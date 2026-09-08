"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Play, Power, Trash2, RefreshCw, Calendar } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { formatRupiah, formatDate, formatDateInput } from "@/lib/format";
import { cn } from "@/lib/utils";

interface RecurringRule {
  id: string; description: string; frequency: string;
  nextRunDate: string; isActive: boolean; templateEntryJson: string;
}
interface Account { id: string; code: string; nameEn: string; type: string; }

const FREQ_LABEL: Record<string, string> = {
  DAILY: "Daily", WEEKLY: "Weekly", MONTHLY: "Monthly", YEARLY: "Yearly",
};

export default function RecurringPage() {
  const [rules, setRules] = useState<RecurringRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [running, setRunning] = useState<string | null>(null);

  // Form state
  const [desc, setDesc] = useState("");
  const [amount, setAmount] = useState("");
  const [txType, setTxType] = useState("EXPENSE");
  const [accountId, setAccountId] = useState("");
  const [cashAccountId, setCashAccountId] = useState("");
  const [frequency, setFrequency] = useState("MONTHLY");
  const [nextRun, setNextRun] = useState(formatDateInput(new Date()));
  const [saving, setSaving] = useState(false);

  const fetchRules = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/recurring");
    const data = await res.json();
    setRules(data.rules ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchRules(); }, [fetchRules]);

  useEffect(() => {
    fetch("/api/accounts").then((r) => r.json()).then((d) => setAccounts(d.accounts ?? []));
  }, []);

  const cashAccounts = accounts.filter((a) => a.code.startsWith("1-1") && !a.code.endsWith("-000"));
  const targetAccounts = accounts.filter((a) => {
    if (txType === "INCOME") return a.type === "INCOME" && !a.code.endsWith("-000");
    if (txType === "EXPENSE") return a.type === "EXPENSE" && !a.code.endsWith("-000");
    return a.type === "ASSET" && !a.code.endsWith("-000");
  });

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await fetch("/api/recurring", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ description: desc, amountIdr: parseFloat(amount), transactionType: txType, accountId, cashAccountId, frequency, nextRunDate: nextRun }),
    });
    setSaving(false);
    setModalOpen(false);
    fetchRules();
  }

  async function handleToggle(id: string) {
    await fetch(`/api/recurring/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "toggle" }) });
    fetchRules();
  }

  async function handleRun(id: string) {
    setRunning(id);
    await fetch(`/api/recurring/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "run" }) });
    setRunning(null);
    fetchRules();
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this recurring rule?")) return;
    await fetch(`/api/recurring/${id}`, { method: "DELETE" });
    fetchRules();
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-slate-100">Recurring</h2>
          <p className="text-sm text-gray-500 dark:text-slate-400">Automate repeating transactions</p>
        </div>
        <Button size="sm" onClick={() => setModalOpen(true)}><Plus className="h-4 w-4" /> Add Rule</Button>
      </div>

      <Card className="p-0 overflow-hidden">
        {loading ? (
          <div className="flex h-32 items-center justify-center text-sm text-gray-400 dark:text-slate-500">
            <RefreshCw className="h-4 w-4 animate-spin mr-2" /> Loading...
          </div>
        ) : rules.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 gap-2 text-sm text-gray-400 dark:text-slate-500">
            <Calendar className="h-8 w-8 opacity-30" />
            <p>No recurring rules. Add salary, subscriptions, or loan payments.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50 dark:divide-slate-700/50">
            {rules.map((rule) => {
              const template = JSON.parse(rule.templateEntryJson) as { amountIdr: number; transactionType: string };
              const isOverdue = new Date(rule.nextRunDate) < new Date();
              return (
                <div key={rule.id} className={cn("flex items-center gap-4 px-4 py-3 bg-white dark:bg-slate-800 transition-colors", !rule.isActive && "opacity-50")}>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-medium text-gray-800 dark:text-slate-200 truncate">{rule.description}</p>
                      <Badge variant={template.transactionType === "INCOME" ? "income" : template.transactionType === "EXPENSE" ? "expense" : "default"}>
                        {template.transactionType}
                      </Badge>
                      <Badge variant="default">{FREQ_LABEL[rule.frequency]}</Badge>
                      {!rule.isActive && <Badge variant="default">Paused</Badge>}
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-gray-400 dark:text-slate-500">
                      <span className="font-medium text-gray-700 dark:text-slate-300">{formatRupiah(template.amountIdr * 100, { short: true })}</span>
                      <span className={cn("flex items-center gap-1", isOverdue && rule.isActive ? "text-red-500" : "")}>
                        <Calendar className="h-3 w-3" />
                        Next: {formatDate(rule.nextRunDate)}
                        {isOverdue && rule.isActive && " (overdue)"}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => handleRun(rule.id)}
                      disabled={running === rule.id || !rule.isActive}
                      title="Run now"
                      className="p-1.5 text-gray-400 dark:text-slate-500 hover:text-green-600 dark:hover:text-green-400 disabled:opacity-30 rounded transition-colors"
                    >
                      {running === rule.id ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
                    </button>
                    <button onClick={() => handleToggle(rule.id)} title={rule.isActive ? "Pause" : "Resume"}
                      className="p-1.5 text-gray-400 dark:text-slate-500 hover:text-primary-600 dark:hover:text-primary-400 rounded transition-colors">
                      <Power className="h-4 w-4" />
                    </button>
                    <button onClick={() => handleDelete(rule.id)}
                      className="p-1.5 text-gray-300 dark:text-slate-600 hover:text-red-400 rounded transition-colors">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Add Recurring Rule">
        <form onSubmit={handleSave} className="space-y-4">
          <Input label="Description" value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="e.g. Gaji bulanan" required />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Amount (IDR)" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="5000000" required />
            <Select label="Frequency" value={frequency} onChange={(e) => setFrequency(e.target.value)}
              options={[{ value: "DAILY", label: "Daily" }, { value: "WEEKLY", label: "Weekly" }, { value: "MONTHLY", label: "Monthly" }, { value: "YEARLY", label: "Yearly" }]} />
          </div>
          <div className="flex rounded-lg border border-gray-200 dark:border-slate-600 overflow-hidden text-sm">
            {["INCOME","EXPENSE","TRANSFER"].map((t) => (
              <button key={t} type="button" onClick={() => { setTxType(t); setAccountId(""); }}
                className={`flex-1 py-2 font-medium transition-colors ${txType === t ? "bg-primary-600 text-white" : "bg-white dark:bg-slate-800 text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700"}`}>
                {t}
              </button>
            ))}
          </div>
          <Select label="Cash / Bank Account" value={cashAccountId} onChange={(e) => setCashAccountId(e.target.value)}
            options={cashAccounts.map((a) => ({ value: a.id, label: `${a.code} — ${a.nameEn}` }))} placeholder="Select account" required />
          <Select label={txType === "INCOME" ? "Income Account" : "Expense Category"} value={accountId} onChange={(e) => setAccountId(e.target.value)}
            options={targetAccounts.map((a) => ({ value: a.id, label: `${a.code} — ${a.nameEn}` }))} placeholder="Select account" required />
          <Input label="First Run Date" type="date" value={nextRun} onChange={(e) => setNextRun(e.target.value)} required />
          <Button type="submit" loading={saving} className="w-full">Save Rule</Button>
        </form>
      </Modal>
    </div>
  );
}
