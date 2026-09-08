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
}: {
  title: string;
  rows: ReportRow[];
  total: number;
  totalLabel: string;
}) {
  return (
    <div className="mb-6">
      {/* Section label */}
      <div className="py-1.5 px-4 border-b border-gray-200 dark:border-slate-600">
        <span className="text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-slate-400">
          {title}
        </span>
      </div>

      <table className="w-full border-collapse">
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td className="py-3 pl-8 text-sm text-gray-400 dark:text-slate-500 italic" colSpan={2}>
                No entries
              </td>
            </tr>
          ) : (
            rows.map((row) => (
              <tr
                key={row.accountId}
                className="border-b border-gray-50 dark:border-slate-700/50 hover:bg-gray-50 dark:hover:bg-slate-800/40 transition-colors"
              >
                <td className="py-2 pl-8 pr-4 text-sm text-gray-700 dark:text-slate-300 whitespace-nowrap">
                  <span className="font-mono text-xs text-gray-400 dark:text-slate-500 mr-2">{row.code}</span>
                  {row.nameEn}
                </td>
                <td className={cn(
                  "py-2 px-4 text-right tabular-nums text-sm whitespace-nowrap w-40",
                  row.monthly.total === 0 ? "text-gray-300 dark:text-slate-600" : "text-gray-800 dark:text-slate-200"
                )}>
                  {row.monthly.total === 0 ? "—" : formatRupiah(row.monthly.total)}
                </td>
              </tr>
            ))
          )}
        </tbody>
        <tfoot>
          <tr className="border-t-2 border-gray-300 dark:border-slate-500 bg-gray-50 dark:bg-slate-800/60">
            <td className="py-2.5 pl-4 pr-4 text-sm font-bold text-gray-800 dark:text-slate-200 whitespace-nowrap">
              {totalLabel}
            </td>
            <td className="py-2.5 px-4 text-right tabular-nums text-sm font-bold text-gray-900 dark:text-slate-100 whitespace-nowrap w-40">
              {formatRupiah(total)}
            </td>
          </tr>
        </tfoot>
      </table>
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
        "flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium mb-6 border",
        data.isBalanced
          ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800"
          : "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800"
      )}>
        {data.isBalanced
          ? <CheckCircle className="h-4 w-4 shrink-0" />
          : <AlertCircle className="h-4 w-4 shrink-0" />}
        {data.isBalanced
          ? "Balanced · Assets = Liabilities + Equity"
          : "Imbalance detected · Assets ≠ Liabilities + Equity"}
      </div>

      {/* Two-column layout on large screens */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
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
        <div>
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

          {/* Grand total */}
          <div className="flex items-center justify-between py-3 px-4 border-t-2 border-b-4 border-double border-gray-400 dark:border-slate-400 bg-gray-100 dark:bg-slate-800 rounded-b">
            <span className="text-sm font-extrabold text-gray-900 dark:text-slate-100 whitespace-nowrap">
              Total Liabilities + Equity
            </span>
            <span className={cn(
              "tabular-nums text-sm font-extrabold whitespace-nowrap ml-8",
              data.isBalanced ? "text-gray-900 dark:text-slate-100" : "text-red-600 dark:text-red-400"
            )}>
              {formatRupiah(totalLiabEquity)}
            </span>
          </div>
        </div>
      </div>

      <p className="mt-4 text-xs text-gray-400 dark:text-slate-500 text-right">
        All amounts in IDR · As of {asOfDate}
      </p>
    </div>
  );
}
