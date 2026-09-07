"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { formatDateInput } from "@/lib/format";

interface Account {
  id: string;
  code: string;
  nameEn: string;
  type: string;
}

interface TransactionFormProps {
  onSuccess: () => void;
}

type TxType = "INCOME" | "EXPENSE" | "TRANSFER";

const TX_TYPES: { value: TxType; label: string }[] = [
  { value: "INCOME", label: "Income" },
  { value: "EXPENSE", label: "Expense" },
  { value: "TRANSFER", label: "Transfer" },
];

export function TransactionForm({ onSuccess }: TransactionFormProps) {
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
    fetch("/api/accounts")
      .then((r) => r.json())
      .then((d) => setAccounts(d.accounts ?? []));
  }, []);

  const cashAccounts = accounts.filter((a) =>
    a.type === "ASSET" && !a.code.endsWith("-000") && a.code.startsWith("1-1")
  );
  const targetAccounts = accounts.filter((a) => {
    if (txType === "INCOME") return a.type === "INCOME" && !a.code.endsWith("-000");
    if (txType === "EXPENSE") return a.type === "EXPENSE" && !a.code.endsWith("-000");
    return a.type === "ASSET" && !a.code.endsWith("-000") && a.id !== cashAccountId;
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!accountId || !cashAccountId) {
      setError("Select both account and cash/bank account.");
      return;
    }

    const amount = parseFloat(amountIdr.replace(/[^0-9.]/g, ""));
    if (!amount || amount <= 0) {
      setError("Enter a valid amount.");
      return;
    }

    setLoading(true);
    const res = await fetch("/api/transactions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        date,
        description,
        amountIdr: amount,
        accountId,
        cashAccountId,
        transactionType: txType,
      }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error ?? "Failed to save transaction.");
      return;
    }

    setDescription("");
    setAmountIdr("");
    setAccountId("");
    onSuccess();
  }

  const toOptions = (list: Account[]) =>
    list.map((a) => ({ value: a.id, label: `${a.code} — ${a.nameEn}` }));

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Type selector */}
      <div className="flex rounded-lg border border-gray-200 overflow-hidden text-sm">
        {TX_TYPES.map((t) => (
          <button
            key={t.value}
            type="button"
            onClick={() => { setTxType(t.value); setAccountId(""); }}
            className={`flex-1 py-2.5 font-medium transition-colors ${
              txType === t.value
                ? "bg-primary-600 text-white"
                : "bg-white text-gray-600 hover:bg-gray-50"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Date & Amount — stacked on mobile, side-by-side on sm+ */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input
          label="Date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
        />
        <Input
          label="Amount (IDR)"
          type="number"
          value={amountIdr}
          onChange={(e) => setAmountIdr(e.target.value)}
          placeholder="0"
          min="1"
          required
        />
      </div>

      <Input
        label="Description"
        type="text"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder={
          txType === "INCOME" ? "e.g. Freelance payment from client A" :
          txType === "EXPENSE" ? "e.g. Groceries at Supermarket" :
          "e.g. Transfer to BCA"
        }
        required
      />

      <Select
        label="Cash / Bank Account"
        value={cashAccountId}
        onChange={(e) => setCashAccountId(e.target.value)}
        options={toOptions(cashAccounts)}
        placeholder="Select cash/bank account"
        required
      />

      <Select
        label={
          txType === "INCOME" ? "Income Account" :
          txType === "EXPENSE" ? "Expense Category" :
          "Destination Account"
        }
        value={accountId}
        onChange={(e) => setAccountId(e.target.value)}
        options={toOptions(targetAccounts)}
        placeholder="Select account"
        required
      />

      {error && (
        <p className="text-sm text-red-500 bg-red-50 rounded-lg px-3 py-2">{error}</p>
      )}

      <Button type="submit" loading={loading} className="w-full">
        Save Transaction
      </Button>
    </form>
  );
}
