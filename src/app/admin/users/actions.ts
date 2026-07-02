"use server";

import { db as prisma } from "@/lib/db";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";

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

    await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
        slug,
      },
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

    const dataToUpdate: any = {
      name,
      email,
      role,
      updatedAt: new Date(), // Explicitly update the timestamp
    };

    if (password) {
      dataToUpdate.password = await bcrypt.hash(password, 10);
    }

    await prisma.user.update({
      where: { id },
      data: dataToUpdate,
    });

    revalidatePath("/admin/users");
    return { success: true };
  } catch (error) {
    console.error("Error updating user:", error);
    return { error: "Failed to update user" };
  }
}
