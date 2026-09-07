import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/ai/sessions — list all sessions for the user
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sessions = await prisma.chatSession.findMany({
    where: { userId: session.user.id, deletedAt: null },
    orderBy: { createdAt: "desc" },
    take: 50,
    include: {
      messages: {
        orderBy: { createdAt: "asc" },
        take: 1, // first message as preview
      },
      _count: { select: { messages: true } },
    },
  });

  return NextResponse.json({ sessions });
}

// POST /api/ai/sessions — create a new session
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const title = body.title ?? null;

  const chatSession = await prisma.chatSession.create({
    data: { userId: session.user.id, title },
  });

  return NextResponse.json({ session: chatSession }, { status: 201 });
}
