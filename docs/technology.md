# Technology — Arsitektur & Stack Laby

Dokumentasi teknis lengkap: tech stack, arsitektur sistem, skema database, API routes, alur AI, keamanan, dan CI/CD.

---

## 1. Tech Stack

| Layer | Pilihan | Versi / Catatan |
|---|---|---|
| Framework | Next.js (App Router) | SSR + API routes dalam satu proyek |
| Language | TypeScript | Strict mode, full type-safety |
| Styling | Tailwind CSS | Design token warna merah + netral |
| Animasi | Framer Motion | Transisi grafik, angka, halaman |
| Icon | Lucide React | Konsisten, tidak ada emoji |
| Database | PostgreSQL via Neon | Serverless Postgres, free tier cukup untuk dev |
| ORM | Prisma | Migration + type-safety, schema-first |
| Auth | Auth.js (NextAuth) | JWT di cookie httpOnly, Credentials provider |
| AI | Google Gemini API | Gemini 2.0 Flash via `@google/generative-ai` |
| Charting | Recharts | Grafik tren net worth, income vs expense |
| Hosting | Vercel | Deploy otomatis dari GitHub |
| CI/CD | GitHub Actions | Lint, type-check, migrate check, deploy |
| i18n | next-intl (Fase 5) | EN default, ID sebagai opsi |

### Dependency Penting

```json
{
  "dependencies": {
    "next": "^15.x",
    "react": "^19.x",
    "@prisma/client": "^6.x",
    "@auth/prisma-adapter": "^2.x",
    "next-auth": "^5.x",
    "@google/generative-ai": "^0.x",
    "recharts": "^2.x",
    "framer-motion": "^12.x",
    "lucide-react": "^0.x",
    "tailwindcss": "^4.x",
    "zod": "^3.x"
  },
  "devDependencies": {
    "prisma": "^6.x",
    "typescript": "^5.x",
    "@types/node": "^22.x",
    "eslint": "^9.x"
  }
}
```

---

## 2. Struktur Folder

```
app/                           # Root workspace
├── app/                       # Next.js App Router
│   ├── (app)/                 # Route group — layout dengan sidebar
│   │   ├── layout.tsx         # Layout dengan AppShell (sidebar + topbar)
│   │   ├── dashboard/         # Halaman dashboard
│   │   │   ├── page.tsx
│   │   │   └── dashboard-client.tsx
│   │   ├── transactions/      # Daftar dan input transaksi
│   │   │   └── page.tsx
│   │   ├── accounts/          # Chart of accounts
│   │   │   └── page.tsx
│   │   ├── history/           # Audit log / activity history
│   │   │   └── page.tsx
│   │   ├── reports/           # Laporan keuangan
│   │   │   ├── page.tsx
│   │   │   └── reports-client.tsx
│   │   └── ai/                # AI assistant & input
│   │       └── page.tsx
│   ├── api/                   # API routes (server-side)
│   │   ├── auth/[...nextauth]/ # NextAuth handler
│   │   ├── transactions/       # CRUD journal entries
│   │   │   ├── route.ts        # GET (list), POST (create)
│   │   │   └── [id]/route.ts   # GET, PATCH, DELETE per id
│   │   ├── accounts/           # Chart of accounts
│   │   │   └── route.ts
│   │   ├── dashboard/          # Aggregasi data dashboard
│   │   │   └── route.ts
│   │   ├── reports/
│   │   │   ├── income-statement/route.ts
│   │   │   ├── balance-sheet/route.ts
│   │   │   ├── cash-flow/route.ts
│   │   │   └── net-worth-history/route.ts
│   │   ├── ai/
│   │   │   ├── chat/route.ts    # Chat parsing + query
│   │   │   └── extract/route.ts # Screenshot extraction
│   │   └── register/route.ts   # User registration
│   ├── login/page.tsx
│   ├── register/page.tsx
│   ├── layout.tsx              # Root layout (font, metadata)
│   └── globals.css
├── components/
│   ├── ai/
│   │   ├── chat-window.tsx
│   │   ├── screenshot-upload.tsx
│   │   └── unified-chat.tsx
│   ├── dashboard/
│   │   ├── stat-card.tsx
│   │   └── cashflow-chart.tsx
│   ├── layout/
│   │   ├── app-shell.tsx
│   │   ├── sidebar.tsx
│   │   └── topbar.tsx
│   ├── reports/
│   │   ├── income-statement.tsx
│   │   ├── balance-sheet.tsx
│   │   ├── cash-flow-statement.tsx
│   │   ├── net-worth-chart.tsx
│   │   └── report-table.tsx
│   ├── transactions/
│   │   ├── transaction-form.tsx
│   │   └── transaction-list.tsx
│   └── ui/                     # Primitif UI
│       ├── button.tsx
│       ├── input.tsx
│       ├── card.tsx
│       ├── modal.tsx
│       └── badge.tsx
├── lib/                        # Utilitas server-side
│   ├── accounting.ts           # Double-entry logic
│   ├── auth.ts                 # NextAuth config
│   ├── format.ts               # Format IDR, sen conversion
│   ├── prisma.ts               # Prisma client singleton
│   └── utils.ts                # Helpers umum (cn, dll)
├── prisma/
│   ├── schema.prisma           # Schema database
│   └── seed.ts                 # Seed 62 chart of accounts
├── middleware.ts               # Auth middleware (proteksi route)
├── next.config.ts
├── tailwind.config.ts
└── tsconfig.json
```

---

## 3. Skema Database

Semua tabel menyimpan `userId` untuk mendukung multi-user di masa depan meski saat ini single-user.

### 3.1 Diagram Relasi

```
users
  └── journal_entries (1:N)
        └── journal_lines (1:N)
              └── accounts (N:1)
        └── attachments (1:N)
  └── accounts (1:N)  ← chart of accounts per user
  └── audit_log (1:N)
  └── recurring_rules (1:N)
  └── chat_sessions (1:N)
        └── chat_messages (1:N)
  └── portfolio_holdings (1:N)
        └── accounts (N:1)
```

### 3.2 Tabel Detail

**users**
```sql
id            String    @id @default(cuid())
email         String    @unique
passwordHash  String
name          String?
locale        String    @default("id")
createdAt     DateTime  @default(now())
updatedAt     DateTime  @updatedAt
```

**accounts** (Chart of Accounts)
```sql
id          String    @id @default(cuid())
userId      String
code        String    -- "1-102", "5-101.1"
nameEn      String
nameId      String
type        AccountType  -- ASSET | LIABILITY | EQUITY | INCOME | EXPENSE
parentId    String?   -- self-referential untuk hierarki
isActive    Boolean   @default(true)
createdAt   DateTime  @default(now())

@@unique([userId, code])
```

**journal_entries**
```sql
id          String    @id @default(cuid())
userId      String
entryDate   DateTime
description String?
source      EntrySource  -- MANUAL | SCREENSHOT_AI | CHAT_AI
status      EntryStatus  -- DRAFT | CONFIRMED
createdAt   DateTime  @default(now())
updatedAt   DateTime  @updatedAt
```

**journal_lines** (inti double-entry)
```sql
id              String    @id @default(cuid())
journalEntryId  String
accountId       String
debit           Int       @default(0)  -- dalam sen IDR
credit          Int       @default(0)  -- dalam sen IDR
note            String?
```

> Invariant: untuk setiap `journal_entry`, `SUM(debit) = SUM(credit)` harus selalu terpenuhi. Divalidasi di `lib/accounting.ts` sebelum insert.

**portfolio_holdings**
```sql
id            String    @id @default(cuid())
userId        String
accountId     String
assetName     String
ticker        String?
quantity      Decimal
avgBuyPrice   Int       -- sen IDR
currentPrice  Int       -- sen IDR
currency      String    @default("IDR")
lastUpdated   DateTime
```

**attachments**
```sql
id              String    @id @default(cuid())
journalEntryId  String
fileUrl         String
fileType        String    -- "screenshot" | "receipt"
uploadedAt      DateTime  @default(now())
```

**audit_log**
```sql
id          String    @id @default(cuid())
userId      String
entityType  String    -- "journal_entry" | "account" | ...
entityId    String
action      AuditAction  -- CREATE | UPDATE | DELETE
beforeValue Json?
afterValue  Json?
source      EntrySource
createdAt   DateTime  @default(now())
```

**recurring_rules**
```sql
id                  String    @id @default(cuid())
userId              String
templateEntryData   Json      -- snapshot template journal entry
frequency           String    -- "monthly" | "weekly" | "yearly"
nextRunDate         DateTime
isActive            Boolean   @default(true)
createdAt           DateTime  @default(now())
```

**chat_sessions**
```sql
id          String    @id @default(cuid())
userId      String
title       String?
createdAt   DateTime  @default(now())
deletedAt   DateTime? -- soft delete
```

**chat_messages**
```sql
id          String    @id @default(cuid())
sessionId   String
role        String    -- "user" | "model"
content     String
createdAt   DateTime  @default(now())
```

### 3.3 Keputusan Penyimpanan Angka

**Semua nilai uang disimpan sebagai integer dalam satuan sen (1 IDR = 100 sen).**

```typescript
// lib/format.ts
export const idrToSen = (idr: number): number => Math.round(idr * 100)
export const senToIdr = (sen: number): number => sen / 100

// Contoh: Rp1.450.000 disimpan sebagai 145000000
```

Alasan: floating-point tidak aman untuk operasi keuangan (0.1 + 0.2 !== 0.3 di IEEE 754). Integer aritmatika di PostgreSQL dan JavaScript selalu exact untuk nilai yang kita butuhkan.

---

## 4. Arsitektur Aplikasi

### 4.1 Request Flow

```
Browser (Client Component)
    │
    │  fetch() / SWR / server action
    ▼
Next.js API Route (route.ts)
    │
    ├── middleware.ts (auth check via NextAuth session)
    │
    ├── Prisma ORM → Neon PostgreSQL
    │
    └── Gemini API (hanya untuk /api/ai/*)
    │
    ▼
JSON Response → Client re-render
```

### 4.2 Auth Flow

```
1. User POST /api/auth/callback/credentials (email + password)
2. NextAuth CredentialsProvider:
   a. Query user dari DB by email
   b. bcrypt.compare(inputPassword, passwordHash)
   c. Kalau cocok → issue JWT
3. JWT disimpan di cookie httpOnly (tidak bisa diakses JS)
4. middleware.ts intercept semua request ke /(app)/*:
   a. getToken() dari cookie
   b. Kalau tidak ada/expired → redirect ke /login
5. API routes: auth(req) dari NextAuth untuk verifikasi session
```

### 4.3 Double-Entry Logic (`lib/accounting.ts`)

Inti sistem — mengubah input sederhana dari form menjadi journal lines yang valid.

```typescript
// Input dari form
type TransactionInput = {
  amountIdr: number
  accountId: string        // akun target (pengeluaran/pendapatan/investasi)
  cashAccountId: string    // akun kas/bank/e-wallet
  transactionType: 'INCOME' | 'EXPENSE' | 'TRANSFER'
}

// Output: pasangan journal lines
function buildJournalLines(input: TransactionInput): JournalLineInput[] {
  const sen = idrToSen(input.amountIdr)

  if (input.transactionType === 'EXPENSE') {
    return [
      { accountId: input.accountId,     debit: sen,  credit: 0 },  // Beban naik (debit)
      { accountId: input.cashAccountId, debit: 0,    credit: sen }, // Kas turun (kredit)
    ]
  }

  if (input.transactionType === 'INCOME') {
    return [
      { accountId: input.cashAccountId, debit: sen,  credit: 0 },  // Kas naik (debit)
      { accountId: input.accountId,     debit: 0,    credit: sen }, // Pendapatan naik (kredit)
    ]
  }

  if (input.transactionType === 'TRANSFER') {
    return [
      { accountId: input.accountId,     debit: sen,  credit: 0 },  // Akun tujuan naik (debit)
      { accountId: input.cashAccountId, debit: 0,    credit: sen }, // Akun sumber turun (kredit)
    ]
  }
}

// Validasi sebelum insert
function isBalanced(lines: JournalLineInput[]): boolean {
  const totalDebit  = lines.reduce((sum, l) => sum + l.debit, 0)
  const totalCredit = lines.reduce((sum, l) => sum + l.credit, 0)
  return totalDebit === totalCredit
}
```

### 4.4 Kalkulasi Laporan Keuangan

Laporan tidak disimpan sebagai tabel tersendiri. Selalu dihitung real-time dari agregasi `journal_lines`.

**Contoh: Income Statement (Laporan Laba Rugi)**
```sql
-- Pendapatan bulan tertentu
SELECT
  a.code,
  a.name_id,
  SUM(jl.credit - jl.debit) AS amount
FROM journal_lines jl
JOIN accounts a ON jl.account_id = a.id
JOIN journal_entries je ON jl.journal_entry_id = je.id
WHERE
  a.type = 'INCOME'
  AND je.user_id = :userId
  AND je.status = 'CONFIRMED'
  AND DATE_TRUNC('month', je.entry_date) = :targetMonth
GROUP BY a.code, a.name_id
ORDER BY a.code;
```

**Contoh: Balance Sheet (Neraca)**
```sql
-- Saldo akun per tanggal tertentu
SELECT
  a.code,
  a.name_id,
  a.type,
  SUM(jl.debit - jl.credit) AS balance  -- untuk aset (saldo normal debit)
FROM journal_lines jl
JOIN accounts a ON jl.account_id = a.id
JOIN journal_entries je ON jl.journal_entry_id = je.id
WHERE
  je.user_id = :userId
  AND je.status = 'CONFIRMED'
  AND je.entry_date <= :asOfDate
GROUP BY a.code, a.name_id, a.type
HAVING SUM(jl.debit - jl.credit) != 0
ORDER BY a.code;
```

---

## 5. API Reference

Base URL: `/api`

Semua endpoint memerlukan session yang valid (cookie JWT dari NextAuth). Response format: JSON.

### 5.1 Transactions

| Method | Path | Fungsi |
|---|---|---|
| GET | `/api/transactions` | Ambil daftar transaksi (dengan filter) |
| POST | `/api/transactions` | Buat journal entry baru |
| GET | `/api/transactions/:id` | Detail satu transaksi |
| PATCH | `/api/transactions/:id` | Update transaksi |
| DELETE | `/api/transactions/:id` | Hapus transaksi (soft delete via status) |

**GET /api/transactions — Query params:**
```
?page=1&limit=20
&startDate=2026-01-01&endDate=2026-01-31
&accountId=xxx
&source=MANUAL|SCREENSHOT_AI|CHAT_AI
&status=DRAFT|CONFIRMED
```

**POST /api/transactions — Request body:**
```json
{
  "entryDate": "2026-09-07",
  "description": "Makan siang",
  "transactionType": "EXPENSE",
  "amountIdr": 75000,
  "accountId": "acc_5101_id",
  "cashAccountId": "acc_1103_gopay_id",
  "source": "MANUAL"
}
```

**Response (201):**
```json
{
  "id": "cuid_xxx",
  "entryDate": "2026-09-07T00:00:00.000Z",
  "description": "Makan siang",
  "status": "CONFIRMED",
  "source": "MANUAL",
  "journalLines": [
    { "accountCode": "5-101", "debit": 7500000, "credit": 0 },
    { "accountCode": "1-103", "debit": 0, "credit": 7500000 }
  ]
}
```

> Catatan: `debit`/`credit` dalam response dalam satuan **sen**.

### 5.2 Accounts

| Method | Path | Fungsi |
|---|---|---|
| GET | `/api/accounts` | Ambil semua akun user (termasuk hierarki) |
| POST | `/api/accounts` | Buat akun baru |
| PATCH | `/api/accounts/:id` | Update akun |

**GET /api/accounts — Query params:**
```
?type=ASSET|LIABILITY|EQUITY|INCOME|EXPENSE
&activeOnly=true
&flat=false  (false = return tree structure)
```

### 5.3 Dashboard

| Method | Path | Fungsi |
|---|---|---|
| GET | `/api/dashboard` | Ringkasan: net worth, cash flow bulan ini, top categories |

**GET /api/dashboard — Query params:**
```
?month=2026-09  (default: bulan berjalan)
```

**Response:**
```json
{
  "netWorth": 6945000000,
  "cashFlowThisMonth": {
    "income": 2397000000,
    "expense": 1062500000,
    "net": 1334500000
  },
  "topExpenseCategories": [
    { "accountCode": "5-103", "name": "Housing/Rent", "amount": 350000000 },
    { "accountCode": "5-101", "name": "Food & Beverages", "amount": 320000000 }
  ]
}
```

### 5.4 Reports

| Method | Path | Fungsi |
|---|---|---|
| GET | `/api/reports/income-statement` | Laporan laba rugi |
| GET | `/api/reports/balance-sheet` | Neraca |
| GET | `/api/reports/cash-flow` | Laporan arus kas |
| GET | `/api/reports/net-worth-history` | Histori net worth bulanan |

**Query params untuk semua reports:**
```
?year=2026       (default: tahun berjalan)
?month=2026-09   (opsional, untuk satu bulan saja)
```

### 5.5 AI

| Method | Path | Fungsi |
|---|---|---|
| POST | `/api/ai/extract` | Ekstraksi transaksi dari screenshot |
| POST | `/api/ai/chat` | Chat parsing + query data keuangan |

**POST /api/ai/extract — Request:**
```json
{
  "imageBase64": "data:image/jpeg;base64,...",
  "mimeType": "image/jpeg"
}
```

**POST /api/ai/chat — Request:**
```json
{
  "message": "kemarin bayar makan siang 75rb",
  "sessionId": "session_cuid_xxx",
  "chatHistory": [
    { "role": "user", "parts": ["..."] },
    { "role": "model", "parts": ["..."] }
  ]
}
```

Detail schema input/output AI lihat [AI Prompt Engineering](./ai-prompt-engineering.md).

### 5.6 Auth

| Method | Path | Fungsi |
|---|---|---|
| POST | `/api/register` | Daftar akun baru |
| POST | `/api/auth/callback/credentials` | Login (ditangani NextAuth) |
| GET | `/api/auth/session` | Info session aktif |
| POST | `/api/auth/signout` | Logout |

---

## 6. Alur AI (End-to-End)

### 6.1 Screenshot Extraction

```
1. User upload gambar di UI (screenshot-upload.tsx)
2. Browser encode ke base64, POST ke /api/ai/extract
3. API route:
   a. Validasi ukuran gambar (max 4MB)
   b. Kirim ke Gemini dengan system prompt + gambar
   c. Parse JSON response dari Gemini
   d. Validasi dengan Zod schema
   e. Return array transaksi sebagai DRAFT
4. UI tampilkan tabel konfirmasi:
   - Setiap baris = satu transaksi
   - Field dengan confidence < 0.7 diberi highlight kuning
   - Field null perlu diisi manual
5. User edit/hapus baris yang salah, lalu klik Konfirmasi
6. POST ke /api/transactions untuk setiap baris yang dikonfirmasi
7. Audit log mencatat source = SCREENSHOT_AI
```

### 6.2 Chat Parsing

```
1. User ketik pesan di chat UI
2. POST ke /api/ai/chat dengan message + histori sesi
3. API route:
   a. Kirim ke Gemini dengan system prompt (termasuk tanggal hari ini)
   b. Parse JSON, cek intent:
      - TRANSACTION → tampilkan preview konfirmasi
      - QUERY → jalankan query DB, kirim hasil ke Gemini untuk jawaban natural
      - CLARIFY → tampilkan pertanyaan balik ke user
4. Kalau TRANSACTION: user konfirmasi, POST ke /api/transactions
5. Kalau QUERY: jawaban langsung tampil di chat
```

### 6.3 Rate Limit Handling

```typescript
// Retry dengan exponential backoff
async function callGeminiWithRetry(fn: () => Promise<any>, maxRetries = 3) {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn()
    } catch (err: any) {
      if (err.status === 429 && attempt < maxRetries - 1) {
        const delay = Math.pow(2, attempt) * 1000  // 1s, 2s, 4s
        await new Promise(resolve => setTimeout(resolve, delay))
        continue
      }
      throw err
    }
  }
}
```

Free tier Gemini 2.0 Flash: ~10 RPM, 500 RPD. Detail di [Gemini API Cheatsheet](./gemini-api-free-tier-cheatsheet.md).

---

## 7. Keamanan

### 7.1 Autentikasi & Sesi
- Password di-hash dengan **bcrypt** (cost factor 12) sebelum disimpan
- JWT disimpan di cookie **httpOnly + Secure + SameSite=Lax** — tidak bisa diakses JavaScript
- `middleware.ts` memproteksi semua route `/(app)/*` — redirect ke `/login` kalau session tidak valid
- Session expired setelah X jam (dikonfigurasi di NextAuth)

### 7.2 API Security
- Semua API routes validasi session via `auth(req)` sebelum query apapun
- `userId` selalu diambil dari session (server-side), tidak pernah dari request body
- Input divalidasi dengan **Zod** sebelum diproses — tidak ada raw `JSON.parse` tanpa schema
- Parameterized queries via Prisma — tidak ada raw SQL concatenation (SQL injection safe)

### 7.3 AI Security
- `GEMINI_API_KEY` hanya ada di server-side (environment variable), tidak pernah di client bundle
- Hanya data yang relevan dikirim ke Gemini — tidak ada password hash, token, atau data sensitif lain
- Ukuran gambar dibatasi 4MB di backend sebelum dikirim ke Gemini API
- Semua output AI divalidasi Zod sebelum menyentuh database

### 7.4 Data Finansial
- Semua koneksi database via SSL (Neon enforce ini by default)
- Tidak ada field finansial yang dilog ke console/log sistem
- Soft delete untuk transaksi — data tidak pernah benar-benar hilang dari database

---

## 8. CI/CD Pipeline

### 8.1 GitHub Actions

```yaml
# .github/workflows/ci.yml (ringkasan)
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:

jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20' }
      - run: npm ci
      - run: npm run lint           # ESLint
      - run: npx tsc --noEmit       # TypeScript type-check
      - run: npx prisma validate    # Validasi schema Prisma
```

### 8.2 Deployment ke Vercel
- Push ke `main` → otomatis deploy ke **production**
- Push ke branch lain / PR → otomatis buat **preview deployment** dengan URL unik
- Environment variables di-set di Vercel dashboard (bukan di repo)
- Vercel otomatis jalankan `npm run build` sebelum deploy

### 8.3 Database Migration
- Development: `npm run db:push` (sync schema langsung, non-destructive)
- Production: `npx prisma migrate deploy` (jalankan migration files yang tersimpan di `prisma/migrations/`)
- Seed hanya dijalankan manual, tidak otomatis di CI

---

## 9. Environment Variables

| Variable | Dipakai oleh | Keterangan |
|---|---|---|
| `DATABASE_URL` | Prisma (runtime) | Pooled connection URL dari Neon |
| `DIRECT_URL` | Prisma (migrations) | Direct connection URL dari Neon |
| `AUTH_SECRET` | NextAuth | Secret untuk sign JWT, generate: `openssl rand -base64 32` |
| `AUTH_TRUST_HOST` | NextAuth | `true` untuk deployment non-canonical host |
| `GEMINI_API_KEY` | `/api/ai/*` | API key dari Google AI Studio — server-side only |
| `NEXT_PUBLIC_APP_NAME` | Client | Nama aplikasi yang tampil di UI |

> Tidak ada environment variable yang dimulai `NEXT_PUBLIC_` yang menyimpan secret — semua yang public hanya data non-sensitif.

---

## 10. Perintah Development

| Perintah | Fungsi |
|---|---|
| `npm run dev` | Dev server dengan hot reload |
| `npm run build` | Build production |
| `npm run start` | Jalankan hasil build |
| `npm run lint` | ESLint |
| `npm run db:generate` | Generate ulang Prisma client setelah schema berubah |
| `npm run db:push` | Sync schema ke database (non-destructive, dev only) |
| `npm run db:seed` | Seed 62 chart of accounts bawaan |
| `npm run db:studio` | Prisma Studio GUI di localhost:5555 |

---

## 11. Keputusan Arsitektur & Trade-off

### Mengapa Next.js App Router bukan Pages Router?
App Router mendukung React Server Components secara native — data fetching untuk laporan keuangan bisa dilakukan langsung di server tanpa client-side loading state, lebih cepat dan lebih aman.

### Mengapa Prisma bukan query builder (Drizzle/Knex)?
Type-safety penuh dari schema ke query ke response, migrations terkelola, dan Prisma Studio sangat membantu untuk inspeksi data saat development. Trade-off: query kompleks kadang perlu raw SQL via `prisma.$queryRaw`.

### Mengapa laporan dihitung real-time, bukan disimpan?
Menyimpan laporan terpisah berisiko inkonsistensi (data berubah tapi laporan tidak di-sync). Real-time query dari `journal_lines` selalu konsisten. Trade-off: untuk dataset besar perlu index yang tepat di PostgreSQL. Untuk skala personal finance (ribuan baris, bukan jutaan), ini tidak masalah.

### Mengapa amounts sebagai integer (sen)?
Floating-point precision issue adalah bug klasik di sistem keuangan. `0.1 + 0.2 = 0.30000000000000004` di JavaScript. Integer aritmatika selalu exact. Trade-off: perlu konversi tampil-dan-simpan, tapi ini sepadan.

### Mengapa single-user UI tapi multi-user DB schema?
Menambahkan multi-user ke DB schema di akhir jauh lebih mahal (rewrite besar, migrasi data) dibanding menyiapkannya dari awal. Biaya awal: sangat rendah (tambah `userId` kolom). Manfaat masa depan: fitur pasangan/keluarga bisa ditambah tanpa rewrite.

---

## Referensi Terkait
- [Setup Development](./setup-dev.md) — cara setup environment lokal
- [AI Prompt Engineering](./ai-prompt-engineering.md) — detail sistem prompt dan schema Gemini
- [Gemini API Cheatsheet](./gemini-api-free-tier-cheatsheet.md) — model, rate limit, API key
- [Product Overview](./product-overview.md) — keputusan desain dari perspektif produk
