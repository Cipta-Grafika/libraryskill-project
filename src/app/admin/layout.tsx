import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Header } from "@/components/Header";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/login");
  }

  // Strict check: Only SUPERADMIN can access /admin routes
  if (session.user.role !== "SUPERADMIN") {
    redirect("/403");
  }

  return (
    <>
      <Header />
      {children}
    </>
  );
}
