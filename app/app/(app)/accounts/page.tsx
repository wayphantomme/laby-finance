import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

type BadgeVariantType = "asset" | "liability" | "equity" | "income" | "expense" | "default";

const TYPE_BADGE: Record<string, BadgeVariantType> = {
  ASSET: "asset",
  LIABILITY: "liability",
  EQUITY: "equity",
  INCOME: "income",
  EXPENSE: "expense",
};

const TYPE_LABEL: Record<string, string> = {
  ASSET: "Asset",
  LIABILITY: "Liability",
  EQUITY: "Equity",
  INCOME: "Income",
  EXPENSE: "Expense",
};

const GROUPS = ["ASSET", "LIABILITY", "EQUITY", "INCOME", "EXPENSE"];

export default async function AccountsPage() {
  const accounts = await prisma.coaAccount.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
    include: {
      _count: { select: { journalLines: true } },
    },
  });

  const grouped = GROUPS.reduce<Record<string, typeof accounts>>((acc, type) => {
    acc[type] = accounts.filter((a) => a.type === type);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">Chart of Accounts</h2>
        <p className="text-sm text-gray-500">
          {accounts.length} accounts following Indonesian accounting conventions (X-YYY format).
        </p>
      </div>

      {GROUPS.map((type) => (
        <Card key={type}>
          <div className="flex items-center gap-2 mb-4">
            <Badge variant={TYPE_BADGE[type] ?? "default"}>{TYPE_LABEL[type]}</Badge>
            <span className="text-sm text-gray-400">
              {grouped[type].length} accounts
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="pb-2 text-left text-xs font-medium uppercase tracking-wide text-gray-400 w-24">Code</th>
                  <th className="pb-2 text-left text-xs font-medium uppercase tracking-wide text-gray-400">Account Name</th>
                  <th className="pb-2 text-left text-xs font-medium uppercase tracking-wide text-gray-400 hidden sm:table-cell">Indonesian</th>
                  <th className="pb-2 text-left text-xs font-medium uppercase tracking-wide text-gray-400 w-24">Balance</th>
                  <th className="pb-2 text-right text-xs font-medium uppercase tracking-wide text-gray-400 w-20">Entries</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {grouped[type].map((acc) => {
                  const isParent = acc.code.endsWith("-000") || acc.parentId === null;
                  const normalBalance =
                    acc.type === "ASSET" || acc.type === "EXPENSE" ? "Debit" : "Credit";
                  return (
                    <tr key={acc.id} className="hover:bg-gray-50 transition-colors">
                      <td className={`py-2.5 pr-4 font-mono text-xs ${isParent ? "font-semibold text-gray-700" : "text-gray-500 pl-4"}`}>
                        {acc.code}
                      </td>
                      <td className={`py-2.5 pr-4 ${isParent ? "font-semibold text-gray-800" : "text-gray-600"}`}>
                        {acc.nameEn}
                      </td>
                      <td className="py-2.5 pr-4 text-gray-400 hidden sm:table-cell">
                        {acc.nameId}
                      </td>
                      <td className="py-2.5 pr-4">
                        <span className="text-xs text-gray-400">{normalBalance}</span>
                      </td>
                      <td className="py-2.5 text-right text-gray-400">
                        {acc._count.journalLines > 0 ? (
                          <span className="text-xs font-medium text-gray-600">
                            {acc._count.journalLines}
                          </span>
                        ) : (
                          <span className="text-xs text-gray-300">—</span>
                        )}
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
