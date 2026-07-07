"use server";

import { db as prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { logAudit } from "@/lib/audit";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

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

    const newSeries = await prisma.series.create({
      data: {
        title,
        slug,
        description: description || null,
      },
    });

    const session = await getServerSession(authOptions);
    await logAudit({
      userId: session?.user?.id,
      action: "CREATE_SERIES",
      module: "Series",
      newData: newSeries,
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

    const oldSeries = await prisma.series.findUnique({ where: { id } });

    const updatedSeries = await prisma.series.update({
      where: { id },
      data: {
        title,
        slug,
        description: description || null,
        updatedAt: new Date(),
      },
    });

    const session = await getServerSession(authOptions);
    await logAudit({
      userId: session?.user?.id,
      action: "UPDATE_SERIES",
      module: "Series",
      oldData: oldSeries,
      newData: updatedSeries,
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
    const session = await getServerSession(authOptions);
    
    if (!session || session.user?.role !== "SUPERADMIN") {
      return { error: "Unauthorized. Only superadmins can delete series." };
    }

    const oldSeries = await prisma.series.findUnique({ where: { id } });

    await prisma.series.delete({
      where: { id },
    });

    await logAudit({
      userId: session.user.id,
      action: "DELETE_SERIES",
      module: "Series",
      oldData: oldSeries,
    });

    revalidatePath("/admin/series");
    return { success: true };
  } catch (error) {
    console.error("Error deleting series:", error);
    return { error: "Failed to delete series" };
  }
}
