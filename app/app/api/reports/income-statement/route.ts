import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { computeIncomeStatement, rowsToCsv } from "@/lib/reports";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const year = parseInt(searchParams.get("year") ?? String(new Date().getFullYear()));
  const monthParam = searchParams.get("month");
  const month = monthParam !== null ? parseInt(monthParam) : undefined;
  const format = searchParams.get("format"); // "csv" or null

  const data = await computeIncomeStatement(session.user.id, year, month);

  if (format === "csv") {
    const incomeRows = rowsToCsv(data.income, year, "Income");
    const expenseRows = rowsToCsv(data.expense, year, "Expense");
    const csv = `Income Statement ${year}\n\n${incomeRows}\n\n${expenseRows}`;
    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="income-statement-${year}.csv"`,
      },
    });
  }

  return NextResponse.json(data);
}
