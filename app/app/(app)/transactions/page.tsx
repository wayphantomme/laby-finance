"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TransactionForm } from "@/components/transactions/transaction-form";
import { TransactionList } from "@/components/transactions/transaction-list";
import { useLocale } from "@/lib/i18n/locale-context";

export default function TransactionsPage() {
  const { t } = useLocale();
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
          <h2 className="text-lg font-semibold text-gray-900 dark:text-slate-100">{t.transactions.title}</h2>
          <p className="text-sm text-gray-500 dark:text-slate-400">{t.transactions.subtitle}</p>
        </div>
        <Button onClick={() => setShowForm((v) => !v)} variant={showForm ? "secondary" : "primary"} size="sm">
          {showForm ? <><X className="h-4 w-4" />{t.transactions.cancel}</> : <><Plus className="h-4 w-4" />{t.transactions.addTransaction}</>}
        </Button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
            <Card>
              <h3 className="text-sm font-semibold text-gray-700 dark:text-slate-300 mb-4">{t.transactions.newTransaction}</h3>
              <TransactionForm onSuccess={handleSuccess} />
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <Card>
        <TransactionList refreshKey={refreshKey} />
      </Card>
    </div>
  );
}
