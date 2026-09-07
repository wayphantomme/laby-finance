"use client";

import { useState, useEffect, useCallback } from "react";
import { Trash2, RefreshCw, ChevronDown, ChevronRight, Pencil } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate, formatRupiah, senToIdr } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useLocale } from "@/lib/i18n/locale-context";
import { motion, AnimatePresence } from "framer-motion";
import type { TransactionDraft } from "./transaction-form";

interface JournalLine {
  id: string; debit: number; credit: number;
  account: { id: string; code: string; nameEn: string; type: string };
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

// Build a TransactionDraft from a JournalEntry for the edit form
function entryToDraft(entry: JournalEntry): TransactionDraft {
  const il = entry.lines.find((l) => l.account.type === "INCOME");
  const el = entry.lines.find((l) => l.account.type === "EXPENSE");
  const cashLine = entry.lines.find((l) => l.account.type === "ASSET");
  const txType: "INCOME" | "EXPENSE" | "TRANSFER" =
    il ? "INCOME" : el ? "EXPENSE" : "TRANSFER";
  const targetLine = il ?? el ?? entry.lines.find((l) => l.account.type !== "ASSET");
  const amountSen = il ? il.credit : el ? el.debit : (cashLine?.debit ?? 0);

  return {
    id: entry.id,
    date: new Date(entry.entryDate).toISOString().split("T")[0],
    description: entry.description,
    amountIdr: String(Math.round(senToIdr(amountSen))),
    transactionType: txType,
    accountId: targetLine?.account.id ?? "",
    cashAccountId: cashLine?.account.id ?? "",
  };
}

// Journal lines detail panel
function JournalLines({ lines }: { lines: JournalLine[] }) {
  const totalDebit = lines.reduce((s, l) => s + l.debit, 0);
  const totalCredit = lines.reduce((s, l) => s + l.credit, 0);
  const isBalanced = totalDebit === totalCredit;

  return (
    <div className="px-4 pb-3 pt-1">
      <div className="rounded-lg border border-gray-100 dark:border-slate-700 overflow-hidden">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-gray-50 dark:bg-slate-900/50 border-b border-gray-100 dark:border-slate-700">
              <th className="px-3 py-2 text-left font-medium text-gray-400 dark:text-slate-500 w-20">Code</th>
              <th className="px-3 py-2 text-left font-medium text-gray-400 dark:text-slate-500">Account</th>
              <th className="px-3 py-2 text-right font-medium text-gray-400 dark:text-slate-500 w-28">Debit</th>
              <th className="px-3 py-2 text-right font-medium text-gray-400 dark:text-slate-500 w-28">Credit</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 dark:divide-slate-700/50">
            {lines.map((line) => (
              <tr key={line.id} className="bg-white dark:bg-slate-800">
                <td className="px-3 py-2 font-mono text-gray-400 dark:text-slate-500">{line.account.code}</td>
                <td className="px-3 py-2 text-gray-700 dark:text-slate-300">{line.account.nameEn}</td>
                <td className="px-3 py-2 text-right tabular-nums text-gray-800 dark:text-slate-200">
                  {line.debit > 0 ? formatRupiah(line.debit) : <span className="text-gray-300 dark:text-slate-600">—</span>}
                </td>
                <td className="px-3 py-2 text-right tabular-nums text-gray-800 dark:text-slate-200">
                  {line.credit > 0 ? formatRupiah(line.credit) : <span className="text-gray-300 dark:text-slate-600">—</span>}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-900/50">
              <td colSpan={2} className="px-3 py-2">
                {isBalanced
                  ? <span className="text-xs text-green-600 dark:text-green-400 font-medium">Balanced</span>
                  : <span className="text-xs text-red-500 font-medium">Imbalanced</span>}
              </td>
              <td className="px-3 py-2 text-right font-semibold tabular-nums text-gray-700 dark:text-slate-300">{formatRupiah(totalDebit)}</td>
              <td className="px-3 py-2 text-right font-semibold tabular-nums text-gray-700 dark:text-slate-300">{formatRupiah(totalCredit)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}

interface TransactionListProps {
  refreshKey?: number;
  onEdit: (draft: TransactionDraft) => void;
}

export function TransactionList({ refreshKey = 0, onEdit }: TransactionListProps) {
  const { t } = useLocale();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  const fetchEntries = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/transactions?page=${page}&limit=20`);
    const data = await res.json();
    setEntries(data.entries ?? []); setTotal(data.total ?? 0); setLoading(false);
  }, [page]);

  useEffect(() => { fetchEntries(); }, [fetchEntries, refreshKey]);

  async function handleDelete(e: React.MouseEvent, id: string) {
    e.stopPropagation();
    if (!confirm(t.transactions.deleteConfirm)) return;
    setDeleting(id);
    await fetch(`/api/transactions/${id}`, { method: "DELETE" });
    setDeleting(null);
    if (expanded === id) setExpanded(null);
    fetchEntries();
  }

  function handleEdit(e: React.MouseEvent, entry: JournalEntry) {
    e.stopPropagation();
    onEdit(entryToDraft(entry));
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
    <div>
      <div className="px-4 pt-3 pb-1 text-xs text-gray-400 dark:text-slate-500">
        {total} {t.transactions.total}
      </div>

      {/* ── Mobile: card list ── */}
      <div className="flex flex-col divide-y divide-gray-50 dark:divide-slate-700/50 sm:hidden">
        {entries.map((entry) => {
          const { amount, type } = getEntryAmount(entry.lines);
          const isIncome = type === "INCOME"; const isExpense = type === "EXPENSE";
          const isExp = expanded === entry.id;
          return (
            <div key={entry.id} className="bg-white dark:bg-slate-800">
              {/* Main row */}
              <div
                className="flex items-center gap-3 px-4 py-3 cursor-pointer active:bg-gray-50 dark:active:bg-slate-700/50"
                onClick={() => setExpanded(isExp ? null : entry.id)}
              >
                <div className={cn("h-2 w-2 rounded-full shrink-0 mt-0.5",
                  isIncome ? "bg-green-400" : isExpense ? "bg-red-400" : "bg-gray-400")} />
                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm font-medium text-gray-800 dark:text-slate-200">{entry.description}</p>
                  <p className="text-xs text-gray-400 dark:text-slate-500 mt-0.5">{formatDate(entry.entryDate)}</p>
                </div>
                <span className={cn("text-sm font-semibold tabular-nums shrink-0",
                  isIncome ? "text-green-600" : isExpense ? "text-red-500" : "text-gray-700 dark:text-slate-300")}>
                  {isExpense ? "−" : isIncome ? "+" : ""}{formatRupiah(amount, { short: true })}
                </span>
                {isExp
                  ? <ChevronDown className="h-4 w-4 text-gray-400 dark:text-slate-500 shrink-0" />
                  : <ChevronRight className="h-4 w-4 text-gray-400 dark:text-slate-500 shrink-0" />}
              </div>

              {/* Expanded: journal lines + actions */}
              <AnimatePresence initial={false}>
                {isExp && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.18 }}
                    className="overflow-hidden border-t border-gray-100 dark:border-slate-700"
                  >
                    <JournalLines lines={entry.lines} />
                    <div className="flex gap-2 px-4 pb-3">
                      <button
                        onClick={(e) => handleEdit(e, entry)}
                        className="flex items-center gap-1.5 text-xs text-primary-600 dark:text-primary-400 hover:text-primary-700 font-medium transition-colors"
                      >
                        <Pencil className="h-3.5 w-3.5" /> Edit
                      </button>
                      <span className="text-gray-300 dark:text-slate-600">·</span>
                      <button
                        onClick={(e) => handleDelete(e, entry.id)}
                        disabled={deleting === entry.id}
                        className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-600 disabled:opacity-50 transition-colors"
                      >
                        <Trash2 className="h-3.5 w-3.5" /> Delete
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      {/* ── Desktop: table ── */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 dark:border-slate-700 bg-gray-50 dark:bg-slate-900/50">
              <th className="w-8" />
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-400 dark:text-slate-500">Date</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-400 dark:text-slate-500">Description</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-400 dark:text-slate-500">Type</th>
              <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wide text-gray-400 dark:text-slate-500">Amount</th>
              <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wide text-gray-400 dark:text-slate-500">Source</th>
              <th className="px-4 py-3 w-16" />
            </tr>
          </thead>
          <tbody>
            {entries.map((entry) => {
              const { amount, type } = getEntryAmount(entry.lines);
              const isExp = expanded === entry.id;
              return (
                <>
                  <tr
                    key={entry.id}
                    className={cn(
                      "cursor-pointer transition-colors border-b border-gray-50 dark:border-slate-700/50",
                      isExp
                        ? "bg-gray-50 dark:bg-slate-700/30"
                        : "bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700/30"
                    )}
                    onClick={() => setExpanded(isExp ? null : entry.id)}
                  >
                    <td className="pl-3 pr-1 py-3">
                      {isExp
                        ? <ChevronDown className="h-3.5 w-3.5 text-gray-400 dark:text-slate-500" />
                        : <ChevronRight className="h-3.5 w-3.5 text-gray-400 dark:text-slate-500" />}
                    </td>
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
                      <Badge variant="default">{entry.source === "MANUAL" ? t.transactions.manual : "AI"}</Badge>
                    </td>
                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center gap-1 justify-end">
                        <button
                          onClick={(e) => handleEdit(e, entry)}
                          className="p-1.5 text-gray-400 dark:text-slate-500 hover:text-primary-600 dark:hover:text-primary-400 transition-colors rounded"
                          aria-label="Edit"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={(e) => handleDelete(e, entry.id)}
                          disabled={deleting === entry.id}
                          className="p-1.5 text-gray-300 dark:text-slate-600 hover:text-red-400 transition-colors disabled:opacity-50 rounded"
                          aria-label="Delete"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                  {isExp && (
                    <tr key={`${entry.id}-lines`} className="bg-gray-50 dark:bg-slate-900/30">
                      <td colSpan={7} className="border-b border-gray-100 dark:border-slate-700">
                        <JournalLines lines={entry.lines} />
                      </td>
                    </tr>
                  )}
                </>
              );
            })}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between p-4 text-sm text-gray-500 dark:text-slate-400">
          <Button variant="secondary" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>{t.transactions.previous}</Button>
          <span>{t.transactions.page} {page} {t.transactions.of} {totalPages}</span>
          <Button variant="secondary" size="sm" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}>{t.transactions.next}</Button>
        </div>
      )}
    </div>
  );
}
