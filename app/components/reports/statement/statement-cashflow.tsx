"use client";

import { cn } from "@/lib/utils";
import { formatRupiah } from "@/lib/format";
import type { CashFlowData, ReportRow } from "@/lib/reports";
import { StatementHeader } from "./statement-header";
import { fmtStatement, sumCols, QUARTERS, MONTH_NAMES_FULL } from "./statement-utils";
import type { PeriodMode } from "./statement-utils";

interface Props {
  data: CashFlowData;
  mode: PeriodMode;
  month?: number;
}

function buildColumns(mode: PeriodMode, month?: number) {
  if (mode === "monthly") {
    const m = month ?? 0;
    return [{ label: MONTH_NAMES_FULL[m], indices: [m] }];
  }
  if (mode === "quarterly") {
    return QUARTERS.map((q) => ({ label: q.label, indices: [...q.months] }));
  }
  // Annual: Q1–Q4 + Full Year
  return [
    ...QUARTERS.map((q) => ({ label: q.label, indices: [...q.months] })),
    { label: "Full Year", indices: Array.from({ length: 12 }, (_, i) => i) },
  ];
}

// ─── Section ──────────────────────────────────────────────────────────────────

function CashSection({
  title,
  rows,
  cols,
  totalLabel,
}: {
  title: string;
  rows: ReportRow[];
  cols: { label: string; indices: number[] }[];
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
                    : val > 0
                    ? "text-gray-800 dark:text-slate-200"
                    : "text-red-600 dark:text-red-400"
                )}
              >
                {fmtStatement(val)}
              </td>
            ))}
          </tr>
        );
      })}

      {/* Section total */}
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
                : val > 0
                ? "text-green-700 dark:text-green-400"
                : "text-red-600 dark:text-red-400"
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

export function StatementCashFlow({ data, mode, month }: Props) {
  const cols = buildColumns(mode, month);

  const netCols = cols.map((col) => {
    const op  = sumCols(data.operating, col.indices);
    const inv = sumCols(data.investing,  col.indices);
    const fin = sumCols(data.financing,  col.indices);
    return op + inv + fin;
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
        title="Cash Flow Statement"
        subtitle="Statement of Cash Flows"
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
            <CashSection
              title="Operating Activities"
              rows={data.operating}
              cols={cols}
              totalLabel="Net Cash from Operations"
            />

            <CashSection
              title="Investing Activities"
              rows={data.investing}
              cols={cols}
              totalLabel="Net Cash from Investing"
            />

            <CashSection
              title="Financing Activities"
              rows={data.financing}
              cols={cols}
              totalLabel="Net Cash from Financing"
            />

            {/* Spacer */}
            <tr><td colSpan={cols.length + 1} className="py-1" /></tr>

            {/* Net Cash Flow */}
            <tr className="border-t-2 border-b-4 border-double border-gray-400 dark:border-slate-400 bg-gray-100 dark:bg-slate-800">
              <td className="py-3 pl-4 pr-4 text-sm font-extrabold text-gray-900 dark:text-slate-100 whitespace-nowrap">
                Net Cash Flow
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
