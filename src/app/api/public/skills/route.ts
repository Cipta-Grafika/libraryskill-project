import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const skills = await db.skill.findMany({
      where: {
        status: "PUBLISHED"
      },
      select: {
        id: true,
        title: true,
        slug: true,
        category: { select: { name: true, slug: true } },
      },
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json(skills);
  } catch (error) {
    console.error("Failed to search public skills:", error);
    return NextResponse.json({ error: "Failed to fetch skills" }, { status: 500 });
  }
}
