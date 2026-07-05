"use server";

import { db as prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function createSeries(formData: FormData) {
  try {
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;

    if (!title) {
      return { error: "Title is required" };
    }

    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

    const existingSeries = await prisma.series.findUnique({
      where: { slug },
    });

    if (existingSeries) {
      return { error: "Series with this title/slug already exists" };
    }

    await prisma.series.create({
      data: {
        title,
        slug,
        description: description || null,
      },
    });

    revalidatePath("/admin/series");
    return { success: true };
  } catch (error) {
    console.error("Error creating series:", error);
    return { error: "Failed to create series" };
  }
}

export async function updateSeries(id: string, formData: FormData) {
  try {
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;

    if (!title) {
      return { error: "Title is required" };
    }

    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

    const existingSeries = await prisma.series.findUnique({
      where: { slug },
    });

    if (existingSeries && existingSeries.id !== id) {
      return { error: "Series with this title/slug already exists" };
    }

    await prisma.series.update({
      where: { id },
      data: {
        title,
        slug,
        description: description || null,
        updatedAt: new Date(),
      },
    });

    revalidatePath("/admin/series");
    return { success: true };
  } catch (error) {
    console.error("Error updating series:", error);
    return { error: "Failed to update series" };
  }
}

export async function deleteSeries(id: string) {
  try {
    const { getServerSession } = await import("next-auth/next");
    const { authOptions } = await import("@/lib/auth");
    const session = await getServerSession(authOptions);
    
    if (!session || session.user?.role !== "SUPERADMIN") {
      return { error: "Unauthorized. Only superadmins can delete series." };
    }

    await prisma.series.delete({
      where: { id },
    });

    revalidatePath("/admin/series");
    return { success: true };
  } catch (error) {
    console.error("Error deleting series:", error);
    return { error: "Failed to delete series" };
  }
}
