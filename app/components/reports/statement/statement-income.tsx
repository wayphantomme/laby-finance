"use client";

import { cn } from "@/lib/utils";
import { formatRupiah } from "@/lib/format";
import type { IncomeStatementData, ReportRow } from "@/lib/reports";
import { StatementHeader } from "./statement-header";
import { fmtStatement, sumCols, QUARTERS, MONTH_NAMES_FULL } from "./statement-utils";
import type { PeriodMode } from "./statement-utils";

interface Props {
  data: IncomeStatementData;
  mode: PeriodMode;
  month?: number;
}

// ─── Column definitions ───────────────────────────────────────────────────────

function buildColumns(mode: PeriodMode, month?: number) {
  if (mode === "monthly") {
    const m = month ?? 0;
    return [{ label: MONTH_NAMES_FULL[m], indices: [m] }];
  }
  if (mode === "quarterly") {
    return QUARTERS.map((q) => ({ label: q.label, indices: [...q.months] }));
  }
  // Annual: Q1–Q4 + Full Year — readable, no overflow
  return [
    ...QUARTERS.map((q) => ({ label: q.label, indices: [...q.months] })),
    { label: "Full Year", indices: Array.from({ length: 12 }, (_, i) => i) },
  ];
}

// ─── Section ──────────────────────────────────────────────────────────────────

function StatementSection({
  title,
  rows,
  cols,
  isExpense = false,
  totalLabel,
}: {
  title: string;
  rows: ReportRow[];
  cols: { label: string; indices: number[] }[];
  isExpense?: boolean;
  totalLabel: string;
}) {
  if (rows.length === 0) return null;

  const totalRow = cols.map((col) => sumCols(rows, col.indices));

  return (
    <>
      {/* Section label */}
      <tr>
        <td
          colSpan={cols.length + 1}
          className="pt-4 pb-1 px-4 text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-slate-400 border-b border-gray-200 dark:border-slate-600"
        >
          {title}
        </td>
      </tr>

      {/* Data rows */}
      {rows.map((row) => {
        const colVals = cols.map((col) => sumCols([row], col.indices));
        return (
          <tr
            key={row.accountId}
            className="border-b border-gray-50 dark:border-slate-700/50 hover:bg-gray-50 dark:hover:bg-slate-800/40 transition-colors"
          >
            <td className="py-2 pl-8 pr-4 text-sm text-gray-700 dark:text-slate-300 whitespace-nowrap">
              <span className="font-mono text-xs text-gray-400 dark:text-slate-500 mr-2">{row.code}</span>
              {row.nameEn}
            </td>
            {colVals.map((val, ci) => (
              <td
                key={ci}
                className={cn(
                  "py-2 px-4 text-right tabular-nums text-sm whitespace-nowrap",
                  val === 0
                    ? "text-gray-300 dark:text-slate-600"
                    : isExpense
                    ? "text-red-600 dark:text-red-400"
                    : "text-gray-800 dark:text-slate-200"
                )}
              >
                {fmtStatement(val)}
              </td>
            ))}
          </tr>
        );
      })}

      {/* Total row */}
      <tr className="border-t-2 border-b border-gray-300 dark:border-slate-500 bg-gray-50 dark:bg-slate-800/60">
        <td className="py-2.5 pl-4 pr-4 text-sm font-bold text-gray-800 dark:text-slate-200 whitespace-nowrap">
          {totalLabel}
        </td>
        {totalRow.map((val, ci) => (
          <td
            key={ci}
            className={cn(
              "py-2.5 px-4 text-right tabular-nums text-sm font-bold whitespace-nowrap",
              val === 0
                ? "text-gray-300 dark:text-slate-600"
                : isExpense
                ? "text-red-600 dark:text-red-400"
                : "text-green-700 dark:text-green-400"
            )}
          >
            {fmtStatement(val)}
          </td>
        ))}
      </tr>
    </>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function StatementIncome({ data, mode, month }: Props) {
  const cols = buildColumns(mode, month);

  const netCols = cols.map((col) => {
    const inc = sumCols(data.income, col.indices);
    const exp = sumCols(data.expense, col.indices);
    return inc - exp;
  });

  const periodLabel =
    mode === "monthly"
      ? `${MONTH_NAMES_FULL[month ?? 0]} ${data.year}`
      : mode === "quarterly"
      ? `Q1–Q4 ${data.year}`
      : `Fiscal Year ${data.year}`;

  return (
    <div className="px-6 py-5">
      <StatementHeader
        title="Income Statement"
        subtitle="Statement of Profit and Loss"
        periodLabel={periodLabel}
      />

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b-2 border-gray-300 dark:border-slate-500">
              <th className="py-2 pl-4 pr-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-slate-500 whitespace-nowrap min-w-[14rem]">
                Account
              </th>
              {cols.map((col) => (
                <th
                  key={col.label}
                  className="py-2 px-4 text-right text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-slate-500 whitespace-nowrap min-w-[9rem]"
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <StatementSection
              title="Revenue"
              rows={data.income}
              cols={cols}
              totalLabel="Total Revenue"
            />

            <StatementSection
              title="Operating Expenses"
              rows={data.expense}
              cols={cols}
              isExpense
              totalLabel="Total Expenses"
            />

            {/* Spacer */}
            <tr><td colSpan={cols.length + 1} className="py-1" /></tr>

            {/* Net Income / (Loss) */}
            <tr className="border-t-2 border-b-4 border-double border-gray-400 dark:border-slate-400 bg-gray-100 dark:bg-slate-800">
              <td className="py-3 pl-4 pr-4 text-sm font-extrabold text-gray-900 dark:text-slate-100 whitespace-nowrap">
                Net Income / (Loss)
              </td>
              {netCols.map((val, ci) => (
                <td
                  key={ci}
                  className={cn(
                    "py-3 px-4 text-right tabular-nums text-sm font-extrabold whitespace-nowrap",
                    val > 0
                      ? "text-green-700 dark:text-green-400"
                      : val < 0
                      ? "text-red-600 dark:text-red-400"
                      : "text-gray-300 dark:text-slate-600"
                  )}
                >
                  {val === 0
                    ? "—"
                    : val < 0
                    ? `(${formatRupiah(Math.abs(val))})`
                    : formatRupiah(val)}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      <p className="mt-4 text-xs text-gray-400 dark:text-slate-500 text-right">
        All amounts in IDR · {periodLabel}
      </p>
    </div>
  );
}
