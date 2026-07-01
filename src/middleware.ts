import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET || "default-secret-key-change-in-production" });
  const { pathname } = req.nextUrl;

  const isAuthPage = pathname.startsWith("/auth/login") || pathname.startsWith("/auth/register");
  
  // Routes mapping based on roles
  const isAdminRoute = pathname.startsWith("/admin");
  const isStudioRoute = pathname.startsWith("/studio");
  const isReviewRoute = pathname.startsWith("/review");

  // Helper to determine home route based on role
  const getHomeRoute = (role?: string) => {
    if (role === "SUPERADMIN") return "/admin";
    if (role === "REVIEWER") return "/review";
    if (role === "AUTHOR") return "/studio";
    return "/"; // Default fallback
  };

  // 1. If user is logged in and tries to access login/register or root, redirect to their dashboard
  if (isAuthPage || pathname === "/") {
    if (token) {
      return NextResponse.redirect(new URL(getHomeRoute(token.role as string), req.url));
    }
    return NextResponse.next();
  }

  // 2. If user is NOT logged in and tries to access protected routes, redirect to login
  if (!token && (isAdminRoute || isStudioRoute || isReviewRoute)) {
    let from = req.nextUrl.pathname;
    if (req.nextUrl.search) {
      from += req.nextUrl.search;
    }
    return NextResponse.redirect(
      new URL(`/auth/login?from=${encodeURIComponent(from)}`, req.url)
    );
  }

  // 3. Role-based authorization for protected routes
  if (token) {
    const role = token.role as string;

    if (isAdminRoute && role !== "SUPERADMIN") {
      return NextResponse.redirect(new URL(getHomeRoute(role), req.url));
    }

    if (isReviewRoute && role !== "REVIEWER" && role !== "SUPERADMIN") {
      return NextResponse.redirect(new URL(getHomeRoute(role), req.url));
    }

    if (isStudioRoute && role !== "AUTHOR" && role !== "SUPERADMIN") {
      return NextResponse.redirect(new URL(getHomeRoute(role), req.url));
    }
  }

  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
