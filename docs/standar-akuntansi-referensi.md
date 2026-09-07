# Referensi Standar Akuntansi & Laporan Keuangan

> Catatan: dokumen ini disusun untuk kebutuhan belajar (mahasiswa Bisnis Digital) dan konteks praktik freelance/bisnis. Bukan pengganti nasihat akuntan/auditor bersertifikat untuk kasus spesifik.

---

## 1. Standar Akuntansi: Indonesia vs Internasional

### 1.1 Hierarki standar di Indonesia (dikeluarkan oleh IAI — Ikatan Akuntan Indonesia)

| Standar | Untuk entitas | Basis |
|---|---|---|
| **SAK Umum (PSAK/ISAK)** | Emiten, BUMN, entitas dengan akuntabilitas publik signifikan (bank, asuransi, dll) | Konvergensi penuh dengan IFRS |
| **SAK EP** (SAK Entitas Privat) | Perusahaan menengah/privat non-publik — menggantikan SAK ETAP sejak 1 Jan 2025 | Simplifikasi dari SAK Umum |
| **SAK EMKM** | Usaha Mikro, Kecil, dan Menengah | Paling sederhana, berbasis biaya historis |
| **SAK Syariah (PSAK/ISAK syariah)** | Entitas syariah (bank syariah, asuransi syariah, dll) | Prinsip syariah + konvergensi IFRS bila relevan |
| **SAP** (Standar Akuntansi Pemerintahan) | Instansi pemerintah pusat/daerah | Ditetapkan KSAP, bukan IAI |

**Kamu (Megatha Tech / klien UMKM/startup)** kemungkinan besar relevan dengan **SAK EMKM** atau **SAK EP**, bukan SAK Umum penuh — kecuali kliennya perusahaan terbuka.

### 1.2 Standar internasional

- **IFRS (International Financial Reporting Standards)** — diterbitkan oleh **IASB** (International Accounting Standards Board), di bawah **IFRS Foundation**. Digunakan di 140+ negara.
- **IAS (International Accounting Standards)** — standar lama dari pendahulu IASB (IASC), masih berlaku selama belum digantikan IFRS baru.
- **US GAAP** — standar Amerika Serikat (FASB), **berbeda** dari IFRS (rule-based vs principle-based). Indonesia mengikuti jalur IFRS, bukan US GAAP.
- **IFRS for SMEs** — versi simplifikasi IFRS untuk UKM (jadi acuan konseptual SAK EP).

### 1.3 Status konvergensi Indonesia

Indonesia mulai konvergensi ke IFRS sejak akhir 2000-an, penuh sejak 2012. Sejak itu IAI terus menyesuaikan PSAK dengan IFRS terbaru. Yang relevan untuk 2025–2026:

- **1 Jan 2025**: SAK EP resmi menggantikan SAK ETAP; PSAK 117 (Kontrak Asuransi, setara IFRS 17) mulai berlaku.
- **1 Jan 2026**: revisi PSAK 338 (Kombinasi Bisnis Entitas Sepengendali), amendemen PSAK 109 & 107, serta penyesuaian tahunan SAK 2024 mulai berlaku efektif.
- IAI juga sedang menyiapkan **PSAK 118** (setara IFRS 18 — Presentation and Disclosure in Financial Statements), yang akan mengubah cara penyajian laporan laba rugi ke depan.

Karena ini terus bergerak, untuk keperluan riil (bukan cuma belajar) selalu cek situs resmi **web.iaiglobal.or.id** untuk versi PSAK yang berlaku saat ini.

---

## 2. Penomoran Akuntansi — Dua Hal Berbeda yang Sering Ketuker

"Penomoran akuntansi" bisa merujuk ke **dua hal berbeda**, dan kelihatannya pertanyaanmu menyentuh keduanya:

### 2.1 Penomoran standar (PSAK/ISAK) — sistem baru sejak 1 Jan 2024

IAI mengubah sistem penomoran PSAK/ISAK supaya langsung bisa dikenali padanannya dengan IFRS:

| Awalan | Arti |
|---|---|
| **PSAK 1xx** | Merujuk ke IFRS Standards (mis. PSAK 109 ≈ IFRS 9 Instrumen Keuangan) |
| **PSAK 2xx** | Merujuk ke IAS Standards (mis. PSAK 228 ≈ IAS 28 Investasi Asosiasi) |
| **PSAK 3xx** | PSAK lokal, tidak merujuk standar IFRS/IAS manapun |
| **PSAK 4xx** | PSAK Syariah |
| **ISAK 1xx** | Merujuk ke interpretasi IFRIC |
| **ISAK 2xx** | Merujuk ke interpretasi SIC |
| **ISAK 3xx** | ISAK lokal |
| **ISAK 4xx** | ISAK Syariah |

Contoh: PSAK 338 = padanan IFRS 3 (Kombinasi Bisnis), angka "38" menandakan itu revisi ketiga dari basis nomor 8... (pola detail render angka tengah bervariasi per standar — cek tabel resmi IAI untuk pemetaan lengkap tiap PSAK). Yang penting dipahami: **digit pertama = kategori rujukan, bukan urutan terbit.**

### 2.2 Penomoran akun (Chart of Accounts / Kode Akun) — ini yang biasanya dimaksud di praktik bisnis sehari-hari

Ini adalah sistem penomoran **internal perusahaan** untuk mengelompokkan akun buku besar, bukan standar dari IAI. Konvensi umum di Indonesia:

| Kode | Kategori | Sifat saldo normal |
|---|---|---|
| **1-xxx** | Aset (Assets) | Debit |
| **2-xxx** | Liabilitas/Kewajiban (Liabilities) | Kredit |
| **3-xxx** | Ekuitas (Equity) | Kredit |
| **4-xxx** | Pendapatan (Revenue) | Kredit |
| **5-xxx** | Beban Pokok Penjualan / HPP (COGS) | Debit |
| **6-xxx** | Beban Operasional (Operating Expenses) | Debit |
| **7-xxx** | Pendapatan/Beban Lain-lain (Other Income/Expense) | Campuran |
| **8-xxx / 9-xxx** | Pajak, laba-rugi penutup (opsional, tergantung sistem) | — |

Contoh detail turunan (subledger), misal untuk Aset:
```
1-000  ASET
1-100    Aset Lancar
1-101      Kas
1-102      Bank
1-110      Piutang Usaha
1-120      Persediaan
1-200    Aset Tetap
1-201      Peralatan
1-202      Akumulasi Penyusutan Peralatan (kontra-aset)
```

Ini yang biasanya kamu setup di software akuntansi (Jurnal, Accurate, Xero, QuickBooks) atau kalau bikin sistem sendiri.

---

## 3. Akuntansi Ada Apa Aja? (Cabang & Siklus)

### 3.1 Cabang-cabang akuntansi
1. **Akuntansi Keuangan (Financial Accounting)** — untuk pihak eksternal (investor, bank, pajak); yang diatur PSAK.
2. **Akuntansi Manajemen (Management Accounting)** — untuk internal (budgeting, costing, decision making); tidak terikat PSAK.
3. **Akuntansi Biaya (Cost Accounting)** — sub dari manajemen, fokus HPP & efisiensi biaya produksi.
4. **Akuntansi Pajak (Tax Accounting)** — mengikuti UU Pajak (beda dari PSAK, ada istilah "koreksi fiskal").
5. **Auditing** — pemeriksaan independen atas laporan keuangan.
6. **Akuntansi Anggaran (Budgeting)**.
7. **Akuntansi Pemerintahan** — beda standar (SAP), basis kas menuju akrual.
8. **Sistem Informasi Akuntansi (SIA)** — desain alur pencatatan & kontrol internal (ini paling dekat dengan skill dev-mu).

### 3.2 Siklus akuntansi (accounting cycle) — bagian yang sering "hilang" dari daftar
Ini penting karena menjelaskan **dari mana angka di laporan keuangan berasal**:

1. Identifikasi & analisis transaksi (bukti transaksi: invoice, kwitansi)
2. Jurnal umum (mencatat debit-kredit)
3. Posting ke buku besar (ledger) — sesuai kode akun di atas
4. Neraca saldo (trial balance)
5. Jurnal penyesuaian (accrual, depresiasi, dll)
6. Neraca saldo disesuaikan
7. Penyusunan laporan keuangan
8. Jurnal penutup (closing entries) — khusus akun nominal (pendapatan/beban)
9. Neraca saldo setelah penutupan
10. (opsional) Jurnal pembalik di awal periode berikutnya

### 3.3 Kerangka Konseptual (Conceptual Framework) — sering terlewat juga
Ini "aturan main" di atas semua PSAK teknis:
- **Asumsi dasar**: entitas berdiri sendiri (going concern), akrual basis
- **Karakteristik kualitatif**: relevan, representasi jujur (fundamental); dapat dibandingkan, dapat diverifikasi, tepat waktu, dapat dipahami (peningkat)
- **Elemen laporan keuangan**: aset, liabilitas, ekuitas, penghasilan, beban
- **Pengakuan & pengukuran**: kapan dicatat, dengan basis nilai apa (historis, wajar, dll)

---

## 4. Laporan Keuangan Ada Apa Aja? (5 Komponen Wajib, sesuai PSAK 1 lama / PSAK 118 baru)

Satu **set lengkap** laporan keuangan (bukan cuma satu dokumen) terdiri dari:

1. **Laporan Posisi Keuangan (Neraca)** — *Statement of Financial Position*
   Aset = Liabilitas + Ekuitas, per tanggal tertentu (snapshot).

2. **Laporan Laba Rugi dan Penghasilan Komprehensif Lain** — *Statement of Profit or Loss and Other Comprehensive Income*
   Pendapatan − Beban = Laba/Rugi, untuk suatu periode.
   *(Catatan: PSAK 118/IFRS 18 yang akan berlaku ke depan mengubah struktur penyajian laba rugi menjadi kategori: operasi, investasi, pendanaan — mirip laporan arus kas.)*

3. **Laporan Perubahan Ekuitas** — *Statement of Changes in Equity*
   Mutasi modal: saldo awal, laba tahun berjalan, dividen, saldo akhir.

4. **Laporan Arus Kas** — *Statement of Cash Flows*
   Dipecah 3 aktivitas: **Operasi, Investasi, Pendanaan.** Metode: langsung atau tidak langsung.

5. **Catatan atas Laporan Keuangan (CaLK)** — *Notes to Financial Statements*
   Kebijakan akuntansi + rincian angka. Ini **bagian integral**, bukan lampiran opsional — sering dianggap "ke-6" padahal wajib.

> Bagian yang **sering terlupa**: laporan komparatif periode sebelumnya (minimal 2 periode neraca, 2 periode laba rugi) wajib disajikan berdampingan — bukan cuma periode berjalan saja.

---

## 5. Penulisan Angka Akuntansi — Konvensi

### 5.1 Format dasar
- **Pemisah ribuan**: di Indonesia pakai **titik** (Rp1.000.000), bukan koma. Standar internasional (Inggris/AS) pakai **koma** (Rp1,000,000) — konteks penting kalau kerja dengan klien asing.
- **Desimal**: Indonesia pakai **koma** (Rp1.000.000,50); internasional pakai **titik** (1,000,000.50).
- **Mata uang**: cantumkan kode mata uang jelas (Rp, IDR, USD, $) dan **satuan penyajian** kalau dibulatkan (mis. "dalam jutaan Rupiah" / "in thousands").

### 5.2 Angka negatif / rugi
- **Tanda kurung** `(1.000.000)` adalah konvensi standar akuntansi untuk nilai negatif — **bukan tanda minus** `-1.000.000`. Ini berlaku universal (PSAK & IFRS).
- Kontra-akun (mis. Akumulasi Penyusutan, Retur Penjualan) juga lazim ditulis dalam kurung meski bukan "rugi", karena sifatnya mengurangi saldo akun induknya.

### 5.3 Penulisan di jurnal & buku besar
- Debit ditulis rata kiri (atau kolom kiri), kredit **menjorok ke kanan** — konvensi ini menunjukkan akun mana yang di-debit vs di-kredit tanpa ambigu.
- Akun kredit dalam ayat jurnal gabungan ditulis di **bawah** akun debit, bukan sejajar.

### 5.4 Pembulatan
- Konsisten satu satuan pembulatan di seluruh laporan (jangan campur rupiah penuh di satu bagian, jutaan di bagian lain).
- Materialitas: nilai yang terlalu kecil untuk memengaruhi keputusan pengguna laporan boleh digabung/tidak dirinci — tapi kebijakan pembulatan harus diungkap di CaLK.

### 5.5 Tanda kutip akun & referensi
- Nomor akun & nomor PSAK ditulis tanpa titik ribuan (PSAK 109, bukan PSAK 1.09) — beda konteks dari penulisan nilai uang.

---

## 6. Yang Sering "Missing" dari Daftar Belajar Akuntansi Pemula

Kalau tujuanmu belajar fundamental, ini yang biasanya kelewat padahal penting:

- **Persamaan akuntansi dasar**: Aset = Liabilitas + Ekuitas (fondasi semua pencatatan double-entry).
- **Basis akrual vs basis kas** — PSAK mewajibkan akrual, tapi SAK EMKM boleh basis kas modifikasian.
- **Rasio keuangan dasar** untuk membaca laporan (likuiditas, solvabilitas, profitabilitas) — laporan keuangan tanpa analisis rasio kurang berguna untuk pengambilan keputusan bisnis.
- **Perbedaan laporan keuangan vs laporan pajak (SPT)** — sering disamakan padahal beda basis (ada "koreksi fiskal").
- **Audit trail & internal control** — relevan banget untuk konteks dev karena ini soal desain sistem, bukan cuma pembukuan.
- **XBRL / taksonomi pelaporan digital** — OJK mewajibkan pelaporan elektronik berbasis taksonomi untuk emiten; relevan kalau nanti bikin tools terkait pelaporan keuangan.
- **ESG / Sustainability Reporting** — makin terhubung dengan laporan keuangan (IFRS S1/S2, DSAK mulai membahas "suplemen-komplemen" laporan keberlanjutan sejak 2025). Ini tren yang akan makin relevan ke depan.

---

## Sumber Rujukan
- Ikatan Akuntan Indonesia (IAI) — web.iaiglobal.or.id (SAK Efektif, DSAK Terkini, Penomoran PSAK/ISAK)
- IFRS Foundation — ifrs.org
- Update PSAK 2026, Susilo & Rekan
