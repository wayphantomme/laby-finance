import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { checkRateLimit, rateLimitHeaders } from "@/lib/rate-limit";

// GET /api/ai/sessions/[id] — load messages for a session
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rl = await checkRateLimit(`rl:api:${session.user.id}`, 200, 3600);
  const rlHeaders = rateLimitHeaders(rl);
  if (!rl.success) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429, headers: rlHeaders });
  }

  const { id } = await params;

  const chatSession = await prisma.chatSession.findFirst({
    where: { id, userId: session.user.id, deletedAt: null },
    include: {
      messages: { orderBy: { createdAt: "asc" } },
    },
  });

  if (!chatSession) {
    return NextResponse.json({ error: "Not found" }, { status: 404, headers: rlHeaders });
  }

  return NextResponse.json({ session: chatSession }, { headers: rlHeaders });
}

// PATCH /api/ai/sessions/[id] — update session title
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rl = await checkRateLimit(`rl:api:${session.user.id}`, 200, 3600);
  const rlHeaders = rateLimitHeaders(rl);
  if (!rl.success) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429, headers: rlHeaders });
  }

  const { id } = await params;
  const { title } = await req.json();

  const existing = await prisma.chatSession.findFirst({
    where: { id, userId: session.user.id, deletedAt: null },
  });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404, headers: rlHeaders });
  }

  const updated = await prisma.chatSession.update({
    where: { id },
    data: { title },
  });

  return NextResponse.json({ session: updated }, { headers: rlHeaders });
}

// DELETE /api/ai/sessions/[id] — soft delete session
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rl = await checkRateLimit(`rl:api:${session.user.id}`, 200, 3600);
  const rlHeaders = rateLimitHeaders(rl);
  if (!rl.success) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429, headers: rlHeaders });
  }

  const { id } = await params;

  const existing = await prisma.chatSession.findFirst({
    where: { id, userId: session.user.id, deletedAt: null },
  });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404, headers: rlHeaders });
  }

  await prisma.chatSession.update({
    where: { id },
    data: { deletedAt: new Date() },
  });

  return NextResponse.json({ success: true }, { headers: rlHeaders });
}
