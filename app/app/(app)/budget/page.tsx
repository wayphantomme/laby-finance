"use client";

import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight, Plus, Pencil, Trash2, AlertTriangle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { formatRupiah, senToIdr } from "@/lib/format";
import { cn } from "@/lib/utils";

const MONTH_NAMES = ["January","February","March","April","May","June","July","August","September","October","November","December"];

interface BudgetItem {
  id: string;
  amountSen: number;
  account: { id: string; code: string; nameEn: string; nameId: string };
}
interface Account { id: string; code: string; nameEn: string; type: string; }

export default function BudgetPage() {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [budgets, setBudgets] = useState<BudgetItem[]>([]);
  const [actual, setActual] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<BudgetItem | null>(null);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [formAccountId, setFormAccountId] = useState("");
  const [formAmount, setFormAmount] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchBudgets = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/budget?month=${month}&year=${year}`);
    const data = await res.json();
    setBudgets(data.budgets ?? []);
    setActual(data.actualByAccount ?? {});
    setLoading(false);
  }, [month, year]);

  useEffect(() => { fetchBudgets(); }, [fetchBudgets]);

  useEffect(() => {
    fetch("/api/accounts").then((r) => r.json()).then((d) => {
      setAccounts((d.accounts ?? []).filter((a: Account) => a.type === "EXPENSE" && !a.code.endsWith("-000")));
    });
  }, []);

  function navigate(delta: number) {
    let m = month + delta;
    let y = year;
    if (m > 12) { m = 1; y++; }
    if (m < 1) { m = 12; y--; }
    setMonth(m); setYear(y);
  }

  function openAdd() {
    setEditItem(null);
    setFormAccountId("");
    setFormAmount("");
    setModalOpen(true);
  }

  function openEdit(item: BudgetItem) {
    setEditItem(item);
    setFormAccountId(item.account.id);
    setFormAmount(String(Math.round(senToIdr(item.amountSen))));
    setModalOpen(true);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await fetch("/api/budget", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ accountId: formAccountId, month, year, amountIdr: parseFloat(formAmount) }),
    });
    setSaving(false);
    setModalOpen(false);
    fetchBudgets();
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete budget?")) return;
    await fetch(`/api/budget/${id}`, { method: "DELETE" });
    fetchBudgets();
  }

  const totalBudget = budgets.reduce((s, b) => s + b.amountSen, 0);
  const totalActual = budgets.reduce((s, b) => s + (actual[b.account.id] ?? 0), 0);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-slate-100">Budget</h2>
          <p className="text-sm text-gray-500 dark:text-slate-400">Target vs actual spending</p>
        </div>
        <div className="flex items-center gap-2">
          {/* Month navigator */}
          <div className="flex items-center gap-1 rounded-lg border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-800 overflow-hidden">
            <button onClick={() => navigate(-1)} className="p-2 text-gray-500 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors">
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="px-2 text-sm font-semibold text-gray-800 dark:text-slate-200 min-w-[9rem] text-center">
              {MONTH_NAMES[month - 1]} {year}
            </span>
            <button onClick={() => navigate(1)} className="p-2 text-gray-500 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors">
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
          <Button size="sm" onClick={openAdd}><Plus className="h-4 w-4" /> Set Budget</Button>
        </div>
      </div>

      {/* Summary */}
      {budgets.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Total Budget", value: totalBudget, color: "text-gray-900 dark:text-slate-100" },
            { label: "Total Spent", value: totalActual, color: totalActual > totalBudget ? "text-red-500" : "text-gray-900 dark:text-slate-100" },
            { label: "Remaining", value: totalBudget - totalActual, color: totalBudget - totalActual < 0 ? "text-red-500" : "text-green-600 dark:text-green-400" },
          ].map((s) => (
            <Card key={s.label} className="text-center">
              <p className="text-xs font-medium uppercase tracking-wide text-gray-400 dark:text-slate-500">{s.label}</p>
              <p className={cn("mt-1 text-lg font-semibold tabular-nums", s.color)}>{formatRupiah(s.value, { short: true })}</p>
            </Card>
          ))}
        </div>
      )}

      {/* Budget rows */}
      <Card className="p-0 overflow-hidden">
        {loading ? (
          <div className="flex h-32 items-center justify-center text-sm text-gray-400 dark:text-slate-500">Loading...</div>
        ) : budgets.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 gap-2 text-sm text-gray-400 dark:text-slate-500">
            <p>No budgets set for {MONTH_NAMES[month - 1]} {year}.</p>
            <Button size="sm" variant="secondary" onClick={openAdd}><Plus className="h-4 w-4" /> Set first budget</Button>
          </div>
        ) : (
          <div className="divide-y divide-gray-50 dark:divide-slate-700/50">
            {budgets.map((b) => {
              const spent = actual[b.account.id] ?? 0;
              const pct = b.amountSen > 0 ? Math.min((spent / b.amountSen) * 100, 100) : 0;
              const isOver = spent > b.amountSen;
              const isWarning = !isOver && pct >= 80;

              return (
                <div key={b.id} className="px-4 py-3 bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors">
                  <div className="flex items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-xs text-gray-400 dark:text-slate-500">{b.account.code}</span>
                        <span className="text-sm font-medium text-gray-800 dark:text-slate-200 truncate">{b.account.nameEn}</span>
                        {isOver && <AlertTriangle className="h-3.5 w-3.5 text-red-500 shrink-0" />}
                        {isWarning && <AlertTriangle className="h-3.5 w-3.5 text-amber-500 shrink-0" />}
                      </div>
                      {/* Progress bar */}
                      <div className="h-2 rounded-full bg-gray-100 dark:bg-slate-700 overflow-hidden">
                        <div
                          className={cn("h-full rounded-full transition-all", isOver ? "bg-red-500" : isWarning ? "bg-amber-400" : "bg-green-500")}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-xs text-gray-400 dark:text-slate-500 mt-1">
                        <span>{formatRupiah(spent, { short: true })} spent</span>
                        <span>Budget: {formatRupiah(b.amountSen, { short: true })}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0 mt-0.5">
                      <button onClick={() => openEdit(b)} className="p-1.5 text-gray-400 dark:text-slate-500 hover:text-primary-600 dark:hover:text-primary-400 rounded transition-colors">
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button onClick={() => handleDelete(b.id)} className="p-1.5 text-gray-300 dark:text-slate-600 hover:text-red-400 rounded transition-colors">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editItem ? "Edit Budget" : "Set Budget"}>
        <form onSubmit={handleSave} className="space-y-4">
          <Select
            label="Expense Category"
            value={formAccountId}
            onChange={(e) => setFormAccountId(e.target.value)}
            options={accounts.map((a) => ({ value: a.id, label: `${a.code} — ${a.nameEn}` }))}
            placeholder="Select category"
            required
          />
          <Input
            label={`Budget Amount for ${MONTH_NAMES[month - 1]} ${year} (IDR)`}
            type="number"
            value={formAmount}
            onChange={(e) => setFormAmount(e.target.value)}
            placeholder="500000"
            required
          />
          <Button type="submit" loading={saving} className="w-full">Save Budget</Button>
        </form>
      </Modal>
    </div>
  );
}
