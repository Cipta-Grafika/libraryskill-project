import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  const skill = await db.skill.findFirst({
    where: {
      slug: "prompt-engineering",
      category: { slug: "frontend-development" }
    }
  });
  return NextResponse.json({ skill });
}
