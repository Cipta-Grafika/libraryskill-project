import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db as prisma } from "@/lib/db";
import DocsClient from "./DocsClient";

export default async function AdminDocsPage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user || session.user.role !== "SUPERADMIN") {
    redirect("/auth/login");
  }

  const docs = await prisma.doc.findMany({
    orderBy: {
      createdAt: 'desc'
    },
    select: {
      id: true,
      title: true,
      status: true,
      createdAt: true,
      slug: true,
      seriesSlug: true,
      seriesOrder: true,
      series: {
        select: { title: true }
      }
    }
  });

  return (
    <div className="w-full">
      <DocsClient initialDocs={docs} />
    </div>
  );
}
