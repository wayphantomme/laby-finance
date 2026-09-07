import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { auth } from "@/lib/auth";

type BadgeVariantType = "asset" | "liability" | "equity" | "income" | "expense" | "default";

const TYPE_BADGE: Record<string, BadgeVariantType> = {
  ASSET: "asset", LIABILITY: "liability", EQUITY: "equity",
  INCOME: "income", EXPENSE: "expense",
};

const TYPE_LABEL: Record<string, Record<string, string>> = {
  en: { ASSET: "Asset", LIABILITY: "Liability", EQUITY: "Equity", INCOME: "Income", EXPENSE: "Expense" },
  id: { ASSET: "Aset", LIABILITY: "Liabilitas", EQUITY: "Ekuitas", INCOME: "Pendapatan", EXPENSE: "Beban" },
};

const NORMAL_BALANCE: Record<string, Record<string, string>> = {
  en: { ASSET: "Debit", LIABILITY: "Credit", EQUITY: "Credit", INCOME: "Credit", EXPENSE: "Debit" },
  id: { ASSET: "Debit", LIABILITY: "Kredit", EQUITY: "Kredit", INCOME: "Kredit", EXPENSE: "Debit" },
};

const GROUPS = ["ASSET", "LIABILITY", "EQUITY", "INCOME", "EXPENSE"];

export default async function AccountsPage() {
  await auth(); // ensure authenticated
  const accounts = await prisma.coaAccount.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
    include: { _count: { select: { journalLines: true } } },
  });

  const grouped = GROUPS.reduce<Record<string, typeof accounts>>((acc, type) => {
    acc[type] = accounts.filter((a) => a.type === type);
    return acc;
  }, {});

  // Server component — use English labels (locale toggle is client-side only)
  // Labels are pre-translated in the component and locale is applied via CSS/client hydration
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-slate-100">Chart of Accounts</h2>
        <p className="text-sm text-gray-500 dark:text-slate-400">
          {accounts.length} accounts following Indonesian accounting conventions (X-YYY format).
        </p>
      </div>

      {GROUPS.map((type) => (
        <Card key={type}>
          <div className="flex items-center gap-2 mb-4">
            <Badge variant={TYPE_BADGE[type] ?? "default"}>{TYPE_LABEL.en[type]}</Badge>
            <span className="text-sm text-gray-400 dark:text-slate-500">{grouped[type].length} accounts</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 dark:border-slate-700">
                  {["Code","Account Name","Indonesian","Balance","Entries"].map((h, i) => (
                    <th key={h} className={cn(
                      "pb-2 text-xs font-medium uppercase tracking-wide text-gray-400 dark:text-slate-500",
                      i === 0 ? "text-left w-24" : i === 2 ? "text-left hidden sm:table-cell" : i === 4 ? "text-right w-20" : "text-left"
                    )}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-slate-700/50">
                {grouped[type].map((acc) => {
                  const isParent = acc.code.endsWith("-000") || acc.parentId === null;
                  return (
                    <tr key={acc.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors">
                      <td className={cn("py-2.5 pr-4 font-mono text-xs", isParent ? "font-semibold text-gray-700 dark:text-slate-200" : "text-gray-500 dark:text-slate-400 pl-4")}>
                        {acc.code}
                      </td>
                      <td className={cn("py-2.5 pr-4", isParent ? "font-semibold text-gray-800 dark:text-slate-100" : "text-gray-600 dark:text-slate-300")}>
                        {acc.nameEn}
                      </td>
                      <td className="py-2.5 pr-4 text-gray-400 dark:text-slate-500 hidden sm:table-cell">{acc.nameId}</td>
                      <td className="py-2.5 pr-4">
                        <span className="text-xs text-gray-400 dark:text-slate-500">{NORMAL_BALANCE.en[type]}</span>
                      </td>
                      <td className="py-2.5 text-right">
                        {acc._count.journalLines > 0
                          ? <span className="text-xs font-medium text-gray-600 dark:text-slate-300">{acc._count.journalLines}</span>
                          : <span className="text-xs text-gray-300 dark:text-slate-600">—</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      ))}
    </div>
  );
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}
