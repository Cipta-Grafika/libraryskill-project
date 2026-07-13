import { NextResponse } from "next/server";
import { db as prisma } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { logAudit } from "@/lib/audit";

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { bio } = await req.json();
    
    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: { bio },
    });
    
    await logAudit({
      userId: session.user.id,
      action: "UPDATE_PROFILE_BIO",
      module: "Users",
      newData: { bio },
    });
    
    return NextResponse.json({ success: true, bio: user.bio });
  } catch (error) {
    console.error("Failed to update profile:", error);
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}
