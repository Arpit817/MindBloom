import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

const getSecretKey = () =>
  new TextEncoder().encode(
    process.env.JWT_SECRET || "mindbloom_default_secret_key_for_development_32chars"
  );

// Routes that require authentication
const PROTECTED_PATHS = [
  "/dashboard",
  "/notes",
  "/subjects",
  "/review",
  "/learning",
  "/progress",
  "/activity",
  "/profile",
];

// Routes only for unauthenticated users (redirect to dashboard if already logged in)
const AUTH_PATHS = ["/login", "/signup"];

export async function proxy(request) {
  const { pathname } = request.nextUrl;

  const token = request.cookies.get("token")?.value;
  let isAuthenticated = false;

  if (token) {
    try {
      await jwtVerify(token, getSecretKey());
      isAuthenticated = true;
    } catch {
      isAuthenticated = false;
    }
  }

  // ── Redirect authenticated users away from auth pages ────────────
  if (isAuthenticated && AUTH_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // ── Redirect unauthenticated users away from protected pages ─────
  if (!isAuthenticated && PROTECTED_PATHS.some((p) => pathname.startsWith(p))) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico
     * - public files
     * - api routes (handled by their own auth checks)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
