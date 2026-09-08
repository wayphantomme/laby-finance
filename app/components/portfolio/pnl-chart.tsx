"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { formatRupiah } from "@/lib/format";

interface PnlChartProps {
  data: { ticker: string; pnl: number; pnlPct: number }[];
}

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) {
  if (!active || !payload?.length) return null;
  const val = payload[0].value;
  return (
    <div className="rounded-xl border border-gray-100 dark:border-slate-700 bg-white dark:bg-slate-800 p-3 shadow-md text-xs">
      <p className="font-medium text-gray-700 dark:text-slate-200 mb-1">{label}</p>
      <p className={val >= 0 ? "text-green-600 dark:text-green-400" : "text-red-500 dark:text-red-400"}>
        {val >= 0 ? "+" : ""}{formatRupiah(val, { short: true })}
      </p>
    </div>
  );
}

export function PnlChart({ data }: PnlChartProps) {
  if (!data.length) return (
    <div className="flex h-40 items-center justify-center text-sm text-gray-400 dark:text-slate-500">No data</div>
  );

  return (
    <ResponsiveContainer width="100%" height={Math.max(160, data.length * 36)}>
      <BarChart data={data} layout="vertical" margin={{ left: 8, right: 16 }}>
        <XAxis type="number" hide />
        <YAxis type="category" dataKey="ticker" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} width={48} />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(148,163,184,0.1)" }} />
        <Bar dataKey="pnl" radius={[0, 4, 4, 0]} barSize={16}>
          {data.map((entry, i) => (
            <Cell key={i} fill={entry.pnl >= 0 ? "#22c55e" : "#ef4444"} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
