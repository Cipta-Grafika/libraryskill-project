import { NextResponse } from "next/server";
import { db as prisma } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "AUTHOR") {
      return NextResponse.json({ points: 0 });
    }

    const userPoint = await prisma.userPoint.findUnique({
      where: { userId: session.user.id },
      select: { totalPoint: true }
    });

    return NextResponse.json({ points: userPoint?.totalPoint || 0 });
  } catch (error) {
    console.error("Failed to fetch points:", error);
    return NextResponse.json({ error: "Failed to fetch points" }, { status: 500 });
  }
}
