import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { computeNetWorthHistory } from "@/lib/reports";
import { checkRateLimit, rateLimitHeaders } from "@/lib/rate-limit";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rl = await checkRateLimit(`rl:api:${session.user.id}`, 200, 3600);
  const rlHeaders = rateLimitHeaders(rl);
  if (!rl.success) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429, headers: rlHeaders });
  }

  const { searchParams } = new URL(req.url);
  const year = parseInt(searchParams.get("year") ?? String(new Date().getFullYear()));

  const data = await computeNetWorthHistory(session.user.id, year);
  return NextResponse.json(data, { headers: rlHeaders });
}
