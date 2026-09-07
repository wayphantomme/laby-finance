import { cn } from "@/lib/utils";

interface CardProps { className?: string; children: React.ReactNode; }

export function Card({ className, children }: CardProps) {
  return (
    <div className={cn("rounded-xl border border-gray-100 dark:border-slate-700 bg-white dark:bg-slate-800 p-5 shadow-sm", className)}>
      {children}
    </div>
  );
}

export function CardHeader({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn("mb-4 flex items-center justify-between", className)}>{children}</div>;
}

export function CardTitle({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <h3 className={cn("text-sm font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wide", className)}>
      {children}
    </h3>
  );
}
