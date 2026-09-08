"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, RefreshCw, TrendingUp, TrendingDown, Minus, Pencil, Trash2, DollarSign } from "lucide-react";
import { motion } from "framer-motion";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { AllocationChart } from "@/components/portfolio/allocation-chart";
import { PnlChart } from "@/components/portfolio/pnl-chart";
import { AddHoldingForm } from "@/components/portfolio/add-holding-form";
import { SellForm } from "@/components/portfolio/sell-form";
import { formatRupiah, senToIdr } from "@/lib/format";
import { cn } from "@/lib/utils";

interface Holding {
  id: string; assetName: string; ticker: string; assetType: string;
  quantity: number; lots: number | null; avgBuyPrice: number; currentPrice: number;
  lastUpdated: string; notes: string | null;
  account: { code: string; nameEn: string };
}

const ASSET_TYPE_LABEL: Record<string, string> = {
  stock_idx: "IDX", stock_us: "US", crypto: "Crypto", gold: "Gold",
  mutual_fund: "Reksa Dana", other: "Other",
};

function pnlColor(pnl: number) {
  if (pnl > 0) return "text-green-600 dark:text-green-400";
  if (pnl < 0) return "text-red-500 dark:text-red-400";
  return "text-gray-400 dark:text-slate-500";
}

function PnlIcon({ pnl }: { pnl: number }) {
  if (pnl > 0) return <TrendingUp className="h-3.5 w-3.5" />;
  if (pnl < 0) return <TrendingDown className="h-3.5 w-3.5" />;
  return <Minus className="h-3.5 w-3.5" />;
}

export default function PortfolioPage() {
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshingPrices, setRefreshingPrices] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [sellTarget, setSellTarget] = useState<Holding | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const fetchHoldings = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/portfolio");
    const data = await res.json();
    setHoldings(data.holdings ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchHoldings(); }, [fetchHoldings, refreshKey]);

  async function refreshPrices() {
    if (!holdings.length) return;
    setRefreshingPrices(true);
    try {
      const res = await fetch("/api/portfolio/prices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ holdings: holdings.map((h) => ({ id: h.id, ticker: h.ticker, assetType: h.assetType })) }),
      });
      const { prices } = await res.json() as { prices: Record<string, number | null> };

      // Update current prices
      await Promise.all(
        Object.entries(prices)
          .filter(([, price]) => price !== null)
          .map(([id, price]) =>
            fetch(`/api/portfolio/${id}`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ currentPriceIdr: Math.round(senToIdr(price! )) }),
            })
          )
      );
      setRefreshKey((k) => k + 1);
    } finally {
      setRefreshingPrices(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Hapus holding ini?")) return;
    setDeleting(id);
    await fetch(`/api/portfolio/${id}`, { method: "DELETE" });
    setDeleting(null);
    setRefreshKey((k) => k + 1);
  }

  // Computed stats
  const totalValue = holdings.reduce((s, h) => {
    const units = h.assetType === "stock_idx" && h.lots ? h.lots * 100 : h.quantity;
    return s + units * senToIdr(h.currentPrice);
  }, 0);

  const totalCost = holdings.reduce((s, h) => {
    const units = h.assetType === "stock_idx" && h.lots ? h.lots * 100 : h.quantity;
    return s + units * senToIdr(h.avgBuyPrice);
  }, 0);

  const totalPnl = totalValue - totalCost;
  const totalPnlPct = totalCost > 0 ? (totalPnl / totalCost) * 100 : 0;

  // Chart data
  const byType: Record<string, number> = {};
  const byTicker: Record<string, number> = {};

  const typeChartData = Object.entries(byType).map(([name, value]) => ({ name, value: Math.round(value * 100) }));
  const tickerChartData = Object.entries(byTicker as Record<string, number>)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 7)
    .map(([name, value]) => ({ name, value: Math.round(value * 100) }));

  const pnlChartData = holdings.map((h) => {
    const units = h.assetType === "stock_idx" && h.lots ? h.lots * 100 : h.quantity;
    const pnl = units * (senToIdr(h.currentPrice) - senToIdr(h.avgBuyPrice));
    const pnlPct = h.avgBuyPrice > 0 ? ((h.currentPrice - h.avgBuyPrice) / h.avgBuyPrice) * 100 : 0;
    return { ticker: h.ticker, pnl: Math.round(pnl * 100), pnlPct };
  }).sort((a, b) => b.pnl - a.pnl);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-slate-100">Portfolio</h2>
          <p className="text-sm text-gray-500 dark:text-slate-400">{holdings.length} holdings</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={refreshPrices} loading={refreshingPrices}>
            <RefreshCw className="h-4 w-4" />
            <span className="hidden sm:inline">Refresh Prices</span>
          </Button>
          <Button size="sm" onClick={() => setAddOpen(true)}>
            <Plus className="h-4 w-4" /> Add Holding
          </Button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Value", value: Math.round(totalValue * 100), sub: "Market value now", trend: "neutral" as const },
          { label: "Total Cost", value: Math.round(totalCost * 100), sub: "Cost basis", trend: "neutral" as const },
          { label: "Unrealized P&L", value: Math.round(totalPnl * 100), sub: `${totalPnlPct >= 0 ? "+" : ""}${totalPnlPct.toFixed(2)}%`, trend: totalPnl >= 0 ? "up" as const : "down" as const },
          { label: "Holdings", value: null, sub: `${holdings.length} positions`, trend: "neutral" as const, count: holdings.length },
        ].map((item, i) => (
          <motion.div key={item.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
            <Card>
              <p className="text-xs font-medium uppercase tracking-wide text-gray-400 dark:text-slate-500">{item.label}</p>
              {item.value !== null ? (
                <p className={cn("mt-2 text-xl font-semibold tabular-nums",
                  item.trend === "up" ? "text-green-600 dark:text-green-400" :
                  item.trend === "down" ? "text-red-500 dark:text-red-400" :
                  "text-gray-900 dark:text-slate-100")}>
                  {item.trend !== "neutral" && item.value > 0 ? "+" : ""}{formatRupiah(Math.abs(item.value), { short: true })}
                </p>
              ) : (
                <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-slate-100">{item.count}</p>
              )}
              <div className={cn("mt-1 flex items-center gap-1 text-xs", pnlColor(item.value ?? 0))}>
                <PnlIcon pnl={item.value ?? 0} />
                <span className="text-gray-400 dark:text-slate-500">{item.sub}</span>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      {holdings.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Card>
            <AllocationChart data={typeChartData} title="By Asset Type" />
          </Card>
          <Card>
            <AllocationChart data={tickerChartData} title="Top Holdings" />
          </Card>
          <Card>
            <p className="text-xs font-medium uppercase tracking-wide text-gray-400 dark:text-slate-500 mb-3">Unrealized P&L by Ticker</p>
            <PnlChart data={pnlChartData} />
          </Card>
        </div>
      )}

      {/* Holdings table */}
      <Card className="p-0 overflow-hidden">
        {loading ? (
          <div className="flex h-32 items-center justify-center text-sm text-gray-400 dark:text-slate-500">
            <RefreshCw className="h-4 w-4 animate-spin mr-2" /> Loading...
          </div>
        ) : holdings.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 gap-3 text-sm text-gray-400 dark:text-slate-500">
            <TrendingUp className="h-8 w-8 opacity-30" />
            <p>No holdings yet. Add your first investment.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 dark:border-slate-700 bg-gray-50 dark:bg-slate-900/50">
                  {["Asset", "Type", "Qty / Lot", "Avg Buy", "Price Now", "Value", "P&L", "P&L %", ""].map((h) => (
                    <th key={h} className={cn("px-4 py-3 text-xs font-medium uppercase tracking-wide text-gray-400 dark:text-slate-500",
                      ["Value", "P&L", "P&L %", "Avg Buy", "Price Now"].includes(h) ? "text-right" : "text-left")}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-slate-700/50">
                {holdings.map((h) => {
                  const units = h.assetType === "stock_idx" && h.lots ? h.lots * 100 : h.quantity;
                  const valueIdr = units * senToIdr(h.currentPrice);
                  const costIdr = units * senToIdr(h.avgBuyPrice);
                  const pnl = valueIdr - costIdr;
                  const pnlPct = costIdr > 0 ? (pnl / costIdr) * 100 : 0;

                  return (
                    <tr key={h.id} className="bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors">
                      <td className="px-4 py-3">
                        <p className="font-semibold text-gray-800 dark:text-slate-200">{h.ticker}</p>
                        <p className="text-xs text-gray-400 dark:text-slate-500 truncate max-w-[120px]">{h.assetName}</p>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant="default">{ASSET_TYPE_LABEL[h.assetType] ?? h.assetType}</Badge>
                      </td>
                      <td className="px-4 py-3 text-gray-700 dark:text-slate-300 tabular-nums">
                        {h.assetType === "stock_idx" && h.lots
                          ? <><span className="font-medium">{h.lots}</span><span className="text-gray-400 dark:text-slate-500 text-xs"> lot</span></>
                          : <><span className="font-medium">{h.quantity}</span><span className="text-gray-400 dark:text-slate-500 text-xs"> unit</span></>}
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums text-gray-600 dark:text-slate-400">{formatRupiah(h.avgBuyPrice, { short: true })}</td>
                      <td className="px-4 py-3 text-right tabular-nums text-gray-800 dark:text-slate-200 font-medium">{formatRupiah(h.currentPrice, { short: true })}</td>
                      <td className="px-4 py-3 text-right tabular-nums font-semibold text-gray-800 dark:text-slate-200">{formatRupiah(Math.round(valueIdr * 100), { short: true })}</td>
                      <td className={cn("px-4 py-3 text-right tabular-nums font-medium", pnlColor(pnl))}>
                        {pnl >= 0 ? "+" : ""}{formatRupiah(Math.round(pnl * 100), { short: true })}
                      </td>
                      <td className={cn("px-4 py-3 text-right tabular-nums text-xs font-medium", pnlColor(pnl))}>
                        {pnlPct >= 0 ? "+" : ""}{pnlPct.toFixed(2)}%
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 justify-end">
                          <button onClick={() => setSellTarget(h)}
                            className="p-1.5 text-gray-400 dark:text-slate-500 hover:text-green-600 dark:hover:text-green-400 transition-colors rounded" aria-label="Sell">
                            <DollarSign className="h-3.5 w-3.5" />
                          </button>
                          <button onClick={() => handleDelete(h.id)} disabled={deleting === h.id}
                            className="p-1.5 text-gray-300 dark:text-slate-600 hover:text-red-400 transition-colors disabled:opacity-50 rounded" aria-label="Delete">
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Add holding modal */}
      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Add Holding">
        <AddHoldingForm onSuccess={() => { setAddOpen(false); setRefreshKey((k) => k + 1); }} />
      </Modal>

      {/* Sell modal */}
      <Modal open={!!sellTarget} onClose={() => setSellTarget(null)} title={`Sell ${sellTarget?.ticker ?? ""}`}>
        {sellTarget && (
          <SellForm holding={sellTarget} onSuccess={() => { setSellTarget(null); setRefreshKey((k) => k + 1); }} />
        )}
      </Modal>
    </div>
  );
}
