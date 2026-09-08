"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { formatRupiah, formatDateInput, senToIdr } from "@/lib/format";

interface Holding {
  id: string; assetName: string; ticker: string; assetType: string;
  quantity: number; lots: number | null; avgBuyPrice: number; currentPrice: number;
}

interface Account { id: string; code: string; nameEn: string; }

export function SellForm({ holding, onSuccess }: { holding: Holding; onSuccess: () => void }) {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [lotsSold, setLotsSold] = useState("");
  const [qtySold, setQtySold] = useState("");
  const [sellPrice, setSellPrice] = useState(String(Math.round(senToIdr(holding.currentPrice))));
  const [sellDate, setSellDate] = useState(formatDateInput(new Date()));
  const [cashAccountId, setCashAccountId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/accounts").then((r) => r.json()).then((d) => {
      const cash = (d.accounts ?? []).filter((a: Account & { code: string }) =>
        a.code.startsWith("1-1") && !a.code.endsWith("-000")
      );
      setAccounts(cash);
      if (cash[0]) setCashAccountId(cash[0].id);
    });
  }, []);

  const isIdx = holding.assetType === "stock_idx";
  const maxLots = holding.lots ?? 0;
  const maxQty = holding.quantity;

  // Preview P&L
  const sellQtyUnits = isIdx ? parseInt(lotsSold || "0") * 100 : parseFloat(qtySold || "0");
  const sellPriceNum = parseFloat(sellPrice || "0");
  const proceeds = sellQtyUnits * sellPriceNum;
  const costBasis = sellQtyUnits * senToIdr(holding.avgBuyPrice);
  const pnl = proceeds - costBasis;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch(`/api/portfolio/${holding.id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "sell",
        quantitySold: isIdx ? parseInt(lotsSold) * 100 : parseFloat(qtySold),
        ...(isIdx && { lotsSold: parseInt(lotsSold) }),
        sellPriceIdr: parseFloat(sellPrice),
        sellDate,
        cashAccountId,
      }),
    });

    const data = await res.json();
    setLoading(false);
    if (!res.ok) { setError(data.error ?? "Failed to sell."); return; }
    onSuccess();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="rounded-lg bg-gray-50 dark:bg-slate-700/50 px-4 py-3 text-sm space-y-1">
        <div className="flex justify-between">
          <span className="text-gray-500 dark:text-slate-400">Asset</span>
          <span className="font-medium text-gray-800 dark:text-slate-200">{holding.assetName} ({holding.ticker})</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500 dark:text-slate-400">Position</span>
          <span className="text-gray-800 dark:text-slate-200">
            {isIdx ? `${maxLots} lot (${maxQty.toLocaleString()} lembar)` : `${maxQty} unit`}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500 dark:text-slate-400">Avg Buy Price</span>
          <span className="text-gray-800 dark:text-slate-200">{formatRupiah(holding.avgBuyPrice)}</span>
        </div>
      </div>

      {isIdx ? (
        <Input
          label={`Lot Dijual (max ${maxLots} lot)`}
          type="number"
          value={lotsSold}
          onChange={(e) => setLotsSold(e.target.value)}
          min="1" max={String(maxLots)} required
        />
      ) : (
        <Input
          label={`Jumlah Dijual (max ${maxQty})`}
          type="number"
          value={qtySold}
          onChange={(e) => setQtySold(e.target.value)}
          min="0" max={String(maxQty)} step="any" required
        />
      )}

      <Input
        label="Harga Jual per Unit (IDR)"
        type="number"
        value={sellPrice}
        onChange={(e) => setSellPrice(e.target.value)}
        required
      />

      <div className="grid grid-cols-2 gap-3">
        <Input label="Tanggal Jual" type="date" value={sellDate} onChange={(e) => setSellDate(e.target.value)} required />
        <Select
          label="Masuk ke Rekening"
          value={cashAccountId}
          onChange={(e) => setCashAccountId(e.target.value)}
          options={accounts.map((a) => ({ value: a.id, label: `${a.code} — ${a.nameEn}` }))}
          placeholder="Pilih rekening"
        />
      </div>

      {/* P&L Preview */}
      {sellQtyUnits > 0 && sellPriceNum > 0 && (
        <div className={`rounded-lg px-4 py-3 text-sm space-y-1 ${pnl >= 0 ? "bg-green-50 dark:bg-green-900/20" : "bg-red-50 dark:bg-red-900/20"}`}>
          <div className="flex justify-between">
            <span className="text-gray-500 dark:text-slate-400">Proceeds</span>
            <span className="font-medium">{formatRupiah(proceeds * 100)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500 dark:text-slate-400">Cost Basis</span>
            <span>{formatRupiah(costBasis * 100)}</span>
          </div>
          <div className="flex justify-between font-semibold">
            <span className={pnl >= 0 ? "text-green-700 dark:text-green-400" : "text-red-600 dark:text-red-400"}>
              {pnl >= 0 ? "Realized Gain" : "Realized Loss"}
            </span>
            <span className={pnl >= 0 ? "text-green-700 dark:text-green-400" : "text-red-600 dark:text-red-400"}>
              {pnl >= 0 ? "+" : ""}{formatRupiah(pnl * 100)}
            </span>
          </div>
        </div>
      )}

      {error && <p className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 rounded-lg px-3 py-2">{error}</p>}

      <Button type="submit" loading={loading} className="w-full">
        Confirm Sell
      </Button>
    </form>
  );
}
