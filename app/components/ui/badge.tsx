import { cn } from "@/lib/utils";

type BadgeVariant = "default" | "income" | "expense" | "asset" | "liability" | "equity";

const variants: Record<BadgeVariant, string> = {
  default:   "bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-300",
  income:    "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400",
  expense:   "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400",
  asset:     "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400",
  liability: "bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400",
  equity:    "bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400",
};

export function Badge({ children, variant = "default", className }: {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}) {
  return (
    <span className={cn("inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium", variants[variant], className)}>
      {children}
    </span>
  );
}
