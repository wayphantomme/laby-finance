"use client";

import { cn } from "@/lib/utils";
import { formatRupiah } from "@/lib/format";
import type { IncomeStatementData, ReportRow } from "@/lib/reports";
import { StatementHeader } from "./statement-header";
import { fmtStatement, sumCols, QUARTERS, MONTH_NAMES_FULL } from "./statement-utils";
import type { PeriodMode } from "./statement-utils";
import { MONTHS } from "@/lib/reports";

interface Props {
  data: IncomeStatementData;
  mode: PeriodMode;
  /** For monthly mode: 0–11 */
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
  // annual: one col per month + full-year total
  return [
    ...MONTHS.map((m, i) => ({ label: m, indices: [i] })),
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
  const grandTotal = totalRow.reduce((s, v) => s + v, 0);

  return (
    <div className="mb-1">
      {/* Section header */}
      <div className="flex items-center gap-3 py-1 border-b border-gray-200 dark:border-slate-600">
        <span className="text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-slate-400">
          {title}
        </span>
      </div>

      {/* Rows */}
      {rows.map((row) => {
        const colVals = cols.map((col) => sumCols([row], col.indices));
        const rowTotal = colVals.reduce((s, v) => s + v, 0);
        return (
          <div
            key={row.accountId}
            className="grid items-center py-1.5 border-b border-gray-50 dark:border-slate-700/50 hover:bg-gray-50 dark:hover:bg-slate-800/40 transition-colors"
            style={{ gridTemplateColumns: `1fr repeat(${cols.length}, minmax(7rem, auto))` }}
          >
            <div className="pl-6 pr-3 text-sm text-gray-700 dark:text-slate-300 flex items-baseline gap-2">
              <span className="font-mono text-xs text-gray-400 dark:text-slate-500 shrink-0">{row.code}</span>
              <span className="truncate">{row.nameEn}</span>
            </div>
            {colVals.map((val, ci) => (
              <div
                key={ci}
                className={cn(
                  "text-right pr-4 tabular-nums text-sm",
                  val === 0
                    ? "text-gray-300 dark:text-slate-600"
                    : isExpense
                    ? "text-red-600 dark:text-red-400"
                    : "text-gray-800 dark:text-slate-200"
                )}
              >
                {fmtStatement(val)}
              </div>
            ))}
          </div>
        );
      })}

      {/* Total row */}
      <div
        className="grid items-center py-2 border-t-2 border-b border-gray-300 dark:border-slate-500 bg-gray-50 dark:bg-slate-800/60"
        style={{ gridTemplateColumns: `1fr repeat(${cols.length}, minmax(7rem, auto))` }}
      >
        <div className="pl-4 pr-3 text-sm font-bold text-gray-800 dark:text-slate-200">{totalLabel}</div>
        {totalRow.map((val, ci) => (
          <div
            key={ci}
            className={cn(
              "text-right pr-4 tabular-nums text-sm font-bold",
              val === 0
                ? "text-gray-300 dark:text-slate-600"
                : isExpense
                ? "text-red-600 dark:text-red-400"
                : "text-green-700 dark:text-green-400"
            )}
          >
            {fmtStatement(val)}
          </div>
        ))}
      </div>
    </div>
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
  const netTotal = netCols.reduce((s, v) => s + v, 0);

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

      {/* Column headers */}
      <div
        className="grid py-2 mb-1 border-b-2 border-gray-300 dark:border-slate-500"
        style={{ gridTemplateColumns: `1fr repeat(${cols.length}, minmax(7rem, auto))` }}
      >
        <div className="pl-4 text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-slate-500">
          Account
        </div>
        {cols.map((col) => (
          <div key={col.label} className="text-right pr-4 text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-slate-500">
            {col.label}
          </div>
        ))}
      </div>

      <StatementSection
        title="Revenue"
        rows={data.income}
        cols={cols}
        totalLabel="Total Revenue"
      />

      <div className="mt-4" />

      <StatementSection
        title="Operating Expenses"
        rows={data.expense}
        cols={cols}
        isExpense
        totalLabel="Total Expenses"
      />

      {/* Net Income / (Loss) */}
      <div
        className="grid items-center py-3 mt-4 border-t-2 border-b-4 border-double border-gray-400 dark:border-slate-400 bg-gray-100 dark:bg-slate-800"
        style={{ gridTemplateColumns: `1fr repeat(${cols.length}, minmax(7rem, auto))` }}
      >
        <div className="pl-4 pr-3 text-sm font-extrabold text-gray-900 dark:text-slate-100">
          Net Income / (Loss)
        </div>
        {netCols.map((val, ci) => (
          <div
            key={ci}
            className={cn(
              "text-right pr-4 tabular-nums text-sm font-extrabold",
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
          </div>
        ))}
      </div>

      <p className="mt-4 text-xs text-gray-400 dark:text-slate-500 text-right">
        All amounts in IDR · {periodLabel}
      </p>
    </div>
  );
}
