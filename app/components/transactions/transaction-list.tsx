"use client";

import { useState, useEffect, useCallback } from "react";
import { Trash2, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate, formatRupiah } from "@/lib/format";
import { cn } from "@/lib/utils";

interface JournalLine {
  id: string;
  debit: number;
  credit: number;
  account: { code: string; nameEn: string; type: string };
}

interface JournalEntry {
  id: string;
  entryDate: string;
  description: string;
  source: string;
  status: string;
  lines: JournalLine[];
}

interface TransactionListProps {
  refreshKey?: number;
}

function getEntryAmount(lines: JournalLine[]): { amount: number; type: "INCOME" | "EXPENSE" | "TRANSFER" } {
  const incomeLine = lines.find((l) => l.account.type === "INCOME");
  const expenseLine = lines.find((l) => l.account.type === "EXPENSE");

  if (incomeLine) return { amount: incomeLine.credit, type: "INCOME" };
  if (expenseLine) return { amount: expenseLine.debit, type: "EXPENSE" };
  const maxDebit = lines.reduce((m, l) => (l.debit > m ? l.debit : m), 0);
  return { amount: maxDebit, type: "TRANSFER" };
}

export function TransactionList({ refreshKey = 0 }: TransactionListProps) {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  const fetchEntries = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/transactions?page=${page}&limit=20`);
    const data = await res.json();
    setEntries(data.entries ?? []);
    setTotal(data.total ?? 0);
    setLoading(false);
  }, [page]);

  useEffect(() => { fetchEntries(); }, [fetchEntries, refreshKey]);

  async function handleDelete(id: string) {
    if (!confirm("Delete this transaction? This cannot be undone.")) return;
    setDeleting(id);
    await fetch(`/api/transactions/${id}`, { method: "DELETE" });
    setDeleting(null);
    fetchEntries();
  }

  if (loading) {
    return (
      <div className="flex h-32 items-center justify-center text-sm text-gray-400">
        <RefreshCw className="h-4 w-4 animate-spin mr-2" /> Loading...
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="flex h-32 items-center justify-center text-sm text-gray-400">
        No transactions yet. Add your first one.
      </div>
    );
  }

  const totalPages = Math.ceil(total / 20);

  return (
    <div className="space-y-3">
      <div className="text-xs text-gray-400">{total} transactions total</div>

      {/* ── Mobile: card list ── */}
      <div className="flex flex-col gap-2 sm:hidden">
        {entries.map((entry) => {
          const { amount, type } = getEntryAmount(entry.lines);
          const isIncome = type === "INCOME";
          const isExpense = type === "EXPENSE";
          return (
            <div
              key={entry.id}
              className="flex items-center gap-3 rounded-xl border border-gray-100 bg-white px-4 py-3"
            >
              {/* Type indicator dot */}
              <div
                className={cn(
                  "h-2 w-2 rounded-full shrink-0",
                  isIncome ? "bg-green-400" : isExpense ? "bg-red-400" : "bg-gray-400"
                )}
              />
              <div className="flex-1 min-w-0">
                <p className="truncate text-sm font-medium text-gray-800">{entry.description}</p>
                <p className="text-xs text-gray-400 mt-0.5">{formatDate(entry.entryDate)}</p>
              </div>
              <div className="flex flex-col items-end gap-1 shrink-0">
                <span
                  className={cn(
                    "text-sm font-semibold tabular-nums",
                    isIncome ? "text-green-600" : isExpense ? "text-red-500" : "text-gray-700"
                  )}
                >
                  {isExpense ? "−" : isIncome ? "+" : ""}
                  {formatRupiah(amount, { short: true })}
                </span>
                <Badge variant={isIncome ? "income" : isExpense ? "expense" : "default"}>
                  {type}
                </Badge>
              </div>
              <button
                onClick={() => handleDelete(entry.id)}
                disabled={deleting === entry.id}
                className="ml-1 p-1.5 text-gray-300 hover:text-red-400 transition-colors disabled:opacity-50"
                aria-label="Delete transaction"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          );
        })}
      </div>

      {/* ── Desktop: table ── */}
      <div className="hidden sm:block overflow-x-auto rounded-lg border border-gray-100">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-400">Date</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-400">Description</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-400">Type</th>
              <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wide text-gray-400">Amount</th>
              <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wide text-gray-400">Source</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {entries.map((entry) => {
              const { amount, type } = getEntryAmount(entry.lines);
              return (
                <tr key={entry.id} className="bg-white hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                    {formatDate(entry.entryDate)}
                  </td>
                  <td className="px-4 py-3 text-gray-800 max-w-xs truncate">
                    {entry.description}
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      variant={
                        type === "INCOME" ? "income" :
                        type === "EXPENSE" ? "expense" : "default"
                      }
                    >
                      {type}
                    </Badge>
                  </td>
                  <td className={cn(
                    "px-4 py-3 text-right font-medium tabular-nums whitespace-nowrap",
                    type === "INCOME" ? "text-green-600" :
                    type === "EXPENSE" ? "text-red-500" : "text-gray-700"
                  )}>
                    {type === "EXPENSE" ? "(" : ""}{formatRupiah(amount, { short: true })}{type === "EXPENSE" ? ")" : ""}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <Badge variant="default">
                      {entry.source === "MANUAL" ? "Manual" :
                       entry.source === "SCREENSHOT_AI" ? "AI" : "Chat AI"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleDelete(entry.id)}
                      disabled={deleting === entry.id}
                      className="text-gray-300 hover:text-red-400 transition-colors disabled:opacity-50"
                      aria-label="Delete transaction"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-gray-500">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Previous
          </Button>
          <span>Page {page} of {totalPages}</span>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
