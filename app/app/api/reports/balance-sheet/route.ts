import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { computeBalanceSheet } from "@/lib/reports";
import { checkRateLimit, rateLimitHeaders } from "@/lib/rate-limit";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rl = await checkRateLimit(`rl:api:${session.user.id}`, 200, 3600);
  const rlHeaders = rateLimitHeaders(rl);
  if (!rl.success) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429, headers: rlHeaders });
  }

  const { searchParams } = new URL(req.url);
  // Default: end of current month
  const asOfParam = searchParams.get("asOf");
  const asOf = asOfParam
    ? new Date(asOfParam)
    : (() => {
        const now = new Date();
        return new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
      })();

  const data = await computeBalanceSheet(session.user.id, asOf);

  const format = searchParams.get("format");
  if (format === "csv") {
    const lines = [
      `Balance Sheet as of ${asOf.toISOString().split("T")[0]}`,
      "",
      "ASSETS",
      "Code,Account,Balance (IDR)",
      ...data.assets.map((r) => `${r.code},"${r.nameEn}",${(r.monthly.total / 100).toFixed(0)}`),
      `,,Total Assets: ${(data.totalAssets / 100).toFixed(0)}`,
      "",
      "LIABILITIES",
      "Code,Account,Balance (IDR)",
      ...data.liabilities.map((r) => `${r.code},"${r.nameEn}",${(r.monthly.total / 100).toFixed(0)}`),
      `,,Total Liabilities: ${(data.totalLiabilities / 100).toFixed(0)}`,
      "",
      "EQUITY",
      "Code,Account,Balance (IDR)",
      ...data.equity.map((r) => `${r.code},"${r.nameEn}",${(r.monthly.total / 100).toFixed(0)}`),
      `,,Total Equity: ${(data.totalEquity / 100).toFixed(0)}`,
    ];
    return new NextResponse(lines.join("\n"), {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="balance-sheet-${asOf.toISOString().split("T")[0]}.csv"`,
        ...rlHeaders,
      },
    });
  }

  return NextResponse.json(data, { headers: rlHeaders });
}
