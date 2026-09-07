"use client";

import { cn } from "@/lib/utils";
import { MONTHS } from "@/lib/reports";
import { formatRupiah } from "@/lib/format";

export interface ReportRow {
  accountId: string;
  code: string;
  nameEn: string;
  monthly: { [k: number]: number; total: number };
}

interface ReportTableProps {
  title: string;
  rows: ReportRow[];
  totalRow?: { label: string; monthly: { [k: number]: number; total: number } };
  highlightTotal?: boolean;
  invertColor?: boolean; // expenses: positive = red
}

export function ReportTable({
  title,
  rows,
  totalRow,
  highlightTotal,
  invertColor = false,
}: ReportTableProps) {
  if (rows.length === 0) return null;

  function color(val: number) {
    if (val === 0) return "text-gray-300";
    if (invertColor) return val > 0 ? "text-red-500" : "text-green-600";
    return val > 0 ? "text-green-600" : "text-red-500";
  }

  function fmt(val: number) {
    if (val === 0) return "—";
    return formatRupiah(Math.abs(val), { short: true });
  }

  return (
    <div className="mb-6">
      <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2 px-1">
        {title}
      </h4>
      <div className="overflow-x-auto rounded-lg border border-gray-100">
        <table className="w-full text-xs tabular-nums">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="sticky left-0 bg-gray-50 px-3 py-2.5 text-left font-medium text-gray-400 w-48 min-w-[12rem]">
                Account
              </th>
              {MONTHS.map((m) => (
                <th key={m} className="px-2 py-2.5 text-right font-medium text-gray-400 min-w-[5.5rem]">
                  {m}
                </th>
              ))}
              <th className="px-3 py-2.5 text-right font-semibold text-gray-500 min-w-[6rem]">
                Total
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {rows.map((row) => (
              <tr key={row.accountId} className="bg-white hover:bg-gray-50 transition-colors">
                <td className="sticky left-0 bg-white px-3 py-2 text-gray-700 truncate max-w-[12rem]">
                  <span className="font-mono text-gray-400 mr-1.5">{row.code}</span>
                  {row.nameEn}
                </td>
                {Array.from({ length: 12 }, (_, i) => {
                  const val = row.monthly[i] ?? 0;
                  return (
                    <td key={i} className={cn("px-2 py-2 text-right", color(val))}>
                      {fmt(val)}
                    </td>
                  );
                })}
                <td className={cn("px-3 py-2 text-right font-semibold", color(row.monthly.total))}>
                  {fmt(row.monthly.total)}
                </td>
              </tr>
            ))}

            {totalRow && (
              <tr className={cn("border-t-2 border-gray-200", highlightTotal && "bg-gray-50")}>
                <td className="sticky left-0 bg-gray-50 px-3 py-2.5 font-semibold text-gray-800">
                  {totalRow.label}
                </td>
                {Array.from({ length: 12 }, (_, i) => {
                  const val = totalRow.monthly[i] ?? 0;
                  return (
                    <td key={i} className={cn("px-2 py-2.5 text-right font-semibold", color(val))}>
                      {fmt(val)}
                    </td>
                  );
                })}
                <td className={cn("px-3 py-2.5 text-right font-bold text-sm", color(totalRow.monthly.total))}>
                  {fmt(totalRow.monthly.total)}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
