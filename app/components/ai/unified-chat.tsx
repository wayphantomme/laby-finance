"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Paperclip, X, Sparkles, RefreshCw, CheckCircle } from "lucide-react";
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

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  imageUrl?: string;   // local object URL for preview
  drafts?: TransactionDraft[];
}

interface Account {
  id: string;
  code: string;
  nameEn: string;
  type: string;
}

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
      if (res.ok) { setSaved(true); onSaved(); }
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
        <span className="text-xs text-gray-400 dark:text-slate-500">{edited.confidence === "high" ? "High confidence" : "Low confidence — verify before saving"}</span>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Input label="Date" type="date" value={edited.date} onChange={(e) => setEdited((p) => ({ ...p, date: e.target.value }))} />
        <Input label="Amount (IDR)" type="number" value={String(edited.amountIdr)} onChange={(e) => setEdited((p) => ({ ...p, amountIdr: parseFloat(e.target.value) || 0 }))} />
        <div className="col-span-2">
          <Input label="Description" value={edited.description} onChange={(e) => setEdited((p) => ({ ...p, description: e.target.value }))} />
        </div>
        <div className="col-span-2">
          <Select
            label="Account"
            value={edited.accountId ?? ""}
            onChange={(e) => setEdited((p) => ({ ...p, accountId: e.target.value }))}
            options={targetAccounts}
            placeholder="Select account"
          />
        </div>
        <div className="col-span-2">
          <Select
            label="Cash / Bank"
            value={edited.cashAccountId ?? ""}
            onChange={(e) => setEdited((p) => ({ ...p, cashAccountId: e.target.value }))}
            options={cashAccounts.map((a) => ({ value: a.id, label: `${a.code} — ${a.nameEn}` }))}
            placeholder="Select cash account"
          />
        </div>
      </div>

      <Button size="sm" className="w-full" loading={saving} disabled={!edited.accountId || !edited.cashAccountId} onClick={save}>
        Save Transaction
      </Button>
    </div>
  );
}

// ─── Message bubble ───────────────────────────────────────────────────────────

function MessageBubble({ msg, accounts, onSaved }: { msg: Message; accounts: Account[]; onSaved: () => void }) {
  const isUser = msg.role === "user";

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={cn("flex gap-3", isUser ? "justify-end" : "justify-start")}
    >
      {!isUser && (
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary-100 mt-1">
          <Sparkles className="h-3.5 w-3.5 text-primary-600" />
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
                : "bg-gray-100 dark:bg-slate-700 text-gray-800 dark:text-slate-100 rounded-bl-sm"
            )}
          >
            <MessageContent content={msg.content} />
          </div>
        )}

        {/* Transaction drafts */}
        {msg.drafts && msg.drafts.length > 0 && (
          <div className="w-full space-y-2 mt-1">
            <p className="text-xs text-gray-400 font-medium">
              {msg.drafts.length} transaction{msg.drafts.length > 1 ? "s" : ""} found — review and save:
            </p>
            {msg.drafts.map((draft, i) => (
              <DraftCard key={i} draft={draft} accounts={accounts} onSaved={onSaved} />
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
  sessionId,
  initialMessages,
  onFirstMessage,
}: {
  onTransactionSaved?: () => void;
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

  // Reset when sessionId changes (switching sessions)
  useEffect(() => {
    setCurrentSessionId(sessionId);
    setMessages(initialMessages ?? []);
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

  async function sendMessage() {
    const text = input.trim();
    if (!text && !pendingImage) return;
    if (loading) return;

    const msgId = Math.random().toString(36).slice(2);
    const userMsg: Message = {
      id: msgId,
      role: "user",
      content: text,
      imageUrl: pendingImageUrl ?? undefined,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    const capturedImage = pendingImage;
    const capturedImageUrl = pendingImageUrl;
    setPendingImage(null);
    setPendingImageUrl(null);
    setLoading(true);

    try {
      const allMessages = [...messages, userMsg].map((m) => ({
        role: m.role,
        content: m.content,
      }));

      // Create session on first message
      let activeSessionId = currentSessionId;
      if (!activeSessionId) {
        const sessRes = await fetch("/api/ai/sessions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({}),
        });
        const sessData = await sessRes.json();
        activeSessionId = sessData.session?.id ?? null;
        setCurrentSessionId(activeSessionId);
        if (activeSessionId) onFirstMessage?.(activeSessionId);
      }

      let res: Response;

      if (capturedImage) {
        const form = new FormData();
        form.append("messages", JSON.stringify(allMessages));
        form.append("image", capturedImage);
        if (activeSessionId) form.append("sessionId", activeSessionId);
        res = await fetch("/api/ai/chat", { method: "POST", body: form });
      } else {
        res = await fetch("/api/ai/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: allMessages, sessionId: activeSessionId }),
        });
      }

      const data = await res.json();

      setMessages((prev) => [
        ...prev,
        {
          id: Math.random().toString(36).slice(2),
          role: "assistant",
          content: res.ok ? data.content : `Error: ${data.error ?? "Request failed"}`,
          drafts: res.ok && data.drafts?.length ? data.drafts : undefined,
        },
      ]);

      if (capturedImageUrl) URL.revokeObjectURL(capturedImageUrl);
    } catch {
      setMessages((prev) => [
        ...prev,
        { id: Math.random().toString(36).slice(2), role: "assistant", content: "Connection error. Try again." },
      ]);
    } finally {
      setLoading(false);
      setTimeout(() => textareaRef.current?.focus(), 50);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  function handlePaste(e: React.ClipboardEvent) {
    const items = Array.from(e.clipboardData.items);
    const imageItem = items.find((i) => i.type.startsWith("image/"));
    if (imageItem) {
      const file = imageItem.getAsFile();
      if (file) { e.preventDefault(); attachImage(file); }
    }
  }

  const isEmpty = messages.length === 0;

  return (
    <div className="flex flex-col h-full">
      {/* Messages area */}
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
                <button
                  key={s}
                  onClick={() => { setInput(s); textareaRef.current?.focus(); }}
                  className="text-left text-sm px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700 hover:border-primary-300 transition-colors"
                >
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
                />
              ))}
            </AnimatePresence>

            {loading && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex gap-3 justify-start">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary-100 mt-1">
                  <Sparkles className="h-3.5 w-3.5 text-primary-600" />
                </div>
                <div className="bg-gray-100 rounded-2xl rounded-bl-sm px-4 py-3">
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
        {/* Pending image preview */}
        {pendingImageUrl && (
          <div className="relative inline-block">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={pendingImageUrl} alt="Pending upload" className="h-20 w-auto rounded-xl border border-gray-200 object-cover" />
            <button
              onClick={clearPendingImage}
              className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-gray-700 text-white hover:bg-gray-900 transition-colors"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        )}

        <div className="flex items-end gap-2">
          {/* Attach image */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-gray-200 dark:border-slate-600 text-gray-400 dark:text-slate-500 hover:text-primary-600 hover:border-primary-300 dark:hover:border-primary-500 transition-colors"
            aria-label="Attach image"
          >
            <Paperclip className="h-4 w-4" />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) attachImage(f); e.target.value = ""; }}
          />

          {/* Text input */}
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              onPaste={handlePaste}
              placeholder={pendingImage ? "Describe what you want to do with this image, or just send..." : "Ask about your finances..."}
              rows={1}
              className="w-full resize-none rounded-xl border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-2.5 pr-12 text-sm text-gray-900 dark:text-slate-100 placeholder:text-gray-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent max-h-32 overflow-y-auto"
              onInput={(e) => {
                const t = e.target as HTMLTextAreaElement;
                t.style.height = "auto";
                t.style.height = Math.min(t.scrollHeight, 128) + "px";
              }}
            />
          </div>

          {/* Send */}
          <button
            onClick={sendMessage}
            disabled={(!input.trim() && !pendingImage) || loading}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-40 disabled:pointer-events-none transition-colors"
            aria-label="Send"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>

        <div className="flex items-center justify-between text-[10px] text-gray-300">
          <span>Paste image with Ctrl+V or use the attach button</span>
          {messages.length > 0 && (
            <button
              onClick={() => { setMessages([]); setCurrentSessionId(null); onFirstMessage?.(null as unknown as string); }}
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
