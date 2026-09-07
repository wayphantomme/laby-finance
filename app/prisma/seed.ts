import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const accounts = [
  // ── ASSET 1-xxx ──────────────────────────────────────────────────────────
  { code: "1-000", nameEn: "Assets", nameId: "Aset", type: "ASSET", parentCode: null, sortOrder: 100 },
  { code: "1-100", nameEn: "Cash & Cash Equivalents", nameId: "Kas & Setara Kas", type: "ASSET", parentCode: "1-000", sortOrder: 110 },
  { code: "1-101", nameEn: "Cash on Hand", nameId: "Kas Tunai", type: "ASSET", parentCode: "1-100", sortOrder: 111 },
  { code: "1-102", nameEn: "Bank Account", nameId: "Rekening Bank", type: "ASSET", parentCode: "1-100", sortOrder: 112 },
  { code: "1-103", nameEn: "E-wallet", nameId: "Dompet Digital", type: "ASSET", parentCode: "1-100", sortOrder: 113 },
  { code: "1-200", nameEn: "Receivables & Other Current Assets", nameId: "Piutang & Aset Lancar Lainnya", type: "ASSET", parentCode: "1-000", sortOrder: 120 },
  { code: "1-201", nameEn: "Client Receivables", nameId: "Piutang Klien", type: "ASSET", parentCode: "1-200", sortOrder: 121 },
  { code: "1-202", nameEn: "Advance Payment", nameId: "Uang Muka", type: "ASSET", parentCode: "1-200", sortOrder: 122 },
  { code: "1-300", nameEn: "Investment Assets", nameId: "Aset Investasi", type: "ASSET", parentCode: "1-000", sortOrder: 130 },
  { code: "1-301", nameEn: "Stocks", nameId: "Saham", type: "ASSET", parentCode: "1-300", sortOrder: 131 },
  { code: "1-302", nameEn: "Cryptocurrency", nameId: "Aset Kripto", type: "ASSET", parentCode: "1-300", sortOrder: 132 },
  { code: "1-303", nameEn: "Mutual Funds", nameId: "Reksa Dana", type: "ASSET", parentCode: "1-300", sortOrder: 133 },
  { code: "1-304", nameEn: "Gold", nameId: "Emas", type: "ASSET", parentCode: "1-300", sortOrder: 134 },
  { code: "1-400", nameEn: "Fixed Assets", nameId: "Aset Tetap", type: "ASSET", parentCode: "1-000", sortOrder: 140 },
  { code: "1-401", nameEn: "Vehicle", nameId: "Kendaraan", type: "ASSET", parentCode: "1-400", sortOrder: 141 },
  { code: "1-402", nameEn: "Electronics & Equipment", nameId: "Elektronik & Peralatan", type: "ASSET", parentCode: "1-400", sortOrder: 142 },
  { code: "1-403", nameEn: "Property", nameId: "Properti", type: "ASSET", parentCode: "1-400", sortOrder: 143 },
  { code: "1-490", nameEn: "Accumulated Depreciation", nameId: "Akumulasi Penyusutan", type: "ASSET", parentCode: "1-400", sortOrder: 149 },

  // ── LIABILITY 2-xxx ───────────────────────────────────────────────────────
  { code: "2-000", nameEn: "Liabilities", nameId: "Liabilitas", type: "LIABILITY", parentCode: null, sortOrder: 200 },
  { code: "2-100", nameEn: "Current Liabilities", nameId: "Liabilitas Jangka Pendek", type: "LIABILITY", parentCode: "2-000", sortOrder: 210 },
  { code: "2-101", nameEn: "Credit Card", nameId: "Kartu Kredit", type: "LIABILITY", parentCode: "2-100", sortOrder: 211 },
  { code: "2-102", nameEn: "Short-term Debt", nameId: "Utang Jangka Pendek", type: "LIABILITY", parentCode: "2-100", sortOrder: 212 },
  { code: "2-200", nameEn: "Long-term Liabilities", nameId: "Liabilitas Jangka Panjang", type: "LIABILITY", parentCode: "2-000", sortOrder: 220 },
  { code: "2-201", nameEn: "Mortgage (KPR)", nameId: "Cicilan KPR", type: "LIABILITY", parentCode: "2-200", sortOrder: 221 },
  { code: "2-202", nameEn: "Business Loan", nameId: "Pinjaman Usaha", type: "LIABILITY", parentCode: "2-200", sortOrder: 222 },

  // ── EQUITY 3-xxx ──────────────────────────────────────────────────────────
  { code: "3-000", nameEn: "Equity", nameId: "Ekuitas", type: "EQUITY", parentCode: null, sortOrder: 300 },
  { code: "3-100", nameEn: "Opening Capital", nameId: "Modal Awal", type: "EQUITY", parentCode: "3-000", sortOrder: 310 },
  { code: "3-200", nameEn: "Retained Earnings (Net Worth)", nameId: "Saldo Laba Ditahan (Net Worth)", type: "EQUITY", parentCode: "3-000", sortOrder: 320 },

  // ── INCOME 4-xxx ──────────────────────────────────────────────────────────
  { code: "4-000", nameEn: "Income", nameId: "Pendapatan", type: "INCOME", parentCode: null, sortOrder: 400 },
  { code: "4-100", nameEn: "Operating Income", nameId: "Pendapatan Operasional", type: "INCOME", parentCode: "4-000", sortOrder: 410 },
  { code: "4-101", nameEn: "Salary", nameId: "Gaji", type: "INCOME", parentCode: "4-100", sortOrder: 411 },
  { code: "4-102", nameEn: "Freelance / Project", nameId: "Freelance / Proyek", type: "INCOME", parentCode: "4-100", sortOrder: 412 },
  { code: "4-103", nameEn: "Business Revenue", nameId: "Pendapatan Bisnis", type: "INCOME", parentCode: "4-100", sortOrder: 413 },
  { code: "4-200", nameEn: "Investment Income", nameId: "Pendapatan Investasi", type: "INCOME", parentCode: "4-000", sortOrder: 420 },
  { code: "4-201", nameEn: "Dividends", nameId: "Dividen", type: "INCOME", parentCode: "4-200", sortOrder: 421 },
  { code: "4-202", nameEn: "Interest", nameId: "Bunga", type: "INCOME", parentCode: "4-200", sortOrder: 422 },
  { code: "4-203", nameEn: "Realized Capital Gain", nameId: "Realized Capital Gain", type: "INCOME", parentCode: "4-200", sortOrder: 423 },
  { code: "4-300", nameEn: "Other Income", nameId: "Pendapatan Lain-lain", type: "INCOME", parentCode: "4-000", sortOrder: 430 },
  { code: "4-301", nameEn: "Prize / Grant / Competition", nameId: "Hadiah / Grant / Kompetisi", type: "INCOME", parentCode: "4-300", sortOrder: 431 },

  // ── EXPENSE — Basic Living 5-xxx ──────────────────────────────────────────
  { code: "5-000", nameEn: "Basic Living Expenses", nameId: "Beban Pokok Hidup", type: "EXPENSE", parentCode: null, sortOrder: 500 },
  { code: "5-100", nameEn: "Daily Necessities", nameId: "Kebutuhan Dasar", type: "EXPENSE", parentCode: "5-000", sortOrder: 510 },
  { code: "5-101", nameEn: "Food & Beverages", nameId: "Makan & Minum", type: "EXPENSE", parentCode: "5-100", sortOrder: 511 },
  { code: "5-102", nameEn: "Transport", nameId: "Transportasi", type: "EXPENSE", parentCode: "5-100", sortOrder: 512 },
  { code: "5-103", nameEn: "Housing / Rent", nameId: "Tempat Tinggal / Sewa", type: "EXPENSE", parentCode: "5-100", sortOrder: 513 },
  { code: "5-104", nameEn: "Utilities", nameId: "Listrik, Air, Gas", type: "EXPENSE", parentCode: "5-100", sortOrder: 514 },
  { code: "5-105", nameEn: "Healthcare", nameId: "Kesehatan", type: "EXPENSE", parentCode: "5-100", sortOrder: 515 },
  { code: "5-200", nameEn: "Lifestyle", nameId: "Gaya Hidup", type: "EXPENSE", parentCode: "5-000", sortOrder: 520 },
  { code: "5-201", nameEn: "Entertainment", nameId: "Hiburan", type: "EXPENSE", parentCode: "5-200", sortOrder: 521 },
  { code: "5-202", nameEn: "Shopping", nameId: "Belanja", type: "EXPENSE", parentCode: "5-200", sortOrder: 522 },
  { code: "5-203", nameEn: "Subscriptions", nameId: "Langganan", type: "EXPENSE", parentCode: "5-200", sortOrder: 523 },
  { code: "5-204", nameEn: "Education", nameId: "Pendidikan", type: "EXPENSE", parentCode: "5-200", sortOrder: 524 },

  // ── EXPENSE — Operational 6-xxx ───────────────────────────────────────────
  { code: "6-000", nameEn: "Operational Expenses", nameId: "Beban Operasional", type: "EXPENSE", parentCode: null, sortOrder: 600 },
  { code: "6-100", nameEn: "Work & Business Expenses", nameId: "Beban Kerja & Bisnis", type: "EXPENSE", parentCode: "6-000", sortOrder: 610 },
  { code: "6-101", nameEn: "Software & Subscriptions", nameId: "Perangkat Lunak & Langganan", type: "EXPENSE", parentCode: "6-100", sortOrder: 611 },
  { code: "6-102", nameEn: "Equipment", nameId: "Peralatan Kerja", type: "EXPENSE", parentCode: "6-100", sortOrder: 612 },
  { code: "6-103", nameEn: "Internet & Communication", nameId: "Internet & Komunikasi", type: "EXPENSE", parentCode: "6-100", sortOrder: 613 },
  { code: "6-200", nameEn: "Financial Expenses", nameId: "Beban Finansial", type: "EXPENSE", parentCode: "6-000", sortOrder: 620 },
  { code: "6-201", nameEn: "Loan Interest", nameId: "Bunga Utang", type: "EXPENSE", parentCode: "6-200", sortOrder: 621 },
  { code: "6-202", nameEn: "Bank Admin Fees", nameId: "Biaya Admin Bank", type: "EXPENSE", parentCode: "6-200", sortOrder: 622 },
  { code: "6-300", nameEn: "Tax Expenses", nameId: "Beban Pajak", type: "EXPENSE", parentCode: "6-000", sortOrder: 630 },
  { code: "6-301", nameEn: "PPh Final (UMKM 0.5%)", nameId: "PPh Final UMKM 0,5%", type: "EXPENSE", parentCode: "6-300", sortOrder: 631 },
  { code: "6-302", nameEn: "Income Tax (PPh OP)", nameId: "PPh Orang Pribadi", type: "EXPENSE", parentCode: "6-300", sortOrder: 632 },
];

async function main() {
  console.log("Seeding chart of accounts...");

  // Build code -> id map in two passes (parents first)
  const codeToId = new Map<string, string>();

  // Pass 1: create all root accounts (no parent)
  for (const acc of accounts.filter((a) => !a.parentCode)) {
    const created = await prisma.coaAccount.upsert({
      where: { code: acc.code },
      update: {
        nameEn: acc.nameEn,
        nameId: acc.nameId,
        type: acc.type,
        sortOrder: acc.sortOrder,
      },
      create: {
        code: acc.code,
        nameEn: acc.nameEn,
        nameId: acc.nameId,
        type: acc.type,
        sortOrder: acc.sortOrder,
      },
    });
    codeToId.set(acc.code, created.id);
    console.log(`  [root] ${acc.code} — ${acc.nameEn}`);
  }

  // Pass 2: create children (up to 2 levels deep)
  for (const acc of accounts.filter((a) => a.parentCode)) {
    const parentId = codeToId.get(acc.parentCode!);
    const created = await prisma.coaAccount.upsert({
      where: { code: acc.code },
      update: {
        nameEn: acc.nameEn,
        nameId: acc.nameId,
        type: acc.type,
        parentId: parentId ?? null,
        sortOrder: acc.sortOrder,
      },
      create: {
        code: acc.code,
        nameEn: acc.nameEn,
        nameId: acc.nameId,
        type: acc.type,
        parentId: parentId ?? null,
        sortOrder: acc.sortOrder,
      },
    });
    codeToId.set(acc.code, created.id);
    console.log(`  [child] ${acc.code} — ${acc.nameEn}`);
  }

  console.log(`\nDone. ${accounts.length} accounts seeded.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
