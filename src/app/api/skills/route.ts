import { NextResponse } from "next/server";
import { db as prisma } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { logAudit } from "@/lib/audit";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const authorId = session.user.id;
    
    const skills = await prisma.skill.findMany({
      where: { authorId },
      include: { category: true },
      orderBy: { updatedAt: "desc" },
    });
    
    return NextResponse.json(skills);
  } catch (error) {
    console.error("Failed to fetch skills:", error);
    return NextResponse.json({ error: "Failed to fetch skills" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await req.json();
    
    // Auto-generate slug if not provided
    const slug = data.slug || data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    const roleSlug = session.user.role.toLowerCase();
    
    const skill = await prisma.skill.create({
      data: {
        title: data.title,
        slug,
        roleSlug,
        description: data.description || null,
        content: data.content || "",
        categoryId: data.categoryId || null,
        status: data.status || "DRAFT",
        authorId: session.user.id,
        tags: data.tags || [],
        outputModes: data.outputModes || [],
      },
    });
    
    await logAudit({
      userId: session.user.id,
      action: "CREATE_SKILL",
      module: "Skills",
      newData: skill,
    });

    return NextResponse.json(skill);
  } catch (error) {
    console.error("Failed to create skill:", error);
    return NextResponse.json({ error: "Failed to create skill" }, { status: 500 });
  }
}
