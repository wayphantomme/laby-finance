"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Send, Paperclip, X, Sparkles, RefreshCw, CheckCircle, TrendingUp, AlertCircle, RotateCcw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { formatRupiah } from "@/lib/format";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

interface TransactionDraft {
  date: string;
  description: string;
  amountIdr: number;
  transactionType: "INCOME" | "EXPENSE" | "TRANSFER";
  accountId: string | null;
  accountCode: string;
  accountName: string;
  cashAccountId: string | null;
  confidence: string;
}

interface HoldingDraft {
  assetName: string;
  ticker: string;
  assetType: string;
  quantity: number;
  lots: number | null;
  avgBuyPriceIdr: number;
  accountId: string;
  currency: string;
  confidence: string;
}

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  imageUrl?: string;
  drafts?: TransactionDraft[];
  holdings?: HoldingDraft[];
  isError?: boolean;
  // for retry: keep the original user message payload
  retryPayload?: { text: string; image?: File; imageUrl?: string };
}

interface Account {
  id: string;
  code: string;
  nameEn: string;
  type: string;
}

// Tickers that are stablecoins — auto-fill $1.00 buy price
const STABLECOIN_TICKERS = new Set(["USDC", "USDT", "USDG", "BUSD", "DAI", "TUSD", "USDD", "FRAX"]);

const AI_TIMEOUT_MS = 75_000; // 75s — Gemini vision can be slow on large images

const SUGGESTIONS = [
  "Berapa total pengeluaran bulan ini?",
  "Apa saja sumber penghasilan tahun ini?",
  "Bagaimana kondisi keuangan saya sekarang?",
  "Kategori pengeluaran terbesar?",
];

// ─── Draft card ───────────────────────────────────────────────────────────────

function DraftCard({
  draft,
  accounts,
  onSaved,
}: {
  draft: TransactionDraft;
  accounts: Account[];
  onSaved: () => void;
}) {
  const [edited, setEdited] = useState({ ...draft });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cashAccounts = accounts.filter(
    (a) => a.type === "ASSET" && a.code.startsWith("1-1") && !a.code.endsWith("-000")
  );
  const targetAccounts = accounts
    .filter((a) => {
      if (edited.transactionType === "INCOME") return a.type === "INCOME" && !a.code.endsWith("-000");
      if (edited.transactionType === "EXPENSE") return a.type === "EXPENSE" && !a.code.endsWith("-000");
      return a.type === "ASSET" && !a.code.endsWith("-000");
    })
    .map((a) => ({ value: a.id, label: `${a.code} — ${a.nameEn}` }));

  async function save() {
    if (!edited.accountId || !edited.cashAccountId) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: edited.date,
          description: edited.description,
          amountIdr: edited.amountIdr,
          accountId: edited.accountId,
          cashAccountId: edited.cashAccountId,
          transactionType: edited.transactionType,
        }),
      });
      if (res.ok) {
        setSaved(true);
        onSaved();
      } else {
        setError("Gagal menyimpan transaksi. Coba lagi.");
      }
    } catch {
      setError("Koneksi gagal. Coba lagi.");
    } finally {
      setSaving(false);
    }
  }

  if (saved) {
    return (
      <div className="flex items-center gap-2 rounded-lg bg-green-50 border border-green-200 px-3 py-2 text-sm text-green-700">
        <CheckCircle className="h-4 w-4 shrink-0" />
        <span>Saved: {edited.description} — {formatRupiah(edited.amountIdr * 100)}</span>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-3 space-y-3">
      <div className="flex items-center gap-2">
        <Badge variant={edited.transactionType === "INCOME" ? "income" : edited.transactionType === "EXPENSE" ? "expense" : "default"}>
          {edited.transactionType}
        </Badge>
        <span className="text-xs text-gray-400 dark:text-slate-500">
          {edited.confidence === "high" ? "High confidence" : "Low confidence — verify before saving"}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Input label="Date" type="date" value={edited.date} onChange={(e) => setEdited((p) => ({ ...p, date: e.target.value }))} />
        <Input label="Amount (IDR)" type="number" value={String(edited.amountIdr)} onChange={(e) => setEdited((p) => ({ ...p, amountIdr: parseFloat(e.target.value) || 0 }))} />
        <div className="col-span-2">
          <Input label="Description" value={edited.description} onChange={(e) => setEdited((p) => ({ ...p, description: e.target.value }))} />
        </div>
        <div className="col-span-2">
          <Select label="Account" value={edited.accountId ?? ""} onChange={(e) => setEdited((p) => ({ ...p, accountId: e.target.value }))} options={targetAccounts} placeholder="Select account" />
        </div>
        <div className="col-span-2">
          <Select label="Cash / Bank" value={edited.cashAccountId ?? ""} onChange={(e) => setEdited((p) => ({ ...p, cashAccountId: e.target.value }))} options={cashAccounts.map((a) => ({ value: a.id, label: `${a.code} — ${a.nameEn}` }))} placeholder="Select cash account" />
        </div>
      </div>

      {error && (
        <p className="text-xs text-red-500 flex items-center gap-1"><AlertCircle className="h-3 w-3" />{error}</p>
      )}

      <Button size="sm" className="w-full" loading={saving} disabled={!edited.accountId || !edited.cashAccountId} onClick={save}>
        Save Transaction
      </Button>
    </div>
  );
}

// ─── Holding draft card ───────────────────────────────────────────────────────

const ASSET_TYPE_LABELS: Record<string, string> = {
  stock_idx: "Saham IDX",
  stock_us: "Saham US",
  crypto: "Kripto",
  gold: "Emas",
  mutual_fund: "Reksa Dana",
  other: "Lainnya",
};

function HoldingDraftCard({
  draft,
  onSaved,
}: {
  draft: HoldingDraft;
  onSaved: () => void;
}) {
  const isUsd = draft.currency === "USD";
  const isStablecoin = STABLECOIN_TICKERS.has(draft.ticker.toUpperCase());

  const [edited, setEdited] = useState({ ...draft });
  // Bug 4 fix: stablecoins auto-fill $1, others start empty (no auto-fill 0)
  const [priceInput, setPriceInput] = useState<string>(
    isStablecoin ? "1" : isUsd ? "" : (draft.avgBuyPriceIdr > 0 ? String(draft.avgBuyPriceIdr) : "")
  );
  const [saving, setSaving] = useState(false);
  // Bug 5 fix: explicit success/error state
  const [saveState, setSaveState] = useState<"idle" | "saving" | "success" | "error">("idle");
  const [saveError, setSaveError] = useState<string | null>(null);
  const [openingDate, setOpeningDate] = useState(new Date().toISOString().split("T")[0]);
  const [usdRate, setUsdRate] = useState<number | null>(null);
  const [rateLoading, setRateLoading] = useState(isUsd);

  // Bug 3 fix: fetch and validate rate is in sane range (10k–25k IDR per USD)
  useEffect(() => {
    if (!isUsd) return;
    fetch("/api/forex/rate")
      .then((r) => r.json())
      .then((d: { rate?: number }) => {
        const raw = d.rate ?? 0;
        // Sanity check: reject obviously wrong rates (< 10.000 or > 25.000)
        const validated = raw >= 10_000 && raw <= 25_000 ? raw : 16_000;
        setUsdRate(validated);
      })
      .catch(() => setUsdRate(16_000))
      .finally(() => setRateLoading(false));
  }, [isUsd]);

  // Derived price in IDR
  const priceUsd = isUsd ? parseFloat(priceInput) || 0 : 0;
  const priceIdr = isUsd
    ? Math.round(priceUsd * (usdRate ?? 16_000))
    : parseFloat(priceInput) || 0;

  // Sync avgBuyPriceIdr into edited whenever input or rate changes
  useEffect(() => {
    setEdited((p) => ({ ...p, avgBuyPriceIdr: priceIdr }));
  }, [priceIdr]);

  // Bug 5 fix: submit with explicit timeout + error state
  async function save() {
    if (!edited.accountId || edited.quantity <= 0) return;
    setSaveState("saving");
    setSaveError(null);

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 30_000);

    try {
      const res = await fetch("/api/portfolio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          assetName: edited.assetName,
          ticker: edited.ticker,
          assetType: edited.assetType,
          quantity: edited.quantity,
          lots: edited.lots,
          avgBuyPriceIdr: edited.avgBuyPriceIdr,
          accountId: edited.accountId,
          currency: edited.currency,
          openingDate,
        }),
      });
      if (res.ok) {
        setSaveState("success");
        onSaved();
      } else {
        const body = await res.json().catch(() => ({})) as { error?: string };
        setSaveState("error");
        setSaveError(body.error ?? "Gagal menyimpan. Coba lagi.");
      }
    } catch (e) {
      setSaveState("error");
      setSaveError(e instanceof Error && e.name === "AbortError" ? "Timeout — server tidak merespons. Coba lagi." : "Koneksi gagal. Coba lagi.");
    } finally {
      clearTimeout(timer);
    }
  }

  if (saveState === "success") {
    return (
      <div className="flex items-center gap-2 rounded-lg bg-green-50 border border-green-200 px-3 py-2 text-sm text-green-700">
        <CheckCircle className="h-4 w-4 shrink-0" />
        <span>
          Berhasil: {edited.ticker} — {edited.quantity}{edited.lots ? ` (${edited.lots} lot)` : ""} ditambahkan ke portfolio
        </span>
      </div>
    );
  }

  const totalIdr = priceIdr * edited.quantity;

  // Bug 3 fix: format rate with correct locale — id-ID uses dot for thousands
  const formattedRate = usdRate
    ? new Intl.NumberFormat("id-ID", { maximumFractionDigits: 0 }).format(usdRate)
    : "…";

  return (
    <div className="rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-3 space-y-3">
      {/* Header */}
      <div className="flex items-center gap-2">
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
          <TrendingUp className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 dark:text-slate-100 truncate">{edited.assetName}</p>
          <p className="text-xs text-gray-400 dark:text-slate-500">
            {ASSET_TYPE_LABELS[edited.assetType] ?? edited.assetType}
            {isStablecoin && <span className="ml-1 text-green-500">· Stablecoin</span>}
          </p>
        </div>
        <Badge variant={edited.confidence === "high" ? "income" : "default"}>
          {edited.ticker}
        </Badge>
      </div>

      {/* Bug 3 fix: exchange rate badge with correct formatting */}
      {isUsd && (
        <div className="flex items-center gap-1.5 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 px-2.5 py-1.5">
          <span className="text-xs text-amber-700 dark:text-amber-400 font-medium">
            {rateLoading ? "Mengambil kurs USD/IDR…" : `1 USD = Rp${formattedRate} (live)`}
          </span>
        </div>
      )}

      <div className="grid grid-cols-2 gap-2">
        {/* Quantity */}
        <Input
          label={edited.assetType === "stock_idx" ? "Jumlah Lot" : "Jumlah Unit"}
          type="number"
          value={String(edited.assetType === "stock_idx" ? (edited.lots ?? edited.quantity / 100) : edited.quantity)}
          onChange={(e) => {
            const v = parseFloat(e.target.value) || 0;
            if (edited.assetType === "stock_idx") {
              setEdited((p) => ({ ...p, lots: v, quantity: v * 100 }));
            } else {
              setEdited((p) => ({ ...p, quantity: v }));
            }
          }}
        />

        {/* Bug 4 fix: consistent label, no auto-fill 0, stablecoin locked at $1 */}
        <div>
          <Input
            label={isUsd ? "Harga Beli (USD/unit)" : "Harga Beli (IDR/unit)"}
            type="number"
            value={priceInput}
            onChange={(e) => setPriceInput(e.target.value)}
            placeholder={isUsd ? "contoh: 150.00" : edited.assetType === "stock_idx" ? "per lembar" : "per unit"}
            disabled={isStablecoin} // stablecoin always $1
          />
          {isStablecoin && (
            <p className="mt-0.5 text-[10px] text-green-500">Stablecoin — harga beli dikunci $1.00</p>
          )}
          {/* IDR equivalent for USD inputs */}
          {isUsd && !isStablecoin && priceUsd > 0 && !rateLoading && usdRate && (
            <p className="mt-0.5 text-[10px] text-gray-400 dark:text-slate-500">
              ≈ {formatRupiah(priceIdr * 100)} per unit
            </p>
          )}
        </div>

        <div className="col-span-2">
          <Input
            label="Tanggal Opening Balance"
            type="date"
            value={openingDate}
            onChange={(e) => setOpeningDate(e.target.value)}
          />
        </div>
      </div>

      {/* Total modal summary — only show when we have real data */}
      {totalIdr > 0 && edited.quantity > 0 && (
        <div className="rounded-lg bg-gray-50 dark:bg-slate-700/50 px-3 py-2 space-y-0.5">
          <div className="flex justify-between text-xs">
            <span className="text-gray-500 dark:text-slate-400">Total modal</span>
            <span className="font-semibold text-gray-900 dark:text-slate-100">
              {formatRupiah(Math.round(totalIdr) * 100)}
            </span>
          </div>
          {isUsd && priceUsd > 0 && (
            <div className="flex justify-between text-xs">
              <span className="text-gray-400 dark:text-slate-500">Dalam USD</span>
              <span className="text-gray-500 dark:text-slate-400">
                ${(priceUsd * edited.quantity).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          )}
          {edited.assetType === "stock_idx" && edited.lots && (
            <p className="text-[10px] text-gray-400 dark:text-slate-500">
              {edited.lots} lot × 100 lembar × {formatRupiah(priceIdr * 100)}
            </p>
          )}
        </div>
      )}

      {/* Bug 5 fix: error feedback + retry */}
      {saveState === "error" && saveError && (
        <div className="flex items-center gap-2 rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-xs text-red-600">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
          <span className="flex-1">{saveError}</span>
          <button onClick={() => { setSaveState("idle"); setSaveError(null); }} className="underline whitespace-nowrap">Coba lagi</button>
        </div>
      )}

      {/* Bug 4 fix: warn if harga beli kosong (non-stablecoin) */}
      {!isStablecoin && priceInput === "" && (
        <p className="text-[10px] text-amber-500 dark:text-amber-400">
          Harga beli kosong — portfolio akan tersimpan dengan harga beli Rp0. Isi jika tahu.
        </p>
      )}

      <Button
        size="sm"
        className="w-full"
        loading={saveState === "saving"}
        disabled={!edited.accountId || edited.quantity <= 0 || saveState === "saving"}
        onClick={save}
      >
        {saveState === "saving" ? "Menyimpan…" : "Tambah ke Portfolio"}
      </Button>
    </div>
  );
}

// ─── Message bubble ───────────────────────────────────────────────────────────

function MessageBubble({
  msg,
  accounts,
  onSaved,
  onHoldingSaved,
  onRetry,
}: {
  msg: Message;
  accounts: Account[];
  onSaved: () => void;
  onHoldingSaved: () => void;
  onRetry?: (payload: NonNullable<Message["retryPayload"]>) => void;
}) {
  const isUser = msg.role === "user";

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={cn("flex gap-3", isUser ? "justify-end" : "justify-start")}
    >
      {!isUser && (
        <div className={cn("flex h-7 w-7 shrink-0 items-center justify-center rounded-full mt-1", msg.isError ? "bg-red-100 dark:bg-red-900/30" : "bg-primary-100")}>
          {msg.isError
            ? <AlertCircle className="h-3.5 w-3.5 text-red-500" />
            : <Sparkles className="h-3.5 w-3.5 text-primary-600" />}
        </div>
      )}

      <div className={cn("flex flex-col gap-2 max-w-[80%]", isUser && "items-end")}>
        {/* Image preview */}
        {msg.imageUrl && (
          <div className="rounded-2xl overflow-hidden border border-gray-200 dark:border-slate-600 max-w-sm">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={msg.imageUrl} alt="Uploaded" className="w-full max-h-60 object-contain bg-gray-50 dark:bg-slate-700" />
          </div>
        )}

        {/* Text bubble */}
        {msg.content && (
          <div
            className={cn(
              "rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
              isUser
                ? "bg-primary-600 text-white rounded-br-sm"
                : msg.isError
                  ? "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800 rounded-bl-sm"
                  : "bg-gray-100 dark:bg-slate-700 text-gray-800 dark:text-slate-100 rounded-bl-sm"
            )}
          >
            <MessageContent content={msg.content} />
          </div>
        )}

        {/* Bug 1 fix: retry button on error messages */}
        {msg.isError && msg.retryPayload && onRetry && (
          <button
            onClick={() => onRetry(msg.retryPayload!)}
            className="flex items-center gap-1.5 text-xs text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-200 transition-colors"
          >
            <RotateCcw className="h-3 w-3" />
            Kirim ulang
          </button>
        )}

        {/* Transaction drafts */}
        {msg.drafts && msg.drafts.length > 0 && (
          <div className="w-full space-y-2 mt-1">
            <p className="text-xs text-gray-400 font-medium">
              {msg.drafts.length} transaksi ditemukan — review dan simpan:
            </p>
            {msg.drafts.map((draft, i) => (
              <DraftCard key={i} draft={draft} accounts={accounts} onSaved={onSaved} />
            ))}
          </div>
        )}

        {/* Portfolio holdings drafts */}
        {msg.holdings && msg.holdings.length > 0 && (
          <div className="w-full space-y-2 mt-1">
            <p className="text-xs text-gray-400 font-medium">
              {msg.holdings.length} holding ditemukan — isi harga beli & konfirmasi:
            </p>
            {msg.holdings.map((holding, i) => (
              <HoldingDraftCard key={i} draft={holding} onSaved={onHoldingSaved} />
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function UnifiedChat({
  onTransactionSaved,
  onHoldingSaved,
  sessionId,
  initialMessages,
  onFirstMessage,
}: {
  onTransactionSaved?: () => void;
  onHoldingSaved?: () => void;
  sessionId: string | null;
  initialMessages?: Message[];
  onFirstMessage?: (sessionId: string) => void;
}) {
  const [messages, setMessages] = useState<Message[]>(initialMessages ?? []);
  const [input, setInput] = useState("");
  const [pendingImage, setPendingImage] = useState<File | null>(null);
  const [pendingImageUrl, setPendingImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(sessionId);
  const bottomRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  function revokeMessageImages(msgs: Message[]) {
    msgs.forEach((m) => { if (m.imageUrl?.startsWith("blob:")) URL.revokeObjectURL(m.imageUrl); });
  }

  useEffect(() => {
    return () => { setMessages((prev) => { revokeMessageImages(prev); return prev; }); };
  }, []);

  useEffect(() => {
    setCurrentSessionId(sessionId);
    setMessages((prev) => { revokeMessageImages(prev); return initialMessages ?? []; });
    setInput("");
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId]);

  useEffect(() => {
    fetch("/api/accounts").then((r) => r.json()).then((d) => setAccounts(d.accounts ?? []));
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  function attachImage(file: File) {
    if (!file.type.startsWith("image/")) return;
    if (pendingImageUrl) URL.revokeObjectURL(pendingImageUrl);
    const url = URL.createObjectURL(file);
    setPendingImage(file);
    setPendingImageUrl(url);
    textareaRef.current?.focus();
  }

  function clearPendingImage() {
    if (pendingImageUrl) URL.revokeObjectURL(pendingImageUrl);
    setPendingImage(null);
    setPendingImageUrl(null);
  }

  // Bug 1 fix: core send with AbortController timeout + explicit error message
  const sendMessageCore = useCallback(async (
    text: string,
    imageFile: File | null,
    imagePreviewUrl: string | null,
    existingMsgId?: string,  // if retrying, replace the error message
  ) => {
    if (loading) return;

    const msgId = existingMsgId ?? Math.random().toString(36).slice(2);
    const retryPayload: Message["retryPayload"] = { text, image: imageFile ?? undefined, imageUrl: imagePreviewUrl ?? undefined };
    const userMsg: Message = { id: msgId, role: "user", content: text, imageUrl: imagePreviewUrl ?? undefined };

    if (!existingMsgId) {
      setMessages((prev) => [...prev, userMsg]);
    }
    setLoading(true);

    // Bug 1: AbortController with timeout
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), AI_TIMEOUT_MS);

    try {
      const allMessages = [...messages, userMsg].map((m) => ({ role: m.role, content: m.content }));

      let activeSessionId = currentSessionId;
      if (!activeSessionId) {
        const sessRes = await fetch("/api/ai/sessions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({}),
          signal: controller.signal,
        });
        const sessData = await sessRes.json();
        activeSessionId = sessData.session?.id ?? null;
        setCurrentSessionId(activeSessionId);
      }

      let res: Response;
      if (imageFile) {
        const form = new FormData();
        form.append("messages", JSON.stringify(allMessages));
        form.append("image", imageFile);
        if (activeSessionId) form.append("sessionId", activeSessionId);
        res = await fetch("/api/ai/chat", { method: "POST", body: form, signal: controller.signal });
      } else {
        res = await fetch("/api/ai/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: allMessages, sessionId: activeSessionId }),
          signal: controller.signal,
        });
      }

      clearTimeout(timer);
      const data = await res.json();

      // Replace blob URL with permanent Cloudinary URL if returned
      if (data.imageUrl && !existingMsgId) {
        setMessages((prev) => prev.map((m) => m.id === msgId ? { ...m, imageUrl: data.imageUrl as string } : m));
        if (imagePreviewUrl) setTimeout(() => URL.revokeObjectURL(imagePreviewUrl), 500);
      }

      setMessages((prev) => [
        ...prev,
        {
          id: Math.random().toString(36).slice(2),
          role: "assistant",
          content: res.ok ? data.content : `Gagal memproses permintaan: ${data.error ?? "Unknown error"}`,
          drafts: res.ok && data.drafts?.length ? data.drafts : undefined,
          holdings: res.ok && data.holdings?.length ? data.holdings : undefined,
          isError: !res.ok,
          retryPayload: !res.ok ? retryPayload : undefined,
        },
      ]);

      if (activeSessionId) onFirstMessage?.(activeSessionId);
    } catch (e) {
      clearTimeout(timer);
      const isTimeout = e instanceof Error && e.name === "AbortError";
      // Bug 1: keep the user message + image visible, show error with retry
      setMessages((prev) => [
        ...prev,
        {
          id: Math.random().toString(36).slice(2),
          role: "assistant",
          content: isTimeout
            ? "Waktu habis — AI membutuhkan waktu terlalu lama memproses gambar ini. Klik \"Kirim ulang\" untuk mencoba lagi."
            : "Koneksi gagal. Periksa jaringan lalu klik \"Kirim ulang\".",
          isError: true,
          retryPayload,
        },
      ]);
    } finally {
      setLoading(false);
      setTimeout(() => textareaRef.current?.focus(), 50);
    }
  }, [loading, messages, currentSessionId, onFirstMessage]);

  async function sendMessage() {
    const text = input.trim();
    if (!text && !pendingImage) return;
    if (loading) return;

    const capturedImage = pendingImage;
    const capturedImageUrl = pendingImageUrl;
    setInput("");
    setPendingImage(null);
    setPendingImageUrl(null);

    await sendMessageCore(text, capturedImage, capturedImageUrl);
  }

  // Bug 1: retry handler — resend with original payload
  async function handleRetry(payload: NonNullable<Message["retryPayload"]>) {
    if (loading) return;
    await sendMessageCore(payload.text, payload.image ?? null, payload.imageUrl ?? null);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  }

  function handlePaste(e: React.ClipboardEvent) {
    const items = Array.from(e.clipboardData.items);
    const imageItem = items.find((i) => i.type.startsWith("image/"));
    if (imageItem) { const file = imageItem.getAsFile(); if (file) { e.preventDefault(); attachImage(file); } }
  }

  const isEmpty = messages.length === 0;

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-5 min-h-0">
        {isEmpty ? (
          <div className="flex flex-col items-center justify-center h-full gap-6 text-center select-none">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-50 dark:bg-primary-900/20">
              <Sparkles className="h-6 w-6 text-primary-500" />
            </div>
            <div>
              <p className="text-base font-semibold text-gray-800 dark:text-slate-100">Laby AI</p>
              <p className="text-sm text-gray-400 dark:text-slate-500 mt-1 max-w-xs">
                Ask about your finances, or attach a screenshot to extract transactions automatically.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-md">
              {SUGGESTIONS.map((s) => (
                <button key={s} onClick={() => { setInput(s); textareaRef.current?.focus(); }}
                  className="text-left text-sm px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700 hover:border-primary-300 transition-colors">
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            <AnimatePresence initial={false}>
              {messages.map((msg) => (
                <MessageBubble
                  key={msg.id}
                  msg={msg}
                  accounts={accounts}
                  onSaved={() => onTransactionSaved?.()}
                  onHoldingSaved={() => onHoldingSaved?.()}
                  onRetry={handleRetry}
                />
              ))}
            </AnimatePresence>

            {loading && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex gap-3 justify-start">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary-100 mt-1">
                  <Sparkles className="h-3.5 w-3.5 text-primary-600" />
                </div>
                <div className="bg-gray-100 dark:bg-slate-700 rounded-2xl rounded-bl-sm px-4 py-3">
                  <div className="flex gap-1 items-center">
                    <span className="h-1.5 w-1.5 rounded-full bg-gray-400 animate-bounce [animation-delay:0ms]" />
                    <span className="h-1.5 w-1.5 rounded-full bg-gray-400 animate-bounce [animation-delay:150ms]" />
                    <span className="h-1.5 w-1.5 rounded-full bg-gray-400 animate-bounce [animation-delay:300ms]" />
                  </div>
                </div>
              </motion.div>
            )}
            <div ref={bottomRef} />
          </>
        )}
      </div>

      {/* Input area */}
      <div className="border-t border-gray-100 dark:border-slate-700 bg-white dark:bg-slate-900 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] space-y-2">
        {/* Pending image preview — Bug 1: survives errors because it's separate state */}
        {pendingImageUrl && (
          <div className="relative inline-block">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={pendingImageUrl} alt="Pending upload" className="h-20 w-auto rounded-xl border border-gray-200 object-cover" />
            <button onClick={clearPendingImage}
              className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-gray-700 text-white hover:bg-gray-900 transition-colors">
              <X className="h-3 w-3" />
            </button>
          </div>
        )}

        <div className="flex items-end gap-2">
          <button onClick={() => fileInputRef.current?.click()}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-gray-200 dark:border-slate-600 text-gray-400 dark:text-slate-500 hover:text-primary-600 hover:border-primary-300 dark:hover:border-primary-500 transition-colors"
            aria-label="Attach image">
            <Paperclip className="h-4 w-4" />
          </button>
          <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) attachImage(f); e.target.value = ""; }} />

          <div className="flex-1 relative">
            <textarea ref={textareaRef} value={input} onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown} onPaste={handlePaste}
              placeholder={pendingImage ? "Deskripsikan gambar ini, atau langsung kirim..." : "Tanya soal keuangan kamu..."}
              rows={1}
              className="w-full resize-none rounded-xl border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-2.5 pr-12 text-sm text-gray-900 dark:text-slate-100 placeholder:text-gray-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent max-h-32 overflow-y-auto"
              onInput={(e) => { const t = e.target as HTMLTextAreaElement; t.style.height = "auto"; t.style.height = Math.min(t.scrollHeight, 128) + "px"; }}
            />
          </div>

          <button onClick={sendMessage} disabled={(!input.trim() && !pendingImage) || loading}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-40 disabled:pointer-events-none transition-colors"
            aria-label="Send">
            <Send className="h-4 w-4" />
          </button>
        </div>

        <div className="flex items-center justify-between text-[10px] text-gray-300 dark:text-slate-600">
          <span>Paste gambar dengan Ctrl+V atau klik ikon lampiran</span>
          {messages.length > 0 && (
            <button
              onClick={() => { revokeMessageImages(messages); setMessages([]); setCurrentSessionId(null); onFirstMessage?.(null as unknown as string); }}
              className="flex items-center gap-1 text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300 transition-colors"
            >
              <RefreshCw className="h-3 w-3" /> New chat
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Text renderer ────────────────────────────────────────────────────────────

function MessageContent({ content }: { content: string }) {
  const lines = content.split("\n");
  return (
    <div className="space-y-1">
      {lines.map((line, i) => {
        if (line.startsWith("**") && line.endsWith("**"))
          return <p key={i} className="font-semibold">{line.slice(2, -2)}</p>;
        if (line.startsWith("- ") || line.startsWith("* "))
          return (
            <p key={i} className="flex gap-2">
              <span className="shrink-0 mt-2 h-1 w-1 rounded-full bg-current opacity-50" />
              <span>{line.slice(2)}</span>
            </p>
          );
        if (line === "") return <div key={i} className="h-1" />;
        return <p key={i}>{line}</p>;
      })}
    </div>
  );
}
