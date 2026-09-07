import type { NextAuthConfig } from "next-auth";

// Lightweight auth config — safe for Edge Runtime (no Prisma, no bcrypt)
// Used by middleware only. Full auth config is in lib/auth.ts.
export const authConfig: NextAuthConfig = {
  pages: {
    signIn: "/login",
  },
  providers: [],
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const { pathname } = nextUrl;

      const publicPaths = ["/login", "/register"];
      const isPublic = publicPaths.some((p) => pathname.startsWith(p));
      const isApi = pathname.startsWith("/api/");

      // API routes handle their own auth
      if (isApi) return true;

      if (!isLoggedIn && !isPublic) {
        return Response.redirect(new URL("/login", nextUrl));
      }

      if (isLoggedIn && isPublic) {
        return Response.redirect(new URL("/dashboard", nextUrl));
      }

      return true;
    },
  },
};
