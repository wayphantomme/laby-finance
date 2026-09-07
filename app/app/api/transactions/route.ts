import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { buildJournalLines } from "@/lib/accounting";
import { idrToSen } from "@/lib/format";

const createSchema = z.object({
  date: z.string().min(1),
  description: z.string().min(1).max(500),
  // Simple UI: amount in IDR (whole rupiah), account to debit/credit
  amountIdr: z.number().positive(),
  // The "target" account (income source or expense category)
  accountId: z.string().min(1),
  // The cash/bank account to pair with
  cashAccountId: z.string().min(1),
  // "INCOME" | "EXPENSE" | "TRANSFER"
  transactionType: z.enum(["INCOME", "EXPENSE", "TRANSFER"]),
});

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
  const limit = Math.min(50, parseInt(searchParams.get("limit") ?? "20"));
  const skip = (page - 1) * limit;

  const [entries, total] = await Promise.all([
    prisma.journalEntry.findMany({
      where: { userId: session.user.id, deletedAt: null },
      orderBy: { entryDate: "desc" },
      skip,
      take: limit,
      include: {
        lines: {
          include: { account: true },
        },
      },
    }),
    prisma.journalEntry.count({
      where: { userId: session.user.id, deletedAt: null },
    }),
  ]);

  return NextResponse.json({ entries, total, page, limit });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = createSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { date, description, amountIdr, accountId, cashAccountId, transactionType } =
      parsed.data;

    const amountSen = idrToSen(amountIdr);
    const lines = buildJournalLines(transactionType, cashAccountId, accountId, amountSen);

    const entry = await prisma.journalEntry.create({
      data: {
        userId: session.user.id,
        entryDate: new Date(date),
        description,
        source: "MANUAL",
        status: "CONFIRMED",
        lines: {
          create: lines,
        },
      },
      include: {
        lines: { include: { account: true } },
      },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        entityType: "JournalEntry",
        entityId: entry.id,
        action: "CREATE",
        afterValue: JSON.stringify(entry),
        source: "MANUAL",
        journalEntryId: entry.id,
      },
    });

    return NextResponse.json({ entry }, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
