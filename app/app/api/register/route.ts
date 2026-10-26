import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { checkRateLimit, getClientIp, rateLimitHeaders } from "@/lib/rate-limit";

const schema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  password: z.string().min(6).max(72),
});

export async function POST(req: NextRequest) {
  const clientIp = getClientIp(req);
  const rl = await checkRateLimit(`rl:auth:${clientIp}`, 10, 900);
  const rlHeaders = rateLimitHeaders(rl);
  if (!rl.success) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429, headers: rlHeaders });
  }

  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten() },
        { status: 400, headers: rlHeaders }
      );
    }

    const { name, email, password } = parsed.data;

    // Run DB check and bcrypt hash in parallel to reduce total latency
    // cost factor 10: ~100ms, secure enough for a personal finance app
    const [existing, passwordHash] = await Promise.all([
      prisma.user.findUnique({ where: { email } }),
      bcrypt.hash(password, 10),
    ]);

    if (existing) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 409, headers: rlHeaders }
      );
    }
    const user = await prisma.user.create({
      data: { name, email, passwordHash },
      select: { id: true, email: true, name: true },
    });

    return NextResponse.json({ user }, { status: 201, headers: rlHeaders });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500, headers: rlHeaders });
  }
}
