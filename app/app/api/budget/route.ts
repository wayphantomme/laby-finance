import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { idrToSen } from "@/lib/format";

const upsertSchema = z.object({
  accountId: z.string().min(1),
  month: z.number().int().min(1).max(12),
  year: z.number().int().min(2020).max(2100),
  amountIdr: z.number().nonnegative(),
});

// GET /api/budget?month=9&year=2026
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const month = parseInt(searchParams.get("month") ?? String(new Date().getMonth() + 1));
  const year = parseInt(searchParams.get("year") ?? String(new Date().getFullYear()));

  // Get budgets
  const budgets = await prisma.budget.findMany({
    where: { userId: session.user.id, month, year },
    include: { account: { select: { id: true, code: true, nameEn: true, nameId: true, type: true } } },
  });

  // Get actual spending for the month (expense accounts only)
  const startOfMonth = new Date(year, month - 1, 1);
  const endOfMonth = new Date(year, month, 0, 23, 59, 59);

  const actualLines = await prisma.journalLine.findMany({
    where: {
      journalEntry: {
        userId: session.user.id,
        status: "CONFIRMED",
        deletedAt: null,
        entryDate: { gte: startOfMonth, lte: endOfMonth },
      },
      account: { type: "EXPENSE" },
    },
    include: { account: { select: { id: true, code: true, nameEn: true } } },
  });

  // Aggregate actual by accountId
  const actualByAccount: Record<string, number> = {};
  for (const line of actualLines) {
    const amt = line.debit - line.credit;
    actualByAccount[line.accountId] = (actualByAccount[line.accountId] ?? 0) + amt;
  }

  return NextResponse.json({ budgets, actualByAccount, month, year });
}

// POST /api/budget — upsert
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = upsertSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });

  const { accountId, month, year, amountIdr } = parsed.data;

  const budget = await prisma.budget.upsert({
    where: { userId_accountId_month_year: { userId: session.user.id, accountId, month, year } },
    update: { amountSen: idrToSen(amountIdr) },
    create: { userId: session.user.id, accountId, month, year, amountSen: idrToSen(amountIdr) },
    include: { account: true },
  });

  return NextResponse.json({ budget }, { status: 201 });
}
