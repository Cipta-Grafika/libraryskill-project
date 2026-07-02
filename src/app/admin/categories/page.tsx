import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db as prisma } from "@/lib/db";
import CategoriesClient from "./CategoriesClient";

export default async function AdminCategoriesPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
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
      updatedAt: true,
      _count: {
        select: { skills: true }
      }
    }
  });

  return (
    <div className="categories-page">
      <CategoriesClient initialCategories={categories} />
    </div>
  );
}
