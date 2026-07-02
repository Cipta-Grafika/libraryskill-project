import { Header } from "@/components/Header";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function ReviewLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session || (session.user.role !== "REVIEWER" && session.user.role !== "SUPERADMIN")) {
    redirect("/auth/login");
  }

  return (
    <>
      <Header />
      {children}
    </>
  );
}
