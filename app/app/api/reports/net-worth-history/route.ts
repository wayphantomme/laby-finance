import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { computeNetWorthHistory } from "@/lib/reports";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const year = parseInt(searchParams.get("year") ?? String(new Date().getFullYear()));

  const data = await computeNetWorthHistory(session.user.id, year);
  return NextResponse.json(data);
}
