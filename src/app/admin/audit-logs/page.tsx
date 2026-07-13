import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db as prisma } from "@/lib/db";
import LogsClient from "./LogsClient";

export default async function AdminAuditLogsPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user?.role !== "SUPERADMIN") {
    redirect("/auth/login");
  }

  const logs = await prisma.auditLog.findMany({
    orderBy: {
      createdAt: 'desc'
    },
    include: {
      user: {
        select: {
          name: true,
          email: true
        }
      }
    }
  });

  return (
    <div className="categories-page">
      <LogsClient initialLogs={logs} />
    </div>
  );
}
