# Setup Development — Laby

Panduan onboarding untuk menjalankan Laby di lokal. Semua perintah dijalankan dari dalam folder `app/`.

---

## Prasyarat

| Tools | Versi minimum | Catatan |
|---|---|---|
| Node.js | 20.x | Direkomendasikan LTS terbaru |
| npm | 10.x | Sudah bundled dengan Node 20 |
| Git | — | — |
| Akun Neon | — | PostgreSQL serverless, gratis tier cukup untuk dev |
| Google AI Studio | — | Untuk mendapat Gemini API key, gratis |

---

## 1. Clone & Install

```bash
git clone <repo-url> laby
cd laby/app
npm install
```

---

## 2. Konfigurasi Environment

Salin file contoh lalu isi nilainya:

```bash
cp .env.example .env
```

Buka `.env` dan isi semua variabel:

```env
# Database — Neon PostgreSQL
# Dapatkan dari dashboard Neon: Settings > Connection string
# DATABASE_URL pakai "pooled connection", DIRECT_URL pakai "direct connection"
DATABASE_URL="postgresql://user:password@host/dbname?sslmode=require"
DIRECT_URL="postgresql://user:password@host/dbname?sslmode=require"

# Auth.js secret — generate dengan perintah ini:
# openssl rand -base64 32
AUTH_SECRET="your-secret-here"
AUTH_TRUST_HOST=true

# Gemini API — dapatkan dari https://aistudio.google.com
GEMINI_API_KEY="your-gemini-api-key"

NEXT_PUBLIC_APP_NAME="Laby"
```

> `DATABASE_URL` dan `DIRECT_URL` harus diisi dua-duanya karena Neon memerlukan pooled URL untuk runtime dan direct URL untuk Prisma migrations. Kalau pakai PostgreSQL lokal biasa, isi keduanya dengan string yang sama.

---

## 3. Setup Database

Generate Prisma client dari schema, lalu push schema ke database:

```bash
npm run db:generate   # generate Prisma client (wajib setelah clone atau setelah schema berubah)
npm run db:push       # push schema ke database (buat tabel)
```

Seed chart of accounts (bagan akun default sesuai konvensi Indonesia):

```bash
npm run db:seed
```

Output seed yang sukses akan terlihat seperti ini:

```
Seeding chart of accounts...
  [root] 1-000 — Assets
  [root] 2-000 — Liabilities
  ...
  [child] 6-302 — Income Tax (PPh OP)

Done. 62 accounts seeded.
```

> Seed menggunakan `upsert` sehingga aman dijalankan berulang kali — tidak akan membuat duplikat.

---

## 4. Jalankan Dev Server

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000) di browser.

---

## 5. Perintah Lain yang Sering Dipakai

| Perintah | Fungsi |
|---|---|
| `npm run dev` | Dev server dengan hot reload (Next.js) |
| `npm run build` | Build production |
| `npm run start` | Jalankan hasil build production |
| `npm run lint` | Lint dengan ESLint |
| `npm run db:generate` | Generate ulang Prisma client setelah schema berubah |
| `npm run db:push` | Sinkronisasi schema ke database (non-destructive) |
| `npm run db:seed` | Seed chart of accounts |
| `npm run db:studio` | Buka Prisma Studio (GUI database di browser) |

---

## 6. Struktur Folder

```
app/
├── app/                    # Next.js App Router
│   ├── (app)/              # Route group — layout dengan sidebar
│   │   ├── dashboard/
│   │   ├── transactions/
│   │   ├── accounts/
│   │   ├── history/
│   │   └── reports/
│   ├── api/                # API routes
│   │   ├── auth/           # NextAuth handler
│   │   ├── transactions/   # CRUD journal entries
│   │   ├── accounts/       # Chart of accounts
│   │   └── dashboard/      # Aggregasi data dashboard
│   ├── login/
│   └── register/
├── components/             # Komponen React
│   ├── dashboard/          # StatCard, CashflowChart
│   ├── layout/             # Sidebar, Topbar
│   ├── transactions/       # TransactionForm, TransactionList
│   └── ui/                 # Primitif UI: Button, Input, Card, dll
├── lib/                    # Utilitas server-side
│   ├── accounting.ts       # Double-entry logic (buildJournalLines, isBalanced)
│   ├── auth.ts             # NextAuth config (JWT + Credentials)
│   ├── format.ts           # Format IDR, sen conversion
│   ├── prisma.ts           # Prisma client singleton
│   └── utils.ts            # Helpers umum (cn, dll)
├── prisma/
│   ├── schema.prisma       # Schema database
│   └── seed.ts             # Seed chart of accounts
└── middleware.ts           # Auth middleware (proteksi route)
```

---

## 7. Membuat Akun Pertama

Tidak ada akun default setelah seed. Buka [http://localhost:3000/register](http://localhost:3000/register) untuk mendaftar, lalu login di `/login`.

---

## 8. Catatan Penting

**Amounts disimpan sebagai integer (sen).** Semua nilai uang di database dalam satuan sen IDR (1 IDR = 100 sen) untuk menghindari floating-point precision issue. Konversi dilakukan via `idrToSen()` dan `senToIdr()` di `lib/format.ts`.

**Double-entry otomatis.** User tidak perlu input debit/kredit manual. Form transaksi menerima `amountIdr`, `accountId` (akun target), `cashAccountId` (akun kas/bank), dan `transactionType` (`INCOME` / `EXPENSE` / `TRANSFER`). Logic `buildJournalLines()` di `lib/accounting.ts` yang membuat pasangan jurnalnya.

**Schema berubah?** Selalu jalankan `npm run db:generate` setelah mengubah `schema.prisma`, lalu `npm run db:push` untuk sinkronisasi ke database.

**Prisma Studio** (`npm run db:studio`) sangat berguna untuk inspeksi data saat development, buka di [http://localhost:5555](http://localhost:5555).
