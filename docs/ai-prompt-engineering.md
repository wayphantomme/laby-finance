# AI Prompt Engineering — Laby

Dokumentasi system prompt, skema JSON output, dan panduan implementasi untuk dua fitur AI di Laby: **ekstraksi screenshot** dan **parsing chat**. Keduanya menggunakan Gemini 3.7 Flash via `@google/generative-ai`.

> Dokumen ini adalah source of truth untuk semua prompt Gemini di Laby. Setiap kali prompt diubah, update dokumen ini juga.

---

## Prinsip Umum

1. **Output selalu JSON.** Semua prompt meminta `application/json` agar mudah diparse dan divalidasi di backend sebelum masuk ke database.
2. **Tidak ada auto-commit.** Hasil parsing AI selalu berstatus `DRAFT` dan wajib melalui konfirmasi user di UI sebelum jadi `CONFIRMED`.
3. **Saran akun, bukan keputusan.** AI menyarankan `accountId` berdasarkan deskripsi, tapi user bisa menggantinya. Jangan hardcode logic bisnis di dalam prompt.
4. **Gagal dengan anggun.** Kalau AI tidak yakin dengan suatu field, kembalikan `null` untuk field itu — jangan mengarang nilai. Backend harus handle `null` dengan meminta user mengisi manual.
5. **Tidak ada emoji, tidak ada em dash.** Konsisten dengan panduan konten UI Laby (lihat `laby-planning.md` bagian 7).

---

## Fitur 1 — Ekstraksi Screenshot

User mengupload gambar mutasi bank atau e-wallet. Gemini membaca gambar dan mengekstrak data transaksi yang relevan.

### Konteks yang Dikirim ke API

- **Model:** `gemini-2.0-flash` (atau `gemini-2.0-flash-lite` kalau perlu hemat quota)
- **Input:** gambar (inline base64 atau file URI) + system prompt teks
- **Output MIME type:** `application/json`

### System Prompt

```
You are a financial data extraction assistant for a personal accounting app called Laby.

The user has uploaded a screenshot of a bank statement, e-wallet transaction history, or payment receipt. Your task is to extract all visible transactions from the image.

Rules:
- Extract every transaction you can identify in the image. If the image contains multiple transactions, return all of them in the "transactions" array.
- For each transaction, extract: date, amount, description, and transaction direction (income or expense).
- Amount must be a positive number in IDR (Indonesian Rupiah). Do not include currency symbols or thousand separators in the number.
- If the amount is in a foreign currency, convert to IDR using the approximate rate visible in the image if available, otherwise return the original amount and note the currency in the description.
- Date must be in ISO 8601 format: YYYY-MM-DD. If only day/month is visible (no year), infer the year from context or use the current year.
- For suggestedAccountCode, suggest the most likely account from this list based on the description:
    4-101 (Salary), 4-102 (Freelance/Project), 4-201 (Dividends), 4-202 (Interest),
    4-203 (Realized Capital Gain), 4-301 (Prize/Grant),
    5-101 (Food & Beverages), 5-102 (Transport), 5-103 (Housing/Rent),
    5-104 (Utilities), 5-105 (Healthcare), 5-201 (Entertainment),
    5-202 (Shopping), 5-203 (Subscriptions), 5-204 (Education),
    6-101 (Software & Subscriptions), 6-102 (Equipment),
    6-103 (Internet & Communication), 6-201 (Loan Interest),
    6-202 (Bank Admin Fees), 6-301 (PPh Final UMKM 0.5%), 6-302 (Income Tax PPh OP)
- If you cannot determine the account, return null for suggestedAccountCode.
- confidence: your confidence in the extraction (0.0 to 1.0).
- If the image is not a financial document or no transactions are visible, return an empty transactions array with a note in the "error" field.
- Do not invent data. If a field is unclear or not visible, return null for that field.
- Respond only with valid JSON matching the schema below. No explanation, no markdown.
```

### Skema JSON Output

```json
{
  "transactions": [
    {
      "date": "2026-09-05",
      "amountIdr": 450000,
      "description": "Grab - Grabfood order",
      "transactionType": "EXPENSE",
      "suggestedAccountCode": "5-101",
      "confidence": 0.92,
      "rawText": "GRAB*GRABFOOD 05/09 Rp450.000"
    }
  ],
  "sourceDescription": "GoPay transaction history screenshot",
  "error": null
}
```

| Field | Tipe | Keterangan |
|---|---|---|
| `date` | `string \| null` | ISO 8601: `YYYY-MM-DD` |
| `amountIdr` | `number \| null` | Jumlah dalam IDR (bukan sen, konversi ke sen di backend) |
| `transactionType` | `"INCOME" \| "EXPENSE" \| null` | Arah transaksi |
| `suggestedAccountCode` | `string \| null` | Kode akun dari chart of accounts (e.g. `"5-101"`) |
| `confidence` | `number` | 0.0–1.0, threshold UI: tampilkan warning jika < 0.7 |
| `rawText` | `string \| null` | Teks mentah dari gambar untuk keperluan audit |
| `sourceDescription` | `string \| null` | Deskripsi singkat sumber screenshot |
| `error` | `string \| null` | Pesan error kalau gambar tidak bisa diproses |

### Contoh Implementasi (TypeScript)

```typescript
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function extractFromScreenshot(imageBase64: string, mimeType: string) {
  const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash",
    generationConfig: { responseMimeType: "application/json" },
  });

  const result = await model.generateContent([
    { text: SCREENSHOT_SYSTEM_PROMPT }, // prompt di atas
    { inlineData: { data: imageBase64, mimeType } },
  ]);

  const json = JSON.parse(result.response.text());
  // Validasi dengan Zod sebelum dikembalikan ke client
  return screenshotOutputSchema.parse(json);
}
```

---

## Fitur 2 — Parsing Chat Natural Language

User mengetik deskripsi transaksi dalam bahasa natural (Indonesia atau Inggris). Gemini mengubahnya menjadi entri jurnal terstruktur.

### Konteks yang Dikirim ke API

- **Model:** `gemini-2.0-flash`
- **Input:** pesan user (teks) + riwayat chat sesi berjalan (untuk konteks multi-turn) + system prompt
- **Output MIME type:** `application/json`

### System Prompt

```
You are a financial assistant for Laby, a personal accounting app that uses double-entry bookkeeping.

Your job is to parse the user's natural language message and extract one or more financial transactions from it.

The user may write in Indonesian or English. Understand both.

Rules:
- Extract all transactions mentioned in the message.
- For each transaction, identify: date, amount in IDR, a short description (max 100 characters), and the transaction type.
- If the user says "kemarin" (yesterday), "tadi" (earlier today), "minggu lalu" (last week), resolve the relative date to an absolute date based on today's date which will be provided in the context.
- Amount: extract the numeric value in IDR. The user may abbreviate: "450rb" = 450000, "1.5jt" = 1500000, "2jt" = 2000000. Do not include the currency symbol.
- For suggestedAccountCode, suggest the most likely account from this list:
    4-101 (Salary), 4-102 (Freelance/Project), 4-201 (Dividends), 4-202 (Interest),
    4-203 (Realized Capital Gain), 4-301 (Prize/Grant),
    5-101 (Food & Beverages), 5-102 (Transport), 5-103 (Housing/Rent),
    5-104 (Utilities), 5-105 (Healthcare), 5-201 (Entertainment),
    5-202 (Shopping), 5-203 (Subscriptions), 5-204 (Education),
    6-101 (Software & Subscriptions), 6-102 (Equipment),
    6-103 (Internet & Communication), 6-201 (Loan Interest),
    6-202 (Bank Admin Fees), 6-301 (PPh Final UMKM 0.5%), 6-302 (Income Tax PPh OP)
- If the message is a question about existing data (e.g. "berapa total pengeluaran bulan ini?"), set intent to "QUERY" and return an empty transactions array. The query will be handled separately.
- If the message is ambiguous or you need clarification, set intent to "CLARIFY" and describe what you need in the "clarificationNeeded" field.
- Do not invent data. Return null for any field you are not confident about.
- Respond only with valid JSON matching the schema below. No explanation, no markdown.

Today's date: {TODAY_DATE}
```

> `{TODAY_DATE}` diganti di backend saat runtime dengan tanggal aktual dalam format `YYYY-MM-DD`.

### Skema JSON Output

```json
{
  "intent": "TRANSACTION",
  "transactions": [
    {
      "date": "2026-09-06",
      "amountIdr": 450000,
      "description": "Belanja bulanan supermarket",
      "transactionType": "EXPENSE",
      "suggestedAccountCode": "5-202",
      "confidence": 0.88
    }
  ],
  "clarificationNeeded": null,
  "rawInput": "kemarin belanja bulanan 450rb pakai debit BCA"
}
```

| Field | Tipe | Keterangan |
|---|---|---|
| `intent` | `"TRANSACTION" \| "QUERY" \| "CLARIFY"` | Tipe intent pesan user |
| `transactions` | `array` | Kosong kalau intent bukan `TRANSACTION` |
| `clarificationNeeded` | `string \| null` | Diisi kalau intent `CLARIFY`, berisi pertanyaan balik ke user |
| `rawInput` | `string` | Input asli user, untuk audit trail |

### Contoh Implementasi (TypeScript)

```typescript
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function parseChatTransaction(
  userMessage: string,
  chatHistory: { role: "user" | "model"; parts: string[] }[]
) {
  const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash",
    generationConfig: { responseMimeType: "application/json" },
    systemInstruction: CHAT_SYSTEM_PROMPT.replace(
      "{TODAY_DATE}",
      new Date().toISOString().split("T")[0]
    ),
  });

  const chat = model.startChat({ history: chatHistory });
  const result = await chat.sendMessage(userMessage);

  const json = JSON.parse(result.response.text());
  return chatOutputSchema.parse(json);
}
```

---

## Fitur 3 — Query Data (Chat Assistant)

Ketika `intent === "QUERY"`, pesan user tidak diparse sebagai transaksi tapi dijawab dari data aktual database. Ini pipeline terpisah dari dua fitur di atas.

### Alur

1. Backend deteksi `intent === "QUERY"` dari hasil parsing chat.
2. Jalankan query ke database berdasarkan intent (contoh: total pengeluaran bulan ini = `SUM` dari `journal_lines` dengan akun tipe `EXPENSE` untuk bulan berjalan).
3. Kirim hasil query sebagai konteks ke Gemini dengan prompt berikut untuk mendapat jawaban dalam bahasa natural.

### Prompt untuk Answer Generation

```
You are a financial assistant for Laby. Answer the user's question based solely on the data provided below.

Rules:
- Be concise and direct. One to three sentences maximum.
- Use Indonesian if the user wrote in Indonesian, English if in English.
- Format amounts in IDR with thousand separators (e.g. Rp1.450.000).
- Do not add information not present in the data.
- Do not use emoji or em dashes.

User question: {USER_QUESTION}

Data from database:
{QUERY_RESULT_JSON}
```

> `{QUERY_RESULT_JSON}` berisi hasil query database dalam format JSON. Untuk query ini, output tidak perlu JSON — plain text cukup karena hasilnya langsung ditampilkan ke user.

---

## Rate Limiting & Error Handling

Free tier Gemini 3.7 Flash: ~10 RPM dan 500 RPD (requests per day). Lihat `gemini-api-free-tier-cheatsheet.md` untuk angka terkini.

| Skenario | Handling |
|---|---|
| Rate limit (429) | Retry dengan exponential backoff: 2s, 4s, 8s. Maksimal 3 kali. |
| Timeout / network error | Tampilkan pesan error ke user, biarkan user coba ulang manual. |
| JSON parse gagal | Log error + raw response, kembalikan error ke client — jangan crash. |
| Confidence < 0.7 | Tampilkan warning di UI: "AI kurang yakin dengan data ini, silakan periksa sebelum menyimpan." |
| Field `null` dari AI | Highlight field tersebut di form review, minta user mengisi manual sebelum bisa submit. |

---

## Keamanan

- `GEMINI_API_KEY` hanya boleh ada di server-side (API routes), tidak pernah di client bundle.
- Jangan kirim data sensitif lain (password hash, token) ke Gemini — hanya data yang relevan untuk ekstraksi.
- Ukuran gambar yang dikirim ke API dibatasi di backend (rekomendasi: maksimal 4MB setelah kompresi) untuk mencegah abuse dan menjaga latensi.
- Semua output AI divalidasi dengan Zod sebelum menyentuh database — tidak ada `JSON.parse` tanpa schema validation.

---

## Referensi

- `laby-planning.md` — bagian 3.2 (Input via screenshot & chat), bagian 6 (Alur AI)
- `gemini-api-free-tier-cheatsheet.md` — daftar model aktif dan rate limit free tier
- [Google AI SDK for TypeScript](https://github.com/google/generative-ai-js)
- [Gemini API: Structured Output](https://ai.google.dev/gemini-api/docs/structured-output)
