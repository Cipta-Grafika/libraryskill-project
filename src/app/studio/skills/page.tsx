import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db as prisma } from "@/lib/db";
import SkillsClient from "./SkillsClient";

export default async function StudioSkillsPage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect("/auth/login");
  }

  const skills = await prisma.skill.findMany({
    where: {
      authorId: session.user.id
    },
    orderBy: {
      createdAt: 'desc'
    },
    include: {
      category: {
        select: { name: true }
      }
    }
  });

  return (
    <div className="skills-page w-full">
      <SkillsClient initialSkills={skills} />
    </div>
  );
}
