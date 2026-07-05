import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const docs = await db.doc.findMany({
      where: {
        status: "PUBLISHED"
      },
      select: {
        id: true,
        title: true,
        slug: true,
        seriesSlug: true,
        seriesOrder: true,
        series: { select: { title: true } },
      },
      orderBy: { updatedAt: "desc" },
    });

    // Transform docs to match the expected format for DashboardSearch
    // The search component likely expects { title, slug, category: { name, slug } }
    // It links to `/${skill.category.slug}/${skill.slug}` when isPublicSearch=true.
    // For docs, the URL is `/docs/[slug]` or `/docs/[seriesSlug]/[order]/[slug]`.
    // So if category.slug is "docs" and slug is the rest, it forms `/docs/the-slug`.
    const formattedDocs = docs.map(doc => ({
      id: doc.id,
      title: doc.title,
      slug: doc.seriesSlug && doc.seriesOrder ? `${doc.seriesSlug}/${doc.seriesOrder}/${doc.slug}` : doc.slug,
      category: { 
        name: doc.series ? `${doc.series.title} (Part ${doc.seriesOrder})` : "Documentation", 
        slug: "docs"
      },
    }));

    return NextResponse.json(formattedDocs);
  } catch (error) {
    console.error("Failed to search public docs:", error);
    return NextResponse.json({ error: "Failed to fetch docs" }, { status: 500 });
  }
}
