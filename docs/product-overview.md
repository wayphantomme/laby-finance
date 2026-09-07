# Product Overview — Laby

> Laby adalah aplikasi laporan keuangan pribadi yang memperlakukan uangmu seperti laporan keuangan perusahaan: ada nomor akun, jurnal, dan tiga laporan utama, tapi dikemas sederhana untuk satu orang.

---

## 1. Visi & Posisi Produk

**Nama:** Laby
**Tagline:** Personal financial statements, done properly
**Bahasa:** Indonesia dan Inggris (toggle)
**Target pengguna:** Freelancer, pemilik usaha kecil, profesional muda yang ingin kelola keuangan pribadi dengan serius, bukan sekadar catatan pemasukan/pengeluaran.

### Apa yang membedakan Laby dari aplikasi keuangan biasa?

| Fitur | Aplikasi catatan biasa | Laby |
|---|---|---|
| Pencatatan | Single-entry (pemasukan/pengeluaran) | Double-entry bookkeeping |
| Laporan | Ringkasan pengeluaran per kategori | Laba rugi, neraca, arus kas standar akuntansi |
| Input data | Manual form | Manual + screenshot AI + chat natural language |
| Audit trail | Tidak ada | Setiap perubahan tercatat lengkap |
| Pajak | Tidak ada | Rekapitulasi penghasilan siap SPT |
| Standar | Tidak ada | Konsisten dengan konvensi akuntansi Indonesia |

---

## 2. Fitur Lengkap

### 2.1 Autentikasi
- Daftar via email dan password (password di-hash dengan bcrypt)
- Login dengan session aman (JWT di cookie httpOnly)
- Struktur database mendukung multi-user sejak awal (`user_id` di semua tabel), meski UI saat ini single-user
- Rencana: 2FA (TOTP) di Fase 5

### 2.2 Pencatatan Transaksi

**Input Manual**
- Form sederhana: tanggal, nominal, deskripsi, akun, tipe transaksi
- Di balik layar, sistem otomatis membuat journal entry double-entry yang benar
- User tidak perlu tahu konsep debit/kredit untuk input transaksi harian

**Input via Screenshot AI**
- Upload gambar mutasi bank, e-wallet, atau struk
- Gemini membaca gambar dan mengekstrak: tanggal, nominal, deskripsi, arah transaksi
- AI menyarankan kode akun yang tepat
- Semua hasil AI tampil sebagai draft untuk dikonfirmasi user sebelum disimpan
- Tidak ada auto-commit — user selalu punya kendali penuh

**Input via Chat AI**
- Ketik deskripsi natural: "kemarin belanja bulanan 450rb pakai debit BCA"
- AI parse menjadi entri jurnal terstruktur
- Mendukung bahasa Indonesia dan Inggris, termasuk singkatan angka (450rb, 1.5jt)
- Hasil tampil sebagai preview konfirmasi sebelum masuk database

**Transfer Antar Akun**
- Catat perpindahan dana antar rekening/e-wallet
- Otomatis membuat dua journal line: debit akun tujuan, kredit akun sumber

### 2.3 Bagan Akun (Chart of Accounts)
- 62 akun bawaan sesuai konvensi akuntansi Indonesia
- Terstruktur: Aset (1-xxx), Liabilitas (2-xxx), Ekuitas (3-xxx), Pendapatan (4-xxx), Beban (5-xxx, 6-xxx)
- User bisa tambah sub-akun untuk kebutuhan spesifik
- Detail bagan akun lihat [Accounting Fundamentals](./accounting-fundamentals.md)

### 2.4 Laporan Keuangan
- **Laporan Laba Rugi** — pendapatan vs beban per bulan, kumulatif 12 bulan, total tahunan
- **Neraca (Balance Sheet)** — snapshot aset, liabilitas, dan ekuitas per akhir bulan
- **Laporan Arus Kas** — dikelompokkan: aktivitas operasional, investasi, pendanaan
- Semua laporan bisa difilter per tahun, tampil dalam format 12 kolom bulan + kolom Total
- Grafik tren: net worth over time, income vs expense per bulan
- Rencana: ekspor ke PDF dan CSV

### 2.5 Dashboard
- Net worth (total aset dikurangi liabilitas)
- Cash flow bulan ini (pendapatan vs pengeluaran)
- Top kategori pengeluaran
- Grafik tren bulanan dengan animasi transisi

### 2.6 Histori & Audit Log
- Setiap create/update/delete transaksi tercatat: waktu, sumber (manual/screenshot AI/chat AI), nilai sebelum dan sesudah
- Filter per bulan, per sumber
- Halaman Activity History dengan tampilan timeline
- Data tidak pernah benar-benar dihapus (soft delete) untuk menjaga integritas audit

### 2.7 AI Assistant
- Chat bebas: "berapa total pengeluaran makan bulan ini?" — dijawab dari data asli database, bukan dikarang
- Histori chat disimpan per sesi, bisa dihapus per sesi
- Semua output AI: tanpa emoji, tanpa em dash, ringkas dan faktual

### 2.8 Portofolio Investasi (Fase 4)
- Daftar aset: saham, crypto, reksadana, emas
- Harga beli, jumlah unit, harga sekarang
- Unrealized gain/loss otomatis, masuk ke neraca sebagai aset
- Saat dijual: realized gain/loss otomatis tercatat sebagai pendapatan

### 2.9 Fitur Pajak (Fase 6)
- Rekapitulasi penghasilan per tahun pajak (lokal vs luar negeri)
- Export summary siap untuk pengisian SPT Tahunan Formulir 1770
- Kalkulasi estimasi PPh Final 0,5% dari omzet bruto per bulan
- Dashboard kepatuhan: indikator bulan mana sudah setor, mana belum
- Catatan: fitur ini membantu estimasi, bukan pengganti konsultasi pajak

---

## 3. Keputusan Desain Penting

### Double-entry di backend, single-entry di UI
User input lewat form sederhana (pilih kategori, masukkan nominal). Sistem yang otomatis buat pasangan jurnal yang sesuai. Ini memastikan neraca selalu balance dan laporan keuangan akurat, tanpa membebani user dengan konsep debit/kredit.

### Base currency IDR
Semua nilai disimpan dalam sen IDR sebagai integer (bukan float) untuk menghindari masalah presisi floating-point. 1 IDR = 100 sen. Konversi di layer tampilan via `senToIdr()`.

### Amounts sebagai integer (sen)
`Rp1.450.000` disimpan sebagai `145000000` di database. Ini standar industri untuk sistem keuangan — menghindari rounding error pada operasi aritmatika.

### Semua laporan dihitung real-time dari journal lines
Tidak ada tabel laporan tersendiri. Laporan laba rugi, neraca, dan arus kas selalu dihitung saat dipanggil dari agregasi `journal_lines`. Ini memastikan laporan selalu konsisten dengan data mentah.

### AI wajib lewat konfirmasi user
Tidak ada fitur AI yang auto-commit ke database. Setiap hasil parsing AI berstatus `DRAFT` hingga user eksplisit mengkonfirmasi. Ini prinsip tidak dapat dikompromikan untuk menjaga integritas data keuangan.

---

## 4. Bagan Akun (Ringkasan)

| Kode | Kategori | Saldo Normal |
|---|---|---|
| 1-xxx | Aset | Debit |
| 2-xxx | Liabilitas | Kredit |
| 3-xxx | Ekuitas | Kredit |
| 4-xxx | Pendapatan | Kredit |
| 5-xxx | Beban Pokok Hidup | Debit |
| 6-xxx | Beban Operasional | Debit |

Lihat [Accounting Fundamentals](./accounting-fundamentals.md) untuk daftar lengkap 62 akun bawaan.

---

## 5. Roadmap

### Fase 1 — Fondasi (Selesai)
Auth, chart of accounts 62 akun, input manual transaksi double-entry, dashboard ringkasan.

### Fase 2 — Laporan (Selesai)
Laporan laba rugi, neraca, arus kas per bulan + total tahunan. Grafik tren, tampilan 12 kolom.

### Fase 3 — AI (Selesai)
Upload screenshot dengan ekstraksi Gemini. Chat assistant untuk input dan tanya-jawab data. Audit log lengkap dengan sumber transaksi.

### Fase 4 — Portofolio & Otomasi (Planned)
- Modul investasi: saham, crypto, reksadana, emas
- Unrealized/realized gain/loss
- Recurring transactions (gaji, langganan, cicilan)
- Budget vs realisasi per kategori
- Notifikasi/reminder input akhir bulan

### Fase 5 — Polish (Planned)
- i18n penuh EN/ID
- Dark mode
- Mobile PWA
- 2FA (TOTP)
- Ekspor laporan ke PDF dan CSV
- Backup/restore database

### Fase 6 — Pajak & Kepatuhan (Planned)
- Rekapitulasi penghasilan format SPT 1770
- PPh Final 0,5% — kalkulasi & reminder setor bulanan
- Dashboard kepatuhan pajak per bulan
- Lihat [Pajak & SPT](./pajak-dan-spt.md) untuk konteks lengkap

---

## 6. Filosofi UI

- Tidak ada emoji di seluruh antarmuka
- Tidak ada em dash; gunakan koma atau kalimat baru
- Bahasa laporan formal tapi ringkas, gaya laporan akuntansi
- Warna merah sebagai aksen utama (primary: `#DC2626`)
- Merah untuk nilai negatif/defisit, hijau untuk surplus — sesuai konvensi akuntansi
- Maskot babi tabungan (piggy bank) muncul di halaman kosong, loading, dan sukses submit
- Mobile-first, responsive

---

## Referensi Terkait
- [User Guide](./user-guide.md) — cara pakai setiap fitur
- [Accounting Fundamentals](./accounting-fundamentals.md) — konsep akuntansi di balik Laby
- [Technology](./technology.md) — detail implementasi teknis
- [Laby Planning](./laby-planning.md) — spesifikasi produk lengkap (dokumen asli)
