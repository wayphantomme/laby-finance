import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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

  // Soft delete
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
