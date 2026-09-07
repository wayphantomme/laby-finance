"use client";

import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { formatRupiah } from "@/lib/format";

interface NetWorthPoint { month: string; netWorth: number; }

function CustomTooltip({ active, payload, label }: {
  active?: boolean; payload?: { value: number }[]; label?: string;
}) {
  if (!active || !payload?.length) return null;
  const val = payload[0].value;
  return (
    <div className="rounded-xl border border-gray-100 dark:border-slate-700 bg-white dark:bg-slate-800 p-3 shadow-md text-xs">
      <p className="font-medium text-gray-700 dark:text-slate-200 mb-1">{label}</p>
      <p className={val >= 0 ? "text-green-600 dark:text-green-400 font-semibold" : "text-red-500 dark:text-red-400 font-semibold"}>
        {formatRupiah(val)}
      </p>
    </div>
  );
}

export function NetWorthChart({ data }: { data: NetWorthPoint[] }) {
  if (!data.some((d) => d.netWorth !== 0)) {
    return <div className="flex h-40 items-center justify-center text-sm text-gray-400 dark:text-slate-500">No data yet</div>;
  }

  const isPositive = (data[data.length - 1]?.netWorth ?? 0) >= 0;
  const color = isPositive ? "#22c55e" : "#ef4444";

  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
        <defs>
          <linearGradient id="nwGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={color} stopOpacity={0.15} />
            <stop offset="95%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
        <YAxis hide />
        <Tooltip content={<CustomTooltip />} />
        <Area type="monotone" dataKey="netWorth" stroke={color} strokeWidth={2} fill="url(#nwGrad)" dot={false} activeDot={{ r: 4 }} />
      </AreaChart>
    </ResponsiveContainer>
  );
}
