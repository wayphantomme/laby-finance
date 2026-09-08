"use client";

import { cn } from "@/lib/utils";

interface StatementHeaderProps {
  title: string;
  subtitle?: string;
  periodLabel: string;
  className?: string;
}

export function StatementHeader({ title, subtitle, periodLabel, className }: StatementHeaderProps) {
  return (
    <div className={cn("text-center border-b border-gray-200 dark:border-slate-600 pb-4 mb-6", className)}>
      <p className="text-xs uppercase tracking-widest text-gray-400 dark:text-slate-500 mb-1">Laby Personal Finance</p>
      <h2 className="text-xl font-bold text-gray-900 dark:text-slate-100 tracking-tight">{title}</h2>
      {subtitle && <p className="text-sm text-gray-500 dark:text-slate-400 mt-0.5">{subtitle}</p>}
      <p className="text-sm font-medium text-gray-600 dark:text-slate-300 mt-1">{periodLabel}</p>
    </div>
  );
}
