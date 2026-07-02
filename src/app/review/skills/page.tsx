import { db } from "@/lib/db";
import ReviewSkillsClient from "./ReviewSkillsClient";

// Server component to fetch all skills (except DRAFTs)
export default async function ReviewAllSkillsPage() {
  const allSkills = await db.skill.findMany({
    where: {
      status: {
        not: "DRAFT",
      },
    },
    include: {
      author: true,
      category: true,
    },
    orderBy: {
      updatedAt: "desc", // Newest first
    },
  });

  return (
    <div className="review-container">
      <ReviewSkillsClient initialSkills={allSkills} />
    </div>
  );
}
