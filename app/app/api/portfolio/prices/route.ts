import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

// ─── Price fetching helpers ───────────────────────────────────────────────────

// CoinGecko: crypto prices in IDR (no API key needed)
async function fetchCryptoPrices(ids: string[]): Promise<Record<string, number>> {
  if (!ids.length) return {};
  try {
    const url = `https://api.coingecko.com/api/v3/simple/price?ids=${ids.join(",")}&vs_currencies=idr`;
    const res = await fetch(url, {
      headers: { "Accept": "application/json" },
      next: { revalidate: 300 }, // cache 5 min
    });
    if (!res.ok) return {};
    const data = await res.json() as Record<string, { idr: number }>;
    return Object.fromEntries(Object.entries(data).map(([k, v]) => [k, v.idr]));
  } catch {
    return {};
  }
}

// Yahoo Finance: stock prices (IDX: BBCA.JK, US: AAPL)
async function fetchStockPrice(ticker: string): Promise<number | null> {
  try {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${ticker}?interval=1d&range=1d`;
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0" },
      next: { revalidate: 300 },
    });
    if (!res.ok) return null;
    const data = await res.json() as {
      chart?: { result?: { meta?: { regularMarketPrice?: number; currency?: string } }[] };
    };
    const meta = data.chart?.result?.[0]?.meta;
    if (!meta?.regularMarketPrice) return null;

    let priceIdr = meta.regularMarketPrice;
    // Convert USD to IDR if US stock
    if (meta.currency === "USD") {
      const usdIdrRes = await fetch(
        "https://api.coingecko.com/api/v3/simple/price?ids=usd&vs_currencies=idr",
        { next: { revalidate: 3600 } }
      );
      if (usdIdrRes.ok) {
        const usdData = await usdIdrRes.json() as { usd?: { idr?: number } };
        const rate = usdData.usd?.idr ?? 16000;
        priceIdr = meta.regularMarketPrice * rate;
      }
    }
    return Math.round(priceIdr);
  } catch {
    return null;
  }
}

// Gold price via Open Exchange Rates or fallback GoldAPI
async function fetchGoldPriceIdr(): Promise<number | null> {
  try {
    // GoldAPI.io free endpoint (XAU in USD, then convert)
    const res = await fetch(
      "https://query1.finance.yahoo.com/v8/finance/chart/GC=F?interval=1d&range=1d",
      { headers: { "User-Agent": "Mozilla/5.0" }, next: { revalidate: 300 } }
    );
    if (!res.ok) return null;
    const data = await res.json() as {
      chart?: { result?: { meta?: { regularMarketPrice?: number } }[] };
    };
    const priceUsdPerOz = data.chart?.result?.[0]?.meta?.regularMarketPrice;
    if (!priceUsdPerOz) return null;

    // Convert troy oz to gram, then to IDR
    const priceUsdPerGram = priceUsdPerOz / 31.1035;
    const usdIdrRes = await fetch(
      "https://api.coingecko.com/api/v3/simple/price?ids=usd&vs_currencies=idr",
      { next: { revalidate: 3600 } }
    );
    const rate = usdIdrRes.ok
      ? ((await usdIdrRes.json()) as { usd?: { idr?: number } }).usd?.idr ?? 16000
      : 16000;

    return Math.round(priceUsdPerGram * rate);
  } catch {
    return null;
  }
}

// CoinGecko ID mapping for common tickers
const CRYPTO_TICKER_TO_ID: Record<string, string> = {
  BTC: "bitcoin", ETH: "ethereum", BNB: "binancecoin", SOL: "solana",
  ADA: "cardano", XRP: "ripple", DOT: "polkadot", AVAX: "avalanche-2",
  MATIC: "matic-network", LINK: "chainlink", UNI: "uniswap",
  DOGE: "dogecoin", SHIB: "shiba-inu", LTC: "litecoin",
  USDT: "tether", USDC: "usd-coin",
};

// ─── Main handler ─────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { holdings } = await req.json() as {
    holdings: { id: string; ticker: string; assetType: string }[];
  };

  const prices: Record<string, number | null> = {};

  // Group by type
  const cryptos = holdings.filter((h) => h.assetType === "crypto");
  const stocksIdx = holdings.filter((h) => h.assetType === "stock_idx");
  const stocksUs = holdings.filter((h) => h.assetType === "stock_us");
  const goldHoldings = holdings.filter((h) => h.assetType === "gold");

  // Fetch crypto prices in batch
  if (cryptos.length) {
    const ids = cryptos.map((h) => CRYPTO_TICKER_TO_ID[h.ticker.toUpperCase()] ?? h.ticker.toLowerCase());
    const cryptoPrices = await fetchCryptoPrices(ids);
    for (const h of cryptos) {
      const geckoId = CRYPTO_TICKER_TO_ID[h.ticker.toUpperCase()] ?? h.ticker.toLowerCase();
      prices[h.id] = cryptoPrices[geckoId] ?? null;
    }
  }

  // Fetch IDX stocks
  await Promise.all(
    stocksIdx.map(async (h) => {
      const ticker = h.ticker.endsWith(".JK") ? h.ticker : `${h.ticker}.JK`;
      prices[h.id] = await fetchStockPrice(ticker);
    })
  );

  // Fetch US stocks
  await Promise.all(
    stocksUs.map(async (h) => {
      prices[h.id] = await fetchStockPrice(h.ticker);
    })
  );

  // Fetch gold price (per gram in IDR)
  if (goldHoldings.length) {
    const goldPrice = await fetchGoldPriceIdr();
    for (const h of goldHoldings) {
      prices[h.id] = goldPrice;
    }
  }

  return NextResponse.json({ prices });
}
