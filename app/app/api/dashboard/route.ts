import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = session.user.id;

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

  // Fetch all confirmed journal lines for this user (via entries)
  const allLines = await prisma.journalLine.findMany({
    where: {
      journalEntry: {
        userId,
        status: "CONFIRMED",
        deletedAt: null,
      },
    },
    include: {
      account: true,
      journalEntry: { select: { entryDate: true } },
    },
  });

  // Net worth = total ASSET debits - total ASSET credits
  //           - (total LIABILITY credits - total LIABILITY debits)
  let totalAssets = 0;
  let totalLiabilities = 0;

  // This month income / expense
  let monthIncome = 0;
  let monthExpense = 0;

  // Expense by account this month (for top categories)
  const expenseByAccount: Record<string, { name: string; amount: number }> = {};

  for (const line of allLines) {
    const type = line.account.type;
    const net = line.debit - line.credit; // positive = debit-heavy

    if (type === "ASSET") totalAssets += net;
    if (type === "LIABILITY") totalLiabilities -= net; // liabilities increase on credit

    const entryDate = new Date(line.journalEntry.entryDate);
    const inThisMonth = entryDate >= startOfMonth && entryDate <= endOfMonth;

    if (inThisMonth) {
      if (type === "INCOME") monthIncome += line.credit - line.debit;
      if (type === "EXPENSE") {
        const expAmount = line.debit - line.credit;
        monthExpense += expAmount;
        const key = line.accountId;
        if (!expenseByAccount[key]) {
          expenseByAccount[key] = { name: line.account.nameEn, amount: 0 };
        }
        expenseByAccount[key].amount += expAmount;
      }
    }
  }

  const netWorth = totalAssets - totalLiabilities;
  const cashFlow = monthIncome - monthExpense;

  // Top 5 expense categories this month
  const topExpenses = Object.values(expenseByAccount)
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5);

  // Monthly cash flow for the last 6 months (income vs expense)
  const monthlyData: { month: string; income: number; expense: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const start = new Date(d.getFullYear(), d.getMonth(), 1);
    const end = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59);
    let inc = 0;
    let exp = 0;
    for (const line of allLines) {
      const entryDate = new Date(line.journalEntry.entryDate);
      if (entryDate >= start && entryDate <= end) {
        if (line.account.type === "INCOME") inc += line.credit - line.debit;
        if (line.account.type === "EXPENSE") exp += line.debit - line.credit;
      }
    }
    monthlyData.push({
      month: d.toLocaleString("default", { month: "short" }),
      income: inc,
      expense: exp,
    });
  }

  return NextResponse.json({
    netWorth,
    monthIncome,
    monthExpense,
    cashFlow,
    topExpenses,
    monthlyData,
  });
}
