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
  { params }: { params: Promise<{ categorySlug: string; skillSlug: string }> }
) {
  const resolvedParams = await params;
  
  // Next.js might include or exclude the .md depending on how the dynamic route is parsed.
  // We'll strip it just to be safe.
  const cleanSkillSlug = resolvedParams.skillSlug.replace(/\.md$/, "");

  const skill = await db.skill.findFirst({
    where: {
      slug: cleanSkillSlug,
      category: {
        slug: resolvedParams.categorySlug
      }
    },
    select: {
      title: true,
      description: true,
      content: true,
      status: true,
      slug: true,
      outputModes: true,
      category: {
        select: { slug: true }
      },
      author: {
        select: { slug: true }
      }
    },
  });

  if (!skill || skill.status !== "PUBLISHED") {
    return new NextResponse("404 Not Found", { status: 404 });
  }

  // Generate YAML Frontmatter for RAG & Crawlers
  const frontmatter = `---
skill_id: ${skill.slug}
version: 1.0.0
category: ${skill.category?.slug || "uncategorized"}
author: ${skill.author.slug}
language: id-ID
output_type:
${skill.outputModes.length > 0 ? skill.outputModes.map((mode) => `  - ${mode}`).join("\n") : "  - text"}
recommended_for:
  - ChatGPT
  - Claude
  - Gemini
  - DeepSeek
  - Grok
source_type: skill_specification
---`;

  // Build the full markdown: title → description
  const titleBlock = `# ${skill.title}`;
  const descriptionBlock = skill.description ? `### ${skill.description}` : "";
  
  // Inject chunk anchors into content for RAG
  const contentWithAnchors = skill.content.replace(/^(#+)\s+(.*)$/gm, (match, hashes, title) => {
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    return `<a id="section-${slug}"></a>\n${match}`;
  });

  // Transform relative image URLs to absolute URLs for RAG consistency
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://libraryskill.com";
  const contentWithAbsoluteImages = contentWithAnchors.replace(
    /(\]\()(\/upload\/img\/[^)]+)(\))/g, 
    `$1${baseUrl}$2$3`
  ).replace(
    /(src=["'])(\/upload\/img\/[^"']+)(["'])/g,
    `$1${baseUrl}$2$3`
  );

  const markdownParts = [frontmatter, titleBlock, descriptionBlock, contentWithAbsoluteImages].filter(Boolean);
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
