/**
 * seed-demo.ts — Create the demo account with realistic sample data.
 *
 * Run:
 *   npx tsx prisma/seed-demo.ts
 *
 * This is idempotent: re-running upserts the user and skips duplicate entries.
 */

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const DEMO_EMAIL = "demo@laby.app";
const DEMO_PASSWORD = "demo1234";
const DEMO_NAME = "Demo User";

async function main() {
  console.log("🌱 Seeding demo account...");

  // ── 1. Upsert demo user ──────────────────────────────────────────────────
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);
  const user = await prisma.user.upsert({
    where: { email: DEMO_EMAIL },
    update: { name: DEMO_NAME, passwordHash },
    create: { email: DEMO_EMAIL, name: DEMO_NAME, passwordHash },
  });
  console.log(`✓ Demo user: ${user.email} (id: ${user.id})`);

  // ── 2. Fetch required CoA accounts ──────────────────────────────────────
  const accounts = await prisma.coaAccount.findMany({
    where: { isActive: true },
    select: { id: true, code: true },
  });
  const byCode = Object.fromEntries(accounts.map((a) => [a.code, a.id]));

  const BANK = byCode["1-102"];
  const EWALLET = byCode["1-103"];
  const SALARY = byCode["4-101"];
  const FREELANCE = byCode["4-102"];
  const FOOD = byCode["5-101"];
  const TRANSPORT = byCode["5-102"];
  const RENT = byCode["5-103"];
  const UTILITIES = byCode["5-104"];
  const ENTERTAINMENT = byCode["5-201"];
  const SHOPPING = byCode["5-202"];
  const SUBSCRIPTIONS = byCode["5-203"];
  const OPENING = byCode["3-100"];
  const CRYPTO = byCode["1-302"];
  const STOCKS = byCode["1-301"];

  if (!BANK || !SALARY || !FOOD || !OPENING) {
    throw new Error("Required CoA accounts not found — run prisma/seed.ts first.");
  }

  // ── 3. Opening balance journal entry ────────────────────────────────────
  const existingOpening = await prisma.journalEntry.findFirst({
    where: { userId: user.id, description: "Opening Balance — Demo Account" },
  });

  if (!existingOpening) {
    await prisma.journalEntry.create({
      data: {
        userId: user.id,
        entryDate: new Date("2026-01-01"),
        description: "Opening Balance — Demo Account",
        source: "MANUAL",
        status: "CONFIRMED",
        lines: {
          create: [
            { accountId: BANK, debit: 3_500_000_00, credit: 0 },       // Rp 3.500.000
            { accountId: EWALLET, debit: 850_000_00, credit: 0 },       // Rp 850.000
            { accountId: OPENING, debit: 0, credit: 4_350_000_00 },    // Rp 4.350.000
          ],
        },
      },
    });
    console.log("✓ Opening balance created");
  }

  // ── 4. Monthly transactions (Jan–Aug 2026) ───────────────────────────────
  type TxDef = {
    date: string;
    description: string;
    debitAccount: string;
    creditAccount: string;
    amount: number; // in sen (×100)
  };

  const transactions: TxDef[] = [
    // ── January 2026 ──
    { date: "2026-01-05", description: "Gaji Januari", debitAccount: BANK, creditAccount: SALARY, amount: 12_000_000_00 },
    { date: "2026-01-06", description: "Sewa Kos Januari", debitAccount: RENT, creditAccount: BANK, amount: 1_800_000_00 },
    { date: "2026-01-08", description: "Belanja Bahan Makanan", debitAccount: FOOD, creditAccount: BANK, amount: 450_000_00 },
    { date: "2026-01-10", description: "Grab / Commute", debitAccount: TRANSPORT, creditAccount: EWALLET, amount: 120_000_00 },
    { date: "2026-01-12", description: "Netflix + Spotify", debitAccount: SUBSCRIPTIONS, creditAccount: BANK, amount: 95_000_00 },
    { date: "2026-01-14", description: "Makan Siang Kantor", debitAccount: FOOD, creditAccount: EWALLET, amount: 85_000_00 },
    { date: "2026-01-18", description: "Listrik & Air", debitAccount: UTILITIES, creditAccount: BANK, amount: 380_000_00 },
    { date: "2026-01-20", description: "Freelance Project A", debitAccount: BANK, creditAccount: FREELANCE, amount: 3_500_000_00 },
    { date: "2026-01-22", description: "Beli Baju Online", debitAccount: SHOPPING, creditAccount: BANK, amount: 350_000_00 },
    { date: "2026-01-25", description: "Weekend Hangout", debitAccount: ENTERTAINMENT, creditAccount: EWALLET, amount: 280_000_00 },
    { date: "2026-01-28", description: "Belanja Mingguan", debitAccount: FOOD, creditAccount: BANK, amount: 320_000_00 },
    // ── February 2026 ──
    { date: "2026-02-05", description: "Gaji Februari", debitAccount: BANK, creditAccount: SALARY, amount: 12_000_000_00 },
    { date: "2026-02-06", description: "Sewa Kos Februari", debitAccount: RENT, creditAccount: BANK, amount: 1_800_000_00 },
    { date: "2026-02-07", description: "Makan Siang", debitAccount: FOOD, creditAccount: EWALLET, amount: 95_000_00 },
    { date: "2026-02-10", description: "Grab / Commute", debitAccount: TRANSPORT, creditAccount: EWALLET, amount: 135_000_00 },
    { date: "2026-02-12", description: "Netflix + Spotify", debitAccount: SUBSCRIPTIONS, creditAccount: BANK, amount: 95_000_00 },
    { date: "2026-02-14", description: "Valentine Dinner", debitAccount: ENTERTAINMENT, creditAccount: BANK, amount: 650_000_00 },
    { date: "2026-02-18", description: "Listrik & Air", debitAccount: UTILITIES, creditAccount: BANK, amount: 395_000_00 },
    { date: "2026-02-20", description: "Belanja Bulanan", debitAccount: FOOD, creditAccount: BANK, amount: 480_000_00 },
    { date: "2026-02-25", description: "Freelance Project B", debitAccount: BANK, creditAccount: FREELANCE, amount: 5_000_000_00 },
    // ── March 2026 ──
    { date: "2026-03-05", description: "Gaji Maret", debitAccount: BANK, creditAccount: SALARY, amount: 12_000_000_00 },
    { date: "2026-03-06", description: "Sewa Kos Maret", debitAccount: RENT, creditAccount: BANK, amount: 1_800_000_00 },
    { date: "2026-03-08", description: "Belanja Bahan Makanan", debitAccount: FOOD, creditAccount: BANK, amount: 420_000_00 },
    { date: "2026-03-10", description: "Grab / Commute", debitAccount: TRANSPORT, creditAccount: EWALLET, amount: 110_000_00 },
    { date: "2026-03-12", description: "Netflix + Spotify", debitAccount: SUBSCRIPTIONS, creditAccount: BANK, amount: 95_000_00 },
    { date: "2026-03-15", description: "Beli Buku & Kursus Online", debitAccount: SHOPPING, creditAccount: BANK, amount: 550_000_00 },
    { date: "2026-03-18", description: "Listrik & Air", debitAccount: UTILITIES, creditAccount: BANK, amount: 370_000_00 },
    { date: "2026-03-20", description: "Makan di Luar", debitAccount: FOOD, creditAccount: EWALLET, amount: 180_000_00 },
    { date: "2026-03-22", description: "Konser Musik", debitAccount: ENTERTAINMENT, creditAccount: BANK, amount: 450_000_00 },
    { date: "2026-03-28", description: "Belanja Mingguan", debitAccount: FOOD, creditAccount: BANK, amount: 380_000_00 },
    // ── April 2026 ──
    { date: "2026-04-05", description: "Gaji April", debitAccount: BANK, creditAccount: SALARY, amount: 12_000_000_00 },
    { date: "2026-04-06", description: "Sewa Kos April", debitAccount: RENT, creditAccount: BANK, amount: 1_800_000_00 },
    { date: "2026-04-07", description: "Freelance Project C", debitAccount: BANK, creditAccount: FREELANCE, amount: 4_200_000_00 },
    { date: "2026-04-10", description: "Belanja Makanan", debitAccount: FOOD, creditAccount: BANK, amount: 460_000_00 },
    { date: "2026-04-12", description: "Netflix + Spotify", debitAccount: SUBSCRIPTIONS, creditAccount: BANK, amount: 95_000_00 },
    { date: "2026-04-15", description: "Beli Sepatu", debitAccount: SHOPPING, creditAccount: BANK, amount: 850_000_00 },
    { date: "2026-04-18", description: "Listrik & Air", debitAccount: UTILITIES, creditAccount: BANK, amount: 390_000_00 },
    { date: "2026-04-20", description: "Grab / Commute", debitAccount: TRANSPORT, creditAccount: EWALLET, amount: 125_000_00 },
    { date: "2026-04-25", description: "Liburan Lokal", debitAccount: ENTERTAINMENT, creditAccount: BANK, amount: 1_200_000_00 },
    // ── May 2026 ──
    { date: "2026-05-05", description: "Gaji Mei", debitAccount: BANK, creditAccount: SALARY, amount: 12_000_000_00 },
    { date: "2026-05-06", description: "Sewa Kos Mei", debitAccount: RENT, creditAccount: BANK, amount: 1_800_000_00 },
    { date: "2026-05-08", description: "Belanja Makanan", debitAccount: FOOD, creditAccount: BANK, amount: 440_000_00 },
    { date: "2026-05-10", description: "Grab / Commute", debitAccount: TRANSPORT, creditAccount: EWALLET, amount: 130_000_00 },
    { date: "2026-05-12", description: "Netflix + Spotify", debitAccount: SUBSCRIPTIONS, creditAccount: BANK, amount: 95_000_00 },
    { date: "2026-05-15", description: "Lebaran Parcel", debitAccount: SHOPPING, creditAccount: BANK, amount: 650_000_00 },
    { date: "2026-05-18", description: "Listrik & Air", debitAccount: UTILITIES, creditAccount: BANK, amount: 360_000_00 },
    { date: "2026-05-20", description: "Makan Bersama Keluarga", debitAccount: FOOD, creditAccount: BANK, amount: 380_000_00 },
    { date: "2026-05-25", description: "Freelance Project D", debitAccount: BANK, creditAccount: FREELANCE, amount: 6_000_000_00 },
    // ── June 2026 ──
    { date: "2026-06-05", description: "Gaji Juni", debitAccount: BANK, creditAccount: SALARY, amount: 12_500_000_00 }, // naik gaji
    { date: "2026-06-06", description: "Sewa Kos Juni", debitAccount: RENT, creditAccount: BANK, amount: 1_800_000_00 },
    { date: "2026-06-08", description: "Belanja Makanan", debitAccount: FOOD, creditAccount: BANK, amount: 420_000_00 },
    { date: "2026-06-10", description: "Grab / Commute", debitAccount: TRANSPORT, creditAccount: EWALLET, amount: 140_000_00 },
    { date: "2026-06-12", description: "Netflix + Spotify", debitAccount: SUBSCRIPTIONS, creditAccount: BANK, amount: 95_000_00 },
    { date: "2026-06-15", description: "Beli Gadget Aksesoris", debitAccount: SHOPPING, creditAccount: BANK, amount: 750_000_00 },
    { date: "2026-06-18", description: "Listrik & Air", debitAccount: UTILITIES, creditAccount: BANK, amount: 405_000_00 },
    { date: "2026-06-22", description: "Nonton Bioskop", debitAccount: ENTERTAINMENT, creditAccount: EWALLET, amount: 120_000_00 },
    { date: "2026-06-28", description: "Belanja Mingguan", debitAccount: FOOD, creditAccount: BANK, amount: 390_000_00 },
    // ── July 2026 ──
    { date: "2026-07-05", description: "Gaji Juli", debitAccount: BANK, creditAccount: SALARY, amount: 12_500_000_00 },
    { date: "2026-07-06", description: "Sewa Kos Juli", debitAccount: RENT, creditAccount: BANK, amount: 1_800_000_00 },
    { date: "2026-07-07", description: "Freelance Project E", debitAccount: BANK, creditAccount: FREELANCE, amount: 7_500_000_00 },
    { date: "2026-07-08", description: "Belanja Makanan", debitAccount: FOOD, creditAccount: BANK, amount: 460_000_00 },
    { date: "2026-07-10", description: "Grab / Commute", debitAccount: TRANSPORT, creditAccount: EWALLET, amount: 125_000_00 },
    { date: "2026-07-12", description: "Netflix + Spotify", debitAccount: SUBSCRIPTIONS, creditAccount: BANK, amount: 95_000_00 },
    { date: "2026-07-18", description: "Listrik & Air", debitAccount: UTILITIES, creditAccount: BANK, amount: 415_000_00 },
    { date: "2026-07-20", description: "Liburan Bali", debitAccount: ENTERTAINMENT, creditAccount: BANK, amount: 3_200_000_00 },
    { date: "2026-07-28", description: "Belanja Mingguan", debitAccount: FOOD, creditAccount: BANK, amount: 400_000_00 },
    // ── August 2026 ──
    { date: "2026-08-05", description: "Gaji Agustus", debitAccount: BANK, creditAccount: SALARY, amount: 12_500_000_00 },
    { date: "2026-08-06", description: "Sewa Kos Agustus", debitAccount: RENT, creditAccount: BANK, amount: 1_800_000_00 },
    { date: "2026-08-08", description: "Belanja Makanan", debitAccount: FOOD, creditAccount: BANK, amount: 430_000_00 },
    { date: "2026-08-10", description: "Grab / Commute", debitAccount: TRANSPORT, creditAccount: EWALLET, amount: 115_000_00 },
    { date: "2026-08-12", description: "Netflix + Spotify", debitAccount: SUBSCRIPTIONS, creditAccount: BANK, amount: 95_000_00 },
    { date: "2026-08-15", description: "Beli Baju Kerja", debitAccount: SHOPPING, creditAccount: BANK, amount: 980_000_00 },
    { date: "2026-08-18", description: "Listrik & Air", debitAccount: UTILITIES, creditAccount: BANK, amount: 388_000_00 },
    { date: "2026-08-20", description: "Makan di Luar", debitAccount: FOOD, creditAccount: EWALLET, amount: 210_000_00 },
    { date: "2026-08-25", description: "Freelance Project F", debitAccount: BANK, creditAccount: FREELANCE, amount: 4_800_000_00 },
    { date: "2026-08-28", description: "Belanja Mingguan", debitAccount: FOOD, creditAccount: BANK, amount: 355_000_00 },
  ];

  let created = 0;
  // Use createMany for speed — skip duplicates via skipDuplicates is not available
  // on Neon's connection pooler, so we batch-check then create.
  const existingDescs = new Set(
    (await prisma.journalEntry.findMany({
      where: { userId: user.id },
      select: { description: true, entryDate: true },
    })).map((e) => `${e.description}|${new Date(e.entryDate).toISOString().split("T")[0]}`)
  );

  for (const tx of transactions) {
    const key = `${tx.description}|${tx.date}`;
    if (existingDescs.has(key)) continue;
    await prisma.journalEntry.create({
      data: {
        userId: user.id,
        entryDate: new Date(tx.date),
        description: tx.description,
        source: "MANUAL",
        status: "CONFIRMED",
        lines: {
          create: [
            { accountId: tx.debitAccount, debit: tx.amount, credit: 0 },
            { accountId: tx.creditAccount, debit: 0, credit: tx.amount },
          ],
        },
      },
    });
    created++;
    process.stdout.write(`\r  Creating transactions... ${created}`);
  }
  console.log(`\n✓ ${created} transactions created (${transactions.length - created} already existed)`);

  // ── 5. Portfolio holdings ────────────────────────────────────────────────
  if (CRYPTO && STOCKS) {
    const holdings = [
      {
        assetName: "Bitcoin",
        ticker: "BTC",
        assetType: "crypto",
        quantity: 0.015,
        lots: null,
        avgBuyPrice: 50_000_00, // $50.000 per BTC → stored as USD cents (50_000 × 100)
        currentPrice: 50_000_00,
        currency: "USD",   // will be converted to IDR on display
        accountId: CRYPTO,
        openingDate: new Date("2026-03-01"),
        notes: "DCA pembelian bertahap",
      },
      {
        assetName: "Solana",
        ticker: "SOL",
        assetType: "crypto",
        quantity: 5,
        lots: null,
        avgBuyPrice: 170_00, // $170 per SOL → stored as USD cents
        currentPrice: 170_00,
        currency: "USD",
        accountId: CRYPTO,
        openingDate: new Date("2026-04-15"),
        notes: null,
      },
      {
        assetName: "Bank Central Asia",
        ticker: "BBCA",
        assetType: "stock_idx",
        quantity: 500,
        lots: 5,
        avgBuyPrice: 980_000, // Rp 9.800 per lembar × 100 sen
        currentPrice: 980_000,
        currency: "IDR",
        accountId: STOCKS,
        openingDate: new Date("2026-02-01"),
        notes: "5 lot BBCA",
      },
    ];

    for (const h of holdings) {
      const existing = await prisma.portfolioHolding.findFirst({
        where: { userId: user.id, ticker: h.ticker },
      });
      if (!existing) {
        await prisma.portfolioHolding.create({
          data: { userId: user.id, ...h },
        });
        // Opening balance journal entry for each holding
        const openingCapital = await prisma.coaAccount.findFirst({ where: { code: "3-100" } });
        const totalCost = h.assetType === "stock_idx" && h.lots
          ? h.lots * 100 * h.avgBuyPrice
          : Math.round(h.quantity * h.avgBuyPrice);
        if (openingCapital && totalCost > 0) {
          await prisma.journalEntry.create({
            data: {
              userId: user.id,
              entryDate: h.openingDate,
              description: `Opening balance: ${h.assetName} (${h.ticker})`,
              source: "MANUAL",
              status: "CONFIRMED",
              lines: {
                create: [
                  { accountId: h.accountId, debit: totalCost, credit: 0 },
                  { accountId: openingCapital.id, debit: 0, credit: totalCost },
                ],
              },
            },
          });
        }
      }
    }
    console.log("✓ Portfolio holdings created");
  }

  // ── 6. Budget ────────────────────────────────────────────────────────────
  const budgets = [
    { accountId: FOOD, month: 9, year: 2026, amountSen: 1_500_000_00 },
    { accountId: TRANSPORT, month: 9, year: 2026, amountSen: 300_000_00 },
    { accountId: RENT, month: 9, year: 2026, amountSen: 1_800_000_00 },
    { accountId: UTILITIES, month: 9, year: 2026, amountSen: 450_000_00 },
    { accountId: ENTERTAINMENT, month: 9, year: 2026, amountSen: 500_000_00 },
    { accountId: SHOPPING, month: 9, year: 2026, amountSen: 600_000_00 },
    { accountId: SUBSCRIPTIONS, month: 9, year: 2026, amountSen: 150_000_00 },
  ];

  for (const b of budgets) {
    await prisma.budget.upsert({
      where: { userId_accountId_month_year: { userId: user.id, accountId: b.accountId, month: b.month, year: b.year } },
      update: { amountSen: b.amountSen },
      create: { userId: user.id, ...b },
    });
  }
  console.log("✓ Budget targets set for Sep 2026");

  // ── 7. Recurring rules ───────────────────────────────────────────────────
  const rules = [
    {
      description: "Gaji Bulanan",
      templateEntryJson: JSON.stringify({ amount: 12_500_000_00, type: "INCOME", accountCode: "4-101" }),
      frequency: "MONTHLY",
      nextRunDate: new Date("2026-10-05"),
      isActive: true,
    },
    {
      description: "Sewa Kos",
      templateEntryJson: JSON.stringify({ amount: 1_800_000_00, type: "EXPENSE", accountCode: "5-103" }),
      frequency: "MONTHLY",
      nextRunDate: new Date("2026-10-06"),
      isActive: true,
    },
    {
      description: "Netflix + Spotify",
      templateEntryJson: JSON.stringify({ amount: 95_000_00, type: "EXPENSE", accountCode: "5-203" }),
      frequency: "MONTHLY",
      nextRunDate: new Date("2026-10-12"),
      isActive: true,
    },
  ];

  for (const r of rules) {
    const existing = await prisma.recurringRule.findFirst({
      where: { userId: user.id, description: r.description },
    });
    if (!existing) {
      await prisma.recurringRule.create({
        data: { userId: user.id, ...r },
      });
    }
  }
  console.log("✓ Recurring rules created");

  console.log("\n✅ Demo account ready!");
  console.log(`   Email    : ${DEMO_EMAIL}`);
  console.log(`   Password : ${DEMO_PASSWORD}`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
