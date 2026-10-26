import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { idrToSen } from "@/lib/format";
import { checkRateLimit, rateLimitHeaders } from "@/lib/rate-limit";

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const rl = await checkRateLimit(`rl:api:${session.user.id}`, 200, 3600);
  const rlHeaders = rateLimitHeaders(rl);
  if (!rl.success) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429, headers: rlHeaders });
  }

  const { id } = await params;
  const budget = await prisma.budget.findFirst({ where: { id, userId: session.user.id } });
  if (!budget) return NextResponse.json({ error: "Not found" }, { status: 404, headers: rlHeaders });
  await prisma.budget.delete({ where: { id } });
  return NextResponse.json({ success: true }, { headers: rlHeaders });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const rl = await checkRateLimit(`rl:api:${session.user.id}`, 200, 3600);
  const rlHeaders = rateLimitHeaders(rl);
  if (!rl.success) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429, headers: rlHeaders });
  }

  const { id } = await params;
  const { amountIdr } = await req.json();
  const budget = await prisma.budget.findFirst({ where: { id, userId: session.user.id } });
  if (!budget) return NextResponse.json({ error: "Not found" }, { status: 404, headers: rlHeaders });
  const updated = await prisma.budget.update({ where: { id }, data: { amountSen: idrToSen(amountIdr) } });
  return NextResponse.json({ budget: updated }, { headers: rlHeaders });
}
