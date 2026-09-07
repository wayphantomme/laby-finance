import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/format";

export default async function HistoryPage() {
  const session = await auth();

  const logs = await prisma.auditLog.findMany({
    where: { userId: session!.user!.id! },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">Activity History</h2>
        <p className="text-sm text-gray-500">All create, update, and delete events on your data.</p>
      </div>

      <Card>
        {logs.length === 0 ? (
          <div className="flex h-32 items-center justify-center text-sm text-gray-400">
            No activity yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="pb-2 text-left text-xs font-medium uppercase tracking-wide text-gray-400">Time</th>
                  <th className="pb-2 text-left text-xs font-medium uppercase tracking-wide text-gray-400">Entity</th>
                  <th className="pb-2 text-left text-xs font-medium uppercase tracking-wide text-gray-400">Action</th>
                  <th className="pb-2 text-left text-xs font-medium uppercase tracking-wide text-gray-400">Source</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="py-2.5 pr-4 text-gray-400 whitespace-nowrap">
                      {formatDate(log.createdAt)}
                    </td>
                    <td className="py-2.5 pr-4 text-gray-600 font-mono text-xs">
                      {log.entityType}
                    </td>
                    <td className="py-2.5 pr-4">
                      <Badge
                        variant={
                          log.action === "CREATE" ? "income" :
                          log.action === "DELETE" ? "expense" : "default"
                        }
                      >
                        {log.action}
                      </Badge>
                    </td>
                    <td className="py-2.5 text-gray-400 text-xs">{log.source}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
