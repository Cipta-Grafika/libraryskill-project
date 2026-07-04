import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  const skills = await db.skill.findMany({
    where: { status: "PUBLISHED" },
    select: {
      title: true,
      description: true,
      category: { select: { slug: true, name: true } },
      slug: true,
    },
  });

  const header = `# LibrarySkill - Prompts and Documentation Hub (Pustaka Skills)

This site contains published prompts, workflows, and documentation skills designed to enhance productivity and standardisation. 
This \`llms.txt\` file serves as an index of all publicly available skills on this platform for AI assistants and crawlers.

Situs ini berisi koleksi prompt, alur kerja (workflows), dan dokumentasi *skills* yang dipublikasikan untuk meningkatkan produktivitas dan standardisasi. 
File \`llms.txt\` ini berfungsi sebagai indeks dari seluruh *skills* yang tersedia secara publik di platform ini, yang ditujukan khusus untuk dibaca oleh asisten AI dan sistem penelusuran (crawlers).

## Published Skills

`;

  // Group skills dynamically by category
  const groupedSkills = skills.reduce((acc, skill) => {
    const catName = skill.category?.name || "Uncategorized";
    if (!acc[catName]) acc[catName] = [];
    acc[catName].push(skill);
    return acc;
  }, {} as Record<string, typeof skills>);

  const skillsList = Object.entries(groupedSkills).map(([catName, catSkills]) => {
    let section = `### Category: ${catName}\n\n`;
    section += catSkills.map((skill) => {
      const catSlug = skill.category?.slug || "uncategorized";
      return `- [${skill.title}](${baseUrl}/${catSlug}/${skill.slug}): ${skill.description || "No description"}. (Raw Markdown: [${baseUrl}/raw/${catSlug}/${skill.slug}.md](${baseUrl}/raw/${catSlug}/${skill.slug}.md))`;
    }).join("\n");
    return section;
  }).join("\n\n");

  const content = header + skillsList + "\n";

  return new NextResponse(content, {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
    },
  });
}
