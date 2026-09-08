"use client";

import { useState, useTransition } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Download, ChevronLeft, ChevronRight, LayoutGrid, FileText } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// Spreadsheet views (existing)
import { IncomeStatement } from "@/components/reports/income-statement";
import { BalanceSheet } from "@/components/reports/balance-sheet";
import { CashFlowStatement } from "@/components/reports/cash-flow-statement";
import { NetWorthChart } from "@/components/reports/net-worth-chart";

// Statement views (new)
import { StatementIncome } from "@/components/reports/statement/statement-income";
import { StatementBalance } from "@/components/reports/statement/statement-balance";
import { StatementCashFlow } from "@/components/reports/statement/statement-cashflow";

import type { IncomeStatementData, BalanceSheetData, CashFlowData } from "@/lib/reports";
import { MONTH_NAMES_FULL } from "@/components/reports/statement/statement-utils";

// ─── Types ────────────────────────────────────────────────────────────────────

type Tab = "income" | "balance" | "cashflow";
type ViewMode = "spreadsheet" | "statement";
type PeriodMode = "annual" | "monthly" | "quarterly";

const TABS: { id: Tab; label: string }[] = [
  { id: "income",   label: "Income Statement" },
  { id: "balance",  label: "Balance Sheet" },
  { id: "cashflow", label: "Cash Flow" },
];

const PERIODS: { id: PeriodMode; label: string }[] = [
  { id: "monthly",   label: "Monthly" },
  { id: "quarterly", label: "Quarterly" },
  { id: "annual",    label: "Annual" },
];

interface Props {
  incomeStatement: IncomeStatementData;
  balanceSheet: BalanceSheetData;
  cashFlow: CashFlowData;
  netWorthHistory: { month: string; netWorth: number }[];
  year: number;
  asOf: string;
  initialViewMode: ViewMode;
  initialPeriod: PeriodMode;
  initialMonth: number;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function ReportsClient({
  incomeStatement,
  balanceSheet,
  cashFlow,
  netWorthHistory,
  year,
  asOf,
  initialViewMode,
  initialPeriod,
  initialMonth,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();

  const [activeTab, setActiveTab]   = useState<Tab>("income");
  const [viewMode, setViewMode]     = useState<ViewMode>(initialViewMode);
  const [period, setPeriod]         = useState<PeriodMode>(initialPeriod);
  const [selectedMonth, setSelectedMonth] = useState<number>(initialMonth);
  const [isPending, startTransition] = useTransition();

  // ── Navigation ────────────────────────────────────────────────────────────

  function navigate(params: {
    year?: number;
    asOf?: string;
    month?: number;
    period?: PeriodMode;
  }) {
    const url = new URL(pathname, "http://x");
    url.searchParams.set("year", String(params.year ?? year));
    url.searchParams.set("viewMode", viewMode);
    url.searchParams.set("period", params.period ?? period);

    if (params.asOf) {
      url.searchParams.set("asOf", params.asOf);
    }

    // month param: send to server only for monthly period
    const effectivePeriod = params.period ?? period;
    const effectiveMonth  = params.month !== undefined ? params.month : selectedMonth;
    if (effectivePeriod === "monthly") {
      url.searchParams.set("month", String(effectiveMonth));
    } else {
      url.searchParams.delete("month");
    }

    startTransition(() =>
      router.push(pathname + "?" + url.searchParams.toString())
    );
  }

  function handlePeriodChange(p: PeriodMode) {
    setPeriod(p);
    navigate({ period: p });
  }

  function handleMonthChange(m: number) {
    setSelectedMonth(m);
    if (period === "monthly") navigate({ month: m });
  }

  // ── CSV download ──────────────────────────────────────────────────────────

  function downloadCsv(tab: Tab) {
    const monthSuffix = period === "monthly" ? `&month=${selectedMonth}` : "";
    const urls: Record<Tab, string> = {
      income:   `/api/reports/income-statement?year=${year}${monthSuffix}&format=csv`,
      balance:  `/api/reports/balance-sheet?asOf=${asOf}&format=csv`,
      cashflow: `/api/reports/cash-flow?year=${year}${monthSuffix}&format=csv`,
    };
    window.open(urls[tab], "_blank");
  }

  const hasAnyData =
    incomeStatement.income.length > 0 ||
    incomeStatement.expense.length > 0 ||
    balanceSheet.assets.length > 0;

  // Period label for display
  const periodLabel =
    period === "monthly"
      ? `${MONTH_NAMES_FULL[selectedMonth]} ${year}`
      : period === "quarterly"
      ? `Q1–Q4 ${year}`
      : `Fiscal Year ${year}`;

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-5">
      {/* ── Page header ── */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-slate-100">Financial Reports</h2>
          <p className="text-sm text-gray-500 dark:text-slate-400 opacity-80">
            {isPending ? "Loading…" : periodLabel}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* View mode toggle */}
          <div className="flex items-center rounded-lg border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-800 overflow-hidden text-sm">
            <button
              onClick={() => setViewMode("spreadsheet")}
              className={`flex items-center gap-1.5 px-3 py-2 transition-colors ${
                viewMode === "spreadsheet"
                  ? "bg-primary-600 text-white"
                  : "text-gray-500 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-700"
              }`}
              title="Spreadsheet view"
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Spreadsheet</span>
            </button>
            <button
              onClick={() => setViewMode("statement")}
              className={`flex items-center gap-1.5 px-3 py-2 transition-colors ${
                viewMode === "statement"
                  ? "bg-primary-600 text-white"
                  : "text-gray-500 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-700"
              }`}
              title="Statement view"
            >
              <FileText className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Statement</span>
            </button>
          </div>

          {/* Year navigator */}
          <div className="flex items-center gap-1 rounded-lg border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-800 overflow-hidden">
            <button
              onClick={() => navigate({ year: year - 1 })}
              className="p-2 text-gray-500 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
              aria-label="Previous year"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="px-2 text-sm font-semibold text-gray-800 dark:text-slate-200 min-w-[3.5rem] text-center tabular-nums">
              {year}
            </span>
            <button
              onClick={() => navigate({ year: year + 1 })}
              disabled={year >= new Date().getFullYear()}
              className="p-2 text-gray-500 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors disabled:opacity-30"
              aria-label="Next year"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {/* Balance sheet: As of date picker */}
          {activeTab === "balance" && (
            <div className="flex items-center gap-2">
              <label className="text-xs text-gray-400 dark:text-slate-500 whitespace-nowrap">As of</label>
              <input
                type="date"
                value={asOf}
                max={new Date().toISOString().split("T")[0]}
                onChange={(e) => navigate({ asOf: e.target.value })}
                className="rounded-lg border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-800 px-2 py-1.5 text-sm text-gray-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-600"
              />
            </div>
          )}

          <Button variant="secondary" size="sm" onClick={() => downloadCsv(activeTab)}>
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">Export CSV</span>
          </Button>
        </div>
      </div>

      {/* ── Net worth chart ── */}
      <Card>
        <div className="mb-3">
          <p className="text-xs font-medium uppercase tracking-wide text-gray-400 dark:text-slate-500">Net Worth Trend</p>
          <p className="text-sm text-gray-500 dark:text-slate-400">12 months of {year}</p>
        </div>
        <NetWorthChart data={netWorthHistory} />
      </Card>

      {/* ── Controls row: period + tab + (monthly: month selector) ── */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Period selector */}
        <div className="flex rounded-lg border border-gray-200 dark:border-slate-600 overflow-hidden bg-white dark:bg-slate-800 text-sm shrink-0">
          {PERIODS.map((p) => (
            <button
              key={p.id}
              onClick={() => handlePeriodChange(p.id)}
              className={`px-3 py-2 font-medium transition-colors whitespace-nowrap ${
                period === p.id
                  ? "bg-gray-800 dark:bg-slate-200 text-white dark:text-slate-900"
                  : "text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Month selector — only visible when period === monthly */}
        {period === "monthly" && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleMonthChange(selectedMonth === 0 ? 11 : selectedMonth - 1)}
              className="p-1.5 rounded-lg border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-500 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
              aria-label="Previous month"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <select
              value={selectedMonth}
              onChange={(e) => handleMonthChange(parseInt(e.target.value))}
              className="rounded-lg border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-800 px-2 py-1.5 text-sm font-medium text-gray-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-600"
            >
              {MONTH_NAMES_FULL.map((name, i) => (
                <option key={i} value={i}>{name}</option>
              ))}
            </select>
            <button
              onClick={() => handleMonthChange(selectedMonth === 11 ? 0 : selectedMonth + 1)}
              className="p-1.5 rounded-lg border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-500 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
              aria-label="Next month"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      {/* ── Tab switcher ── */}
      <div className="flex overflow-x-auto pb-1 -mx-4 px-4 lg:mx-0 lg:px-0">
        <div className="flex rounded-lg border border-gray-200 dark:border-slate-600 overflow-hidden bg-white dark:bg-slate-800 text-sm shrink-0">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 font-medium transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? "bg-primary-600 text-white"
                  : "text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Report content ── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`${activeTab}-${viewMode}-${period}-${selectedMonth}-${year}-${asOf}`}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.15 }}
        >
          {!hasAnyData ? (
            <Card>
              <div className="flex flex-col items-center justify-center h-40 text-sm text-gray-400 dark:text-slate-500 gap-2">
                <p>No transactions recorded yet.</p>
                <p className="text-xs">Add transactions to see your financial statements.</p>
              </div>
            </Card>
          ) : viewMode === "spreadsheet" ? (
            /* ── Spreadsheet view ── */
            <Card className="overflow-hidden">
              {activeTab === "income"   && <IncomeStatement data={incomeStatement} />}
              {activeTab === "balance"  && <BalanceSheet data={balanceSheet} />}
              {activeTab === "cashflow" && <CashFlowStatement data={cashFlow} />}
            </Card>
          ) : (
            /* ── Statement view ── */
            <Card className="overflow-hidden">
              {activeTab === "income" && (
                <StatementIncome
                  data={incomeStatement}
                  mode={period}
                  month={selectedMonth}
                />
              )}
              {activeTab === "balance" && (
                <StatementBalance data={balanceSheet} />
              )}
              {activeTab === "cashflow" && (
                <StatementCashFlow
                  data={cashFlow}
                  mode={period}
                  month={selectedMonth}
                />
              )}
            </Card>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
