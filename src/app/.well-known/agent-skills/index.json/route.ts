import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import crypto from "crypto";

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://libraryskill.com";
  
  // Fetch all published skills
  const skills = await db.skill.findMany({
    where: { status: "PUBLISHED" },
    include: { category: true }
  });

  const agentSkills = skills.map((skill) => {
    // Basic hash for digest
    const hash = crypto.createHash("sha256").update(skill.content).digest("hex");
    const skillUrl = `${baseUrl}/raw/${skill.category?.slug}/${skill.slug}`;
    
    return {
      name: skill.title,
      type: "specification", // general type for skills
      description: skill.description || "Prompt specification for AI Agents",
      url: skillUrl,
      digest: `sha256:${hash}`
    };
  });

  const responseBody = {
    $schema: "https://agentskills.io/schema/v0.2.0.json",
    skills: agentSkills
  };

  return new NextResponse(JSON.stringify(responseBody, null, 2), {
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
