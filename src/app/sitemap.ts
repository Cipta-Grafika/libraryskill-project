import { MetadataRoute } from "next";
import { db } from "@/lib/db";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  const publishedSkills = await db.skill.findMany({
    where: {
      status: 'PUBLISHED',
    },
    select: {
      category: { select: { slug: true } },
      slug: true,
      updatedAt: true,
      publishedAt: true,
    },
  });

  const skillUrls = publishedSkills.map((skill) => ({
    url: `${baseUrl}/${skill.category?.slug || "uncategorized"}/${skill.slug}`,
    lastModified: skill.publishedAt || skill.updatedAt,
    changeFrequency: 'weekly' as const,
    priority: 0.9,
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    ...skillUrls,
  ];
}
