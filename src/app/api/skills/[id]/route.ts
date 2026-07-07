import { NextResponse } from "next/server";
import { db as prisma } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { logAudit } from "@/lib/audit";

export async function GET(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;
    
    const skill = await prisma.skill.findUnique({
      where: { id },
      include: { category: true }
    });

    if (!skill) {
      return NextResponse.json({ error: "Skill not found" }, { status: 404 });
    }

    // Only author or superadmin can view draft skills
    if (skill.authorId !== session.user.id && session.user.role !== "SUPERADMIN" && skill.status === "DRAFT") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    
    return NextResponse.json(skill);
  } catch (error) {
    console.error("Failed to fetch skill:", error);
    return NextResponse.json({ error: "Failed to fetch skill" }, { status: 500 });
  }
}

export async function PUT(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;
    const data = await req.json();
    
    // Verify ownership
    const existing = await prisma.skill.findUnique({ where: { id } });
    if (!existing || (existing.authorId !== session.user.id && session.user.role !== "SUPERADMIN")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    
    const skill = await prisma.skill.update({
      where: { id },
      data: {
        title: data.title,
        description: data.description,
        content: data.content,
        categoryId: data.categoryId,
        status: data.status,
        tags: data.tags,
        outputModes: data.outputModes,
      },
    });
    
    await logAudit({
      userId: session.user.id,
      action: "UPDATE_SKILL",
      module: "Skills",
      oldData: existing,
      newData: skill,
    });

    return NextResponse.json(skill);
  } catch (error) {
    console.error("Failed to update skill:", error);
    return NextResponse.json({ error: "Failed to update skill" }, { status: 500 });
  }
}

export async function DELETE(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;
    
    // Verify ownership
    const existing = await prisma.skill.findUnique({ where: { id } });
    if (!existing || (existing.authorId !== session.user.id && session.user.role !== "SUPERADMIN")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    
    await prisma.skill.delete({ where: { id } });
    
    await logAudit({
      userId: session.user.id,
      action: "DELETE_SKILL",
      module: "Skills",
      oldData: existing,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete skill:", error);
    return NextResponse.json({ error: "Failed to delete skill" }, { status: 500 });
  }
}
