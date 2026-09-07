"use client";

import type { BalanceSheetData } from "@/lib/reports";
import { formatRupiah } from "@/lib/format";
import { cn } from "@/lib/utils";
import { CheckCircle, AlertCircle } from "lucide-react";

const VARIANT_STYLES = {
  asset:     { header: "text-blue-700 dark:text-blue-400",   total: "text-blue-800 dark:text-blue-300" },
  liability: { header: "text-orange-700 dark:text-orange-400", total: "text-orange-800 dark:text-orange-300" },
  equity:    { header: "text-purple-700 dark:text-purple-400", total: "text-purple-800 dark:text-purple-300" },
};

function Section({ title, rows, total, totalLabel, variant }: {
  title: string;
  rows: BalanceSheetData["assets"];
  total: number;
  totalLabel: string;
  variant: "asset" | "liability" | "equity";
}) {
  const s = VARIANT_STYLES[variant];
  return (
    <div className="rounded-lg border border-gray-100 dark:border-slate-700 overflow-hidden">
      <div className={cn("px-4 py-2.5 bg-gray-50 dark:bg-slate-900/50 border-b border-gray-100 dark:border-slate-700 font-semibold text-sm", s.header)}>
        {title}
      </div>
      <table className="w-full text-sm">
        <tbody className="divide-y divide-gray-50 dark:divide-slate-700/50">
          {rows.length === 0 ? (
            <tr>
              <td colSpan={2} className="px-4 py-3 text-center text-gray-400 dark:text-slate-500 text-xs">No entries</td>
            </tr>
          ) : (
            rows.map((row) => (
              <tr key={row.accountId} className="bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
                <td className="px-4 py-2.5 text-gray-700 dark:text-slate-300">
                  <span className="font-mono text-xs text-gray-400 dark:text-slate-500 mr-2">{row.code}</span>
                  {row.nameEn}
                </td>
                <td className="px-4 py-2.5 text-right font-medium tabular-nums text-gray-800 dark:text-slate-200">
                  {row.monthly.total === 0
                    ? <span className="text-gray-300 dark:text-slate-600">—</span>
                    : formatRupiah(row.monthly.total)}
                </td>
              </tr>
            ))
          )}
        </tbody>
        <tfoot>
          <tr className="border-t-2 border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-900/50">
            <td className={cn("px-4 py-3 font-bold", s.total)}>{totalLabel}</td>
            <td className={cn("px-4 py-3 text-right font-bold text-base tabular-nums", s.total)}>
              {formatRupiah(total)}
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

export function BalanceSheet({ data }: { data: BalanceSheetData }) {
  const asOfDate = new Date(data.asOf).toLocaleDateString("id-ID", {
    day: "numeric", month: "long", year: "numeric",
  });

  return (
    <div className="space-y-5">
      <div className={cn(
        "flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium",
        data.isBalanced
          ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400"
          : "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400"
      )}>
        {data.isBalanced ? <CheckCircle className="h-4 w-4 shrink-0" /> : <AlertCircle className="h-4 w-4 shrink-0" />}
        {data.isBalanced
          ? `Balance sheet is balanced as of ${asOfDate}`
          : `Imbalance detected as of ${asOfDate} — Assets ≠ Liabilities + Equity`}
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Section title="Assets" rows={data.assets} total={data.totalAssets} totalLabel="Total Assets" variant="asset" />
        <div className="space-y-4">
          <Section title="Liabilities" rows={data.liabilities} total={data.totalLiabilities} totalLabel="Total Liabilities" variant="liability" />
          <Section title="Equity" rows={data.equity} total={data.totalEquity} totalLabel="Total Equity" variant="equity" />
          <div className="flex justify-between items-center rounded-lg border-2 border-gray-200 dark:border-slate-600 px-4 py-3 bg-gray-50 dark:bg-slate-900/50">
            <span className="font-bold text-gray-800 dark:text-slate-200">Total Liabilities + Equity</span>
            <span className="font-bold text-base tabular-nums text-gray-900 dark:text-slate-100">
              {formatRupiah(data.totalLiabilities + data.totalEquity)}
            </span>
          </div>
        </div>
      </div>
      <p className="text-xs text-gray-400 dark:text-slate-500 text-right">As of {asOfDate}</p>
    </div>
  );
}
