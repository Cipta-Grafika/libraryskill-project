import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    // Auth check - only authenticated users can upload
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create unique filename
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const originalExt = file.name.split('.').pop() || 'png';
    const filename = `${uniqueSuffix}.${originalExt}`;

    // Ensure directory exists
    const uploadDir = join(process.cwd(), "public/upload/img");
    try {
      await mkdir(uploadDir, { recursive: true });
    } catch {
      // Ignore if exists
    }

    // Write file
    const path = join(uploadDir, filename);
    await writeFile(path, buffer);

    // Return the absolute URL for consistency in Markdown and RAG
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://libraryskill.com";
    return NextResponse.json({ 
      url: `${baseUrl}/upload/img/${filename}`,
      success: true 
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Failed to upload file" }, { status: 500 });
  }
}
