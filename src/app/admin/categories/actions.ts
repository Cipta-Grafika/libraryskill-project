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
