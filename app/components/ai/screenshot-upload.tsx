"use client";

import { useState, useCallback, useRef } from "react";
import { Upload, X, CheckCircle, AlertCircle, Loader2, ImageIcon, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { formatRupiah, formatDateInput } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useEffect } from "react";

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

interface Account {
  id: string;
  code: string;
  nameEn: string;
  type: string;
}

export function ScreenshotUpload({ onTransactionSaved }: { onTransactionSaved: () => void }) {
  const [dragOver, setDragOver] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [extracting, setExtracting] = useState(false);
  const [drafts, setDrafts] = useState<TransactionDraft[]>([]);
  const [editedDrafts, setEditedDrafts] = useState<TransactionDraft[]>([]);
  const [saving, setSaving] = useState<Record<number, boolean>>({});
  const [saved, setSaved] = useState<Record<number, boolean>>({});
  const [error, setError] = useState("");
  const [accounts, setAccounts] = useState<Account[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/accounts")
      .then((r) => r.json())
      .then((d) => setAccounts(d.accounts ?? []));
  }, []);

  const cashAccounts = accounts.filter(
    (a) => a.type === "ASSET" && a.code.startsWith("1-1") && !a.code.endsWith("-000")
  );

  const accountOptions = (type: "INCOME" | "EXPENSE" | "TRANSFER") =>
    accounts
      .filter((a) => {
        if (type === "INCOME") return a.type === "INCOME" && !a.code.endsWith("-000");
        if (type === "EXPENSE") return a.type === "EXPENSE" && !a.code.endsWith("-000");
        return a.type === "ASSET" && !a.code.endsWith("-000");
      })
      .map((a) => ({ value: a.id, label: `${a.code} — ${a.nameEn}` }));

  function loadFile(f: File) {
    setFile(f);
    setDrafts([]);
    setEditedDrafts([]);
    setSaved({});
    setError("");
    const url = URL.createObjectURL(f);
    setPreview(url);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f && f.type.startsWith("image/")) loadFile(f);
  }

  function handleFileInput(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (f) loadFile(f);
  }

  function clearFile() {
    setFile(null);
    setPreview(null);
    setDrafts([]);
    setEditedDrafts([]);
    setSaved({});
    setError("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function handleExtract() {
    if (!file) return;
    setExtracting(true);
    setError("");
    setDrafts([]);

    const form = new FormData();
    form.append("file", file);

    try {
      const res = await fetch("/api/ai/extract", { method: "POST", body: form });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Extraction failed.");
        return;
      }

      if (!data.drafts?.length) {
        setError("No transactions found in this image. Try a clearer screenshot.");
        return;
      }

      setDrafts(data.drafts);
      setEditedDrafts(data.drafts.map((d: TransactionDraft) => ({ ...d })));
    } catch {
      setError("Network error during extraction.");
    } finally {
      setExtracting(false);
    }
  }

  function updateDraft(i: number, patch: Partial<TransactionDraft>) {
    setEditedDrafts((prev) => prev.map((d, idx) => (idx === i ? { ...d, ...patch } : d)));
  }

  async function saveDraft(i: number) {
    const draft = editedDrafts[i];
    if (!draft.accountId || !draft.cashAccountId || !draft.amountIdr) return;

    setSaving((s) => ({ ...s, [i]: true }));
    try {
      const res = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: draft.date,
          description: draft.description,
          amountIdr: draft.amountIdr,
          accountId: draft.accountId,
          cashAccountId: draft.cashAccountId,
          transactionType: draft.transactionType,
        }),
      });

      if (res.ok) {
        setSaved((s) => ({ ...s, [i]: true }));
        onTransactionSaved();
      }
    } finally {
      setSaving((s) => ({ ...s, [i]: false }));
    }
  }

  async function saveAll() {
    const unsaved = editedDrafts.map((_, i) => i).filter((i) => !saved[i]);
    for (const i of unsaved) await saveDraft(i);
  }

  return (
    <div className="flex flex-col h-full gap-4 overflow-y-auto">
      {/* Drop zone */}
      {!preview ? (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={cn(
            "flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed cursor-pointer transition-colors p-8",
            dragOver
              ? "border-primary-400 bg-primary-50"
              : "border-gray-200 bg-gray-50 hover:border-primary-300 hover:bg-gray-100"
          )}
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white border border-gray-200">
            <ImageIcon className="h-5 w-5 text-gray-400" />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-gray-700">
              Drop a screenshot here
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Bank statement, e-wallet, or any transaction screenshot
            </p>
            <p className="text-xs text-gray-300 mt-1">JPEG, PNG, WebP up to 10MB</p>
          </div>
          <Button variant="secondary" size="sm" type="button">
            <Upload className="h-4 w-4" /> Choose file
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={handleFileInput}
          />
        </div>
      ) : (
        <div className="space-y-3">
          {/* Preview */}
          <div className="relative rounded-xl overflow-hidden border border-gray-200">
            <img src={preview} alt="Screenshot preview" className="w-full max-h-64 object-contain bg-gray-50" />
            <button
              onClick={clearFile}
              className="absolute top-2 right-2 flex h-7 w-7 items-center justify-center rounded-full bg-white border border-gray-200 text-gray-500 hover:text-red-500 shadow-sm transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {drafts.length === 0 && (
            <Button onClick={handleExtract} loading={extracting} className="w-full">
              {extracting ? "Analyzing..." : "Extract Transactions with AI"}
            </Button>
          )}
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Extracted drafts */}
      <AnimatePresence>
        {editedDrafts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-gray-700">
                {editedDrafts.length} transaction{editedDrafts.length > 1 ? "s" : ""} found
              </p>
              {editedDrafts.length > 1 && (
                <Button size="sm" onClick={saveAll}>
                  Save all
                </Button>
              )}
            </div>

            {editedDrafts.map((draft, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className={cn(
                  "rounded-xl border p-4 space-y-3 transition-colors",
                  saved[i]
                    ? "border-green-200 bg-green-50"
                    : "border-gray-200 bg-white"
                )}
              >
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={
                        draft.transactionType === "INCOME" ? "income" :
                        draft.transactionType === "EXPENSE" ? "expense" : "default"
                      }
                    >
                      {draft.transactionType}
                    </Badge>
                    <Badge variant={draft.confidence === "high" ? "default" : "default"}>
                      {draft.confidence === "high" ? "High confidence" : "Low confidence"}
                    </Badge>
                  </div>
                  {saved[i] && (
                    <span className="flex items-center gap-1 text-xs text-green-600 font-medium">
                      <CheckCircle className="h-3.5 w-3.5" /> Saved
                    </span>
                  )}
                </div>

                {!saved[i] && (
                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      label="Date"
                      type="date"
                      value={draft.date}
                      onChange={(e) => updateDraft(i, { date: e.target.value })}
                    />
                    <Input
                      label="Amount (IDR)"
                      type="number"
                      value={String(draft.amountIdr)}
                      onChange={(e) => updateDraft(i, { amountIdr: parseFloat(e.target.value) || 0 })}
                    />
                    <div className="col-span-2">
                      <Input
                        label="Description"
                        value={draft.description}
                        onChange={(e) => updateDraft(i, { description: e.target.value })}
                      />
                    </div>
                    <div className="col-span-2">
                      <Select
                        label="Transaction Type"
                        value={draft.transactionType}
                        onChange={(e) =>
                          updateDraft(i, { transactionType: e.target.value as "INCOME" | "EXPENSE" | "TRANSFER", accountId: null })
                        }
                        options={[
                          { value: "INCOME", label: "Income" },
                          { value: "EXPENSE", label: "Expense" },
                          { value: "TRANSFER", label: "Transfer" },
                        ]}
                      />
                    </div>
                    <div className="col-span-2">
                      <Select
                        label="Account"
                        value={draft.accountId ?? ""}
                        onChange={(e) => updateDraft(i, { accountId: e.target.value })}
                        options={accountOptions(draft.transactionType)}
                        placeholder="Select account"
                      />
                    </div>
                    <div className="col-span-2">
                      <Select
                        label="Cash / Bank Account"
                        value={draft.cashAccountId ?? ""}
                        onChange={(e) => updateDraft(i, { cashAccountId: e.target.value })}
                        options={cashAccounts.map((a) => ({ value: a.id, label: `${a.code} — ${a.nameEn}` }))}
                        placeholder="Select cash account"
                      />
                    </div>
                  </div>
                )}

                {saved[i] ? (
                  <p className="text-xs text-green-700">
                    {draft.description} — {formatRupiah(draft.amountIdr * 100)}
                  </p>
                ) : (
                  <Button
                    onClick={() => saveDraft(i)}
                    loading={saving[i]}
                    disabled={!draft.accountId || !draft.cashAccountId}
                    className="w-full"
                    size="sm"
                  >
                    Save Transaction
                  </Button>
                )}
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
