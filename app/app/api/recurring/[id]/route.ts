import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { buildJournalLines } from "@/lib/accounting";
import { idrToSen } from "@/lib/format";

type Params = { params: Promise<{ id: string }> };

function nextDate(current: Date, frequency: string): Date {
  const d = new Date(current);
  if (frequency === "DAILY")   d.setDate(d.getDate() + 1);
  if (frequency === "WEEKLY")  d.setDate(d.getDate() + 7);
  if (frequency === "MONTHLY") d.setMonth(d.getMonth() + 1);
  if (frequency === "YEARLY")  d.setFullYear(d.getFullYear() + 1);
  return d;
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  const rule = await prisma.recurringRule.findFirst({ where: { id, userId: session.user.id } });
  if (!rule) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json();

  if (body.action === "toggle") {
    const updated = await prisma.recurringRule.update({ where: { id }, data: { isActive: !rule.isActive } });
    return NextResponse.json({ rule: updated });
  }

  if (body.action === "run") {
    const template = JSON.parse(rule.templateEntryJson) as {
      description: string; amountIdr: number; transactionType: "INCOME" | "EXPENSE" | "TRANSFER";
      accountId: string; cashAccountId: string;
    };

    const lines = buildJournalLines(template.transactionType, template.cashAccountId, template.accountId, idrToSen(template.amountIdr));

    await prisma.$transaction(async (tx) => {
      await tx.journalEntry.create({
        data: {
          userId: session.user!.id!,
          entryDate: new Date(),
          description: template.description,
          source: "MANUAL",
          status: "CONFIRMED",
          lines: { create: lines },
        },
      });
      await tx.recurringRule.update({
        where: { id },
        data: { nextRunDate: nextDate(rule.nextRunDate, rule.frequency) },
      });
    });

    return NextResponse.json({ success: true });
  }

  // General update
  const updated = await prisma.recurringRule.update({
    where: { id },
    data: {
      ...(body.description && { description: body.description }),
      ...(body.nextRunDate && { nextRunDate: new Date(body.nextRunDate) }),
      ...(body.isActive !== undefined && { isActive: body.isActive }),
    },
  });
  return NextResponse.json({ rule: updated });
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  const rule = await prisma.recurringRule.findFirst({ where: { id, userId: session.user.id } });
  if (!rule) return NextResponse.json({ error: "Not found" }, { status: 404 });
  await prisma.recurringRule.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
