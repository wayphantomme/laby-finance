import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  /*
   * CoaAccount is a shared, userId-free lookup table readable by all authenticated
   * users. This intentional design means all authenticated users see the same chart
   * of accounts. Write access must never be added to this file without an admin-role
   * guard (out of scope for this iteration).
   */
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
