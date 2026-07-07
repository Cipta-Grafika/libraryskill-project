"use server";

import { db as prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { logAudit } from "@/lib/audit";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

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

    const newCategory = await prisma.category.create({
      data: {
        name,
        slug,
        description: description || null,
      },
    });

    const session = await getServerSession(authOptions);
    await logAudit({
      userId: session?.user?.id,
      action: "CREATE_CATEGORY",
      module: "Categories",
      newData: newCategory,
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

    const oldCategory = await prisma.category.findUnique({ where: { id } });

    const updatedCategory = await prisma.category.update({
      where: { id },
      data: {
        name,
        slug,
        description: description || null,
        updatedAt: new Date(),
      },
    });

    const session = await getServerSession(authOptions);
    await logAudit({
      userId: session?.user?.id,
      action: "UPDATE_CATEGORY",
      module: "Categories",
      oldData: oldCategory,
      newData: updatedCategory,
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
    const session = await getServerSession(authOptions);
    
    if (!session || session.user?.role !== "SUPERADMIN") {
      return { error: "Unauthorized. Only superadmins can delete categories." };
    }

    const oldCategory = await prisma.category.findUnique({ where: { id } });

    await prisma.category.delete({
      where: { id },
    });

    await logAudit({
      userId: session.user.id,
      action: "DELETE_CATEGORY",
      module: "Categories",
      oldData: oldCategory,
    });

    revalidatePath("/admin/categories");
    return { success: true };
  } catch (error) {
    console.error("Error deleting category:", error);
    return { error: "Failed to delete category" };
  }
}
