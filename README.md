# Laby — Personal Financial Statements, Done Properly

Laby is a personal finance app that treats your money like a company's books: proper double-entry bookkeeping, a structured chart of accounts, and three standard financial reports — packaged simply for one person.

> Built with Next.js 15, Prisma, Neon PostgreSQL, and Google Gemini AI.

---

## Features

- **Double-entry bookkeeping** — every transaction creates balanced journal entries automatically; you just pick a category and enter an amount
- **Three financial reports** — Income Statement, Balance Sheet, and Cash Flow Statement with 12-month column view and annual totals
- **AI-powered input** — upload a bank screenshot or type in natural language ("spent 450k on groceries yesterday") and Gemini parses it into a structured entry
- **AI chat assistant** — ask questions about your data ("what did I spend on food this month?") and get answers pulled from your actual records
- **62-account chart of accounts** — structured per Indonesian accounting conventions (Assets 1-xxx, Liabilities 2-xxx, Equity 3-xxx, Revenue 4-xxx, Expenses 5-xxx/6-xxx)
- **Dashboard** — net worth, monthly cash flow, top spending categories, and trend charts
- **Audit log** — every create/update/delete is recorded with timestamp and source (manual / screenshot AI / chat AI); soft deletes only
- **AI confirmation flow** — no AI result is ever auto-committed; every draft requires explicit user confirmation before hitting the database

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Database | PostgreSQL via Neon (serverless) |
| ORM | Prisma 6 |
| Auth | Auth.js v5 (NextAuth) |
| AI | Google Gemini API |
| UI | Tailwind CSS v4, Recharts, Framer Motion |
| Icons | Lucide React |
| Validation | Zod |

---

## Prerequisites

- Node.js 18+
- A [Neon](https://neon.tech) PostgreSQL database
- A [Google AI Studio](https://aistudio.google.com) API key (Gemini)

---

## Getting Started

### 1. Clone and install

```bash
git clone https://github.com/wayphantomme/laby-finance.git
cd laby-finance/app
npm install
```

### 2. Configure environment variables

```bash
cp .env.example .env
```

```env
# Database — Neon PostgreSQL
DATABASE_URL="postgresql://user:password@host/dbname?sslmode=require"
DIRECT_URL="postgresql://user:password@host/dbname?sslmode=require"

# Auth.js — generate with: openssl rand -base64 32
AUTH_SECRET="your-secret-here"
AUTH_TRUST_HOST=true

# Google Gemini API
GEMINI_API_KEY="your-gemini-api-key"
NEXT_PUBLIC_APP_NAME="Laby"
```

### 3. Set up the database

```bash
npm run db:generate   # generate Prisma client
npm run db:push       # push schema to database
npm run db:seed       # seed chart of accounts (62 default accounts)
```

### 4. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run db:generate` | Generate Prisma client |
| `npm run db:push` | Push Prisma schema to database |
| `npm run db:seed` | Seed default chart of accounts |
| `npm run db:studio` | Open Prisma Studio (database GUI) |

---

## Project Structure

```
laby-finance/
├── app/                        # Next.js application
│   ├── app/
│   │   ├── (app)/              # Authenticated routes
│   │   │   ├── dashboard/
│   │   │   ├── transactions/
│   │   │   ├── accounts/
│   │   │   ├── reports/
│   │   │   ├── ai/
│   │   │   └── history/
│   │   ├── api/                # API routes
│   │   │   ├── transactions/
│   │   │   ├── accounts/
│   │   │   ├── reports/
│   │   │   └── ai/
│   │   ├── login/
│   │   └── register/
│   ├── components/
│   │   ├── ai/
│   │   ├── dashboard/
│   │   ├── layout/
│   │   ├── reports/
│   │   ├── transactions/
│   │   └── ui/
│   ├── lib/                    # Utilities (accounting, auth, format, reports)
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── seed.ts
│   └── .env.example
└── docs/                       # Project documentation
```

---

## Design Decisions

**Double-entry in the backend, single-entry in the UI** — users fill a simple form; the system generates the correct journal entry pairs automatically. The balance sheet always balances without the user needing to know debit from credit.

**Amounts stored as integer cents** — `Rp 1,450,000` is stored as `145000000`. This avoids floating-point rounding errors, which is standard for financial systems.

**Reports calculated in real-time** — there are no separate report tables. Every report is aggregated from `journal_lines` on demand, so reports are always consistent with raw data.

**AI never auto-commits** — all AI-parsed results are `DRAFT` status until the user explicitly confirms. Non-negotiable for financial data integrity.

---

## Roadmap

- [x] Phase 1 — Auth, chart of accounts, manual double-entry input, dashboard
- [x] Phase 2 — Income Statement, Balance Sheet, Cash Flow reports
- [x] Phase 3 — AI screenshot parsing, AI chat assistant, audit log
- [ ] Phase 4 — Investment portfolio (stocks, crypto, mutual funds, gold)
- [ ] Phase 5 — i18n (EN/ID), dark mode, mobile PWA, 2FA, PDF/CSV export
- [ ] Phase 6 — Tax module: annual income summary for Indonesian SPT 1770, PPh Final 0.5% tracker

---

## License

MIT
