"use server";

import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { logAudit } from "@/lib/audit";
import { SkillStatus } from "@prisma/client";

export async function submitReview(formData: FormData) {
  const session = await getServerSession(authOptions);
  
  if (!session || (session.user.role !== "REVIEWER" && session.user.role !== "SUPERADMIN")) {
    throw new Error("Unauthorized");
  }

  const skillId = formData.get("skillId") as string;
  const status = formData.get("status") as string; // 'APPROVE' or 'REJECT'
  let noteMarkdown = formData.get("noteMarkdown") as string | null;
  
  if (!skillId || typeof skillId !== "string") {
    throw new Error("Missing or invalid skillId");
  }
  if (!status || typeof status !== "string") {
    throw new Error("Missing or invalid status");
  }
  if (!session.user.id) {
    throw new Error("Missing reviewer ID in session");
  }
  
  if (!noteMarkdown || noteMarkdown.trim() === "") {
    noteMarkdown = null;
  }

  // Determine new skill status based on review
  // Assuming if approved, it's PUBLISHED. If rejected, it's REJECTED.
  const newSkillStatus: SkillStatus = status === "APPROVE" ? "PUBLISHED" : "REJECTED";

  try {
    // Transaction to update skill and add review record
    await db.$transaction([
      db.review.create({
        data: {
          skillId,
          reviewerId: session.user.id,
          status,
          noteMarkdown,
        }
      }),
      db.skill.update({
        where: { id: skillId },
        data: { 
          status: newSkillStatus,
          publishedAt: status === "APPROVE" ? new Date() : null,
        }
      })
    ]);

    await logAudit({
      userId: session.user.id,
      action: "SUBMIT_REVIEW",
      module: "Reviews",
      newData: {
        skillId,
        status,
        noteMarkdown,
        newSkillStatus
      },
    });

  } catch (error) {
    console.error("Failed to submit review:", error);
    if (error instanceof Error) {
      throw new Error(`Failed to submit review: ${error.message}`);
    }
    throw new Error("Failed to submit review");
  }

  revalidatePath("/review/queue");
  revalidatePath("/review/skills");
  return { success: true };
}
