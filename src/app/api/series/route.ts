import { NextResponse } from "next/server";
import { db as prisma } from "@/lib/db";

export async function GET() {
  try {
    const series = await prisma.series.findMany({
      orderBy: {
        title: 'asc',
      },
      select: {
        id: true,
        title: true,
        slug: true,
      }
    });

    return NextResponse.json(series);
  } catch (error) {
    console.error("Error fetching series:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
