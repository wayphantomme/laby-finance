import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const accounts = await prisma.coaAccount.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
    include: {
      parent: { select: { code: true, nameEn: true } },
      _count: { select: { journalLines: true } },
    },
  });

  return NextResponse.json({ accounts });
}
