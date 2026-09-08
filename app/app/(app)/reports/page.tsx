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
  /** 0-based month index for monthly view */
  month?: string;
  /** "spreadsheet" | "statement" — default statement */
  viewMode?: string;
  /** "annual" | "monthly" | "quarterly" — default annual */
  period?: string;
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

  const monthParam = sp.month !== undefined ? parseInt(sp.month) : undefined;

  const [incomeStatement, balanceSheet, cashFlow, netWorthHistory] =
    await Promise.all([
      // For annual/quarterly: always fetch full year so we can aggregate on client.
      // For monthly: fetch filtered month from server.
      computeIncomeStatement(userId, year, monthParam),
      computeBalanceSheet(userId, asOf),
      computeCashFlow(userId, year, monthParam),
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
      initialViewMode={(sp.viewMode as "spreadsheet" | "statement") ?? "statement"}
      initialPeriod={(sp.period as "annual" | "monthly" | "quarterly") ?? "annual"}
      initialMonth={monthParam ?? new Date().getMonth()}
    />
  );
}
