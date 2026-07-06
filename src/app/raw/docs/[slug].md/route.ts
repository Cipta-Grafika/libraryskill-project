import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const resolvedParams = await params;
  
  // Clean slug
  const cleanDocSlug = resolvedParams.slug.replace(/\.md$/, "");

  const doc = await db.doc.findFirst({
    where: {
      slug: cleanDocSlug,
    },
    select: {
      title: true,
      description: true,
      content: true,
      status: true,
      slug: true,
      series: {
        select: { slug: true }
      },
      author: {
        select: { slug: true }
      }
    },
  });

  if (!doc || doc.status !== "PUBLISHED") {
    return new NextResponse("404 Not Found", { status: 404 });
  }

  // Generate YAML Frontmatter for RAG & Crawlers
  const frontmatter = `---
doc_id: ${doc.slug}
version: 1.0.0
series: ${doc.series?.slug || "none"}
author: ${doc.author.slug}
language: id-ID
output_type:
  - text
recommended_for:
  - ChatGPT
  - Claude
  - Gemini
  - DeepSeek
  - Grok
source_type: documentation
---`;

  // Build the full markdown: title → description
  const titleBlock = `# ${doc.title}`;
  const descriptionBlock = doc.description ? `### ${doc.description}` : "";
  
  // Inject chunk anchors into content for RAG
  const contentWithAnchors = doc.content.replace(/^(#+)\s+(.*)$/gm, (match, hashes, title) => {
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    return `<a id="section-${slug}"></a>\n${match}`;
  });

  const markdownParts = [frontmatter, titleBlock, descriptionBlock, contentWithAnchors].filter(Boolean);
  const fullMarkdown = markdownParts.join("\n\n");

  // Return raw Markdown as text/markdown without forcing download
  return new NextResponse(fullMarkdown, {
    status: 200,
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}
