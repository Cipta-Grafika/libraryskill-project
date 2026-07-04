import { NextResponse, NextRequest } from "next/server";
import { db } from "@/lib/db";
import { SkillStatus } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");

    const skills = await db.skill.findMany({
      where: status ? { status: status as SkillStatus } : undefined,
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
    console.error("Failed to search skills:", error);
    return NextResponse.json({ error: "Failed to fetch skills" }, { status: 500 });
  }
}
