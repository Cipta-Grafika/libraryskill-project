import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db as prisma } from "@/lib/db";
import SeriesClient from "./SeriesClient";

export default async function AdminSeriesPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "SUPERADMIN") {
    redirect("/auth/login");
  }

  const series = await prisma.series.findMany({
    orderBy: {
      createdAt: 'desc'
    },
    select: {
      id: true,
      title: true,
      slug: true,
      description: true,
      createdAt: true,
      updatedAt: true,
      _count: {
        select: { docs: true }
      }
    }
  });

  return (
    <div className="categories-page">
      <SeriesClient initialSeries={series} />
    </div>
  );
}
