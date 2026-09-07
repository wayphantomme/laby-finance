import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { buildJournalLines } from "@/lib/accounting";
import { idrToSen } from "@/lib/format";

const editSchema = z.object({
  date: z.string().min(1),
  description: z.string().min(1).max(500),
  amountIdr: z.number().positive(),
  accountId: z.string().min(1),
  cashAccountId: z.string().min(1),
  transactionType: z.enum(["INCOME", "EXPENSE", "TRANSFER"]),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const existing = await prisma.journalEntry.findFirst({
    where: { id, userId: session.user.id, deletedAt: null },
    include: { lines: true },
  });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  try {
    const body = await req.json();
    const parsed = editSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });
    }

    const { date, description, amountIdr, accountId, cashAccountId, transactionType } = parsed.data;
    const amountSen = idrToSen(amountIdr);
    const newLines = buildJournalLines(transactionType, cashAccountId, accountId, amountSen);

    // Delete old lines and create new ones in a transaction
    const updated = await prisma.$transaction(async (tx) => {
      await tx.journalLine.deleteMany({ where: { journalEntryId: id } });

      return tx.journalEntry.update({
        where: { id },
        data: {
          entryDate: new Date(date),
          description,
          lines: { create: newLines },
        },
        include: { lines: { include: { account: true } } },
      });
    });

    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        entityType: "JournalEntry",
        entityId: id,
        action: "UPDATE",
        beforeValue: JSON.stringify(existing),
        afterValue: JSON.stringify(updated),
        source: "MANUAL",
        journalEntryId: id,
      },
    });

    return NextResponse.json({ entry: updated });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const entry = await prisma.journalEntry.findFirst({
    where: { id, userId: session.user.id, deletedAt: null },
  });

  if (!entry) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const deleted = await prisma.journalEntry.update({
    where: { id },
    data: { deletedAt: new Date() },
  });

  await prisma.auditLog.create({
    data: {
      userId: session.user.id,
      entityType: "JournalEntry",
      entityId: id,
      action: "DELETE",
      beforeValue: JSON.stringify(entry),
      source: "MANUAL",
      journalEntryId: id,
    },
  });

  return NextResponse.json({ deleted });
}
