import { cn } from "@/lib/utils";

type BadgeVariant = "default" | "income" | "expense" | "asset" | "liability" | "equity";

const variants: Record<BadgeVariant, string> = {
  default: "bg-gray-100 text-gray-600",
  income: "bg-green-50 text-green-700",
  expense: "bg-red-50 text-red-600",
  asset: "bg-blue-50 text-blue-700",
  liability: "bg-orange-50 text-orange-700",
  equity: "bg-purple-50 text-purple-700",
};

export function Badge({
  children,
  variant = "default",
  className,
}: {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium",
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
