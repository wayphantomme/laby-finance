import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { idrToSen } from "@/lib/format";

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const budget = await prisma.budget.findFirst({ where: { id, userId: session.user.id } });
  if (!budget) return NextResponse.json({ error: "Not found" }, { status: 404 });
  await prisma.budget.delete({ where: { id } });
  return NextResponse.json({ success: true });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const { amountIdr } = await req.json();
  const budget = await prisma.budget.findFirst({ where: { id, userId: session.user.id } });
  if (!budget) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const updated = await prisma.budget.update({ where: { id }, data: { amountSen: idrToSen(amountIdr) } });
  return NextResponse.json({ budget: updated });
}
