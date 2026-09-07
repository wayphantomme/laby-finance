import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Use the auth() middleware helper — runs in Node runtime, not Edge
export default auth(function middleware(req: NextRequest & { auth: unknown }) {
  const isLoggedIn = !!(req as { auth?: { user?: unknown } }).auth;
  const { pathname } = req.nextUrl;

  const publicPaths = ["/login", "/register"];
  const isPublic = publicPaths.some((p) => pathname.startsWith(p));
  // All /api/* routes except /api/auth are handled by their own auth checks
  const isApi = pathname.startsWith("/api/");

  if (isApi) return NextResponse.next();

  if (!isLoggedIn && !isPublic) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (isLoggedIn && isPublic) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
