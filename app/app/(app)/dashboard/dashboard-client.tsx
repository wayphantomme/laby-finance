"use client";

import { useState, useEffect } from "react";
import { StatCard } from "@/components/dashboard/stat-card";
import { CashFlowChart } from "@/components/dashboard/cashflow-chart";
import { NetWorthChart } from "@/components/reports/net-worth-chart";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { formatRupiah } from "@/lib/format";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useLocale } from "@/lib/i18n/locale-context";

interface DashboardData {
  netWorth: number;
  monthIncome: number;
  monthExpense: number;
  cashFlow: number;
  topExpenses: { name: string; amount: number }[];
  monthlyData: { month: string; income: number; expense: number }[];
}

export function DashboardClient({ data }: { data: DashboardData }) {
  const { t } = useLocale();
  const now = new Date();
  const year = now.getFullYear();
  const monthLabel = now.toLocaleString("en", { month: "long", year: "numeric" });
  const [netWorthHistory, setNetWorthHistory] = useState<{ month: string; netWorth: number }[]>([]);

  useEffect(() => {
    fetch(`/api/reports/net-worth-history?year=${year}`)
      .then((r) => r.json())
      .then(setNetWorthHistory)
      .catch(() => {});
  }, [year]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard title={t.dashboard.netWorth} valueSen={data.netWorth} trend={data.netWorth >= 0 ? "up" : "down"} subtitle={t.dashboard.netWorthSubtitle} index={0} />
        <StatCard title={t.dashboard.income} valueSen={data.monthIncome} trend="up" subtitle={monthLabel} index={1} />
        <StatCard title={t.dashboard.expenses} valueSen={data.monthExpense} trend={data.monthExpense > 0 ? "down" : "neutral"} subtitle={monthLabel} index={2} />
        <StatCard title={t.dashboard.cashFlow} valueSen={data.cashFlow} trend={data.cashFlow >= 0 ? "up" : "down"} subtitle={data.cashFlow >= 0 ? t.dashboard.surplus : t.dashboard.deficit} index={3} />
      </div>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
        <Card>
          <CardHeader>
            <CardTitle>{t.dashboard.netWorthTrend}</CardTitle>
            <Link href="/reports" className="flex items-center gap-1 text-xs text-primary-600 hover:underline">
              {t.dashboard.viewReports} <ArrowRight className="h-3 w-3" />
            </Link>
          </CardHeader>
          <NetWorthChart data={netWorthHistory} />
        </Card>
      </motion.div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <motion.div className="lg:col-span-2" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
          <Card>
            <CardHeader>
              <CardTitle>{t.dashboard.incomeVsExpenses}</CardTitle>
              <p className="text-xs text-gray-400 dark:text-slate-500">{t.dashboard.last6Months}</p>
            </CardHeader>
            {data.monthlyData.some((m) => m.income > 0 || m.expense > 0) ? (
              <CashFlowChart data={data.monthlyData} />
            ) : (
              <div className="flex h-40 items-center justify-center text-sm text-gray-400 dark:text-slate-500">
                {t.dashboard.noTransactions}
              </div>
            )}
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}>
          <Card className="h-full">
            <CardHeader>
              <CardTitle>{t.dashboard.topExpenses}</CardTitle>
              <p className="text-xs text-gray-400 dark:text-slate-500">{monthLabel}</p>
            </CardHeader>
            {data.topExpenses.length > 0 ? (
              <ul className="space-y-3">
                {data.topExpenses.map((item, i) => {
                  const pct = data.monthExpense > 0 ? Math.round((item.amount / data.monthExpense) * 100) : 0;
                  return (
                    <li key={i} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-700 dark:text-slate-300 truncate">{item.name}</span>
                        <span className="text-gray-500 dark:text-slate-400 tabular-nums ml-2 shrink-0">{formatRupiah(item.amount, { short: true })}</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-gray-100 dark:bg-slate-700">
                        <div className="h-1.5 rounded-full bg-primary-400 transition-all" style={{ width: `${pct}%` }} />
                      </div>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <div className="flex h-32 items-center justify-center text-sm text-gray-400 dark:text-slate-500">
                {t.dashboard.noExpenses}
              </div>
            )}
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
