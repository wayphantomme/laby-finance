import { formatRupiah } from "@/lib/format";

/** Format a sen amount for statement display. Negative shown as (Rp...) in accounting style. */
export function fmtStatement(sen: number, opts?: { short?: boolean }): string {
  if (sen === 0) return "—";
  const abs = Math.abs(sen);
  const formatted = formatRupiah(abs, opts);
  return sen < 0 ? `(${formatted})` : formatted;
}

/** Get Tailwind color class for a value in statement context.
 *  isExpense=true flips the color: positive expense = red (outflow) */
export function valColor(val: number, isExpense = false): string {
  if (val === 0) return "text-gray-300 dark:text-slate-600";
  const positive = isExpense ? val < 0 : val > 0;
  return positive
    ? "text-gray-900 dark:text-slate-100"
    : "text-red-600 dark:text-red-400";
}

/** Sum a list of ReportRow monthly values for a set of column indices */
export function sumCols(
  rows: { monthly: { [k: number]: number; total: number } }[],
  cols: number[]
): number {
  return rows.reduce(
    (s, r) => s + cols.reduce((cs, i) => cs + (r.monthly[i] ?? 0), 0),
    0
  );
}

/** Build an array of quarter definitions { label, months: number[] } */
export const QUARTERS = [
  { label: "Q1", months: [0, 1, 2] },
  { label: "Q2", months: [3, 4, 5] },
  { label: "Q3", months: [6, 7, 8] },
  { label: "Q4", months: [9, 10, 11] },
] as const;

export type PeriodMode = "annual" | "monthly" | "quarterly";

export const MONTH_NAMES_FULL = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
