"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { formatDateInput } from "@/lib/format";
import { useLocale } from "@/lib/i18n/locale-context";

interface Account { id: string; code: string; nameEn: string; type: string; }

type TxType = "INCOME" | "EXPENSE" | "TRANSFER";

export function TransactionForm({ onSuccess }: { onSuccess: () => void }) {
  const { t } = useLocale();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [txType, setTxType] = useState<TxType>("EXPENSE");
  const [date, setDate] = useState(formatDateInput(new Date()));
  const [description, setDescription] = useState("");
  const [amountIdr, setAmountIdr] = useState("");
  const [accountId, setAccountId] = useState("");
  const [cashAccountId, setCashAccountId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/accounts").then((r) => r.json()).then((d) => setAccounts(d.accounts ?? []));
  }, []);

  const cashAccounts = accounts.filter((a) => a.type === "ASSET" && !a.code.endsWith("-000") && a.code.startsWith("1-1"));
  const targetAccounts = accounts.filter((a) => {
    if (txType === "INCOME") return a.type === "INCOME" && !a.code.endsWith("-000");
    if (txType === "EXPENSE") return a.type === "EXPENSE" && !a.code.endsWith("-000");
    return a.type === "ASSET" && !a.code.endsWith("-000") && a.id !== cashAccountId;
  });

  const TX_TYPES = [
    { value: "INCOME",   label: t.transactions.income },
    { value: "EXPENSE",  label: t.transactions.expense },
    { value: "TRANSFER", label: t.transactions.transfer },
  ];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!accountId || !cashAccountId) { setError("Select both accounts."); return; }
    const amount = parseFloat(amountIdr.replace(/[^0-9.]/g, ""));
    if (!amount || amount <= 0) { setError("Enter a valid amount."); return; }
    setLoading(true);
    const res = await fetch("/api/transactions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date, description, amountIdr: amount, accountId, cashAccountId, transactionType: txType }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) { setError(data.error ?? "Failed to save."); return; }
    setDescription(""); setAmountIdr(""); setAccountId("");
    onSuccess();
  }

  const toOptions = (list: Account[]) => list.map((a) => ({ value: a.id, label: `${a.code} — ${a.nameEn}` }));

  const accountLabel = txType === "INCOME" ? t.transactions.incomeAccount
    : txType === "EXPENSE" ? t.transactions.expenseCategory
    : t.transactions.destinationAccount;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex rounded-lg border border-gray-200 dark:border-slate-600 overflow-hidden text-sm">
        {TX_TYPES.map((ty) => (
          <button key={ty.value} type="button"
            onClick={() => { setTxType(ty.value as TxType); setAccountId(""); }}
            className={`flex-1 py-2 font-medium transition-colors ${txType === ty.value ? "bg-primary-600 text-white" : "bg-white dark:bg-slate-800 text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700"}`}
          >
            {ty.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Input label={t.transactions.date} type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
        <Input label={t.transactions.amount} type="number" value={amountIdr} onChange={(e) => setAmountIdr(e.target.value)} placeholder="0" min="1" required />
      </div>
      <Input label={t.transactions.description} type="text" value={description} onChange={(e) => setDescription(e.target.value)} required />
      <Select label={t.transactions.cashAccount} value={cashAccountId} onChange={(e) => setCashAccountId(e.target.value)} options={toOptions(cashAccounts)} placeholder="Select cash/bank account" required />
      <Select label={accountLabel} value={accountId} onChange={(e) => setAccountId(e.target.value)} options={toOptions(targetAccounts)} placeholder="Select account" required />

      {error && <p className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 rounded-lg px-3 py-2">{error}</p>}
      <Button type="submit" loading={loading} className="w-full">{t.transactions.saveTransaction}</Button>
    </form>
  );
}
