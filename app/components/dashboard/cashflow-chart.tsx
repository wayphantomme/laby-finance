"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { formatRupiah } from "@/lib/format";

interface MonthlyData { month: string; income: number; expense: number; }

function CustomTooltip({ active, payload, label }: {
  active?: boolean;
  payload?: { name: string; value: number; color: string }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-gray-100 dark:border-slate-700 bg-white dark:bg-slate-800 p-3 shadow-md text-xs">
      <p className="font-medium text-gray-700 dark:text-slate-200 mb-2">{label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color }}>{p.name}: {formatRupiah(p.value, { short: true })}</p>
      ))}
    </div>
  );
}

export function CashFlowChart({ data }: { data: MonthlyData[] }) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} barSize={12} barGap={4}>
        <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
        <YAxis hide />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(148,163,184,0.1)" }} />
        <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
        <Bar dataKey="income" name="Income" fill="#22c55e" radius={[3, 3, 0, 0]} />
        <Bar dataKey="expense" name="Expense" fill="#ef4444" radius={[3, 3, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
