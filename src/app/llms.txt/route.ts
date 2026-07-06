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

  const header = `# LibrarySkill

> A public skill library for structured AI Agent prompts, reusable workflows, and LLM-readable documentation.

LibrarySkill provides reviewed Markdown-based skill specifications for AI Agents and LLMs. Each skill is designed to support consistent output, clear constraints, and reusable prompt workflows.

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
    let section = `\n### ${catName}\n\n`;
    section += catSkills.map((skill) => {
      const catSlug = skill.category?.slug || "uncategorized";
      return `- [${skill.title}](${baseUrl}/raw/${catSlug}/${skill.slug}.md): ${skill.description || "No description provided."}`;
    }).join("\n");
    return section;
  }).join("\n");

  const content = header + skillsList + "\n";

  return new NextResponse(content, {
    status: 200,
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
    },
  });
}
