import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

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
  });

  if (!skill || skill.status !== "PUBLISHED") {
    return new NextResponse("404 Not Found", { status: 404 });
  }

  // Return raw Markdown as text/plain, and force download
  return new NextResponse(skill.content, {
    status: 200,
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Content-Disposition": `attachment; filename="${cleanSkillSlug}.md"`,
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
