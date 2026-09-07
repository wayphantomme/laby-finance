"use client";

import { ReportTable } from "./report-table";
import type { CashFlowData } from "@/lib/reports";
import { formatRupiah } from "@/lib/format";
import { MONTHS } from "@/lib/reports";
import { cn } from "@/lib/utils";

export function CashFlowStatement({ data }: { data: CashFlowData }) {
  function sectionTotal(rows: CashFlowData["operating"]) {
    const result: { [k: number]: number; total: number } = { total: 0 };
    for (let i = 0; i < 12; i++) {
      result[i] = rows.reduce((s, r) => s + (r.monthly[i] ?? 0), 0);
      result.total += result[i];
    }
    return result;
  }

  return (
    <div>
      <ReportTable
        title="Operating Activities"
        rows={data.operating}
        totalRow={{ label: "Net from Operations", monthly: sectionTotal(data.operating) }}
        highlightTotal
      />
      <ReportTable
        title="Investing Activities"
        rows={data.investing}
        totalRow={{ label: "Net from Investing", monthly: sectionTotal(data.investing) }}
        highlightTotal
      />
      <ReportTable
        title="Financing Activities"
        rows={data.financing}
        totalRow={{ label: "Net from Financing", monthly: sectionTotal(data.financing) }}
        highlightTotal
      />

      {/* Net cash flow summary */}
      <div className="overflow-x-auto rounded-lg border-2 border-gray-200 bg-gray-50 mt-2">
        <table className="w-full text-xs tabular-nums">
          <tbody>
            <tr>
              <td className="sticky left-0 bg-gray-50 px-3 py-3 font-bold text-gray-900 w-48 min-w-[12rem]">
                Net Cash Flow
              </td>
              {Array.from({ length: 12 }, (_, i) => {
                const val = data.netByMonth[i] ?? 0;
                return (
                  <td
                    key={i}
                    className={cn(
                      "px-2 py-3 text-right font-bold min-w-[5.5rem]",
                      val > 0 ? "text-green-600" : val < 0 ? "text-red-500" : "text-gray-300"
                    )}
                  >
                    {val === 0 ? "—" : val < 0
                      ? `(${formatRupiah(Math.abs(val), { short: true })})`
                      : formatRupiah(val, { short: true })}
                  </td>
                );
              })}
              <td
                className={cn(
                  "px-3 py-3 text-right font-bold text-sm min-w-[6rem]",
                  data.netByMonth.total > 0 ? "text-green-600"
                  : data.netByMonth.total < 0 ? "text-red-500"
                  : "text-gray-300"
                )}
              >
                {data.netByMonth.total === 0 ? "—"
                  : data.netByMonth.total < 0
                  ? `(${formatRupiah(Math.abs(data.netByMonth.total), { short: true })})`
                  : formatRupiah(data.netByMonth.total, { short: true })}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <p className="mt-3 text-xs text-gray-400 text-right">
        Fiscal year {data.year} | Columns: {MONTHS.join(", ")}
      </p>
    </div>
  );
}
