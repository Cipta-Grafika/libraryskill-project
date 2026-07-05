import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db as prisma } from "@/lib/db";
import EditDocClient from "./EditDocClient";

export default async function EditDocPage({ params }: { params: Promise<{ slug: string }> }) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user || session.user.role !== "SUPERADMIN") {
    redirect("/auth/login");
  }

  const { slug } = await params;

  const doc = await prisma.doc.findFirst({
    where: { slug }
  });

  if (!doc) {
    redirect("/admin/docs");
  }

  // Parse markdown content back into blocks.
  const contentStr = doc.content || "";
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

  const docData = {
    ...doc,
    seriesOrder: doc.seriesOrder ? String(doc.seriesOrder) : "",
    blocks
  };

  return (
    <div className="w-full">
      <EditDocClient initialData={docData} />
    </div>
  );
}
