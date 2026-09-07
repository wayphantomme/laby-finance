import { auth } from "@/lib/auth";
import {
  computeIncomeStatement,
  computeBalanceSheet,
  computeCashFlow,
  computeNetWorthHistory,
} from "@/lib/reports";
import { ReportsClient } from "./reports-client";

interface SearchParams {
  year?: string;
  asOf?: string;
}

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const session = await auth();
  const userId = session!.user!.id!;

  const sp = await searchParams;
  const year = parseInt(sp.year ?? String(new Date().getFullYear()));
  const asOf = sp.asOf
    ? new Date(sp.asOf + "T23:59:59")
    : new Date(year, new Date().getMonth() + 1, 0, 23, 59, 59);

  const [incomeStatement, balanceSheet, cashFlow, netWorthHistory] =
    await Promise.all([
      computeIncomeStatement(userId, year),
      computeBalanceSheet(userId, asOf),
      computeCashFlow(userId, year),
      computeNetWorthHistory(userId, year),
    ]);

  return (
    <ReportsClient
      incomeStatement={incomeStatement}
      balanceSheet={balanceSheet}
      cashFlow={cashFlow}
      netWorthHistory={netWorthHistory}
      year={year}
      asOf={asOf.toISOString().split("T")[0]}
    />
  );
}
