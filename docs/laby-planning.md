# Laby - Laporan Keuangan Pribadi

Dokumen perencanaan (planning & spec) untuk web app tracking portofolio dan keuangan pribadi bergaya laporan akuntansi profesional.

---

## 1. Visi Produk

Laby adalah aplikasi keuangan pribadi yang memperlakukan uangmu seperti laporan keuangan perusahaan: ada nomor akun, uraian, jurnal, dan tiga laporan utama (laba rugi, neraca, arus kas), tapi dikemas sederhana untuk satu orang. Input data bisa lewat form manual, upload screenshot (mutasi bank, e-wallet, aplikasi investasi), atau chat ke AI. Semua histori perubahan tercatat sehingga bisa diaudit kembali.

Nama: **Laby**
Tagline (draft): "Personal financial statements, done properly"
Warna utama: merah (contoh token: `#DC2626` sebagai primary, dengan varian gelap `#991B1B` dan terang `#FEE2E2`)
Maskot: babi tabungan (piggy bank), dipakai di halaman kosong (empty state), loading, dan onboarding — bukan sebagai emoji, tapi ilustrasi/SVG custom.
Bahasa: Inggris (default) dan Indonesia, bisa toggle.

---

## 2. Yang Kamu Belum Sebutkan (Gap Analysis)

Beberapa hal yang biasanya ada di laporan keuangan pribadi yang serius, tapi belum kamu sebutkan di brief:

1. **Sistem pencatatan: single-entry vs double-entry.** Untuk bisa menghasilkan neraca yang benar-benar balance (Aset = Liabilitas + Ekuitas), kamu butuh double-entry bookkeeping, bukan sekadar catatan pemasukan/pengeluaran. Ini keputusan arsitektur paling penting di awal.
2. **Chart of Accounts (bagan akun).** Perlu struktur nomor akun standar akuntansi (1000-an Aset, 2000-an Liabilitas, 3000-an Ekuitas, 4000-an Pendapatan, 5000-an Beban).
3. **Portofolio & valuasi aset.** Kamu sebut "tracking portofolio" — ini butuh modul terpisah dari transaksi harian: harga beli, harga sekarang, unrealized gain/loss, dan bagaimana itu masuk ke neraca (aset investasi) vs laba rugi (realized gain saat dijual).
4. **Multi-mata uang.** Kalau ada investasi crypto/saham luar negeri, perlu keputusan mata uang dasar (base currency, misalnya IDR) dan kurs konversi.
5. **Rekonsiliasi saldo.** Saldo di aplikasi vs saldo riil di rekening/e-wallet perlu dicocokkan secara berkala.
6. **Transaksi berulang (recurring).** Gaji bulanan, langganan, cicilan — supaya tidak input manual tiap bulan.
7. **Budget vs realisasi.** Opsional tapi umum: target pengeluaran per kategori per bulan.
8. **Lampiran bukti (attachment).** Screenshot atau struk yang diupload sebaiknya disimpan sebagai bukti transaksi, bukan cuma dipakai sekali lalu hilang.
9. **Ekspor data.** CSV/PDF untuk laporan bulanan/tahunan, dan backup/restore database.
10. **Keamanan data finansial.** Karena data sangat sensitif: enkripsi field sensitif, rate limiting, session expiry, opsional 2FA.
11. **Audit trail terpisah dari data.** Histori update yang kamu minta perlu tabel tersendiri (siapa/apa yang berubah, kapan, dari mana — manual, screenshot AI, atau chat AI).
12. **Notifikasi/reminder.** Misalnya reminder input transaksi tiap akhir bulan.
13. **Definisi periode.** Tahun fiskal Januari-Desember atau custom? Perlu ini jelas karena laporan 12 bulan + total tahunan bergantung pada ini.

Poin 1, 2, dan 3 adalah fondasi — sebaiknya diputuskan dulu sebelum desain database.

---

## 3. Fitur Utama

### 3.1 Autentikasi
- Single-user (personal), atau multi-user dengan role di masa depan (misal: kamu + pasangan).
- Login via email/password (hashed dengan bcrypt/argon2) atau magic link.
- Opsional 2FA (TOTP) karena ini data finansial pribadi.
- Session pakai JWT atau NextAuth/Auth.js session, disimpan di cookie httpOnly.

### 3.2 Pencatatan Transaksi
- Input manual: tanggal, akun, nomor akun, uraian, debit/kredit, kategori, tag, lampiran.
- Input via upload screenshot: AI (Gemini) membaca gambar mutasi bank/e-wallet, mengekstrak tanggal, jumlah, deskripsi, lalu menyarankan akun & kategori — user konfirmasi sebelum disimpan.
- Input via chat: user ketik natural language ("kemarin belanja bulanan 450rb pakai debit BCA"), AI parse jadi entri jurnal terstruktur, tampilkan preview, user konfirmasi.
- Semua entri dari AI wajib melalui tahap konfirmasi/review sebelum masuk ke buku besar (tidak auto-commit).

### 3.3 Laporan Keuangan
- **Laporan Laba Rugi (Income Statement):** pendapatan dikurangi beban, per bulan dan kumulatif 12 bulan + total tahunan.
- **Neraca (Balance Sheet):** aset (kas, rekening, investasi, aset lain), liabilitas (utang, cicilan), ekuitas (net worth), snapshot per akhir bulan.
- **Arus Kas (Cash Flow Statement):** dikelompokkan gaya profesional — aktivitas operasional, investasi, pendanaan — disesuaikan konteks pribadi (operasional = gaji & pengeluaran harian, investasi = beli/jual portofolio, pendanaan = utang/cicilan).
- Tampilan bulanan (12 kolom bulan Jan-Des) + kolom Total, bisa difilter per tahun.
- Grafik tren (net worth over time, income vs expense per bulan) dengan animasi transisi.

### 3.4 Portofolio Investasi
- Daftar aset investasi (saham, crypto, reksadana, emas, dll) dengan harga beli, jumlah unit, harga sekarang.
- Unrealized gain/loss dihitung otomatis, muncul di neraca sebagai bagian aset.
- Saat dijual, realized gain/loss otomatis tercatat sebagai pendapatan di laba rugi.

### 3.5 Histori & Audit Log
- Setiap create/update/delete transaksi tercatat: waktu, sumber (manual/screenshot AI/chat AI), before-after value, siapa yang melakukan.
- Halaman "Activity History" bisa difilter per bulan/per sumber.

### 3.6 AI Assistant (Gemini)
- Mode chat bebas untuk tanya laporan ("berapa total pengeluaran makan bulan ini?") — dijawab dari data asli, bukan dikarang.
- Mode input via screenshot dan via chat seperti di atas.
- Semua output teks dari AI di UI mengikuti gaya anti-AI-slop: tanpa emoji, tanpa em dash, kalimat jelas dan ringkas.

### 3.7 Lain-lain
- Dashboard ringkasan (net worth, cash flow bulan ini, top kategori pengeluaran).
- Dark/light mode.
- Bilingual EN/ID dengan i18n (default EN).
- Mobile-first, responsive, terasa native di HP.
- Ekspor laporan ke PDF/CSV.

---

## 4. Bagan Akun (Chart of Accounts)

Mengikuti konvensi kode akun standar Indonesia (lihat `standar-akuntansi-referensi.md` bagian 2.2). Format: `X-YYY` di mana digit pertama adalah kategori utama, tiga digit berikutnya adalah kode spesifik. Saldo normal: Aset & Beban = Debit; Liabilitas, Ekuitas & Pendapatan = Kredit.

| Kode | Kategori | Saldo Normal | Contoh Akun |
|---|---|---|---|
| **1-xxx** | **Aset** | Debit | |
| 1-100 | Aset Lancar — Kas & Setara Kas | Debit | Kas Tunai, Rekening Bank, E-wallet |
| 1-200 | Aset Lancar — Piutang & Lain-lain | Debit | Piutang Klien, Uang Muka |
| 1-300 | Aset Investasi | Debit | Saham, Crypto, Reksadana, Emas |
| 1-400 | Aset Tetap | Debit | Kendaraan, Elektronik, Properti |
| 1-490 | Akumulasi Penyusutan (kontra-aset) | (Kredit) | Penyusutan Peralatan |
| **2-xxx** | **Liabilitas** | Kredit | |
| 2-100 | Liabilitas Lancar | Kredit | Kartu Kredit, Utang Jangka Pendek |
| 2-200 | Liabilitas Jangka Panjang | Kredit | Cicilan KPR, Pinjaman |
| **3-xxx** | **Ekuitas** | Kredit | |
| 3-100 | Modal & Ekuitas | Kredit | Modal Awal, Saldo Laba Ditahan (Net Worth) |
| **4-xxx** | **Pendapatan** | Kredit | |
| 4-100 | Pendapatan Operasional | Kredit | Gaji, Freelance, Bisnis |
| 4-200 | Pendapatan Investasi | Kredit | Dividen, Bunga, Realized Gain |
| 4-300 | Pendapatan Lain-lain | Kredit | Hadiah, Grant, Kompetisi |
| **5-xxx** | **Beban Pokok Hidup** | Debit | |
| 5-100 | Kebutuhan Dasar | Debit | Makan, Transport, Tempat Tinggal |
| 5-200 | Gaya Hidup | Debit | Hiburan, Belanja, Langganan |
| **6-xxx** | **Beban Operasional** | Debit | |
| 6-100 | Beban Kerja & Bisnis | Debit | Software, Peralatan Kerja, Internet |
| 6-200 | Beban Finansial | Debit | Bunga Utang, Biaya Admin Bank |
| 6-300 | Beban Pajak | Debit | PPh Final, PPh Kurang Bayar |

Setiap akun bisa punya sub-akun menggunakan format `X-YYY.Z` (misal `5-100.1` = Makan, `5-100.2` = Transport). Struktur ini selaras dengan output laporan pajak — akun `6-300` (Beban Pajak) langsung bisa diekstrak untuk rekonsiliasi SPT.

> Referensi: konvensi nomor akun di atas konsisten dengan standar praktik Indonesia, bukan SAK/PSAK yang merupakan standar pelaporan (beda konteks — lihat `standar-akuntansi-referensi.md` bagian 2 untuk penjelasan lengkap).

---

## 5. Skema Database (Ringkas)

```
users
  id, email, password_hash, name, locale, created_at

accounts (chart of accounts)
  id, code, name_en, name_id, type (asset/liability/equity/income/expense),
  parent_id, is_active

journal_entries
  id, user_id, entry_date, description, source (manual/screenshot_ai/chat_ai),
  status (draft/confirmed), created_at

journal_lines
  id, journal_entry_id, account_id, debit, credit, note

portfolio_holdings
  id, user_id, account_id, asset_name, ticker, quantity,
  avg_buy_price, current_price, currency, last_updated

attachments
  id, journal_entry_id, file_url, type (screenshot/receipt), uploaded_at

audit_log
  id, entity_type, entity_id, action (create/update/delete),
  before_value, after_value, source, created_at

recurring_rules
  id, user_id, template_journal_entry, frequency, next_run_date, active

chat_sessions / chat_messages
  id, user_id, role, content, created_at
```

Laporan (laba rugi, neraca, arus kas) dihitung dari agregasi `journal_lines` per bulan — bukan tabel tersendiri, supaya selalu konsisten dengan data mentah.

---

## 6. Tech Stack & Arsitektur

| Layer | Pilihan | Catatan |
|---|---|---|
| Framework | Next.js (App Router) | SSR + API routes jadi satu |
| Styling | Tailwind CSS | Design token warna merah + netral |
| Animasi | Framer Motion | Transisi grafik, angka, halaman |
| Icon | Lucide React | Konsisten, bukan emoji |
| Database | PostgreSQL via Neon | Serverless Postgres |
| ORM | Prisma | Migration + type-safety untuk skema di atas |
| Auth | Auth.js (NextAuth) atau custom JWT | Sesuai kebutuhan single-user vs multi-user |
| AI | Gemini 3.x API (Google AI Studio) | Untuk OCR screenshot & chat parsing. Pakai **Gemini 3.7 Flash** (terbaru, gratis, native grounding). Rate limit free tier: ~10 RPM, perlu client-side throttling atau queue untuk fitur screenshot batch. Kalau usage tinggi, upgrade ke paid atau pakai OpenRouter sebagai fallback. Lihat `gemini-api-free-tier-cheatsheet.md` untuk daftar model aktif terkini. |
| Hosting | Vercel | Deploy otomatis dari GitHub |
| CI/CD | GitHub Actions | Lint, type-check, test, lalu deploy ke Vercel |
| i18n | next-intl atau next-i18next | EN default, ID sebagai opsi |
| Charting | Recharts | Grafik tren net worth, income vs expense |

### Alur AI (Screenshot & Chat)
1. User upload gambar atau ketik chat.
2. Gambar/teks dikirim ke Gemini dengan prompt terstruktur (system prompt meminta output JSON: tanggal, jumlah, deskripsi, saran akun).
3. Backend validasi hasil JSON, isi ke form draft.
4. User review dan konfirmasi di UI sebelum masuk `journal_entries` dengan status `confirmed`.
5. Setiap langkah tercatat ke `audit_log`.

### CI/CD (GitHub Actions -> Vercel)
- Push ke `main`: run lint (ESLint) -> type-check (`tsc --noEmit`) -> test -> Prisma migrate check -> auto-deploy ke Vercel production.
- Push ke branch lain / PR: preview deployment Vercel otomatis + comment hasil check di PR.

---

## 7. Panduan Konten & UI (Anti-AI-Slop)

- Tidak ada emoji di UI maupun teks yang dihasilkan AI.
- Tidak ada tanda em dash (—); gunakan koma, titik, atau kalimat baru.
- Bahasa laporan formal tapi ringkas, gaya laporan akuntansi, bukan gaya obrolan santai berlebihan.
- Maskot babi tabungan dipakai secukupnya: di logo, halaman kosong, dan sukses submit, bukan di setiap tombol.
- Warna merah sebagai aksen utama (tombol utama, grafik naik/turun disesuaikan konvensi: merah untuk defisit/turun, hijau untuk surplus/naik, supaya tetap intuitif secara akuntansi meski red jadi warna brand).

---

## 8. Roadmap Bertahap

**Fase 1 - Fondasi**
Auth, chart of accounts, input manual transaksi (double-entry sederhana lewat form yang terasa seperti single-entry di UI), dashboard dasar.

**Fase 2 - Laporan**
Laba rugi, neraca, arus kas per bulan + total tahunan, grafik tren, ekspor PDF/CSV.

**Fase 3 - AI**
Upload screenshot dengan ekstraksi Gemini, chat assistant untuk input dan tanya-jawab data, audit log lengkap.

**Fase 4 - Portofolio & Otomasi**
Modul investasi dengan valuasi, recurring transactions, budget vs realisasi, notifikasi.

**Fase 5 - Polish**
i18n penuh EN/ID, dark mode, mobile PWA, 2FA, backup/restore.

**Fase 6 - Pajak & Kepatuhan**
Fitur ekspor data yang relevan untuk pelaporan pajak Indonesia:
- Rekapitulasi penghasilan per tahun pajak (terpilah: lokal vs luar negeri), langsung bisa dicocokkan dengan pengisian SPT Tahunan Formulir 1770.
- Export CSV/PDF summary yang formatnya mengikuti struktur SPT (sesuai `rencana-lapor-pajak-spt.md` Fase B).
- Kalkulasi estimasi PPh Final 0,5% dari omzet bruto per bulan (untuk skema UMKM), lengkap dengan reminder setor bulanan.
- Dashboard kepatuhan pajak: indikator bulan mana sudah setor PPh Final, bulan mana belum.
- Catatan: fitur ini hanya estimasi bantu — bukan pengganti konsultasi dengan AR KPP atau konsultan pajak untuk angka final.

---

## 9. Keputusan Arsitektur — Sudah Diputuskan

1. **Double-entry penuh atau simplified?**
   Pakai **double-entry di backend, single-entry experience di UI**. Artinya user tidak perlu input debit/kredit manual — form terasa seperti "tambah transaksi" biasa (pilih kategori, jumlah, akun) tapi sistem otomatis buat journal entry pasangannya. Ini memastikan neraca bisa balance dan laporan keuangan bisa digenerate secara akurat, tanpa membebani user dengan konsep akuntansi.

2. **Base currency: IDR saja, atau multi-currency?**
   **IDR sebagai base currency, multi-currency sebagai fitur Fase 2+.** Pada Fase 1, semua input dalam IDR. Transaksi luar negeri dicatat dengan kurs konversi ke IDR saat input (user input manual kursnya). Infrastruktur DB sudah disiapkan kolom `currency` dan `exchange_rate` di `journal_lines` sejak awal supaya tidak perlu migrasi besar nanti.

3. **Single-user atau multi-user?**
   **Single-user di Fase 1, tapi struktur DB pakai `user_id` sejak awal** di semua tabel utama. Ini cost rendah tapi membuka jalur multi-user (pasangan/keluarga) tanpa rewrite besar. Auth tetap simpel (satu akun) sampai ada kebutuhan nyata multi-user.

4. **Tahun fiskal: Januari-Desember atau custom?**
   **Januari-Desember fixed untuk Fase 1.** Ini sesuai dengan tahun pajak Indonesia (selaras dengan kebutuhan ekspor data SPT). Custom fiscal year bisa ditambah nanti sebagai setting opsional, tapi tidak akan memengaruhi arsitektur laporan karena semua laporan di-query berdasarkan `entry_date` range yang fleksibel.

5. **Histori chat AI: permanen atau bisa dihapus?**
   **Permanen by default, tapi user bisa hapus per sesi.** Histori chat disimpan di `chat_sessions` / `chat_messages`, berguna untuk konteks AI di sesi berikutnya ("bulan lalu kamu tanya soal ini..."). User bisa hapus satu sesi sekaligus, bukan per pesan. Penghapusan soft-delete (tandai `deleted_at`) bukan hard-delete, supaya audit trail tetap ada di sisi admin kalau perlu debugging.
