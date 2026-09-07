"use client";

import { useState, useEffect, useCallback } from "react";
import { Trash2, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate, formatRupiah } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useLocale } from "@/lib/i18n/locale-context";

interface JournalLine {
  id: string; debit: number; credit: number;
  account: { code: string; nameEn: string; type: string };
}
interface JournalEntry {
  id: string; entryDate: string; description: string; source: string; status: string;
  lines: JournalLine[];
}

function getEntryAmount(lines: JournalLine[]): { amount: number; type: "INCOME" | "EXPENSE" | "TRANSFER" } {
  const il = lines.find((l) => l.account.type === "INCOME");
  const el = lines.find((l) => l.account.type === "EXPENSE");
  if (il) return { amount: il.credit, type: "INCOME" };
  if (el) return { amount: el.debit, type: "EXPENSE" };
  return { amount: lines.reduce((m, l) => (l.debit > m ? l.debit : m), 0), type: "TRANSFER" };
}

export function TransactionList({ refreshKey = 0 }: { refreshKey?: number }) {
  const { t } = useLocale();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  const fetchEntries = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/transactions?page=${page}&limit=20`);
    const data = await res.json();
    setEntries(data.entries ?? []); setTotal(data.total ?? 0); setLoading(false);
  }, [page]);

  useEffect(() => { fetchEntries(); }, [fetchEntries, refreshKey]);

  async function handleDelete(id: string) {
    if (!confirm(t.transactions.deleteConfirm)) return;
    setDeleting(id);
    await fetch(`/api/transactions/${id}`, { method: "DELETE" });
    setDeleting(null);
    fetchEntries();
  }

  if (loading) return (
    <div className="flex h-32 items-center justify-center text-sm text-gray-400 dark:text-slate-500">
      <RefreshCw className="h-4 w-4 animate-spin mr-2" /> {t.common.loading}
    </div>
  );

  if (entries.length === 0) return (
    <div className="flex h-32 items-center justify-center text-sm text-gray-400 dark:text-slate-500">
      {t.transactions.noTransactions}
    </div>
  );

  const totalPages = Math.ceil(total / 20);

  return (
    <div className="space-y-3">
      <div className="text-xs text-gray-400 dark:text-slate-500">{total} {t.transactions.total}</div>

      {/* Mobile: card list */}
      <div className="flex flex-col gap-2 sm:hidden">
        {entries.map((entry) => {
          const { amount, type } = getEntryAmount(entry.lines);
          const isIncome = type === "INCOME"; const isExpense = type === "EXPENSE";
          return (
            <div key={entry.id} className="flex items-center gap-3 rounded-xl border border-gray-100 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-3">
              <div className={cn("h-2 w-2 rounded-full shrink-0", isIncome ? "bg-green-400" : isExpense ? "bg-red-400" : "bg-gray-400")} />
              <div className="flex-1 min-w-0">
                <p className="truncate text-sm font-medium text-gray-800 dark:text-slate-200">{entry.description}</p>
                <p className="text-xs text-gray-400 dark:text-slate-500 mt-0.5">{formatDate(entry.entryDate)}</p>
              </div>
              <div className="flex flex-col items-end gap-1 shrink-0">
                <span className={cn("text-sm font-semibold tabular-nums", isIncome ? "text-green-600" : isExpense ? "text-red-500" : "text-gray-700 dark:text-slate-300")}>
                  {isExpense ? "−" : isIncome ? "+" : ""}{formatRupiah(amount, { short: true })}
                </span>
                <Badge variant={isIncome ? "income" : isExpense ? "expense" : "default"}>{type}</Badge>
              </div>
              <button onClick={() => handleDelete(entry.id)} disabled={deleting === entry.id}
                className="ml-1 p-1.5 text-gray-300 dark:text-slate-600 hover:text-red-400 transition-colors disabled:opacity-50" aria-label="Delete">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          );
        })}
      </div>

      {/* Desktop: table */}
      <div className="hidden sm:block overflow-x-auto rounded-lg border border-gray-100 dark:border-slate-700">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 dark:border-slate-700 bg-gray-50 dark:bg-slate-900/50">
              {["Date","Description","Type","Amount","Source",""].map((h, i) => (
                <th key={i} className={cn("px-4 py-3 text-xs font-medium uppercase tracking-wide text-gray-400 dark:text-slate-500", i === 3 ? "text-right" : i === 4 ? "text-center" : "text-left")}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 dark:divide-slate-700/50">
            {entries.map((entry) => {
              const { amount, type } = getEntryAmount(entry.lines);
              return (
                <tr key={entry.id} className="bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
                  <td className="px-4 py-3 text-gray-500 dark:text-slate-400 whitespace-nowrap">{formatDate(entry.entryDate)}</td>
                  <td className="px-4 py-3 text-gray-800 dark:text-slate-200 max-w-xs truncate">{entry.description}</td>
                  <td className="px-4 py-3">
                    <Badge variant={type === "INCOME" ? "income" : type === "EXPENSE" ? "expense" : "default"}>{type}</Badge>
                  </td>
                  <td className={cn("px-4 py-3 text-right font-medium tabular-nums whitespace-nowrap",
                    type === "INCOME" ? "text-green-600" : type === "EXPENSE" ? "text-red-500" : "text-gray-700 dark:text-slate-300")}>
                    {type === "EXPENSE" ? "(" : ""}{formatRupiah(amount, { short: true })}{type === "EXPENSE" ? ")" : ""}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <Badge variant="default">{entry.source === "MANUAL" ? t.transactions.manual : entry.source === "SCREENSHOT_AI" ? "AI" : "Chat AI"}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => handleDelete(entry.id)} disabled={deleting === entry.id}
                      className="text-gray-300 dark:text-slate-600 hover:text-red-400 transition-colors disabled:opacity-50" aria-label="Delete">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-gray-500 dark:text-slate-400">
          <Button variant="secondary" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>{t.transactions.previous}</Button>
          <span>{t.transactions.page} {page} {t.transactions.of} {totalPages}</span>
          <Button variant="secondary" size="sm" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}>{t.transactions.next}</Button>
        </div>
      )}
    </div>
  );
}
