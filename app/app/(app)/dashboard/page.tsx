import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DashboardClient } from "./dashboard-client";

async function getDashboardData(userId: string) {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
  // Only fetch last 6 months for the chart + current month
  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

  // Two focused queries instead of one giant query over all history
  const [allTimeLines, recentLines] = await Promise.all([
    // For net worth: only ASSET + LIABILITY, no date filter needed
    prisma.journalLine.findMany({
      where: {
        journalEntry: { userId, status: "CONFIRMED", deletedAt: null },
        account: { type: { in: ["ASSET", "LIABILITY"] } },
      },
      include: { account: { select: { type: true } } },
    }),
    // For income/expense chart + this month summary: last 6 months only
    prisma.journalLine.findMany({
      where: {
        journalEntry: {
          userId,
          status: "CONFIRMED",
          deletedAt: null,
          entryDate: { gte: sixMonthsAgo },
        },
        account: { type: { in: ["INCOME", "EXPENSE"] } },
      },
      include: {
        account: true,
        journalEntry: { select: { entryDate: true } },
      },
    }),
  ]);

  // Net worth from all-time asset/liability lines
  let totalAssets = 0;
  let totalLiabilities = 0;
  for (const line of allTimeLines) {
    if (line.account.type === "ASSET") totalAssets += line.debit - line.credit;
    else totalLiabilities += line.credit - line.debit;
  }

  // This month + 6-month chart from recent lines
  let monthIncome = 0;
  let monthExpense = 0;
  const expenseByAccount: Record<string, { name: string; amount: number }> = {};

  // Build 6-month buckets
  const monthBuckets: Record<string, { income: number; expense: number }> = {};
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = d.toLocaleString("en", { month: "short" });
    monthBuckets[key] = { income: 0, expense: 0 };
  }

  for (const line of recentLines) {
    const entryDate = new Date(line.journalEntry.entryDate);
    const monthKey = entryDate.toLocaleString("en", { month: "short" });
    const inThisMonth = entryDate >= startOfMonth && entryDate <= endOfMonth;

    if (line.account.type === "INCOME") {
      const amt = line.credit - line.debit;
      if (monthBuckets[monthKey]) monthBuckets[monthKey].income += amt;
      if (inThisMonth) monthIncome += amt;
    } else {
      const amt = line.debit - line.credit;
      if (monthBuckets[monthKey]) monthBuckets[monthKey].expense += amt;
      if (inThisMonth) {
        monthExpense += amt;
        if (!expenseByAccount[line.accountId]) {
          expenseByAccount[line.accountId] = { name: line.account.nameEn, amount: 0 };
        }
        expenseByAccount[line.accountId].amount += amt;
      }
    }
  }

  const monthlyData = Object.entries(monthBuckets).map(([month, v]) => ({ month, ...v }));

  return {
    netWorth: totalAssets - totalLiabilities,
    monthIncome,
    monthExpense,
    cashFlow: monthIncome - monthExpense,
    topExpenses: Object.values(expenseByAccount)
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5),
    monthlyData,
  };
}

export default async function DashboardPage() {
  const session = await auth();
  const data = await getDashboardData(session!.user!.id!);
  return <DashboardClient data={data} />;
}
