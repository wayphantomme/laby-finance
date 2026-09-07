"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { TransactionForm } from "@/components/transactions/transaction-form";
import { TransactionList } from "@/components/transactions/transaction-list";

export default function TransactionsPage() {
  const [showForm, setShowForm] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  function handleSuccess() {
    setShowForm(false);
    setRefreshKey((k) => k + 1);
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Transactions</h2>
          <p className="text-sm text-gray-500">All journal entries, double-entry recorded.</p>
        </div>
        <Button onClick={() => setShowForm(true)} variant="primary" size="sm">
          <Plus className="h-4 w-4" /> Add Transaction
        </Button>
      </div>

      <Modal
        open={showForm}
        onClose={() => setShowForm(false)}
        title="New Transaction"
      >
        <TransactionForm onSuccess={handleSuccess} />
      </Modal>

      <Card>
        <TransactionList refreshKey={refreshKey} />
      </Card>
    </div>
  );
}
