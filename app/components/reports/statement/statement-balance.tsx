"use client";

import { cn } from "@/lib/utils";
import { formatRupiah } from "@/lib/format";
import type { BalanceSheetData, ReportRow } from "@/lib/reports";
import { StatementHeader } from "./statement-header";
import { CheckCircle, AlertCircle } from "lucide-react";

interface Props {
  data: BalanceSheetData;
}

// ─── Section ──────────────────────────────────────────────────────────────────

function Section({
  title,
  rows,
  total,
  totalLabel,
  indent = false,
}: {
  title: string;
  rows: ReportRow[];
  total: number;
  totalLabel: string;
  indent?: boolean;
}) {
  return (
    <div className="mb-1">
      <div className="py-1.5 border-b border-gray-200 dark:border-slate-600">
        <span className="text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-slate-400">
          {title}
        </span>
      </div>

      {rows.length === 0 ? (
        <div className="py-3 pl-6 text-sm text-gray-400 dark:text-slate-500 italic">No entries</div>
      ) : (
        rows.map((row) => (
          <div
            key={row.accountId}
            className="flex items-center justify-between py-1.5 border-b border-gray-50 dark:border-slate-700/50 hover:bg-gray-50 dark:hover:bg-slate-800/40 transition-colors"
          >
            <div className={cn("flex items-baseline gap-2 text-sm text-gray-700 dark:text-slate-300", indent ? "pl-8" : "pl-6")}>
              <span className="font-mono text-xs text-gray-400 dark:text-slate-500 shrink-0">{row.code}</span>
              <span>{row.nameEn}</span>
            </div>
            <div className={cn(
              "tabular-nums text-sm pr-4 min-w-[10rem] text-right",
              row.monthly.total === 0 ? "text-gray-300 dark:text-slate-600" : "text-gray-800 dark:text-slate-200"
            )}>
              {row.monthly.total === 0 ? "—" : formatRupiah(row.monthly.total)}
            </div>
          </div>
        ))
      )}

      {/* Total */}
      <div className="flex items-center justify-between py-2 border-t-2 border-b border-gray-300 dark:border-slate-500 bg-gray-50 dark:bg-slate-800/60">
        <div className="pl-4 text-sm font-bold text-gray-800 dark:text-slate-200">{totalLabel}</div>
        <div className="pr-4 tabular-nums text-sm font-bold text-gray-900 dark:text-slate-100 min-w-[10rem] text-right">
          {formatRupiah(total)}
        </div>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function StatementBalance({ data }: Props) {
  const asOfDate = new Date(data.asOf).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const totalLiabEquity = data.totalLiabilities + data.totalEquity;

  return (
    <div className="px-6 py-5">
      <StatementHeader
        title="Balance Sheet"
        subtitle="Statement of Financial Position"
        periodLabel={`As of ${asOfDate}`}
      />

      {/* Balance indicator */}
      <div className={cn(
        "flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium mb-6",
        data.isBalanced
          ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800"
          : "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800"
      )}>
        {data.isBalanced
          ? <CheckCircle className="h-4 w-4 shrink-0" />
          : <AlertCircle className="h-4 w-4 shrink-0" />}
        {data.isBalanced
          ? `Balanced · Assets = Liabilities + Equity`
          : `Imbalance detected · Assets ≠ Liabilities + Equity`}
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Left: Assets */}
        <div>
          <Section
            title="Assets"
            rows={data.assets}
            total={data.totalAssets}
            totalLabel="Total Assets"
          />
        </div>

        {/* Right: Liabilities + Equity */}
        <div className="space-y-6">
          <Section
            title="Liabilities"
            rows={data.liabilities}
            total={data.totalLiabilities}
            totalLabel="Total Liabilities"
          />
          <Section
            title="Equity"
            rows={data.equity}
            total={data.totalEquity}
            totalLabel="Total Equity"
          />

          {/* Liabilities + Equity grand total */}
          <div className="flex items-center justify-between py-3 border-t-2 border-b-4 border-double border-gray-400 dark:border-slate-400 bg-gray-100 dark:bg-slate-800">
            <div className="pl-4 text-sm font-extrabold text-gray-900 dark:text-slate-100">
              Total Liabilities + Equity
            </div>
            <div className={cn(
              "pr-4 tabular-nums text-sm font-extrabold min-w-[10rem] text-right",
              data.isBalanced ? "text-gray-900 dark:text-slate-100" : "text-red-600 dark:text-red-400"
            )}>
              {formatRupiah(totalLiabEquity)}
            </div>
          </div>
        </div>
      </div>

      <p className="mt-4 text-xs text-gray-400 dark:text-slate-500 text-right">
        All amounts in IDR · As of {asOfDate}
      </p>
    </div>
  );
}
