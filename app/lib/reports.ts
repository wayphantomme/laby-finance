/**
 * Core report computation logic.
 * All amounts in IDR sen (integer). Divide by 100 for display.
 *
 * Accounting equation enforced: Assets = Liabilities + Equity
 * Normal balances: ASSET/EXPENSE = Debit-heavy, LIABILITY/EQUITY/INCOME = Credit-heavy
 */

import { prisma } from "@/lib/prisma";

export const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

export interface MonthlyAmount {
  [monthIndex: number]: number; // 0–11
  total: number;
}

export interface ReportRow {
  accountId: string;
  code: string;
  nameEn: string;
  nameId: string;
  parentId: string | null;
  isParent: boolean;
  monthly: MonthlyAmount;
}

export interface IncomeStatementData {
  year: number;
  income: ReportRow[];
  expense: ReportRow[];
  netIncomeByMonth: MonthlyAmount;
}

export interface BalanceSheetData {
  asOf: string; // ISO date string
  assets: ReportRow[];
  liabilities: ReportRow[];
  equity: ReportRow[];
  totalAssets: number;
  totalLiabilities: number;
  totalEquity: number;
  isBalanced: boolean;
}

export interface CashFlowData {
  year: number;
  operating: ReportRow[];    // INCOME + basic living EXPENSE (5-xxx)
  investing: ReportRow[];    // ASSET changes (1-3xx investments)
  financing: ReportRow[];    // LIABILITY changes (2-xxx)
  netByMonth: MonthlyAmount;
}

// ─── Helper ──────────────────────────────────────────────────────────────────

function emptyMonthly(): MonthlyAmount {
  const m = { total: 0 } as MonthlyAmount;
  for (let i = 0; i < 12; i++) m[i] = 0;
  return m;
}

function addToMonthly(m: MonthlyAmount, monthIdx: number, amount: number) {
  m[monthIdx] = (m[monthIdx] ?? 0) + amount;
  m.total += amount;
}

// ─── Income Statement ─────────────────────────────────────────────────────────

export async function computeIncomeStatement(
  userId: string,
  year: number
): Promise<IncomeStatementData> {
  const start = new Date(year, 0, 1);
  const end = new Date(year, 11, 31, 23, 59, 59);

  const lines = await prisma.journalLine.findMany({
    where: {
      journalEntry: {
        userId,
        status: "CONFIRMED",
        deletedAt: null,
        entryDate: { gte: start, lte: end },
      },
      account: { type: { in: ["INCOME", "EXPENSE"] } },
    },
    include: {
      account: true,
      journalEntry: { select: { entryDate: true } },
    },
  });

  // Build per-account monthly amounts
  const incomeMap = new Map<string, ReportRow>();
  const expenseMap = new Map<string, ReportRow>();

  for (const line of lines) {
    const acc = line.account;
    const monthIdx = new Date(line.journalEntry.entryDate).getMonth();
    const map = acc.type === "INCOME" ? incomeMap : expenseMap;

    if (!map.has(acc.id)) {
      map.set(acc.id, {
        accountId: acc.id,
        code: acc.code,
        nameEn: acc.nameEn,
        nameId: acc.nameId,
        parentId: acc.parentId,
        isParent: false,
        monthly: emptyMonthly(),
      });
    }

    const row = map.get(acc.id)!;
    // INCOME: net = credit - debit (credit-normal)
    // EXPENSE: net = debit - credit (debit-normal)
    const net =
      acc.type === "INCOME"
        ? line.credit - line.debit
        : line.debit - line.credit;
    addToMonthly(row.monthly, monthIdx, net);
  }

  const income = sortByCode([...incomeMap.values()]);
  const expense = sortByCode([...expenseMap.values()]);

  // Net income per month
  const netIncomeByMonth = emptyMonthly();
  for (let i = 0; i < 12; i++) {
    const totalIncome = income.reduce((s, r) => s + (r.monthly[i] ?? 0), 0);
    const totalExpense = expense.reduce((s, r) => s + (r.monthly[i] ?? 0), 0);
    const net = totalIncome - totalExpense;
    netIncomeByMonth[i] = net;
    netIncomeByMonth.total += net;
  }

  return { year, income, expense, netIncomeByMonth };
}

// ─── Balance Sheet ────────────────────────────────────────────────────────────

export async function computeBalanceSheet(
  userId: string,
  asOf: Date
): Promise<BalanceSheetData> {
  const lines = await prisma.journalLine.findMany({
    where: {
      journalEntry: {
        userId,
        status: "CONFIRMED",
        deletedAt: null,
        entryDate: { lte: asOf },
      },
      account: { type: { in: ["ASSET", "LIABILITY", "EQUITY"] } },
    },
    include: {
      account: true,
    },
  });

  const assetMap = new Map<string, ReportRow>();
  const liabilityMap = new Map<string, ReportRow>();
  const equityMap = new Map<string, ReportRow>();

  for (const line of lines) {
    const acc = line.account;
    let map: Map<string, ReportRow>;
    if (acc.type === "ASSET") map = assetMap;
    else if (acc.type === "LIABILITY") map = liabilityMap;
    else map = equityMap;

    if (!map.has(acc.id)) {
      map.set(acc.id, {
        accountId: acc.id,
        code: acc.code,
        nameEn: acc.nameEn,
        nameId: acc.nameId,
        parentId: acc.parentId,
        isParent: false,
        monthly: emptyMonthly(), // unused for balance sheet, kept for type compat
      });
    }

    const row = map.get(acc.id)!;
    // Balance = cumulative net (debit - credit for assets, credit - debit for liab/equity)
    const net =
      acc.type === "ASSET"
        ? line.debit - line.credit
        : line.credit - line.debit;
    row.monthly.total += net;
  }

  // Add retained earnings from income/expense accounts
  const incomeLines = await prisma.journalLine.findMany({
    where: {
      journalEntry: {
        userId,
        status: "CONFIRMED",
        deletedAt: null,
        entryDate: { lte: asOf },
      },
      account: { type: { in: ["INCOME", "EXPENSE"] } },
    },
    include: { account: true },
  });

  let retainedEarnings = 0;
  for (const line of incomeLines) {
    retainedEarnings +=
      line.account.type === "INCOME"
        ? line.credit - line.debit
        : line.debit - line.credit;
  }

  // Find or create retained earnings row
  const reAccount = await prisma.coaAccount.findFirst({
    where: { code: "3-200" },
  });
  if (reAccount) {
    if (!equityMap.has(reAccount.id)) {
      equityMap.set(reAccount.id, {
        accountId: reAccount.id,
        code: reAccount.code,
        nameEn: reAccount.nameEn,
        nameId: reAccount.nameId,
        parentId: reAccount.parentId,
        isParent: false,
        monthly: emptyMonthly(),
      });
    }
    equityMap.get(reAccount.id)!.monthly.total += retainedEarnings;
  }

  const assets = sortByCode([...assetMap.values()]);
  const liabilities = sortByCode([...liabilityMap.values()]);
  const equity = sortByCode([...equityMap.values()]);

  const totalAssets = assets.reduce((s, r) => s + r.monthly.total, 0);
  const totalLiabilities = liabilities.reduce((s, r) => s + r.monthly.total, 0);
  const totalEquity = equity.reduce((s, r) => s + r.monthly.total, 0);

  return {
    asOf: asOf.toISOString(),
    assets,
    liabilities,
    equity,
    totalAssets,
    totalLiabilities,
    totalEquity,
    isBalanced: Math.abs(totalAssets - (totalLiabilities + totalEquity)) < 100, // within 1 IDR
  };
}

// ─── Cash Flow ────────────────────────────────────────────────────────────────

export async function computeCashFlow(
  userId: string,
  year: number
): Promise<CashFlowData> {
  const start = new Date(year, 0, 1);
  const end = new Date(year, 11, 31, 23, 59, 59);

  const lines = await prisma.journalLine.findMany({
    where: {
      journalEntry: {
        userId,
        status: "CONFIRMED",
        deletedAt: null,
        entryDate: { gte: start, lte: end },
      },
    },
    include: {
      account: true,
      journalEntry: { select: { entryDate: true } },
    },
  });

  const operatingMap = new Map<string, ReportRow>();
  const investingMap = new Map<string, ReportRow>();
  const financingMap = new Map<string, ReportRow>();

  for (const line of lines) {
    const acc = line.account;
    const monthIdx = new Date(line.journalEntry.entryDate).getMonth();

    // Cash flow classification:
    // Operating: INCOME accounts + EXPENSE accounts (5-xxx basic living, 6-xxx operational)
    // Investing: Asset changes in 1-3xx (investments) and 1-4xx (fixed assets)
    // Financing: LIABILITY accounts (2-xxx)
    let map: Map<string, ReportRow> | null = null;
    let net = 0;

    if (acc.type === "INCOME") {
      map = operatingMap;
      net = line.credit - line.debit;
    } else if (acc.type === "EXPENSE") {
      map = operatingMap;
      net = -(line.debit - line.credit); // outflow = negative
    } else if (acc.type === "ASSET" && (acc.code.startsWith("1-3") || acc.code.startsWith("1-4"))) {
      map = investingMap;
      net = -(line.debit - line.credit); // buying asset = outflow
    } else if (acc.type === "LIABILITY") {
      map = financingMap;
      net = line.credit - line.debit; // borrowing = inflow
    }

    if (!map) continue;

    if (!map.has(acc.id)) {
      map.set(acc.id, {
        accountId: acc.id,
        code: acc.code,
        nameEn: acc.nameEn,
        nameId: acc.nameId,
        parentId: acc.parentId,
        isParent: false,
        monthly: emptyMonthly(),
      });
    }
    addToMonthly(map.get(acc.id)!.monthly, monthIdx, net);
  }

  const operating = sortByCode([...operatingMap.values()]);
  const investing = sortByCode([...investingMap.values()]);
  const financing = sortByCode([...financingMap.values()]);

  const netByMonth = emptyMonthly();
  for (let i = 0; i < 12; i++) {
    const n =
      operating.reduce((s, r) => s + (r.monthly[i] ?? 0), 0) +
      investing.reduce((s, r) => s + (r.monthly[i] ?? 0), 0) +
      financing.reduce((s, r) => s + (r.monthly[i] ?? 0), 0);
    netByMonth[i] = n;
    netByMonth.total += n;
  }

  return { year, operating, investing, financing, netByMonth };
}

// ─── Net Worth History ────────────────────────────────────────────────────────

export async function computeNetWorthHistory(
  userId: string,
  year: number
): Promise<{ month: string; netWorth: number }[]> {
  // Single query: fetch all lines up to end of year, compute monthly snapshots in memory
  const endOfYear = new Date(year, 11, 31, 23, 59, 59);

  const lines = await prisma.journalLine.findMany({
    where: {
      journalEntry: {
        userId,
        status: "CONFIRMED",
        deletedAt: null,
        entryDate: { lte: endOfYear },
      },
      account: { type: { in: ["ASSET", "LIABILITY"] } },
    },
    include: {
      account: { select: { type: true } },
      journalEntry: { select: { entryDate: true } },
    },
  });

  const result = [];
  for (let m = 0; m < 12; m++) {
    const cutoff = new Date(year, m + 1, 0, 23, 59, 59); // last day of month

    let assets = 0;
    let liabilities = 0;

    for (const line of lines) {
      if (new Date(line.journalEntry.entryDate) > cutoff) continue;
      if (line.account.type === "ASSET") assets += line.debit - line.credit;
      else liabilities += line.credit - line.debit;
    }

    result.push({
      month: MONTHS[m],
      netWorth: assets - liabilities,
    });
  }

  return result;
}

// ─── CSV Export ──────────────────────────────────────────────────────────────

export function rowsToCsv(
  rows: ReportRow[],
  year: number,
  label: string
): string {
  const headers = ["Code", "Account", ...MONTHS, "Total"];
  const lines = [
    `${label} ${year}`,
    headers.join(","),
    ...rows.map((r) => {
      const vals = Array.from({ length: 12 }, (_, i) =>
        ((r.monthly[i] ?? 0) / 100).toFixed(0)
      );
      return [
        r.code,
        `"${r.nameEn}"`,
        ...vals,
        (r.monthly.total / 100).toFixed(0),
      ].join(",");
    }),
  ];
  return lines.join("\n");
}

// ─── Util ─────────────────────────────────────────────────────────────────────

function sortByCode(rows: ReportRow[]): ReportRow[] {
  return rows.sort((a, b) => a.code.localeCompare(b.code));
}
