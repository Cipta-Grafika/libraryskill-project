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

LibrarySkill provides reviewed Markdown-based skill specifications for AI Agents and LLMs.

## Published Skills

`;

  const skillsList = skills.map((skill) => {
    const catSlug = skill.category?.slug || "uncategorized";
    return `- [${skill.title}](${baseUrl}/raw/${catSlug}/${skill.slug}.md): ${skill.description || "No description provided."}`;
  }).join("\n");

  const content = header + skillsList + "\n";

  return new NextResponse(content, {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
    },
  });
}
