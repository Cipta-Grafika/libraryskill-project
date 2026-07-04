"use server";

import { db as prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function createCategory(formData: FormData) {
  try {
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;

    if (!name) {
      return { error: "Name is required" };
    }

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

    const existingCategory = await prisma.category.findUnique({
      where: { slug },
    });

    if (existingCategory) {
      return { error: "Category with this name/slug already exists" };
    }

    await prisma.category.create({
      data: {
        name,
        slug,
        description: description || null,
      },
    });

    revalidatePath("/admin/categories");
    return { success: true };
  } catch (error) {
    console.error("Error creating category:", error);
    return { error: "Failed to create category" };
  }
}

export async function updateCategory(id: string, formData: FormData) {
  try {
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;

    if (!name) {
      return { error: "Name is required" };
    }

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

    const existingCategory = await prisma.category.findUnique({
      where: { slug },
    });

    if (existingCategory && existingCategory.id !== id) {
      return { error: "Category with this name/slug already exists" };
    }

    await prisma.category.update({
      where: { id },
      data: {
        name,
        slug,
        description: description || null,
        updatedAt: new Date(),
      },
    });

    revalidatePath("/admin/categories");
    return { success: true };
  } catch (error) {
    console.error("Error updating category:", error);
    return { error: "Failed to update category" };
  }
}

export async function deleteCategory(id: string) {
  try {
    const { getServerSession } = await import("next-auth/next");
    const { authOptions } = await import("@/lib/auth");
    const session = await getServerSession(authOptions);
    
    if (!session || session.user?.role !== "SUPERADMIN") {
      return { error: "Unauthorized. Only superadmins can delete categories." };
    }

    await prisma.category.delete({
      where: { id },
    });

    revalidatePath("/admin/categories");
    return { success: true };
  } catch (error) {
    console.error("Error deleting category:", error);
    return { error: "Failed to delete category" };
  }
}
