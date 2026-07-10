import { NextResponse } from "next/server";
import { unlink } from "fs/promises";
import { join } from "path";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    // Auth check - only authenticated users can delete
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { url } = body;

    if (!url || typeof url !== "string") {
      return NextResponse.json({ error: "No URL provided" }, { status: 400 });
    }

    // Extract filename from URL (expecting format /upload/img/filename.ext)
    const filename = url.split("/").pop();
    
    // Prevent path traversal
    if (!filename || filename.includes("/") || filename.includes("..")) {
      return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
    }

    // Attempt to delete file
    const filePath = join(process.cwd(), "public", "upload", "img", filename);
    
    try {
      await unlink(filePath);
    } catch (e: any) {
      // If file doesn't exist, we can ignore the error
      if (e.code !== 'ENOENT') {
        throw e;
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete error:", error);
    return NextResponse.json({ error: "Failed to delete file" }, { status: 500 });
  }
}
