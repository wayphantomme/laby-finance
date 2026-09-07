# User Guide — Laby

Panduan lengkap untuk pengguna Laby: dari daftar akun pertama kali sampai membaca laporan keuangan bulanan.

> Tidak perlu tahu akuntansi dulu. Laby dirancang supaya input terasa seperti aplikasi catatan biasa, tapi menghasilkan laporan keuangan yang benar di balik layar.

---

## 1. Mulai: Daftar & Login

### Daftar akun
1. Buka Laby di browser (atau install sebagai PWA di HP)
2. Klik **Register** di halaman utama
3. Isi email dan password (minimal 8 karakter)
4. Klik **Daftar** — kamu langsung masuk ke dashboard

### Login
1. Buka halaman Login
2. Masukkan email dan password
3. Session tersimpan di browser, tidak perlu login ulang kecuali logout atau session expired

### Lupa password
Fitur reset password via email tersedia di halaman Login. Klik "Lupa password?" dan ikuti instruksi di email.

---

## 2. Orientasi Dashboard

Saat pertama masuk, dashboard menampilkan:

- **Net Worth** — total aset dikurangi total liabilitas (kekayaan bersih saat ini)
- **Cash Flow Bulan Ini** — selisih pendapatan vs pengeluaran bulan berjalan
- **Top Pengeluaran** — kategori dengan pengeluaran terbesar bulan ini
- **Grafik Tren** — pergerakan net worth dari bulan ke bulan

Semua angka di dashboard otomatis ter-update setiap kali kamu input transaksi baru.

---

## 3. Input Transaksi

Ada tiga cara input transaksi. Pilih yang paling nyaman.

### 3.1 Input Manual

Cocok untuk transaksi tunggal yang kamu input saat itu juga.

1. Klik tombol **+ Transaksi** (tersedia di mana saja via navbar atau shortcut)
2. Isi form:
   - **Tanggal** — default hari ini, bisa diganti
   - **Tipe** — pilih Pendapatan, Pengeluaran, atau Transfer
   - **Nominal** — masukkan angka dalam Rupiah (contoh: 450000)
   - **Akun** — pilih akun yang sesuai (contoh: 5-101 Makanan & Minuman)
   - **Akun Kas** — pilih rekening/e-wallet yang dipakai (contoh: 1-102 Bank BCA)
   - **Deskripsi** — opsional, tapi membantu saat audit nanti
3. Klik **Simpan**

Sistem otomatis membuat jurnal double-entry yang benar di balik layar. Kamu tidak perlu input debit/kredit manual.

**Tips:**
- Untuk transaksi pengeluaran rutin, coba biasakan input setiap hari atau setiap minggu — jangan menumpuk di akhir bulan.
- Gunakan field Deskripsi untuk catat detail penting: nama toko, nomor invoice, nama klien.

### 3.2 Input via Screenshot

Cocok untuk batch input dari mutasi bank atau riwayat transaksi e-wallet.

1. Buka menu **AI** atau klik ikon kamera di form transaksi
2. Upload screenshot:
   - Mutasi rekening bank (BCA, Mandiri, BRI, dll)
   - Riwayat transaksi GoPay, OVO, Dana, ShopeePay
   - Struk belanja atau nota pembayaran
3. Tunggu Gemini memproses gambar (biasanya 2-5 detik)
4. Periksa hasil ekstraksi yang muncul sebagai tabel draft:
   - Cek tanggal, nominal, deskripsi
   - Sesuaikan saran akun jika AI salah tebak
   - Hapus baris yang tidak relevan
5. Klik **Konfirmasi Semua** atau konfirmasi satu per satu

**Catatan penting:**
- AI tidak selalu 100% akurat. Selalu periksa sebelum konfirmasi.
- Baris dengan confidence < 70% akan ditandai kuning — artinya AI kurang yakin, periksa lebih teliti.
- Field yang kosong (AI tidak bisa baca) perlu kamu isi manual sebelum bisa disimpan.
- Satu screenshot bisa menghasilkan banyak transaksi sekaligus.

**Format screenshot yang baik:**
- Resolusi cukup jelas, angka terbaca
- Tabel mutasi terlihat lengkap (tidak terpotong)
- Bila ada beberapa halaman, upload satu per satu

### 3.3 Input via Chat

Cocok untuk input cepat dari memori atau saat mengetik lebih mudah dari upload gambar.

1. Buka menu **AI** lalu pilih tab **Chat**
2. Ketik deskripsi transaksi dalam bahasa natural:
   - "Kemarin bayar makan siang 75rb"
   - "Terima transfer dari klien 3.5jt kemarin"
   - "Tadi pagi bayar listrik 285000"
   - "Beli domain Namecheap $12 hari ini"
3. AI akan menampilkan preview transaksi yang diparsing:
   - Tanggal (diselesaikan dari "kemarin", "tadi", dll)
   - Nominal (diparsing dari "75rb", "3.5jt", dll)
   - Saran akun
4. Konfirmasi atau edit sebelum disimpan

**Singkatan yang dimengerti AI:**
| Singkatan | Artinya |
|---|---|
| 75rb / 75k | Rp75.000 |
| 1.5jt | Rp1.500.000 |
| 3jt | Rp3.000.000 |
| 500rb | Rp500.000 |
| kemarin | hari sebelum hari ini |
| tadi / tadi pagi/siang | hari ini |
| minggu lalu | 7 hari lalu |

**Tips:**
- Bisa input beberapa transaksi dalam satu pesan: "Hari ini bayar listrik 285rb dan beli kopi 32rb"
- AI mengerti Indonesia dan Inggris, campur pun tidak masalah
- Kalau AI meminta klarifikasi, jawab di pesan berikutnya

---

## 4. Mengelola Akun (Chart of Accounts)

Bagan akun adalah daftar semua rekening, kategori pengeluaran, dan sumber pendapatan yang kamu punya.

### Melihat daftar akun
Buka menu **Accounts** di sidebar. Akun dikelompokkan berdasarkan tipe:
- Aset: rekening bank, e-wallet, kas tunai, investasi
- Liabilitas: kartu kredit, pinjaman, cicilan
- Ekuitas: modal/net worth
- Pendapatan: gaji, freelance, investasi
- Beban: semua kategori pengeluaran

### Akun bawaan (seed)
Saat daftar, akun bawaan otomatis tersedia — 62 akun mengikuti konvensi akuntansi Indonesia. Kamu tidak perlu setup dari nol.

### Tambah akun baru
1. Klik **+ Tambah Akun** di halaman Accounts
2. Isi kode akun (format X-YYY atau X-YYY.Z untuk sub-akun)
3. Isi nama akun
4. Pilih tipe (Asset/Liability/Equity/Income/Expense)
5. Pilih akun induk jika ini sub-akun
6. Klik **Simpan**

**Contoh akun yang mungkin perlu kamu tambah:**
- `1-102.1` — Bank BCA (sub-akun dari Bank)
- `1-102.2` — Bank Mandiri
- `1-103.1` — GoPay
- `1-103.2` — OVO
- `4-102.1` — Freelance Project A
- `5-101.1` — Makan Siang Kerja

### Nonaktifkan akun
Akun yang tidak lagi dipakai bisa dinonaktifkan (bukan dihapus) supaya tidak muncul di dropdown form transaksi, tapi historinya tetap tersimpan.

---

## 5. Membaca Laporan Keuangan

Laporan keuangan tersedia di menu **Reports**. Ada tiga laporan utama.

### 5.1 Laporan Laba Rugi

**Apa yang ditampilkan:** Selisih pendapatan dan pengeluaran per bulan.

**Cara membaca:**
- Baris atas: semua pendapatan (gaji, freelance, dividen, dll)
- Baris tengah: semua beban (makan, transport, langganan, dll)
- Baris bawah: **Surplus/Defisit** = Pendapatan dikurangi Beban
- Kolom kanan: **Total** = akumulasi 12 bulan tahun berjalan
- Angka dalam kurung `(xxx)` = nilai negatif

**Sinyal yang perlu diperhatikan:**
- Bulan dengan defisit (pengeluaran > pendapatan) — perlu ditelusuri kategori mana yang membengkak
- Tren pendapatan: apakah meningkat, stabil, atau turun dari bulan ke bulan?
- Bulan dengan pengeluaran anomali — mungkin ada pembelian besar satu kali

### 5.2 Neraca (Balance Sheet)

**Apa yang ditampilkan:** Snapshot kekayaan bersih per akhir bulan — aset, utang, dan selisihnya.

**Cara membaca:**
- **Aset** = semua yang kamu miliki (rekening bank, e-wallet, investasi, aset fisik)
- **Liabilitas** = semua yang kamu hutang (kartu kredit, pinjaman, cicilan)
- **Ekuitas = Aset dikurangi Liabilitas** — ini net worth kamu
- Neraca harus selalu balance: Total Aset = Total Liabilitas + Ekuitas

**Sinyal yang perlu diperhatikan:**
- Net worth naik dari bulan ke bulan = tanda keuangan sehat
- Liabilitas bertambah cepat = waspadai apakah karena cicilan produktif atau konsumtif
- Aset investasi bertambah = portofolio tumbuh

### 5.3 Laporan Arus Kas

**Apa yang ditampilkan:** Pergerakan uang tunai dari tiga aktivitas.

**Cara membaca:**
- **Aktivitas Operasional** — arus kas dari kegiatan sehari-hari (gaji masuk, pengeluaran rutin)
- **Aktivitas Investasi** — beli/jual aset investasi (saham, crypto, properti)
- **Aktivitas Pendanaan** — pinjam/cicil utang, tambah modal
- Baris bawah: **Kenaikan/Penurunan Kas Bersih** per bulan

**Kenapa laporan ini penting?**
Laba rugi bisa positif tapi kas bisa tetap minus kalau banyak piutang belum dibayar atau investasi besar. Laporan arus kas menunjukkan realitas likuiditas — apakah kamu punya cukup uang tunai bulan ini.

---

## 6. AI Assistant — Tanya Data Keuangan

Selain untuk input transaksi, AI juga bisa menjawab pertanyaan dari data keuangan kamu.

**Contoh pertanyaan yang bisa dijawab:**
- "Berapa total pengeluaran makan bulan ini?"
- "Bulan mana pengeluaran paling besar tahun ini?"
- "Berapa total freelance income kuartal pertama?"
- "Apakah net worth saya naik atau turun bulan ini?"
- "Kategori apa yang paling banyak menguras kas bulan lalu?"

**Cara pakai:**
1. Buka menu **AI** lalu pilih tab **Chat**
2. Ketik pertanyaan seperti biasa
3. AI menjawab berdasarkan data aktual dari database kamu, bukan perkiraan

**Catatan:**
- AI hanya menjawab dari data yang sudah kamu input. Kalau ada periode yang datanya belum lengkap, jawaban AI juga tidak akurat.
- AI tidak bisa mengakses data di luar Laby (saldo rekening real-time, harga saham live, dll)
- Histori chat tersimpan per sesi dan bisa dihapus per sesi dari menu pengaturan chat

---

## 7. Histori & Audit Log

Semua perubahan data tercatat di halaman **History**.

**Yang bisa dilihat:**
- Transaksi baru (manual, screenshot AI, chat AI)
- Edit transaksi yang sudah ada
- Penghapusan transaksi
- Sumber setiap perubahan (dibuat manual, dari screenshot mana, dari sesi chat mana)

**Filter tersedia:**
- Per bulan
- Per sumber (manual / screenshot AI / chat AI)

**Kenapa ini berguna?**
- Cek ulang kalau ada angka aneh di laporan — telusuri dari mana asalnya
- Verifikasi bahwa semua transaksi dari screenshot sudah tercatat dengan benar
- Bukti audit kalau ada pertanyaan tentang data keuanganmu

---

## 8. Tips & Best Practices

### Rutinitas yang disarankan

**Harian (opsional tapi ideal):**
- Input transaksi sehari sebelum tidur atau pagi hari
- Pakai chat AI untuk input cepat dari memori

**Mingguan:**
- Review dashboard — apakah cash flow mingguan sesuai ekspektasi?
- Upload screenshot mutasi bank/e-wallet dari 7 hari terakhir

**Bulanan (wajib):**
- Pastikan semua transaksi bulan berjalan sudah masuk
- Buka laporan laba rugi — cek bulan ini surplus atau defisit
- Bandingkan dengan bulan lalu: kategori mana yang naik, mana yang turun
- Cek neraca: apakah net worth bertambah?

**Tahunan:**
- Export laporan untuk keperluan pajak (Fase 6)
- Review laporan laba rugi setahun penuh
- Evaluasi apakah ada akun yang perlu ditambah/dinonaktifkan

### Jaga akurasi data
- Konfirmasi setiap hasil AI dengan teliti, terutama nominal dan tanggal
- Transaksi yang sudah dikonfirmasi masih bisa diedit, tapi perubahan akan tercatat di audit log
- Kalau ada transaksi yang salah, edit atau hapus — jangan biarkan data salah menumpuk

### Pisahkan pengeluaran bisnis dari pribadi
Kalau kamu freelancer atau punya usaha, buat sub-akun terpisah untuk pengeluaran kerja (6-101 dst) vs pengeluaran pribadi (5-xxx). Ini memudahkan rekapitulasi penghasilan untuk SPT nanti.

### Multi rekening
Buat satu akun untuk setiap rekening bank, e-wallet, atau dompet tunai yang kamu punya. Ini memastikan neraca mencerminkan posisi kas yang akurat di masing-masing rekening.

---

## 9. Pertanyaan Umum (FAQ)

**Q: Apakah data saya aman?**
Data disimpan di database PostgreSQL (Neon) dengan enkripsi koneksi SSL. Password di-hash dengan bcrypt. API key dan kredensial tidak pernah ada di sisi client.

**Q: Apakah AI membaca semua data keuangan saya?**
Hanya data yang relevan untuk menjawab pertanyaan atau memproses gambar yang dikirim ke Gemini. Password, token, dan data sensitif lain tidak pernah dikirim ke AI.

**Q: Apakah saya perlu tahu akuntansi untuk pakai Laby?**
Tidak. Form transaksi dirancang sesederhana mungkin. Tapi kalau ingin lebih memahami angka di laporan keuangan, baca [Accounting Fundamentals](./accounting-fundamentals.md).

**Q: Bisakah saya pakai Laby untuk keuangan bisnis?**
Bisa, dengan catatan Laby saat ini dirancang untuk satu pengguna. Akun bisnis dan pribadi bisa dipisahkan melalui penggunaan kode akun yang konsisten. Untuk bisnis yang lebih formal, pertimbangkan software akuntansi bisnis seperti Accurate atau Jurnal.

**Q: Bagaimana kalau saya punya mata uang asing (USD, dll)?**
Saat ini Laby hanya mendukung IDR sebagai mata uang dasar. Untuk transaksi mata uang asing, masukkan nilai yang sudah dikonversi ke IDR dengan kurs saat transaksi terjadi. Catat kurs di field deskripsi untuk referensi.

**Q: Apakah laporan Laby bisa dipakai untuk laporan pajak?**
Data dari Laby bisa jadi dasar rekapitulasi penghasilan untuk SPT. Fitur ekspor khusus pajak sedang dalam pengembangan (Fase 6). Untuk panduan lengkap, baca [Pajak & SPT](./pajak-dan-spt.md).

---

## Referensi Terkait
- [Product Overview](./product-overview.md) — gambaran besar fitur dan roadmap
- [Accounting Fundamentals](./accounting-fundamentals.md) — konsep akuntansi di balik laporan Laby
- [Laporan Keuangan](./laporan-keuangan.md) — cara membaca laporan secara mendalam
- [Pajak & SPT](./pajak-dan-spt.md) — menggunakan data Laby untuk laporan pajak
