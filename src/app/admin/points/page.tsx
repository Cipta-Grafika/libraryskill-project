import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db as prisma } from "@/lib/db";
import { syncMissingPoints } from "@/lib/points";
import PointsClient from "./PointsClient";

export default async function AdminPointsPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user?.role !== "SUPERADMIN") {
    redirect("/auth/login");
  }

  // Automatically sync missing points before querying the latest data
  await syncMissingPoints();

  const points = await prisma.userPoint.findMany({
    orderBy: {
      totalPoint: 'desc'
    },
    include: {
      user: {
        select: {
          name: true,
          email: true,
          pointHistory: {
            orderBy: { createdAt: 'desc' },
            take: 20,
            include: {
              skill: {
                select: {
                  slug: true,
                  title: true
                }
              }
            }
          }
        }
      }
    }
  });

  return (
    <div className="categories-page">
      <PointsClient initialPoints={points} />
    </div>
  );
}
