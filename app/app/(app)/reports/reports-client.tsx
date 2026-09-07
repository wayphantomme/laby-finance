"use client";

import { useState, useTransition } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Download, ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { IncomeStatement } from "@/components/reports/income-statement";
import { BalanceSheet } from "@/components/reports/balance-sheet";
import { CashFlowStatement } from "@/components/reports/cash-flow-statement";
import { NetWorthChart } from "@/components/reports/net-worth-chart";
import type { IncomeStatementData, BalanceSheetData, CashFlowData } from "@/lib/reports";

type Tab = "income" | "balance" | "cashflow";

const TABS: { id: Tab; label: string }[] = [
  { id: "income",   label: "Income Statement" },
  { id: "balance",  label: "Balance Sheet" },
  { id: "cashflow", label: "Cash Flow" },
];

interface Props {
  incomeStatement: IncomeStatementData;
  balanceSheet: BalanceSheetData;
  cashFlow: CashFlowData;
  netWorthHistory: { month: string; netWorth: number }[];
  year: number;
  asOf: string; // YYYY-MM-DD
}

export function ReportsClient({ incomeStatement, balanceSheet, cashFlow, netWorthHistory, year, asOf }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [activeTab, setActiveTab] = useState<Tab>("income");
  const [isPending, startTransition] = useTransition();

  function navigate(params: { year?: number; asOf?: string }) {
    const url = new URL(pathname, "http://x");
    url.searchParams.set("year", String(params.year ?? year));
    if (params.asOf) url.searchParams.set("asOf", params.asOf);
    else if (activeTab !== "balance") url.searchParams.delete("asOf");
    startTransition(() => router.push(pathname + "?" + url.searchParams.toString()));
  }

  function downloadCsv(tab: Tab) {
    const urls: Record<Tab, string> = {
      income:   `/api/reports/income-statement?year=${year}&format=csv`,
      balance:  `/api/reports/balance-sheet?asOf=${asOf}&format=csv`,
      cashflow: `/api/reports/cash-flow?year=${year}&format=csv`,
    };
    window.open(urls[tab], "_blank");
  }

  const hasAnyData =
    incomeStatement.income.length > 0 ||
    incomeStatement.expense.length > 0 ||
    balanceSheet.assets.length > 0;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Financial Reports</h2>
          <p className="text-sm text-gray-500 opacity-60">
            {isPending ? "Loading..." : `Fiscal year ${year}`}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Year navigator */}
          <div className="flex items-center gap-1 rounded-lg border border-gray-200 bg-white overflow-hidden">
            <button
              onClick={() => navigate({ year: year - 1 })}
              className="p-2 text-gray-500 hover:bg-gray-50 transition-colors"
              aria-label="Previous year"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="px-2 text-sm font-semibold text-gray-800 min-w-[3.5rem] text-center tabular-nums">
              {year}
            </span>
            <button
              onClick={() => navigate({ year: year + 1 })}
              disabled={year >= new Date().getFullYear()}
              className="p-2 text-gray-500 hover:bg-gray-50 transition-colors disabled:opacity-30"
              aria-label="Next year"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {/* Balance sheet date picker (only show on balance tab) */}
          {activeTab === "balance" && (
            <div className="flex items-center gap-2">
              <label className="text-xs text-gray-400 whitespace-nowrap">As of</label>
              <input
                type="date"
                value={asOf}
                max={new Date().toISOString().split("T")[0]}
                onChange={(e) => navigate({ asOf: e.target.value })}
                className="rounded-lg border border-gray-200 bg-white px-2 py-1.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary-600"
              />
            </div>
          )}

          <Button variant="secondary" size="sm" onClick={() => downloadCsv(activeTab)}>
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">Export CSV</span>
          </Button>
        </div>
      </div>

      {/* Net worth chart */}
      <Card>
        <div className="mb-3">
          <p className="text-xs font-medium uppercase tracking-wide text-gray-400">Net Worth Trend</p>
          <p className="text-sm text-gray-500">12 months of {year}</p>
        </div>
        <NetWorthChart data={netWorthHistory} />
      </Card>

      {/* Tab switcher — scrollable on mobile */}
      <div className="flex overflow-x-auto pb-1 -mx-4 px-4 lg:mx-0 lg:px-0">
        <div className="flex rounded-lg border border-gray-200 overflow-hidden bg-white text-sm shrink-0">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 font-medium transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? "bg-primary-600 text-white"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Report content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab + year + asOf}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.15 }}
        >
          {!hasAnyData ? (
            <Card>
              <div className="flex flex-col items-center justify-center h-40 text-sm text-gray-400 gap-2">
                <p>No transactions recorded yet.</p>
                <p className="text-xs">Add transactions to see your financial statements.</p>
              </div>
            </Card>
          ) : (
            <Card className="overflow-hidden">
              {activeTab === "income"   && <IncomeStatement data={incomeStatement} />}
              {activeTab === "balance"  && <BalanceSheet data={balanceSheet} />}
              {activeTab === "cashflow" && <CashFlowStatement data={cashFlow} />}
            </Card>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
