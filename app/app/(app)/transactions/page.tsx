"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { TransactionForm, type TransactionDraft } from "@/components/transactions/transaction-form";
import { TransactionList } from "@/components/transactions/transaction-list";
import { useLocale } from "@/lib/i18n/locale-context";

export default function TransactionsPage() {
  const { t } = useLocale();
  const [modalOpen, setModalOpen] = useState(false);
  const [editDraft, setEditDraft] = useState<TransactionDraft | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  function openAdd() {
    setEditDraft(null);
    setModalOpen(true);
  }

  function openEdit(draft: TransactionDraft) {
    setEditDraft(draft);
    setModalOpen(true);
  }

  function handleSuccess() {
    setModalOpen(false);
    setEditDraft(null);
    setRefreshKey((k) => k + 1);
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-slate-100">
            {t.transactions.title}
          </h2>
          <p className="text-sm text-gray-500 dark:text-slate-400">
            {t.transactions.subtitle}
          </p>
        </div>
        <Button onClick={openAdd} size="sm">
          <Plus className="h-4 w-4" />
          {t.transactions.addTransaction}
        </Button>
      </div>

      <Card className="p-0 overflow-hidden">
        <TransactionList
          refreshKey={refreshKey}
          onEdit={openEdit}
        />
      </Card>

      <Modal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditDraft(null); }}
        title={editDraft ? "Edit Transaction" : t.transactions.newTransaction}
      >
        <TransactionForm
          key={editDraft?.id ?? "new"}
          onSuccess={handleSuccess}
          initialValues={editDraft ?? undefined}
        />
      </Modal>
    </div>
  );
}
