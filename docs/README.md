# Laby — Dokumentasi

Direktori ini berisi semua dokumentasi untuk proyek **Laby** — aplikasi laporan keuangan pribadi berbasis double-entry bookkeeping.

Mulai dari [index.md](./index.md) untuk navigasi lengkap, atau langsung ke dokumen yang kamu butuhkan di bawah.

---

## Navigasi Cepat

### Untuk Pengguna
| File | Isi |
|---|---|
| [`index.md`](./index.md) | Hub navigasi — titik masuk semua dokumentasi |
| [`product-overview.md`](./product-overview.md) | Visi, fitur lengkap, roadmap, filosofi desain |
| [`user-guide.md`](./user-guide.md) | Cara daftar, input transaksi (3 metode), baca laporan, pakai AI, FAQ |

### Akuntansi & Keuangan
| File | Isi |
|---|---|
| [`accounting-fundamentals.md`](./accounting-fundamentals.md) | Double-entry, persamaan akuntansi, 5 tipe akun, bagan akun 62 akun, siklus akuntansi, penyusutan, rasio keuangan |
| [`laporan-keuangan.md`](./laporan-keuangan.md) | 5 komponen laporan keuangan, contoh angka nyata, cara membaca laba rugi/neraca/arus kas, rasio |
| [`standar-akuntansi.md`](./standar-akuntansi.md) | SAK EMKM, SAK EP (baru 2025), SAK Umum/PSAK, IFRS, US GAAP, kerangka konseptual, koreksi fiskal |

### Pajak
| File | Isi |
|---|---|
| [`pajak-dan-spt.md`](./pajak-dan-spt.md) | PPh pribadi vs badan, PPh Final UMKM 0,5%, tarif progresif, PPN, step-by-step Coretax, mapping akun Laby ke SPT |

### Teknis
| File | Isi |
|---|---|
| [`technology.md`](./technology.md) | Tech stack, struktur folder, skema DB, API reference, alur AI, keamanan, CI/CD |
| [`setup-dev.md`](./setup-dev.md) | Setup lokal: install, env, database, seed, perintah npm |
| [`ai-prompt-engineering.md`](./ai-prompt-engineering.md) | System prompt Gemini, skema JSON output, rate limit handling |
| [`gemini-api-free-tier-cheatsheet.md`](./gemini-api-free-tier-cheatsheet.md) | Model aktif free tier, rate limit, cara dapat API key |

### Referensi & Perencanaan
| File | Isi |
|---|---|
| [`laby-planning.md`](./laby-planning.md) | Spesifikasi produk asli: visi, CoA, skema DB, tech stack, roadmap, keputusan arsitektur |
| [`standar-akuntansi-referensi.md`](./standar-akuntansi-referensi.md) | Referensi mendalam PSAK/IFRS, siklus akuntansi, konvensi angka |
| [`rencana-lapor-pajak-spt.md`](./rencana-lapor-pajak-spt.md) | Panduan pajak freelancer: PPh, timeline, Coretax step-by-step |

---

## Status Proyek

| Fase | Status |
|---|---|
| Fase 1 — Fondasi (auth, CoA, input manual, dashboard) | Selesai |
| Fase 2 — Laporan (laba rugi, neraca, arus kas, grafik) | Selesai |
| Fase 3 — AI (screenshot, chat, audit log) | Selesai |
| Fase 4 — Portofolio & Otomasi | Planned |
| Fase 5 — Polish (i18n, dark mode, 2FA, PWA) | Planned |
| Fase 6 — Pajak & Kepatuhan | Planned |

---

## Konvensi Dokumen

- Semua file `kebab-case`, Bahasa Indonesia
- Angka: pemisah ribuan titik, desimal koma (`Rp1.450.000,50`)
- Nilai negatif: tanda kurung `(1.450.000)`, bukan tanda minus
- Tidak ada emoji, tidak ada em dash
- Kode akun: format `X-YYY` (contoh: `5-101`)
