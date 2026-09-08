"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { formatDateInput } from "@/lib/format";

interface Account { id: string; code: string; nameEn: string; }

const ASSET_TYPES = [
  { value: "stock_idx", label: "Saham IDX (BEI)" },
  { value: "stock_us",  label: "Saham US" },
  { value: "crypto",    label: "Kripto" },
  { value: "gold",      label: "Emas (gram)" },
  { value: "mutual_fund", label: "Reksa Dana" },
  { value: "other",     label: "Lainnya" },
];

const TICKER_HINTS: Record<string, string> = {
  stock_idx: "BBCA, TLKM, GOTO, BBRI",
  stock_us: "AAPL, MSFT, NVDA, TSLA",
  crypto: "BTC, ETH, SOL, BNB",
  gold: "XAU",
  mutual_fund: "Nama reksa dana",
  other: "Ticker atau kode aset",
};

export function AddHoldingForm({ onSuccess }: { onSuccess: () => void }) {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [assetType, setAssetType] = useState("stock_idx");
  const [ticker, setTicker] = useState("");
  const [assetName, setAssetName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [lots, setLots] = useState("");
  const [avgBuyPrice, setAvgBuyPrice] = useState("");
  const [openingDate, setOpeningDate] = useState(formatDateInput(new Date()));
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/accounts").then((r) => r.json()).then((d) => {
      const investmentAccs = (d.accounts ?? []).filter((a: Account & { code: string }) =>
        a.code.startsWith("1-3") && !a.code.endsWith("-000")
      );
      setAccounts(investmentAccs);
    });
  }, []);

  // Auto-fill accountId based on assetType
  const accountOptions = accounts.map((a) => ({ value: a.id, label: `${a.code} — ${a.nameEn}` }));
  const defaultAccount = accounts.find((a) =>
    assetType === "stock_idx" || assetType === "stock_us" ? a.code === "1-301" :
    assetType === "crypto" ? a.code === "1-302" :
    assetType === "mutual_fund" ? a.code === "1-303" :
    assetType === "gold" ? a.code === "1-304" : a.code === "1-301"
  );
  const [accountId, setAccountId] = useState("");
  useEffect(() => {
    if (defaultAccount) setAccountId(defaultAccount.id);
  }, [defaultAccount?.id]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const payload: Record<string, unknown> = {
      assetName: assetName || ticker.toUpperCase(),
      ticker: ticker.toUpperCase(),
      assetType,
      avgBuyPriceIdr: parseFloat(avgBuyPrice),
      openingDate,
      accountId,
      notes: notes || undefined,
    };

    if (assetType === "stock_idx") {
      payload.lots = parseInt(lots);
      payload.quantity = parseInt(lots) * 100;
    } else {
      payload.quantity = parseFloat(quantity);
    }

    const res = await fetch("/api/portfolio", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) { setError(data.error ?? "Failed to save."); return; }
    onSuccess();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Select
        label="Asset Type"
        value={assetType}
        onChange={(e) => { setAssetType(e.target.value); setTicker(""); setAssetName(""); }}
        options={ASSET_TYPES}
      />

      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Ticker / Kode"
          value={ticker}
          onChange={(e) => setTicker(e.target.value.toUpperCase())}
          placeholder={TICKER_HINTS[assetType]}
          required
        />
        <Input
          label="Nama Aset"
          value={assetName}
          onChange={(e) => setAssetName(e.target.value)}
          placeholder="Opsional, auto dari ticker"
        />
      </div>

      {assetType === "stock_idx" ? (
        <Input
          label="Jumlah Lot (1 lot = 100 lembar)"
          type="number"
          value={lots}
          onChange={(e) => setLots(e.target.value)}
          placeholder="10"
          min="1"
          required
        />
      ) : (
        <Input
          label={assetType === "gold" ? "Jumlah (gram)" : assetType === "crypto" ? "Jumlah unit" : "Jumlah unit/lembar"}
          type="number"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          placeholder={assetType === "gold" ? "10.5" : assetType === "crypto" ? "0.05" : "100"}
          min="0"
          step="any"
          required
        />
      )}

      <Input
        label={assetType === "stock_idx" ? "Harga Beli per Lembar (IDR)" : assetType === "gold" ? "Harga Beli per Gram (IDR)" : "Harga Beli per Unit (IDR)"}
        type="number"
        value={avgBuyPrice}
        onChange={(e) => setAvgBuyPrice(e.target.value)}
        placeholder={assetType === "stock_idx" ? "9500" : assetType === "crypto" ? "800000000" : "1500000"}
        required
      />

      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Tanggal Beli / Opening"
          type="date"
          value={openingDate}
          onChange={(e) => setOpeningDate(e.target.value)}
          required
        />
        <Select
          label="Akun Investasi"
          value={accountId}
          onChange={(e) => setAccountId(e.target.value)}
          options={accountOptions}
          placeholder="Pilih akun"
        />
      </div>

      <Input
        label="Catatan (opsional)"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="e.g. Dibeli di Ajaib"
      />

      {error && <p className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 rounded-lg px-3 py-2">{error}</p>}

      <Button type="submit" loading={loading} className="w-full">
        Add to Portfolio
      </Button>
    </form>
  );
}
