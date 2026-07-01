import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Header } from "@/components/Header";
import { db as prisma } from "@/lib/db";
import UsersClient from "./UsersClient";

export default async function AdminUsersPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "SUPERADMIN") {
    redirect("/auth/login");
  }

  const users = await prisma.user.findMany({
    orderBy: {
      createdAt: 'desc'
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      slug: true,
      bio: true,
    }
  });

  return (
    <>
      <Header />
      <div className="users-page">
        <UsersClient initialUsers={users} />
      </div>
    </>
  );
}
