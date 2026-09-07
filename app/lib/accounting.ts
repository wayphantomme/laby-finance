// Double-entry helper: given a simple transaction (income or expense),
// auto-generate the two journal lines (debit + credit pair).
//
// For INCOME:  Debit Cash account, Credit Income account
// For EXPENSE: Debit Expense account, Credit Cash account
// For TRANSFER: Debit destination, Credit source

import type { CoaAccount } from "@prisma/client";

export type AccountType = "ASSET" | "LIABILITY" | "EQUITY" | "INCOME" | "EXPENSE";

export function normalBalance(type: AccountType): "DEBIT" | "CREDIT" {
  return type === "ASSET" || type === "EXPENSE" ? "DEBIT" : "CREDIT";
}

export type SimpleTransactionType = "INCOME" | "EXPENSE" | "TRANSFER";

export interface JournalLineInput {
  accountId: string;
  debit: number;  // in sen
  credit: number; // in sen
  note?: string;
}

/**
 * Build journal lines for a simple transaction.
 * cashAccountId: the asset account to hit (e.g. 1-101 Cash, 1-102 Bank)
 * targetAccountId: the income/expense account
 * amountSen: amount in IDR sen
 */
export function buildJournalLines(
  type: SimpleTransactionType,
  cashAccountId: string,
  targetAccountId: string,
  amountSen: number
): JournalLineInput[] {
  if (type === "INCOME") {
    return [
      { accountId: cashAccountId, debit: amountSen, credit: 0 },
      { accountId: targetAccountId, debit: 0, credit: amountSen },
    ];
  }
  if (type === "EXPENSE") {
    return [
      { accountId: targetAccountId, debit: amountSen, credit: 0 },
      { accountId: cashAccountId, debit: 0, credit: amountSen },
    ];
  }
  // TRANSFER: debit destination, credit source
  return [
    { accountId: targetAccountId, debit: amountSen, credit: 0 },
    { accountId: cashAccountId, debit: 0, credit: amountSen },
  ];
}

/**
 * Validate that a set of journal lines balances (total debit == total credit).
 */
export function isBalanced(lines: JournalLineInput[]): boolean {
  const totalDebit = lines.reduce((s, l) => s + l.debit, 0);
  const totalCredit = lines.reduce((s, l) => s + l.credit, 0);
  return totalDebit === totalCredit;
}

/**
 * Determine transaction type from account types.
 */
export function inferTransactionType(account: CoaAccount): SimpleTransactionType {
  if (account.type === "INCOME") return "INCOME";
  if (account.type === "EXPENSE") return "EXPENSE";
  return "TRANSFER";
}
