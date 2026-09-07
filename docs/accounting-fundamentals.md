# Accounting Fundamentals — Konsep Akuntansi di Laby

Panduan konsep akuntansi yang dipakai Laby, mulai dari yang paling dasar sampai hal-hal yang sering terlewat. Tidak perlu latar belakang akuntansi — dokumen ini ditulis untuk pembaca baru sekalipun.

---

## 1. Persamaan Akuntansi Dasar

Semua akuntansi double-entry berdiri di atas satu persamaan:

```
Aset = Liabilitas + Ekuitas
```

**Aset** — semua yang kamu miliki: uang di rekening, barang, investasi
**Liabilitas** — semua yang kamu hutang: kartu kredit, pinjaman, cicilan
**Ekuitas** — selisihnya = kekayaan bersih (net worth) kamu

Persamaan ini harus selalu balance. Setiap transaksi selalu mempengaruhi minimal dua sisi — itulah inti double-entry bookkeeping.

**Contoh:**
- Terima gaji Rp10.000.000 → Aset (kas) naik Rp10jt, Ekuitas (pendapatan) naik Rp10jt. Balance tetap.
- Bayar cicilan KPR Rp3.000.000 → Aset (kas) turun Rp3jt, Liabilitas (utang KPR) turun Rp3jt. Balance tetap.
- Beli laptop Rp15.000.000 tunai → Aset (laptop) naik Rp15jt, Aset (kas) turun Rp15jt. Totale aset tetap sama.

---

## 2. Double-Entry Bookkeeping

### Kenapa double-entry, bukan single-entry?

Single-entry = catatan pemasukan dan pengeluaran seperti buku kas. Simpel tapi tidak bisa menghasilkan neraca yang akurat.

Double-entry = setiap transaksi dicatat di dua akun sekaligus (debit di satu akun, kredit di akun lain). Lebih kompleks di belakang layar, tapi menghasilkan laporan keuangan yang lengkap dan selalu balance.

Laby menggunakan double-entry di backend. Tapi kamu tidak perlu tahu tentang debit/kredit untuk input transaksi — form Laby mengabstraksi ini.

### Aturan Debit dan Kredit

| Tipe Akun | Debit | Kredit |
|---|---|---|
| Aset | Naik | Turun |
| Liabilitas | Turun | Naik |
| Ekuitas | Turun | Naik |
| Pendapatan | Turun | Naik |
| Beban | Naik | Turun |

**Cara mudah ingat:** Aset dan Beban naik dengan Debit. Liabilitas, Ekuitas, dan Pendapatan naik dengan Kredit.

### Contoh Journal Entry

**Transaksi:** Terima freelance Rp5.000.000 ke rekening BCA

```
DEBIT  1-102 Bank BCA           Rp5.000.000
KREDIT 4-102 Pendapatan Freelance             Rp5.000.000
```

**Transaksi:** Bayar langganan Netflix Rp55.000 dari OVO

```
DEBIT  5-203 Langganan (Beban)   Rp55.000
KREDIT 1-103 OVO (Aset)                       Rp55.000
```

Di Laby, kamu cukup memilih: "Pengeluaran, Rp55.000, akun Langganan, dari OVO". Sistem yang menulis jurnal di atas secara otomatis.

---

## 3. Lima Tipe Akun

### 3.1 Aset (Assets) — kode 1-xxx
Semua yang kamu miliki dan punya nilai ekonomi.

- **Aset Lancar** — mudah diuangkan: kas tunai, rekening bank, e-wallet, piutang
- **Aset Investasi** — untuk tujuan investasi: saham, crypto, reksadana, emas, obligasi
- **Aset Tetap** — dipakai jangka panjang: kendaraan, laptop, furnitur
- **Aset Lain** — uang muka, deposit, dan lain-lain

Saldo normal aset: **Debit** (bertambah dengan debit).

### 3.2 Liabilitas (Liabilities) — kode 2-xxx
Semua kewajiban finansial yang harus dibayar di masa depan.

- **Liabilitas Lancar** — jatuh tempo dalam 12 bulan: tagihan kartu kredit, utang jangka pendek
- **Liabilitas Jangka Panjang** — cicilan KPR, pinjaman tenor panjang

Saldo normal liabilitas: **Kredit** (bertambah dengan kredit).

### 3.3 Ekuitas (Equity) — kode 3-xxx
Kekayaan bersih — selisih aset dikurangi liabilitas.

Di konteks keuangan pribadi, ekuitas = net worth kamu. Naik kalau pendapatan lebih besar dari pengeluaran dan liabilitas tidak bertambah.

Saldo normal ekuitas: **Kredit**.

### 3.4 Pendapatan (Revenue/Income) — kode 4-xxx
Semua aliran masuk uang sebagai penghasilan.

- Gaji, honorarium
- Penghasilan freelance, project
- Dividen, bunga deposito
- Realized gain dari investasi
- Hadiah, grant, bonus

Saldo normal pendapatan: **Kredit**.

### 3.5 Beban (Expense) — kode 5-xxx dan 6-xxx
Semua pengeluaran untuk membiayai kehidupan dan pekerjaan.

- **5-xxx Beban Pokok Hidup** — kebutuhan pribadi: makan, transport, sewa, utilitas, kesehatan, hiburan
- **6-xxx Beban Operasional** — biaya pekerjaan/usaha: software, peralatan, internet, beban finansial, pajak

Saldo normal beban: **Debit**.

---

## 4. Bagan Akun Laby (Chart of Accounts)

62 akun bawaan yang otomatis tersedia saat daftar. Format kode: `X-YYY` (tipe-nomor), sub-akun: `X-YYY.Z`.

### Aset (1-xxx)

| Kode | Nama | Keterangan |
|---|---|---|
| 1-000 | Assets (Aset) | Akun induk |
| 1-100 | Current Assets (Aset Lancar) | Induk |
| 1-101 | Cash on Hand (Kas Tunai) | Uang fisik di tangan |
| 1-102 | Bank Account (Rekening Bank) | Semua rekening bank |
| 1-103 | E-Wallet | GoPay, OVO, Dana, dll |
| 1-104 | Savings Account (Tabungan) | Tabungan berjangka |
| 1-110 | Accounts Receivable (Piutang) | Tagihan yang belum dibayar klien |
| 1-120 | Prepaid Expenses (Uang Muka) | Deposit, DP yang belum terpakai |
| 1-200 | Investment Assets (Aset Investasi) | Induk |
| 1-201 | Stocks (Saham) | Saham lokal/asing |
| 1-202 | Crypto Assets | Bitcoin, Ethereum, dll |
| 1-203 | Mutual Funds (Reksadana) | |
| 1-204 | Bonds (Obligasi/SBN) | ORI, SBR, Sukuk |
| 1-205 | Gold (Emas) | Emas fisik/digital |
| 1-300 | Fixed Assets (Aset Tetap) | Induk |
| 1-301 | Vehicles (Kendaraan) | Motor, mobil |
| 1-302 | Electronics (Elektronik) | Laptop, HP, kamera |
| 1-303 | Property | Properti/real estate |
| 1-390 | Accumulated Depreciation (Akumulasi Penyusutan) | Kontra-aset, saldo kredit |

### Liabilitas (2-xxx)

| Kode | Nama | Keterangan |
|---|---|---|
| 2-000 | Liabilities (Liabilitas) | Akun induk |
| 2-100 | Current Liabilities (Liabilitas Lancar) | Induk |
| 2-101 | Credit Card (Kartu Kredit) | Tagihan kartu kredit |
| 2-102 | Short-term Debt (Utang Jangka Pendek) | Pinjol, utang teman |
| 2-103 | Accounts Payable (Utang Usaha) | Tagihan yang belum dibayar ke vendor |
| 2-200 | Long-term Liabilities | Induk |
| 2-201 | Mortgage (KPR) | Cicilan rumah |
| 2-202 | Vehicle Loan (Kredit Kendaraan) | Cicilan motor/mobil |
| 2-203 | Long-term Loan (Pinjaman Jangka Panjang) | Pinjaman tenor > 1 tahun |

### Ekuitas (3-xxx)

| Kode | Nama | Keterangan |
|---|---|---|
| 3-000 | Equity (Ekuitas) | Akun induk |
| 3-100 | Opening Balance (Modal Awal) | Saldo awal saat pertama setup |
| 3-200 | Retained Earnings (Laba Ditahan) | Akumulasi surplus/defisit |

### Pendapatan (4-xxx)

| Kode | Nama | Keterangan |
|---|---|---|
| 4-000 | Income (Pendapatan) | Akun induk |
| 4-100 | Operating Income | Induk pendapatan utama |
| 4-101 | Salary (Gaji) | Gaji/upah bulanan |
| 4-102 | Freelance/Project | Penghasilan proyek, honorarium |
| 4-103 | Business Income | Penghasilan usaha |
| 4-200 | Investment Income | Induk |
| 4-201 | Dividends (Dividen) | Dividen saham |
| 4-202 | Interest Income (Bunga) | Bunga deposito, obligasi |
| 4-203 | Realized Capital Gain | Keuntungan jual investasi |
| 4-300 | Other Income (Pendapatan Lain) | Induk |
| 4-301 | Prize/Grant (Hadiah/Grant) | Kompetisi, beasiswa, grant |
| 4-302 | Miscellaneous Income | Penjualan barang bekas, cashback, dll |

### Beban Pokok Hidup (5-xxx)

| Kode | Nama | Keterangan |
|---|---|---|
| 5-000 | Living Expenses | Akun induk |
| 5-100 | Basic Needs (Kebutuhan Dasar) | Induk |
| 5-101 | Food & Beverages (Makan & Minum) | Groceries, makan di luar |
| 5-102 | Transportation (Transport) | BBM, ojol, parkir, tol |
| 5-103 | Housing/Rent (Tempat Tinggal) | Sewa, kontrakan, kos |
| 5-104 | Utilities (Utilitas) | Listrik, air, gas |
| 5-105 | Healthcare (Kesehatan) | Dokter, obat, BPJS |
| 5-200 | Lifestyle (Gaya Hidup) | Induk |
| 5-201 | Entertainment (Hiburan) | Bioskop, konser, game |
| 5-202 | Shopping (Belanja) | Pakaian, barang rumah tangga |
| 5-203 | Subscriptions (Langganan) | Netflix, Spotify, iCloud |
| 5-204 | Education (Pendidikan) | Kursus, buku, seminar |
| 5-205 | Personal Care | Salon, gym, perawatan |

### Beban Operasional (6-xxx)

| Kode | Nama | Keterangan |
|---|---|---|
| 6-000 | Operating Expenses | Akun induk |
| 6-100 | Work & Business Expenses | Induk |
| 6-101 | Software & Subscriptions | Tools kerja: Figma, Notion, hosting |
| 6-102 | Equipment (Peralatan) | Peralatan kerja yang langsung dibebankan |
| 6-103 | Internet & Communication | Internet, HP, telepon |
| 6-104 | Professional Services | Jasa akuntan, konsultan, notaris |
| 6-200 | Financial Expenses | Induk |
| 6-201 | Loan Interest (Bunga Utang) | Bunga KPR, pinjaman |
| 6-202 | Bank Admin Fees | Biaya admin bank, transfer |
| 6-300 | Tax Expenses (Beban Pajak) | Induk |
| 6-301 | PPh Final UMKM 0,5% | Setoran PPh Final bulanan |
| 6-302 | Income Tax PPh OP | PPh kurang bayar dari SPT |

---

## 5. Siklus Akuntansi

Ini alur lengkap dari transaksi sampai laporan keuangan:

```
1. Transaksi terjadi (bukti: struk, invoice, mutasi bank)
         ↓
2. Input ke Laby (manual / screenshot / chat)
         ↓
3. Jurnal umum dibuat otomatis (journal_entries + journal_lines)
         ↓
4. Posting ke buku besar (dikelompokkan per akun)
         ↓
5. Neraca saldo (trial balance) — semua debit = semua kredit
         ↓
6. Jurnal penyesuaian (jika ada: penyusutan, akrual)
         ↓
7. Laporan keuangan digenerate:
   - Laba Rugi
   - Neraca
   - Arus Kas
         ↓
8. Akhir tahun: jurnal penutup (akun pendapatan/beban direset ke nol)
```

Di Laby, langkah 2-5 terjadi otomatis. Langkah 6 (penyesuaian manual seperti penyusutan aset) masih perlu diinput manual untuk saat ini.

---

## 6. Basis Akrual vs Basis Kas

### Basis Kas
Transaksi dicatat saat uang benar-benar berpindah tangan. Simpel, tapi bisa menyesatkan.

*Contoh:* Kamu kirim invoice Rp10jt ke klien bulan Januari, tapi dibayar bulan Maret. Di basis kas, pendapatan baru tercatat di Maret.

### Basis Akrual
Transaksi dicatat saat hak/kewajiban timbul, bukan saat uang berpindah. Lebih akurat untuk gambaran keuangan sebenarnya.

*Contoh:* Invoice Rp10jt dikirim Januari → dicatat sebagai pendapatan Januari + piutang. Saat dibayar Maret → piutang berubah jadi kas.

**Laby menggunakan pendekatan campuran:** default basis kas untuk kemudahan, tapi mendukung pencatatan piutang/utang untuk mendekati akrual kalau kamu mau lebih akurat.

---

## 7. Penyusutan Aset (Depreciation)

Aset fisik seperti laptop, kendaraan, dan peralatan nilainya berkurang seiring waktu. Penyusutan adalah beban yang diakui setiap periode untuk mencerminkan penurunan nilai ini.

**Metode paling sederhana — Garis Lurus (Straight-Line):**

```
Beban Penyusutan per tahun = (Harga Beli - Nilai Sisa) / Umur Ekonomis
```

**Contoh:**
- Laptop dibeli Rp15.000.000
- Nilai sisa setelah 4 tahun: Rp3.000.000
- Umur ekonomis: 4 tahun
- Beban penyusutan per tahun = (15jt - 3jt) / 4 = Rp3.000.000/tahun = Rp250.000/bulan

**Journal entry penyusutan bulanan:**
```
DEBIT  6-102 Beban Peralatan    Rp250.000
KREDIT 1-390 Akumulasi Penyusutan             Rp250.000
```

Di Laby, kamu bisa input jurnal penyusutan ini sebagai transaksi manual bulanan.

---

## 8. Rekonsiliasi

Rekonsiliasi = mencocokkan saldo di Laby dengan saldo riil di rekening/e-wallet.

**Kapan perlu dilakukan:**
- Setiap akhir bulan, idealnya
- Sebelum membaca laporan keuangan bulanan

**Cara rekonsiliasi:**
1. Cek saldo akun di Laby (misal: 1-102 Bank BCA)
2. Bandingkan dengan saldo di aplikasi/buku rekening bank
3. Kalau ada selisih, cari transaksi yang mungkin belum diinput

**Selisih umum yang sering terjadi:**
- Biaya admin bank yang terlupa diinput
- Bunga tabungan yang belum dicatat
- Transaksi refund/pengembalian yang terlewat
- Angka transaksi yang salah input

---

## 9. Rasio Keuangan Dasar

Angka laporan keuangan lebih berarti kalau dibaca dengan rasio. Beberapa rasio sederhana yang berguna untuk keuangan pribadi:

### Savings Rate (Tingkat Tabungan)
```
Savings Rate = (Pendapatan - Total Pengeluaran) / Pendapatan × 100%
```
Target sehat: minimal 20%. Di atas 30% sangat baik.

### Debt-to-Asset Ratio (Rasio Utang terhadap Aset)
```
Debt-to-Asset = Total Liabilitas / Total Aset × 100%
```
Semakin rendah semakin baik. Di atas 50% mulai perlu perhatian.

### Emergency Fund Ratio
```
Emergency Fund = Kas & Setara Kas / Pengeluaran Bulanan Rata-rata
```
Target standar: 3-6 bulan pengeluaran dalam bentuk aset likuid.

### Investment Rate
```
Investment Rate = Pengeluaran untuk Investasi / Pendapatan × 100%
```
Berapa persen pendapatan yang aktif diinvestasikan setiap bulan.

---

## 10. Kesalahan Umum yang Perlu Dihindari

**Input di akun yang salah**
Membeli software untuk kerja (6-101) vs berlangganan Netflix (5-203) — kelihatannya sama-sama "langganan" tapi berbeda kategori. Kategori yang benar penting untuk laporan pajak dan analisis pengeluaran.

**Tidak membuat akun per rekening**
Kalau punya 3 rekening bank dan semuanya dimasukkan ke satu akun "Bank", laporan arus kas tidak bisa menunjukkan perpindahan dana antar rekening. Buat sub-akun per rekening.

**Lupa catat biaya admin bank**
Biaya admin, biaya transfer, biaya kartu kredit adalah pengeluaran nyata. Masuk ke akun 6-202 (Bank Admin Fees).

**Tidak catat pendapatan non-kas**
Dividen, bunga deposito, cashback — sering dilupakan karena "langsung masuk rekening sendiri". Tetap perlu dicatat sebagai pendapatan.

**Mencatat cicilan sebagai pengeluaran penuh**
Bayar cicilan KPR Rp5jt/bulan bukan berarti pengeluaran Rp5jt. Yang benar: sebagian adalah cicilan pokok (mengurangi liabilitas, bukan beban), sebagian bunga (beban nyata). Pisahkan keduanya untuk neraca yang akurat.

---

## Referensi Terkait
- [Laporan Keuangan](./laporan-keuangan.md) — cara membaca laporan yang dihasilkan Laby
- [Standar Akuntansi](./standar-akuntansi.md) — SAK, PSAK, dan standar formal Indonesia
- [Product Overview](./product-overview.md) — bagaimana konsep ini diterapkan di Laby
- [Standar Akuntansi Referensi](./standar-akuntansi-referensi.md) — dokumen referensi mendalam
