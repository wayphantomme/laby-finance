import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { computeCashFlow, rowsToCsv } from "@/lib/reports";
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
  const year = parseInt(searchParams.get("year") ?? String(new Date().getFullYear()));
  const monthParam = searchParams.get("month");
  const month = monthParam !== null ? parseInt(monthParam) : undefined;
  const format = searchParams.get("format");

  const data = await computeCashFlow(session.user.id, year, month);

  if (format === "csv") {
    const csv = [
      `Cash Flow Statement ${year}`,
      "",
      rowsToCsv(data.operating, year, "Operating Activities"),
      "",
      rowsToCsv(data.investing, year, "Investing Activities"),
      "",
      rowsToCsv(data.financing, year, "Financing Activities"),
    ].join("\n");
    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="cash-flow-${year}.csv"`,
        ...rlHeaders,
      },
    });
  }

  return NextResponse.json(data, { headers: rlHeaders });
}
