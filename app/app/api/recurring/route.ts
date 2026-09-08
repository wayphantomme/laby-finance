import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { buildJournalLines } from "@/lib/accounting";
import { idrToSen } from "@/lib/format";

const createSchema = z.object({
  description: z.string().min(1).max(200),
  amountIdr: z.number().positive(),
  transactionType: z.enum(["INCOME", "EXPENSE", "TRANSFER"]),
  accountId: z.string().min(1),
  cashAccountId: z.string().min(1),
  frequency: z.enum(["DAILY", "WEEKLY", "MONTHLY", "YEARLY"]),
  nextRunDate: z.string().min(1),
});

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const rules = await prisma.recurringRule.findMany({
    where: { userId: session.user.id },
    orderBy: { nextRunDate: "asc" },
  });

  return NextResponse.json({ rules });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const { description, amountIdr, transactionType, accountId, cashAccountId, frequency, nextRunDate } = parsed.data;

  const rule = await prisma.recurringRule.create({
    data: {
      userId: session.user.id,
      description,
      frequency,
      nextRunDate: new Date(nextRunDate),
      isActive: true,
      templateEntryJson: JSON.stringify({ description, amountIdr, transactionType, accountId, cashAccountId }),
    },
  });

  return NextResponse.json({ rule }, { status: 201 });
}
