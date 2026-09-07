"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { formatRupiah } from "@/lib/format";

interface NetWorthPoint {
  month: string;
  netWorth: number;
}

function CustomTooltip({ active, payload, label }: {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  const val = payload[0].value;
  return (
    <div className="rounded-xl border border-gray-100 bg-white p-3 shadow-md text-xs">
      <p className="font-medium text-gray-700 mb-1">{label}</p>
      <p className={val >= 0 ? "text-green-600 font-semibold" : "text-red-500 font-semibold"}>
        {formatRupiah(val)}
      </p>
    </div>
  );
}

export function NetWorthChart({ data }: { data: NetWorthPoint[] }) {
  const hasData = data.some((d) => d.netWorth !== 0);

  if (!hasData) {
    return (
      <div className="flex h-40 items-center justify-center text-sm text-gray-400">
        No data yet
      </div>
    );
  }

  const isPositive = data[data.length - 1]?.netWorth >= 0;

  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
        <defs>
          <linearGradient id="nwGradient" x1="0" y1="0" x2="0" y2="1">
            <stop
              offset="5%"
              stopColor={isPositive ? "#22c55e" : "#ef4444"}
              stopOpacity={0.15}
            />
            <stop
              offset="95%"
              stopColor={isPositive ? "#22c55e" : "#ef4444"}
              stopOpacity={0}
            />
          </linearGradient>
        </defs>
        <XAxis
          dataKey="month"
          tick={{ fontSize: 11, fill: "#9ca3af" }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis hide />
        <Tooltip content={<CustomTooltip />} />
        <Area
          type="monotone"
          dataKey="netWorth"
          stroke={isPositive ? "#22c55e" : "#ef4444"}
          strokeWidth={2}
          fill="url(#nwGradient)"
          dot={false}
          activeDot={{ r: 4 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
