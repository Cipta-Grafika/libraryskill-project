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

  if (!session) {
    redirect("/auth/login");
  }

  // Strict check: Only REVIEWER can access /review routes
  if (session.user.role !== "REVIEWER") {
    redirect("/403");
  }

  return (
    <>
      <Header />
      {children}
    </>
  );
}
