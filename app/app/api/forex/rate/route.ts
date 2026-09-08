import { NextResponse } from "next/server";
import { getUsdToIdr } from "@/lib/forex";

/**
 * GET /api/forex/rate
 * Returns the live USD/IDR exchange rate.
 * Cached 1 hour at the fetch level; also set Cache-Control header
 * so the browser/CDN can cache for 5 minutes.
 */
export async function GET() {
  const rate = await getUsdToIdr();
  return NextResponse.json(
    { rate, base: "USD", quote: "IDR", updatedAt: new Date().toISOString() },
    {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=3600",
      },
    }
  );
}
