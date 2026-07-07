"use server";

import { db as prisma } from "@/lib/db";
import { Prisma } from "@prisma/client";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { logAudit } from "@/lib/audit";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function createUser(formData: FormData) {
  try {
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;
    const role = formData.get("role") as "AUTHOR" | "REVIEWER" | "SUPERADMIN";

    if (!name || !email || !password || !confirmPassword || !role) {
      return { error: "All fields are required" };
    }

    if (password !== confirmPassword) {
      return { error: "Passwords do not match" };
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return { error: "User with this email already exists" };
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Generate a basic slug from name
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now().toString().slice(-4);

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
        slug,
      },
    });

    const session = await getServerSession(authOptions);
    await logAudit({
      userId: session?.user?.id,
      action: "CREATE_USER",
      module: "Users",
      newData: { ...newUser, password: "[REDACTED]" },
    });

    revalidatePath("/admin/users");
    return { success: true };
  } catch (error) {
    console.error("Error creating user:", error);
    return { error: "Failed to create user" };
  }
}

export async function updateUser(id: string, formData: FormData) {
  try {
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;
    const role = formData.get("role") as "AUTHOR" | "REVIEWER" | "SUPERADMIN";

    if (!name || !email || !role) {
      return { error: "Name, email, and role are required" };
    }

    if (password && password !== confirmPassword) {
      return { error: "Passwords do not match" };
    }

    // Check if email belongs to another user
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser && existingUser.id !== id) {
      return { error: "Email is already in use by another user" };
    }

    const dataToUpdate: Prisma.UserUpdateInput = {
      name,
      email,
      role,
      updatedAt: new Date(), // Explicitly update the timestamp
    };

    if (password) {
      dataToUpdate.password = await bcrypt.hash(password, 10);
    }

    const oldUser = await prisma.user.findUnique({ where: { id } });
    
    const updatedUser = await prisma.user.update({
      where: { id },
      data: dataToUpdate,
    });

    const session = await getServerSession(authOptions);
    await logAudit({
      userId: session?.user?.id,
      action: "UPDATE_USER",
      module: "Users",
      oldData: oldUser ? { ...oldUser, password: "[REDACTED]" } : null,
      newData: { ...updatedUser, password: "[REDACTED]" },
    });

    revalidatePath("/admin/users");
    return { success: true };
  } catch (error) {
    console.error("Error updating user:", error);
    return { error: "Failed to update user" };
  }
}

export async function deleteUser(id: string) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user?.role !== "SUPERADMIN") {
      return { error: "Unauthorized. Only superadmins can delete users." };
    }

    if (session.user.id === id) {
      return { error: "You cannot delete yourself." };
    }

    const oldUser = await prisma.user.findUnique({ where: { id } });

    await prisma.user.delete({
      where: { id },
    });

    await logAudit({
      userId: session.user.id,
      action: "DELETE_USER",
      module: "Users",
      oldData: oldUser ? { ...oldUser, password: "[REDACTED]" } : null,
    });

    revalidatePath("/admin/users");
    return { success: true };
  } catch (error) {
    console.error("Error deleting user:", error);
    return { error: "Failed to delete user" };
  }
}
