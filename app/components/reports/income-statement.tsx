"use client";

import { ReportTable } from "./report-table";
import type { IncomeStatementData } from "@/lib/reports";
import { formatRupiah } from "@/lib/format";
import { cn } from "@/lib/utils";
import { MONTHS } from "@/lib/reports";

export function IncomeStatement({ data }: { data: IncomeStatementData }) {
  const totalIncome = {
    label: "Total Income",
    monthly: sumRows(data.income),
  };
  const totalExpense = {
    label: "Total Expenses",
    monthly: sumRows(data.expense),
  };

  return (
    <div>
      <ReportTable
        title="Income"
        rows={data.income}
        totalRow={totalIncome}
        highlightTotal
      />
      <ReportTable
        title="Expenses"
        rows={data.expense}
        totalRow={totalExpense}
        highlightTotal
        invertColor
      />

      {/* Net Income summary row */}
      <div className="overflow-x-auto rounded-lg border-2 border-gray-200 bg-gray-50">
        <table className="w-full text-xs tabular-nums">
          <tbody>
            <tr>
              <td className="sticky left-0 bg-gray-50 px-3 py-3 font-bold text-gray-900 w-48 min-w-[12rem]">
                Net Income / (Loss)
              </td>
              {Array.from({ length: 12 }, (_, i) => {
                const val = data.netIncomeByMonth[i] ?? 0;
                return (
                  <td
                    key={i}
                    className={cn(
                      "px-2 py-3 text-right font-bold min-w-[5.5rem]",
                      val > 0 ? "text-green-600" : val < 0 ? "text-red-500" : "text-gray-300"
                    )}
                  >
                    {val === 0 ? "—" : val < 0 ? `(${formatRupiah(Math.abs(val), { short: true })})` : formatRupiah(val, { short: true })}
                  </td>
                );
              })}
              <td
                className={cn(
                  "px-3 py-3 text-right font-bold text-sm min-w-[6rem]",
                  data.netIncomeByMonth.total > 0
                    ? "text-green-600"
                    : data.netIncomeByMonth.total < 0
                    ? "text-red-500"
                    : "text-gray-300"
                )}
              >
                {data.netIncomeByMonth.total === 0
                  ? "—"
                  : data.netIncomeByMonth.total < 0
                  ? `(${formatRupiah(Math.abs(data.netIncomeByMonth.total), { short: true })})`
                  : formatRupiah(data.netIncomeByMonth.total, { short: true })}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Month labels at bottom for reference */}
      <p className="mt-3 text-xs text-gray-400 text-right">
        Fiscal year {data.year} | Columns: {MONTHS.join(", ")}
      </p>
    </div>
  );
}

function sumRows(rows: { monthly: { [k: number]: number; total: number } }[]) {
  const result: { [k: number]: number; total: number } = { total: 0 };
  for (let i = 0; i < 12; i++) {
    result[i] = rows.reduce((s, r) => s + (r.monthly[i] ?? 0), 0);
    result.total += result[i];
  }
  return result;
}
