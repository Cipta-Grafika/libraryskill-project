import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db as prisma } from "@/lib/db";
import { logAudit } from "@/lib/audit";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || session.user.role !== "SUPERADMIN") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { title, description, content, seriesSlug, seriesOrder, status } = body;

    if (!title || !content) {
      return NextResponse.json({ message: "Title and content are required" }, { status: 400 });
    }

    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

    const existingDoc = await prisma.doc.findUnique({
      where: { slug },
    });

    if (existingDoc) {
      return NextResponse.json({ message: "Doc with this title/slug already exists" }, { status: 400 });
    }

    const doc = await prisma.doc.create({
      data: {
        title,
        slug,
        description: description || null,
        content,
        seriesSlug: seriesSlug || null,
        seriesOrder: seriesOrder ? parseInt(seriesOrder, 10) : null,
        status: status || "DRAFT",
        authorId: session.user.id,
        publishedAt: status === "PUBLISHED" ? new Date() : null,
      },
    });

    await logAudit({
      userId: session.user.id,
      action: "CREATE_DOC",
      module: "Docs",
      newData: doc,
    });

    return NextResponse.json(doc, { status: 201 });
  } catch (error) {
    console.error("Error creating doc:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
