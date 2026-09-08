import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { idrToSen } from "@/lib/format";

const createSchema = z.object({
  assetName: z.string().min(1).max(200),
  ticker: z.string().min(1).max(20).toUpperCase(),
  assetType: z.enum(["stock_idx", "stock_us", "crypto", "gold", "mutual_fund", "other"]),
  quantity: z.number().positive(),
  lots: z.number().int().positive().optional(),
  avgBuyPriceIdr: z.number().min(0), // 0 = not set yet, user will fill manually
  openingDate: z.string().min(1),
  accountId: z.string().min(1),
  notes: z.string().optional(),
});

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const holdings = await prisma.portfolioHolding.findMany({
    where: { userId: session.user.id, deletedAt: null },
    include: { account: { select: { code: true, nameEn: true } } },
    orderBy: { openingDate: "desc" },
  });

  return NextResponse.json({ holdings });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const parsed = createSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });

    const { assetName, ticker, assetType, quantity, lots, avgBuyPriceIdr, openingDate, accountId, notes } = parsed.data;
    const avgBuyPriceSen = idrToSen(avgBuyPriceIdr);

    // Calculate total cost in sen
    const totalCostSen = assetType === "stock_idx" && lots
      ? lots * 100 * avgBuyPriceSen  // lots × 100 shares × price per share
      : Math.round(quantity * avgBuyPriceSen);

    // Find opening capital account for journal entry
    const openingCapital = await prisma.coaAccount.findFirst({ where: { code: "3-100" } });
    if (!openingCapital) return NextResponse.json({ error: "Opening capital account not found" }, { status: 500 });

    // Create holding + opening balance journal entry in transaction
    const [holding] = await prisma.$transaction(async (tx) => {
      const h = await tx.portfolioHolding.create({
        data: {
          userId: session.user!.id!,
          accountId,
          assetName,
          ticker,
          assetType,
          quantity,
          lots: lots ?? null,
          avgBuyPrice: avgBuyPriceSen,
          currentPrice: avgBuyPriceSen,
          openingDate: new Date(openingDate),
          notes: notes ?? null,
        },
      });

      // Opening balance journal entry (only if buy price is set)
      if (totalCostSen > 0) {
        await tx.journalEntry.create({
          data: {
            userId: session.user!.id!,
            entryDate: new Date(openingDate),
            description: `Opening balance: ${assetName} (${ticker})`,
            source: "MANUAL",
            status: "CONFIRMED",
            lines: {
              create: [
                { accountId, debit: totalCostSen, credit: 0 },
                { accountId: openingCapital.id, debit: 0, credit: totalCostSen },
              ],
            },
          },
        });
      }

      return [h];
    });

    return NextResponse.json({ holding }, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
