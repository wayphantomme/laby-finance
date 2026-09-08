"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { formatRupiah } from "@/lib/format";

const COLORS = ["#dc2626", "#2563eb", "#16a34a", "#d97706", "#7c3aed", "#0891b2", "#be185d"];

interface AllocationChartProps {
  data: { name: string; value: number }[];
  title: string;
}

function CustomTooltip({ active, payload }: { active?: boolean; payload?: { name: string; value: number; percent: number }[] }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-gray-100 dark:border-slate-700 bg-white dark:bg-slate-800 p-3 shadow-md text-xs">
      <p className="font-medium text-gray-700 dark:text-slate-200 mb-1">{payload[0].name}</p>
      <p className="text-gray-600 dark:text-slate-300">{formatRupiah(payload[0].value)}</p>
      <p className="text-gray-400 dark:text-slate-500">{(payload[0].percent * 100).toFixed(1)}%</p>
    </div>
  );
}

export function AllocationChart({ data, title }: AllocationChartProps) {
  if (!data.length) return (
    <div className="flex h-40 items-center justify-center text-sm text-gray-400 dark:text-slate-500">No data</div>
  );

  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-gray-400 dark:text-slate-500 mb-3">{title}</p>
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie data={data} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={2} dataKey="value">
            {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend
            iconType="circle"
            iconSize={8}
            wrapperStyle={{ fontSize: 11 }}
            formatter={(value) => <span className="text-gray-600 dark:text-slate-300">{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
