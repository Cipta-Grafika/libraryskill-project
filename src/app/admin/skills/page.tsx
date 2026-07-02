import { db } from "@/lib/db";
import AdminSkillsClient from "./AdminSkillsClient";

// Server component to fetch all skills (including DRAFTs)
export default async function AdminAllSkillsPage() {
  const allSkills = await db.skill.findMany({
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
      <AdminSkillsClient initialSkills={allSkills} />
    </div>
  );
}
