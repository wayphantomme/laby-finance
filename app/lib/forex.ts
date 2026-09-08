/**
 * Shared USD→IDR exchange rate helper.
 *
 * Primary:  ExchangeRate-API (open.er-api.com) — free, no key, real fiat rate.
 * Fallback: CoinGecko USDC/IDR price (stablecoin ≈ 1 USD).
 * Last resort: hardcoded 16000.
 *
 * Cached 1 hour via Next.js fetch revalidation.
 *
 * NOTE: Do NOT use CoinGecko `ids=usd` — that refers to a crypto token
 * named "USD" and returns ~20, not the actual fiat exchange rate.
 */

interface ExchangeRateResponse {
  result?: string;
  rates?: { IDR?: number };
}

const FALLBACK_RATE = 16000; // IDR per 1 USD

/**
 * Returns the live USD/IDR exchange rate as a whole number (e.g. 16350).
 */
export async function getUsdToIdr(): Promise<number> {
  // Primary: ExchangeRate-API free tier (no key required)
  try {
    const res = await fetch("https://open.er-api.com/v6/latest/USD", {
      headers: { Accept: "application/json" },
      next: { revalidate: 3600 },
    });
    if (res.ok) {
      const data = (await res.json()) as ExchangeRateResponse;
      const rate = data.rates?.IDR;
      if (rate && rate > 1000) return Math.round(rate);
    }
  } catch { /* fall through */ }

  // Fallback: USDC price in IDR via CoinGecko (stablecoin ≈ $1)
  try {
    const res = await fetch(
      "https://api.coingecko.com/api/v3/simple/price?ids=usd-coin&vs_currencies=idr",
      { next: { revalidate: 3600 } }
    );
    if (res.ok) {
      const data = (await res.json()) as { "usd-coin"?: { idr?: number } };
      const rate = data["usd-coin"]?.idr;
      if (rate && rate > 1000) return Math.round(rate);
    }
  } catch { /* fall through */ }

  return FALLBACK_RATE;
}

/** Convert a USD amount to IDR sen (×100 for storage). */
export function usdToIdrSen(usd: number, rate: number): number {
  return Math.round(usd * rate * 100);
}

/** Convert a USD amount to IDR (whole rupiah). */
export function usdToIdr(usd: number, rate: number): number {
  return Math.round(usd * rate);
}
