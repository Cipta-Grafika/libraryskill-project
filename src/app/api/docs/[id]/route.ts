import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db as prisma } from "@/lib/db";
import { logAudit } from "@/lib/audit";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || session.user.role !== "SUPERADMIN") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const { title, description, content, seriesSlug, seriesOrder, status } = body;

    if (!title || !content) {
      return NextResponse.json({ message: "Title and content are required" }, { status: 400 });
    }

    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

    const existingDoc = await prisma.doc.findUnique({
      where: { slug },
    });

    if (existingDoc && existingDoc.id !== id) {
      return NextResponse.json({ message: "Doc with this title/slug already exists" }, { status: 400 });
    }

    const doc = await prisma.doc.update({
      where: { id },
      data: {
        title,
        slug,
        description: description || null,
        content,
        seriesSlug: seriesSlug || null,
        seriesOrder: seriesOrder ? parseInt(seriesOrder, 10) : null,
        status: status || "DRAFT",
        publishedAt: status === "PUBLISHED" && existingDoc?.status !== "PUBLISHED" ? new Date() : undefined,
        updatedAt: new Date(),
      },
    });
    const oldDoc = await prisma.doc.findUnique({ where: { id } });

    await logAudit({
      userId: session.user.id,
      action: "UPDATE_DOC",
      module: "Docs",
      oldData: oldDoc || existingDoc,
      newData: doc,
    });

    return NextResponse.json(doc, { status: 200 });
  } catch (error) {
    console.error("Error updating doc:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
