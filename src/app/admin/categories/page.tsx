import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Header } from "@/components/Header";
import { db as prisma } from "@/lib/db";
import CategoriesClient from "./CategoriesClient";

export default async function AdminCategoriesPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "SUPERADMIN") {
    redirect("/auth/login");
  }

  const categories = await prisma.category.findMany({
    orderBy: {
      createdAt: 'desc'
    },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      createdAt: true,
      _count: {
        select: { skills: true }
      }
    }
  });

  return (
    <>
      <Header />
      <div className="categories-page">
        <CategoriesClient initialCategories={categories} />
      </div>
    </>
  );
}
