import { db as prisma } from "@/lib/db";

/**
 * Awards 10 points to an author when their skill is published.
 * Ensures idempotency (does not award points twice for the same skill).
 */
export async function awardPointsForPublishedSkill(skillId: string, authorId: string) {
  try {
    const histories = await prisma.pointHistory.findMany({
      where: {
        skillId,
        userId: authorId,
        status: "VALIDATED",
      }
    });
    
    const netSum = histories.reduce((sum, h) => sum + h.amount, 0);

    if (netSum >= 10) {
      // Points already awarded for this skill
      return;
    }

    // Use a transaction to ensure data integrity
    await prisma.$transaction(async (tx) => {
      // 1. Create point history
      const history = await tx.pointHistory.create({
        data: {
          userId: authorId,
          skillId,
          amount: 10,
          status: "VALIDATED"
        }
      });

      // 2. Upsert the UserPoint (points table)
      await tx.userPoint.upsert({
        where: { userId: authorId },
        update: {
          totalPoint: {
            increment: 10
          },
          pointHistoryId: history.id
        },
        create: {
          userId: authorId,
          totalPoint: 10,
          pointHistoryId: history.id
        }
      });
    });
  } catch (error) {
    console.error("[POINTS_ERROR] Failed to award points for skill", skillId, error);
    // Depending on business requirements, you might want to rethrow or just swallow
    // Usually it's better to log it so the main publish action doesn't fail entirely.
  }
}

/**
 * Revokes 10 points from an author when their skill is unpublished (e.g. rejected, draft).
 * Ensures idempotency (does not revoke if already revoked or never awarded).
 */
export async function revokePointsForUnpublishedSkill(skillId: string, authorId: string) {
  try {
    const histories = await prisma.pointHistory.findMany({
      where: {
        skillId,
        userId: authorId,
        status: "VALIDATED",
      }
    });
    
    const netSum = histories.reduce((sum, h) => sum + h.amount, 0);

    if (netSum <= 0) {
      // Points already revoked or never awarded
      return;
    }

    // Use a transaction to ensure data integrity
    await prisma.$transaction(async (tx) => {
      // 1. Create point history
      const history = await tx.pointHistory.create({
        data: {
          userId: authorId,
          skillId,
          amount: -10, // Deduction
          status: "VALIDATED" // Valid deduction
        }
      });

      // 2. Upsert the UserPoint (points table)
      await tx.userPoint.upsert({
        where: { userId: authorId },
        update: {
          totalPoint: {
            decrement: 10
          },
          pointHistoryId: history.id
        },
        create: {
          userId: authorId,
          totalPoint: -10, // Theoretically possible if they somehow lost points without gaining, though netSum prevents this usually
          pointHistoryId: history.id
        }
      });
    });
  } catch (error) {
    console.error("[POINTS_ERROR] Failed to revoke points for skill", skillId, error);
  }
}

/**
 * Automatically syncs points for any published skills that might have missed being awarded points.
 */
export async function syncMissingPoints() {
  try {
    const publishedSkills = await prisma.skill.findMany({
      where: { status: "PUBLISHED" },
      select: { id: true, authorId: true }
    });

    for (const skill of publishedSkills) {
      await awardPointsForPublishedSkill(skill.id, skill.authorId);
    }
  } catch (error) {
    console.error("[POINTS_ERROR] Failed to sync missing points", error);
  }
}
