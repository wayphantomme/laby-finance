import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";
import { NextResponse } from "next/server";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import type { NextAuthRequest } from "next-auth";

// Only imports authConfig (no Prisma, no bcrypt) — keeps Edge Function < 1 MB
// Rate-limit the NextAuth credentials callback (brute-force login protection).
// Same parameters as /api/register: 10 requests per 900 s per IP.
const CREDENTIALS_PATH = "/api/auth/callback/credentials";

export default NextAuth(authConfig).auth(async (req: NextAuthRequest) => {
  if (req.method === "POST" && req.nextUrl.pathname === CREDENTIALS_PATH) {
    const ip = getClientIp(req);
    const rl = await checkRateLimit(`rl:login:${ip}`, 10, 900);
    if (!rl.success) {
      return NextResponse.json(
        { error: "Too many login attempts. Please try again later." },
        {
          status: 429,
          headers: {
            "X-RateLimit-Limit": String(rl.limit),
            "X-RateLimit-Remaining": String(rl.remaining),
            ...(rl.resetAt !== 0 && { "X-RateLimit-Reset": String(rl.resetAt) }),
          },
        }
      );
    }
  }
  // Return undefined to let NextAuth continue with its normal session/auth handling.
});

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
