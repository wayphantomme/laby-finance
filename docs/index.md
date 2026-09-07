# Laby — Documentation Hub

> Laby adalah aplikasi laporan keuangan pribadi berbasis double-entry bookkeeping. Dokumentasi ini mencakup semua aspek: produk, panduan pengguna, akuntansi, laporan keuangan, standar akuntansi, perpajakan, dan teknologi.

---

## Navigasi Cepat

### Produk & Pengguna
| Dokumen | Isi |
|---|---|
| [Product Overview](./product-overview.md) | Visi, fitur lengkap, roadmap, keputusan desain |
| [User Guide](./user-guide.md) | Cara daftar, input transaksi, baca laporan, pakai AI |

### Akuntansi & Keuangan
| Dokumen | Isi |
|---|---|
| [Accounting Fundamentals](./accounting-fundamentals.md) | Double-entry, persamaan akuntansi, siklus, bagan akun |
| [Laporan Keuangan](./laporan-keuangan.md) | 5 jenis laporan, cara membaca, contoh angka, rasio |
| [Standar Akuntansi](./standar-akuntansi.md) | SAK, PSAK, SAK EP, SAK EMKM, IFRS, konvergensi Indonesia |

### Pajak
| Dokumen | Isi |
|---|---|
| [Pajak & SPT](./pajak-dan-spt.md) | PPh pribadi/badan, PPN, cara bayar, lapor SPT via Coretax |

### Teknis
| Dokumen | Isi |
|---|---|
| [Technology](./technology.md) | Tech stack, arsitektur, skema DB, API reference |
| [Setup Development](./setup-dev.md) | Onboarding lokal, env config, database, perintah npm |
| [AI Prompt Engineering](./ai-prompt-engineering.md) | System prompt Gemini, skema JSON, rate limit handling |
| [Gemini API Cheatsheet](./gemini-api-free-tier-cheatsheet.md) | Model aktif, rate limit, cara dapat API key |

### Referensi Lama (detail teknis)
| Dokumen | Isi |
|---|---|
| [Laby Planning](./laby-planning.md) | Spesifikasi produk lengkap, CoA, skema DB, keputusan arsitektur |
| [Standar Akuntansi Referensi](./standar-akuntansi-referensi.md) | Referensi mendalam PSAK/IFRS, siklus akuntansi, konvensi angka |
| [Rencana Lapor Pajak SPT](./rencana-lapor-pajak-spt.md) | Panduan pajak freelancer/UMKM, timeline, Coretax step-by-step |

---

## Untuk Siapa Dokumentasi Ini?

**Pengguna Laby** — mulai dari [User Guide](./user-guide.md). Tidak perlu tahu akuntansi dulu.

**Baru belajar akuntansi** — mulai dari [Accounting Fundamentals](./accounting-fundamentals.md), lanjut ke [Laporan Keuangan](./laporan-keuangan.md).

**Freelancer/pemilik usaha** — [Pajak & SPT](./pajak-dan-spt.md) punya semua yang kamu butuhkan untuk lapor pajak tahunan.

**Developer yang mau kontribusi** — [Technology](./technology.md) dan [Setup Development](./setup-dev.md).

---

## Status Proyek

| Fase | Status | Keterangan |
|---|---|---|
| Fase 1 — Fondasi | Selesai | Auth, CoA, input manual, dashboard |
| Fase 2 — Laporan | Selesai | Laba rugi, neraca, arus kas, grafik |
| Fase 3 — AI | Selesai | Screenshot extraction, chat parsing, AI assistant |
| Fase 4 — Portofolio | Planned | Investasi, recurring, budget |
| Fase 5 — Polish | Planned | i18n EN/ID, dark mode, 2FA, PWA |
| Fase 6 — Pajak | Planned | Ekspor SPT, PPh Final dashboard, rekapitulasi tahunan |

---

## Konvensi Dokumen

- Semua file `kebab-case`, Bahasa Indonesia
- Angka keuangan: pemisah ribuan titik, desimal koma (Rp1.450.000,50)
- Nilai negatif: tanda kurung `(1.450.000)`, bukan tanda minus
- Tidak ada emoji, tidak ada em dash
- Kode akun: format `X-YYY` (contoh: `5-101`)
