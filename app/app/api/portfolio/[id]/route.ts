import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { idrToSen } from "@/lib/format";

type Params = { params: Promise<{ id: string }> };

const sellSchema = z.object({
  quantitySold: z.number().positive(),
  lotsSold: z.number().int().positive().optional(),
  sellPriceIdr: z.number().positive(),
  sellDate: z.string().min(1),
  cashAccountId: z.string().min(1),
});

const updateSchema = z.object({
  assetName: z.string().min(1).max(200).optional(),
  quantity: z.number().positive().optional(),
  lots: z.number().int().positive().optional(),
  avgBuyPriceIdr: z.number().positive().optional(),
  currentPriceIdr: z.number().positive().optional(),
  notes: z.string().optional(),
});

export async function PATCH(req: NextRequest, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  const holding = await prisma.portfolioHolding.findFirst({
    where: { id, userId: session.user.id, deletedAt: null },
  });
  if (!holding) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const updated = await prisma.portfolioHolding.update({
    where: { id },
    data: {
      ...(parsed.data.assetName && { assetName: parsed.data.assetName }),
      ...(parsed.data.quantity !== undefined && { quantity: parsed.data.quantity }),
      ...(parsed.data.lots !== undefined && { lots: parsed.data.lots }),
      ...(parsed.data.avgBuyPriceIdr && { avgBuyPrice: idrToSen(parsed.data.avgBuyPriceIdr) }),
      ...(parsed.data.currentPriceIdr && { currentPrice: idrToSen(parsed.data.currentPriceIdr), lastUpdated: new Date() }),
      ...(parsed.data.notes !== undefined && { notes: parsed.data.notes }),
    },
  });
  return NextResponse.json({ holding: updated });
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  const holding = await prisma.portfolioHolding.findFirst({
    where: { id, userId: session.user.id, deletedAt: null },
  });
  if (!holding) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.portfolioHolding.update({ where: { id }, data: { deletedAt: new Date() } });
  return NextResponse.json({ success: true });
}

// POST /api/portfolio/[id]/sell — sell partial or full position
export async function POST(req: NextRequest, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  const holding = await prisma.portfolioHolding.findFirst({
    where: { id, userId: session.user.id, deletedAt: null },
  });
  if (!holding) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json();
  if (body.action !== "sell") return NextResponse.json({ error: "Unknown action" }, { status: 400 });

  const parsed = sellSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });

  const { quantitySold, lotsSold, sellPriceIdr, sellDate, cashAccountId } = parsed.data;
  const sellPriceSen = idrToSen(sellPriceIdr);

  // For IDX stocks: quantity is lots
  const actualQtySold = holding.assetType === "stock_idx" && lotsSold
    ? lotsSold * 100
    : quantitySold;

  const costBasisSen = Math.round(actualQtySold * holding.avgBuyPrice);
  const proceedsSen = Math.round(actualQtySold * sellPriceSen);
  const gainLossSen = proceedsSen - costBasisSen;

  // Find gain/loss accounts
  const [gainAccount, lossAccount] = await Promise.all([
    prisma.coaAccount.findFirst({ where: { code: "4-203" } }),
    prisma.coaAccount.findFirst({ where: { code: "5-210" } }),
  ]);

  await prisma.$transaction(async (tx) => {
    // Journal: DEBIT Cash, CREDIT Investment Asset, CREDIT/DEBIT Gain/Loss
    const lines: { accountId: string; debit: number; credit: number }[] = [
      { accountId: cashAccountId, debit: proceedsSen, credit: 0 },
      { accountId: holding.accountId, debit: 0, credit: costBasisSen },
    ];

    if (gainLossSen > 0 && gainAccount) {
      lines.push({ accountId: gainAccount.id, debit: 0, credit: gainLossSen });
    } else if (gainLossSen < 0 && lossAccount) {
      lines.push({ accountId: lossAccount.id, debit: Math.abs(gainLossSen), credit: 0 });
    }

    await tx.journalEntry.create({
      data: {
        userId: session.user!.id!,
        entryDate: new Date(sellDate),
        description: `Sell ${holding.assetName} (${holding.ticker}): ${holding.assetType === "stock_idx" ? `${lotsSold ?? quantitySold} lot` : `${quantitySold} unit`}`,
        source: "MANUAL",
        status: "CONFIRMED",
        lines: { create: lines },
      },
    });

    // Update or soft-delete holding
    const newQty = holding.quantity - actualQtySold;
    const newLots = holding.lots ? holding.lots - (lotsSold ?? 0) : null;

    if (newQty <= 0) {
      await tx.portfolioHolding.update({ where: { id }, data: { deletedAt: new Date() } });
    } else {
      await tx.portfolioHolding.update({
        where: { id },
        data: { quantity: newQty, lots: newLots && newLots > 0 ? newLots : null },
      });
    }
  });

  return NextResponse.json({ gainLossSen, proceedsSen, costBasisSen });
}
