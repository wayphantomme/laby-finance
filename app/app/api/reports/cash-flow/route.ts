import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { computeCashFlow, rowsToCsv } from "@/lib/reports";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const year = parseInt(searchParams.get("year") ?? String(new Date().getFullYear()));
  const format = searchParams.get("format");

  const data = await computeCashFlow(session.user.id, year);

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
      },
    });
  }

  return NextResponse.json(data);
}
