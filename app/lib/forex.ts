/**
 * Shared USD→IDR exchange rate helper.
 * Uses CoinGecko's free endpoint (no API key required).
 * Cached 1 hour via Next.js fetch revalidation.
 */

interface CoinGeckoUsdRate {
  usd?: { idr?: number };
}

const FALLBACK_RATE = 16000; // IDR per 1 USD

/**
 * Fetch live USD/IDR exchange rate from CoinGecko.
 * Falls back to FALLBACK_RATE if the request fails.
 */
export async function getUsdToIdr(): Promise<number> {
  try {
    const res = await fetch(
      "https://api.coingecko.com/api/v3/simple/price?ids=usd&vs_currencies=idr",
      {
        headers: { Accept: "application/json" },
        next: { revalidate: 3600 }, // cache 1 hour server-side
      }
    );
    if (!res.ok) return FALLBACK_RATE;
    const data = (await res.json()) as CoinGeckoUsdRate;
    return data.usd?.idr ?? FALLBACK_RATE;
  } catch {
    return FALLBACK_RATE;
  }
}

/** Convert a USD amount to IDR sen (×100 for storage). */
export function usdToIdrSen(usd: number, rate: number): number {
  return Math.round(usd * rate * 100);
}

/** Convert a USD amount to IDR (whole rupiah). */
export function usdToIdr(usd: number, rate: number): number {
  return Math.round(usd * rate);
}
