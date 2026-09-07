"use client";

import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Card } from "@/components/ui/card";
import { formatRupiah } from "@/lib/format";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  valueSen: number;
  subtitle?: string;
  trend?: "up" | "down" | "neutral";
  index?: number;
}

export function StatCard({ title, valueSen, subtitle, trend = "neutral", index = 0 }: StatCardProps) {
  const trendColor =
    trend === "up"   ? "text-green-600 dark:text-green-400" :
    trend === "down" ? "text-red-500 dark:text-red-400" :
    "text-gray-400 dark:text-slate-500";

  const TrendIcon = trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Minus;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07, duration: 0.3 }}
    >
      <Card className="p-3 sm:p-5">
        <p className="text-xs font-medium uppercase tracking-wide text-gray-400 dark:text-slate-500 truncate">{title}</p>
        <p className="mt-1.5 text-base sm:text-2xl font-semibold text-gray-900 dark:text-slate-100 tabular-nums break-all">
          {formatRupiah(Math.abs(valueSen))}
        </p>
        {subtitle && (
          <div className={cn("mt-1 flex items-center gap-1 text-xs truncate", trendColor)}>
            <TrendIcon className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{subtitle}</span>
          </div>
        )}
      </Card>
    </motion.div>
  );
}
