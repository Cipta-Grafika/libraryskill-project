import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db as prisma } from "@/lib/db";
import EditSkillClient from "./EditSkillClient";

export default async function EditSkillPage({ params }: { params: Promise<{ slug: string }> }) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect("/auth/login");
  }

  const { slug } = await params;

  const skill = await prisma.skill.findFirst({
    where: { slug }
  });

  if (!skill) {
    redirect("/studio/skills");
  }

  if (skill.authorId !== session.user.id && session.user.role !== "SUPERADMIN") {
    redirect("/studio/skills");
  }

  // Parse markdown content back into blocks.
  const contentStr = skill.content || "";
  const parts = contentStr.split(/(?=(?:^|\n)# )/).filter(Boolean);
  
  let blocks = [];
  
  if (parts.length === 0) {
    blocks.push({ id: "1", title: "Main Content", content: "" });
  } else {
    blocks = parts.map((part, index) => {
      const cleanPart = part.trim();
      const match = cleanPart.match(/^# ([^\n]+)\n([\s\S]*)$/);
      if (match) {
        return { id: String(index + 1), title: match[1].trim(), content: match[2].trim() };
      }
      return { id: String(index + 1), title: "Content", content: cleanPart };
    });
  }

  const skillData = {
    ...skill,
    blocks
  };

  return (
    <div className="w-full">
      <EditSkillClient initialData={skillData} />
    </div>
  );
}
