"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  Search,
  BookOpen,
  Users,
  Layers,
  FileText,
  Scale,
  Receipt,
  Code2,
  ChevronRight,
  ChevronDown,
  X,
  ExternalLink,
  Lightbulb,
  AlertTriangle,
  Info,
  CheckCircle2,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Section {
  id: string;
  title: string;
  content: React.ReactNode;
}

interface DocGroup {
  id: string;
  label: string;
  icon: React.ElementType;
  sections: Section[];
}

// ─── Callout helpers ─────────────────────────────────────────────────────────

function Note({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex gap-3 rounded-lg border border-blue-100 bg-blue-50 p-4 text-sm text-blue-800">
      <Info className="mt-0.5 h-4 w-4 shrink-0 text-blue-500" />
      <div>{children}</div>
    </div>
  );
}

function Warning({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex gap-3 rounded-lg border border-amber-100 bg-amber-50 p-4 text-sm text-amber-800">
      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
      <div>{children}</div>
    </div>
  );
}

function Tip({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex gap-3 rounded-lg border border-green-100 bg-green-50 p-4 text-sm text-green-800">
      <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-green-500" />
      <div>{children}</div>
    </div>
  );
}

function Check({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex gap-3 rounded-lg border border-primary-100 bg-primary-50 p-4 text-sm text-primary-800">
      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary-600" />
      <div>{children}</div>
    </div>
  );
}

function H2({ children }: { children: React.ReactNode }) {
  return <h2 className="mt-8 mb-3 text-base font-semibold text-gray-900 first:mt-0">{children}</h2>;
}

function H3({ children }: { children: React.ReactNode }) {
  return <h3 className="mt-5 mb-2 text-sm font-semibold text-gray-800">{children}</h3>;
}

function P({ children }: { children: React.ReactNode }) {
  return <p className="mb-3 text-sm leading-relaxed text-gray-600">{children}</p>;
}

function UL({ children }: { children: React.ReactNode }) {
  return <ul className="mb-3 space-y-1.5 pl-4 text-sm text-gray-600 list-disc list-outside">{children}</ul>;
}

function OL({ children }: { children: React.ReactNode }) {
  return <ol className="mb-3 space-y-1.5 pl-4 text-sm text-gray-600 list-decimal list-outside">{children}</ol>;
}

function Table({ headers, rows }: { headers: string[]; rows: (string | React.ReactNode)[][] }) {
  return (
    <div className="mb-4 overflow-x-auto rounded-lg border border-gray-200">
      <table className="w-full min-w-max text-sm">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50">
            {headers.map((h) => (
              <th key={h} className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className={cn("border-b border-gray-100 last:border-0", i % 2 === 1 && "bg-gray-50/50")}>
              {row.map((cell, j) => (
                <td key={j} className="px-4 py-2.5 text-gray-700 align-top">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Code({ children }: { children: string }) {
  return (
    <pre className="mb-4 overflow-x-auto rounded-lg bg-gray-900 p-4 text-xs leading-relaxed text-gray-100">
      <code>{children}</code>
    </pre>
  );
}

function Badge({ children, color = "gray" }: { children: React.ReactNode; color?: "gray" | "red" | "green" | "blue" | "amber" }) {
  const colors = {
    gray: "bg-gray-100 text-gray-700",
    red: "bg-primary-50 text-primary-700",
    green: "bg-green-50 text-green-700",
    blue: "bg-blue-50 text-blue-700",
    amber: "bg-amber-50 text-amber-700",
  };
  return (
    <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium", colors[color])}>
      {children}
    </span>
  );
}

// ─── Doc Content ──────────────────────────────────────────────────────────────

const DOCS: DocGroup[] = [
  // ── PRODUCT ──────────────────────────────────────────────────────────────
  {
    id: "product",
    label: "Produk",
    icon: Layers,
    sections: [
      {
        id: "product-overview",
        title: "Tentang Laby",
        content: (
          <div>
            <H2>Apa itu Laby?</H2>
            <P>
              Laby adalah aplikasi laporan keuangan pribadi yang memperlakukan uangmu seperti laporan keuangan perusahaan: ada nomor akun, jurnal, dan tiga laporan utama, tapi dikemas sederhana untuk satu orang.
            </P>
            <Check>
              <strong>Tagline:</strong> Personal financial statements, done properly.
            </Check>

            <H2>Apa yang Membedakan Laby?</H2>
            <Table
              headers={["Fitur", "Aplikasi biasa", "Laby"]}
              rows={[
                ["Pencatatan", "Single-entry (pemasukan/pengeluaran)", "Double-entry bookkeeping"],
                ["Laporan", "Ringkasan pengeluaran per kategori", "Laba rugi, neraca, arus kas standar akuntansi"],
                ["Input data", "Manual form", "Manual + screenshot AI + chat natural language"],
                ["Audit trail", "Tidak ada", "Setiap perubahan tercatat lengkap"],
                ["Pajak", "Tidak ada", "Rekapitulasi penghasilan siap SPT"],
              ]}
            />

            <H2>Fitur Utama</H2>
            <UL>
              <li><strong>Input manual</strong> — form sederhana, double-entry otomatis di balik layar</li>
              <li><strong>Screenshot AI</strong> — upload mutasi bank/e-wallet, Gemini ekstrak transaksi</li>
              <li><strong>Chat AI</strong> — ketik natural language, AI parse jadi jurnal terstruktur</li>
              <li><strong>Tiga laporan keuangan</strong> — laba rugi, neraca, arus kas per bulan + tahunan</li>
              <li><strong>Dashboard</strong> — net worth, cash flow, top pengeluaran, grafik tren</li>
              <li><strong>Audit log</strong> — histori setiap perubahan dengan sumber asalnya</li>
              <li><strong>62 akun bawaan</strong> — chart of accounts standar Indonesia siap pakai</li>
            </UL>

            <H2>Keputusan Desain Penting</H2>
            <H3>Double-entry di backend, single-entry di UI</H3>
            <P>
              User input lewat form sederhana. Sistem otomatis buat pasangan jurnal yang benar. Neraca selalu balance, laporan keuangan selalu akurat, tanpa user perlu tahu debit/kredit.
            </P>
            <H3>Amounts sebagai integer (sen)</H3>
            <P>
              Semua nilai uang disimpan dalam satuan sen IDR (1 IDR = 100 sen) sebagai integer untuk menghindari floating-point precision issue. Rp1.450.000 tersimpan sebagai 145000000.
            </P>
            <H3>AI wajib lewat konfirmasi user</H3>
            <P>
              Tidak ada fitur AI yang auto-commit ke database. Setiap hasil parsing AI berstatus DRAFT hingga user eksplisit mengkonfirmasi. Ini prinsip tidak dapat dikompromikan untuk menjaga integritas data keuangan.
            </P>
          </div>
        ),
      },
      {
        id: "roadmap",
        title: "Roadmap",
        content: (
          <div>
            <H2>Roadmap Pengembangan</H2>
            <div className="space-y-3">
              {[
                { phase: "Fase 1", label: "Fondasi", status: "done", desc: "Auth, chart of accounts 62 akun, input manual transaksi double-entry, dashboard ringkasan." },
                { phase: "Fase 2", label: "Laporan", status: "done", desc: "Laporan laba rugi, neraca, arus kas per bulan + total tahunan. Grafik tren, tampilan 12 kolom bulan." },
                { phase: "Fase 3", label: "AI", status: "done", desc: "Screenshot extraction via Gemini, chat parsing, AI assistant untuk tanya-jawab data, audit log sumber transaksi." },
                { phase: "Fase 4", label: "Portofolio & Otomasi", status: "planned", desc: "Modul investasi (saham, crypto, reksadana, emas), recurring transactions, budget vs realisasi, notifikasi." },
                { phase: "Fase 5", label: "Polish", status: "planned", desc: "i18n EN/ID, dark mode, mobile PWA, 2FA (TOTP), ekspor PDF/CSV, backup/restore." },
                { phase: "Fase 6", label: "Pajak & Kepatuhan", status: "planned", desc: "Rekapitulasi penghasilan format SPT 1770, PPh Final 0,5% kalkulasi + reminder, dashboard kepatuhan pajak per bulan." },
              ].map((item) => (
                <div key={item.phase} className="flex gap-4 rounded-lg border border-gray-100 bg-white p-4">
                  <div className="shrink-0 pt-0.5">
                    {item.status === "done" ? (
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                    ) : (
                      <div className="h-5 w-5 rounded-full border-2 border-gray-300" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{item.phase}</span>
                      <span className="text-sm font-semibold text-gray-900">{item.label}</span>
                      <Badge color={item.status === "done" ? "green" : "gray"}>
                        {item.status === "done" ? "Selesai" : "Planned"}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-500">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ),
      },
    ],
  },

  // ── USERS ─────────────────────────────────────────────────────────────────
  {
    id: "users",
    label: "Panduan Pengguna",
    icon: Users,
    sections: [
      {
        id: "getting-started",
        title: "Mulai Pakai",
        content: (
          <div>
            <H2>Daftar dan Login</H2>
            <OL>
              <li>Buka Laby di browser dan klik <strong>Register</strong></li>
              <li>Isi email dan password (minimal 8 karakter)</li>
              <li>Klik Daftar — kamu langsung masuk ke dashboard</li>
              <li>Saat pertama masuk, 62 akun bawaan sudah tersedia otomatis</li>
            </OL>
            <Note>Session tersimpan di browser. Tidak perlu login ulang kecuali logout atau session expired.</Note>

            <H2>Orientasi Dashboard</H2>
            <Table
              headers={["Widget", "Isi"]}
              rows={[
                ["Net Worth", "Total aset dikurangi total liabilitas — kekayaan bersih saat ini"],
                ["Cash Flow Bulan Ini", "Selisih pendapatan vs pengeluaran bulan berjalan"],
                ["Top Pengeluaran", "Kategori dengan pengeluaran terbesar bulan ini"],
                ["Grafik Tren", "Pergerakan net worth dari bulan ke bulan"],
              ]}
            />

            <H2>Input Transaksi — 3 Cara</H2>
            <H3>1. Manual</H3>
            <P>Klik tombol + Transaksi, isi form: tanggal, tipe, nominal, akun, akun kas, deskripsi. Sistem otomatis buat jurnal double-entry.</P>

            <H3>2. Screenshot AI</H3>
            <OL>
              <li>Buka menu AI, upload screenshot mutasi bank atau e-wallet</li>
              <li>Gemini baca gambar dan ekstrak transaksi sebagai draft</li>
              <li>Periksa setiap baris, sesuaikan akun jika perlu, klik Konfirmasi</li>
            </OL>
            <Warning>Field dengan confidence di bawah 70% ditandai kuning. Selalu periksa sebelum konfirmasi.</Warning>

            <H3>3. Chat AI</H3>
            <P>Ketik deskripsi natural, contoh: &quot;kemarin bayar makan siang 75rb&quot;. AI parse jadi transaksi terstruktur, tampil sebagai preview konfirmasi.</P>
            <Table
              headers={["Singkatan", "Artinya"]}
              rows={[
                ["75rb / 75k", "Rp75.000"],
                ["1.5jt", "Rp1.500.000"],
                ["kemarin", "Hari sebelum hari ini"],
                ["tadi pagi/siang", "Hari ini"],
                ["minggu lalu", "7 hari lalu"],
              ]}
            />
          </div>
        ),
      },
      {
        id: "reading-reports",
        title: "Membaca Laporan",
        content: (
          <div>
            <H2>Tiga Laporan di Laby</H2>

            <H3>Laporan Laba Rugi</H3>
            <P>Menunjukkan performa keuangan satu periode: pendapatan dikurangi beban = surplus/defisit.</P>
            <UL>
              <li>Baris atas: semua pendapatan (gaji, freelance, dividen)</li>
              <li>Baris tengah: semua beban per kategori</li>
              <li>Baris bawah: <strong>Surplus/Defisit</strong> — angka terpenting</li>
              <li>Angka dalam kurung <code className="rounded bg-gray-100 px-1 text-xs">(xxx)</code> = nilai negatif, konvensi standar akuntansi</li>
            </UL>
            <Tip>Savings rate = Surplus / Total Pendapatan. Target sehat minimal 20%.</Tip>

            <H3>Neraca (Balance Sheet)</H3>
            <P>Snapshot kekayaan bersih per akhir bulan. Selalu harus balance: Aset = Liabilitas + Ekuitas.</P>
            <UL>
              <li><strong>Aset</strong> — semua yang kamu miliki (rekening, investasi, barang)</li>
              <li><strong>Liabilitas</strong> — semua yang kamu hutang (kartu kredit, cicilan)</li>
              <li><strong>Ekuitas</strong> — selisihnya = net worth kamu</li>
            </UL>
            <Tip>Net worth naik dari bulan ke bulan = tanda keuangan sehat.</Tip>

            <H3>Laporan Arus Kas</H3>
            <P>Pergerakan kas nyata dari 3 aktivitas: operasional, investasi, pendanaan.</P>
            <UL>
              <li><strong>Operasional</strong> — arus kas harian: gaji masuk, pengeluaran rutin</li>
              <li><strong>Investasi</strong> — beli/jual aset investasi</li>
              <li><strong>Pendanaan</strong> — pinjam/cicil utang</li>
            </UL>
            <Note>Arus kas operasional harus selalu positif untuk keuangan yang sehat.</Note>

            <H2>Tips Baca Laporan</H2>
            <UL>
              <li>Bandingkan 3 bulan berturut — satu bulan buruk bisa kebetulan, tiga bulan berturut adalah sinyal serius</li>
              <li>Kolom Total di kanan = akumulasi 12 bulan, gunakan untuk evaluasi tahunan</li>
              <li>Arus kas bisa negatif meski laba rugi surplus, kalau ada piutang belum dibayar klien</li>
            </UL>
          </div>
        ),
      },
      {
        id: "best-practices",
        title: "Tips & Best Practices",
        content: (
          <div>
            <H2>Rutinitas yang Disarankan</H2>
            <H3>Harian (ideal)</H3>
            <UL>
              <li>Input transaksi sebelum tidur atau pagi hari via chat AI</li>
              <li>Foto/screenshot struk sesaat setelah transaksi</li>
            </UL>
            <H3>Mingguan</H3>
            <UL>
              <li>Upload screenshot mutasi bank/e-wallet 7 hari terakhir</li>
              <li>Review dashboard — apakah cash flow mingguan sesuai ekspektasi?</li>
            </UL>
            <H3>Bulanan (wajib)</H3>
            <UL>
              <li>Pastikan semua transaksi bulan berjalan sudah masuk</li>
              <li>Buka laporan laba rugi — cek surplus atau defisit?</li>
              <li>Cek neraca — apakah net worth bertambah?</li>
              <li>Rekonsiliasi: cocokkan saldo Laby dengan saldo riil rekening/e-wallet</li>
            </UL>
            <H3>Tahunan</H3>
            <UL>
              <li>Export laporan untuk keperluan SPT pajak</li>
              <li>Evaluasi akun — ada yang perlu ditambah atau dinonaktifkan?</li>
            </UL>

            <H2>Praktik Penting</H2>
            <Tip>Pisahkan satu akun per rekening bank/e-wallet. Ini membuat neraca mencerminkan posisi kas yang akurat per rekening.</Tip>
            <Tip>Untuk freelancer: gunakan akun 6-xxx (beban kerja) untuk pengeluaran bisnis, pisahkan dari 5-xxx (beban hidup pribadi). Ini memudahkan rekap penghasilan untuk SPT.</Tip>
            <Warning>Konfirmasi setiap hasil AI dengan teliti, terutama nominal dan tanggal. Transaksi yang sudah dikonfirmasi masih bisa diedit, tapi perubahan tercatat di audit log.</Warning>

            <H2>FAQ</H2>
            <div className="space-y-3">
              {[
                { q: "Perlu tahu akuntansi dulu?", a: "Tidak. Form transaksi dirancang sesederhana mungkin. Konsep akuntansi bekerja di balik layar." },
                { q: "Apakah AI membaca semua data keuangan saya?", a: "Hanya data yang relevan untuk menjawab pertanyaan atau memproses gambar yang dikirim ke Gemini. Password, token, dan data sensitif lain tidak pernah dikirim ke AI." },
                { q: "Bisakah dipakai untuk keuangan bisnis?", a: "Bisa, dengan catatan Laby saat ini dirancang untuk satu pengguna. Pisahkan akun bisnis dan pribadi melalui kode akun yang konsisten." },
                { q: "Bagaimana transaksi mata uang asing?", a: "Masukkan nilai yang sudah dikonversi ke IDR dengan kurs saat transaksi. Catat kurs di field deskripsi untuk referensi." },
              ].map(({ q, a }) => (
                <div key={q} className="rounded-lg border border-gray-100 bg-white p-4">
                  <p className="mb-1 text-sm font-semibold text-gray-900">{q}</p>
                  <p className="text-sm text-gray-500">{a}</p>
                </div>
              ))}
            </div>
          </div>
        ),
      },
    ],
  },

  // ── ACCOUNTING ────────────────────────────────────────────────────────────
  {
    id: "accounting",
    label: "Akuntansi",
    icon: BookOpen,
    sections: [
      {
        id: "double-entry",
        title: "Double-Entry Bookkeeping",
        content: (
          <div>
            <H2>Persamaan Akuntansi Dasar</H2>
            <div className="mb-4 rounded-xl border border-primary-100 bg-primary-50 p-5 text-center">
              <p className="text-lg font-bold text-primary-700">Aset = Liabilitas + Ekuitas</p>
              <p className="mt-1 text-xs text-primary-500">Persamaan ini harus selalu balance. Selamanya.</p>
            </div>
            <P>Setiap transaksi mempengaruhi minimal dua akun sekaligus, memastikan persamaan tetap balance.</P>

            <H2>Aturan Debit dan Kredit</H2>
            <Table
              headers={["Tipe Akun", "Debit", "Kredit", "Saldo Normal"]}
              rows={[
                ["Aset (1-xxx)", "Naik", "Turun", <Badge key="a" color="blue">Debit</Badge>],
                ["Liabilitas (2-xxx)", "Turun", "Naik", <Badge key="l" color="red">Kredit</Badge>],
                ["Ekuitas (3-xxx)", "Turun", "Naik", <Badge key="e" color="red">Kredit</Badge>],
                ["Pendapatan (4-xxx)", "Turun", "Naik", <Badge key="p" color="red">Kredit</Badge>],
                ["Beban (5-xxx, 6-xxx)", "Naik", "Turun", <Badge key="b" color="blue">Debit</Badge>],
              ]}
            />
            <Tip>Cara mudah ingat: Aset dan Beban naik dengan Debit. Liabilitas, Ekuitas, dan Pendapatan naik dengan Kredit.</Tip>

            <H2>Contoh Journal Entry</H2>
            <H3>Terima freelance Rp5.000.000 ke rekening BCA</H3>
            <Code>{`DEBIT  1-102 Bank BCA               Rp5.000.000
KREDIT 4-102 Pendapatan Freelance               Rp5.000.000`}</Code>
            <H3>Bayar langganan Netflix Rp55.000 dari GoPay</H3>
            <Code>{`DEBIT  5-203 Langganan (Beban)       Rp55.000
KREDIT 1-103 GoPay (Aset)                       Rp55.000`}</Code>
            <Note>Di Laby, kamu cukup memilih: &quot;Pengeluaran, Rp55.000, akun Langganan, dari GoPay&quot;. Sistem yang menulis jurnal di atas secara otomatis.</Note>

            <H2>Siklus Akuntansi</H2>
            <OL>
              <li>Transaksi terjadi (bukti: struk, invoice, mutasi bank)</li>
              <li>Input ke Laby (manual / screenshot / chat)</li>
              <li>Jurnal umum dibuat otomatis (journal_entries + journal_lines)</li>
              <li>Posting ke buku besar, dikelompokkan per akun</li>
              <li>Neraca saldo: total debit = total kredit</li>
              <li>Laporan keuangan digenerate: laba rugi, neraca, arus kas</li>
            </OL>
          </div>
        ),
      },
      {
        id: "chart-of-accounts",
        title: "Bagan Akun",
        content: (
          <div>
            <H2>Chart of Accounts — 62 Akun Bawaan</H2>
            <P>Terstruktur mengikuti konvensi akuntansi Indonesia. Format kode: <code className="rounded bg-gray-100 px-1 text-xs">X-YYY</code>, sub-akun: <code className="rounded bg-gray-100 px-1 text-xs">X-YYY.Z</code>.</P>

            {[
              {
                group: "Aset (1-xxx)", color: "blue" as const,
                accounts: [
                  ["1-101", "Kas Tunai", "Uang fisik di tangan"],
                  ["1-102", "Bank Account", "Rekening bank"],
                  ["1-103", "E-Wallet", "GoPay, OVO, Dana"],
                  ["1-104", "Tabungan", "Tabungan berjangka"],
                  ["1-110", "Piutang", "Tagihan belum dibayar klien"],
                  ["1-201", "Saham", "Saham lokal/asing"],
                  ["1-202", "Crypto", "Bitcoin, Ethereum, dll"],
                  ["1-203", "Reksadana", ""],
                  ["1-204", "Obligasi/SBN", "ORI, SBR, Sukuk"],
                  ["1-205", "Emas", "Emas fisik/digital"],
                  ["1-301", "Kendaraan", "Motor, mobil"],
                  ["1-302", "Elektronik", "Laptop, HP"],
                  ["1-390", "Akumulasi Penyusutan", "Kontra-aset"],
                ],
              },
              {
                group: "Liabilitas (2-xxx)", color: "red" as const,
                accounts: [
                  ["2-101", "Kartu Kredit", "Tagihan kartu kredit"],
                  ["2-102", "Utang Jangka Pendek", "Pinjol, utang teman"],
                  ["2-201", "KPR", "Cicilan rumah"],
                  ["2-202", "Kredit Kendaraan", "Cicilan motor/mobil"],
                  ["2-203", "Pinjaman Jangka Panjang", "Tenor > 1 tahun"],
                ],
              },
              {
                group: "Ekuitas (3-xxx)", color: "gray" as const,
                accounts: [
                  ["3-100", "Modal Awal", "Saldo awal saat setup"],
                  ["3-200", "Laba Ditahan", "Akumulasi surplus/defisit"],
                ],
              },
              {
                group: "Pendapatan (4-xxx)", color: "green" as const,
                accounts: [
                  ["4-101", "Gaji", "Gaji/upah bulanan"],
                  ["4-102", "Freelance/Project", "Penghasilan proyek"],
                  ["4-103", "Pendapatan Usaha", "Penghasilan bisnis"],
                  ["4-201", "Dividen", "Dividen saham"],
                  ["4-202", "Bunga", "Bunga deposito, obligasi"],
                  ["4-203", "Realized Capital Gain", "Keuntungan jual investasi"],
                  ["4-301", "Hadiah/Grant", "Kompetisi, beasiswa"],
                ],
              },
              {
                group: "Beban Hidup (5-xxx)", color: "amber" as const,
                accounts: [
                  ["5-101", "Makan & Minum", "Groceries, makan di luar"],
                  ["5-102", "Transport", "BBM, ojol, parkir"],
                  ["5-103", "Tempat Tinggal", "Sewa, kos"],
                  ["5-104", "Utilitas", "Listrik, air, gas"],
                  ["5-105", "Kesehatan", "Dokter, obat, BPJS"],
                  ["5-201", "Hiburan", "Bioskop, konser, game"],
                  ["5-202", "Belanja", "Pakaian, barang rumah"],
                  ["5-203", "Langganan", "Netflix, Spotify, iCloud"],
                  ["5-204", "Pendidikan", "Kursus, buku"],
                ],
              },
              {
                group: "Beban Operasional (6-xxx)", color: "amber" as const,
                accounts: [
                  ["6-101", "Software & Subscriptions", "Tools kerja: Figma, Notion"],
                  ["6-102", "Peralatan", "Peralatan kerja"],
                  ["6-103", "Internet & Komunikasi", "Internet, HP"],
                  ["6-201", "Bunga Utang", "Bunga KPR, pinjaman"],
                  ["6-202", "Biaya Admin Bank", "Transfer, administrasi"],
                  ["6-301", "PPh Final UMKM 0,5%", "Setoran PPh Final bulanan"],
                  ["6-302", "PPh OP", "PPh kurang bayar dari SPT"],
                ],
              },
            ].map(({ group, accounts }) => (
              <div key={group} className="mb-4">
                <h3 className="mb-2 text-sm font-semibold text-gray-700">{group}</h3>
                <div className="overflow-x-auto rounded-lg border border-gray-200">
                  <table className="w-full min-w-max text-sm">
                    <tbody>
                      {accounts.map(([code, name, note]) => (
                        <tr key={code} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                          <td className="px-4 py-2 w-24">
                            <code className="rounded bg-gray-100 px-1.5 py-0.5 text-xs font-mono text-gray-700">{code}</code>
                          </td>
                          <td className="px-4 py-2 font-medium text-gray-800">{name}</td>
                          <td className="px-4 py-2 text-gray-400 text-xs">{note}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        ),
      },
      {
        id: "accounting-concepts",
        title: "Konsep Lanjutan",
        content: (
          <div>
            <H2>Basis Akrual vs Basis Kas</H2>
            <Table
              headers={["Basis", "Kapan dicatat", "Contoh"]}
              rows={[
                ["Kas", "Saat uang berpindah", "Invoice dikirim Januari, dicatat Maret saat dibayar"],
                ["Akrual", "Saat hak/kewajiban timbul", "Invoice dikirim Januari → dicatat Januari + piutang"],
              ]}
            />
            <P>Laby default basis kas untuk kemudahan, tapi mendukung pencatatan piutang/utang untuk mendekati akrual.</P>

            <H2>Penyusutan Aset (Depreciation)</H2>
            <P>Aset tetap seperti laptop berkurang nilainya seiring waktu. Metode garis lurus:</P>
            <Code>{`Beban Penyusutan/tahun = (Harga Beli - Nilai Sisa) / Umur Ekonomis

Contoh: Laptop Rp15.000.000, nilai sisa Rp3.000.000, umur 4 tahun
= (15.000.000 - 3.000.000) / 4 = Rp3.000.000/tahun = Rp250.000/bulan`}</Code>

            <H2>Rekonsiliasi</H2>
            <P>Cocokkan saldo di Laby dengan saldo riil rekening/e-wallet setiap akhir bulan. Selisih umum:</P>
            <UL>
              <li>Biaya admin bank yang terlupa diinput</li>
              <li>Bunga tabungan yang belum dicatat</li>
              <li>Transaksi refund/pengembalian yang terlewat</li>
            </UL>

            <H2>Rasio Keuangan Penting</H2>
            <Table
              headers={["Rasio", "Rumus", "Target"]}
              rows={[
                ["Savings Rate", "Surplus / Pendapatan × 100%", "Minimal 20%"],
                ["Debt-to-Asset", "Liabilitas / Aset × 100%", "Di bawah 30%"],
                ["Emergency Fund", "Kas Likuid / Pengeluaran Bulanan", "3–6 bulan"],
                ["Investment Rate", "Pengeluaran Investasi / Pendapatan", "Semakin tinggi semakin baik"],
              ]}
            />
          </div>
        ),
      },
    ],
  },

  // ── LAPORAN KEUANGAN ─────────────────────────────────────────────────────
  {
    id: "reports",
    label: "Laporan Keuangan",
    icon: FileText,
    sections: [
      {
        id: "five-components",
        title: "5 Komponen Laporan",
        content: (
          <div>
            <H2>Set Lengkap Laporan Keuangan</H2>
            <P>Satu set laporan keuangan yang lengkap terdiri dari 5 komponen — bukan hanya satu dokumen.</P>
            <Table
              headers={["No", "Nama", "Bahasa Inggris", "Pertanyaan yang Dijawab"]}
              rows={[
                ["1", "Laporan Laba Rugi", "Income Statement", "Berapa surplus/defisit periode ini?"],
                ["2", "Neraca", "Balance Sheet", "Berapa kekayaan bersih saat ini?"],
                ["3", "Laporan Arus Kas", "Cash Flow Statement", "Berapa kas yang benar-benar mengalir?"],
                ["4", "Laporan Perubahan Ekuitas", "Statement of Changes in Equity", "Bagaimana net worth berubah?"],
                ["5", "Catatan atas LK", "Notes to Financial Statements", "Apa kebijakan di balik angka?"],
              ]}
            />
            <Note>Laby saat ini menghasilkan laporan 1, 2, dan 3 secara otomatis dari data transaksi.</Note>

            <H2>Hubungan Antar Laporan</H2>
            <Code>{`Laporan Laba Rugi
  Surplus/Defisit: Rp13.345.000
         |
         | menambah/mengurangi
         ↓
Laporan Perubahan Ekuitas
  Ekuitas Awal + Surplus = Ekuitas Akhir
         |
         | ekuitas akhir masuk ke
         ↓
Neraca
  Total Ekuitas: Rp69.450.000

Laporan Arus Kas
  Saldo kas akhir = saldo kas di Neraca ✓`}</Code>

            <H2>Laporan Keuangan Komparatif</H2>
            <P>Standar akuntansi mewajibkan laporan minimal 2 periode berdampingan. Di Laby, filter tahun di reports memungkinkan perbandingan antar tahun. Kolom 12 bulan + Total memudahkan analisis horizontal.</P>
            <Tip>Analisis vertikal: nyatakan setiap angka sebagai persentase dari total untuk membandingkan proporsi antar bulan yang nominalnya berbeda.</Tip>
          </div>
        ),
      },
      {
        id: "income-statement",
        title: "Laporan Laba Rugi",
        content: (
          <div>
            <H2>Struktur Laporan Laba Rugi</H2>
            <Code>{`PENDAPATAN
  Pendapatan Operasional
    Gaji                          Rp15.000.000
    Freelance                      Rp8.500.000
  Total Pendapatan Operasional    Rp23.500.000

  Pendapatan Investasi
    Dividen                          Rp350.000
    Bunga Deposito                   Rp120.000
  Total Pendapatan Investasi         Rp470.000

TOTAL PENDAPATAN                  Rp23.970.000

BEBAN
  Beban Pokok Hidup
    Makan & Minuman                Rp3.200.000
    Transport                      Rp1.100.000
    Tempat Tinggal (Sewa)          Rp3.500.000
  Total Beban Pokok Hidup          Rp7.800.000

  Beban Operasional
    Software & Tools                 Rp450.000
    Internet                         Rp350.000
  Total Beban Operasional            Rp800.000

TOTAL BEBAN                       Rp10.625.000

SURPLUS / (DEFISIT)               Rp13.345.000`}</Code>

            <H2>Cara Membaca</H2>
            <UL>
              <li><strong>Surplus positif</strong> — pendapatan lebih besar dari beban. Surplus ini menambah ekuitas (net worth).</li>
              <li><strong>Defisit (dalam kurung)</strong> — pengeluaran melebihi pendapatan. Perlu ditelusuri penyebabnya.</li>
              <li><strong>Angka kurung</strong> <code className="rounded bg-gray-100 px-1 text-xs">(xxx)</code> adalah konvensi standar akuntansi untuk nilai negatif, bukan tanda minus.</li>
            </UL>

            <H2>Sinyal yang Perlu Diperhatikan</H2>
            <UL>
              <li>Savings rate di bawah 20% selama 3 bulan berturut</li>
              <li>Satu kategori beban yang terus membengkak</li>
              <li>Pendapatan berfluktuasi tajam (relevan untuk freelancer)</li>
              <li>Bulan dengan pengeluaran anomali — mungkin ada pembelian besar satu kali</li>
            </UL>
          </div>
        ),
      },
      {
        id: "balance-sheet",
        title: "Neraca",
        content: (
          <div>
            <H2>Struktur Neraca</H2>
            <Code>{`ASET
  Aset Lancar
    Kas Tunai                      Rp500.000
    Bank BCA                       Rp8.200.000
    GoPay                            Rp450.000
    Piutang Klien                  Rp5.000.000
  Total Aset Lancar               Rp14.150.000

  Aset Investasi
    Saham (Nilai Pasar)           Rp35.000.000
    Reksadana                     Rp12.500.000
  Total Aset Investasi            Rp47.500.000

TOTAL ASET                        Rp61.650.000

LIABILITAS
  Kartu Kredit BCA                 Rp2.300.000
  Cicilan Motor (sisa)            Rp18.500.000
TOTAL LIABILITAS                  Rp20.800.000

EKUITAS                           Rp40.850.000

TOTAL LIABILITAS + EKUITAS        Rp61.650.000  ✓`}</Code>

            <H2>Poin Penting</H2>
            <UL>
              <li><strong>Kartu kredit</strong> ada di liabilitas, bukan pengeluaran. Saat gesek kartu, itu liabilitas. Baru jadi beban saat di-charge ke akun pengeluaran.</li>
              <li><strong>Akumulasi penyusutan</strong> ditulis dalam kurung karena kontra-aset (mengurangi nilai aset tetap).</li>
              <li>Neraca selalu snapshot per satu tanggal, bukan rentang periode.</li>
            </UL>
          </div>
        ),
      },
      {
        id: "cash-flow",
        title: "Laporan Arus Kas",
        content: (
          <div>
            <H2>Tiga Aktivitas Arus Kas</H2>
            <Code>{`AKTIVITAS OPERASIONAL
  Penerimaan dari penghasilan        Rp23.500.000
  Pembayaran beban hidup             (Rp8.450.000)
  Pembayaran beban operasional         (Rp825.000)
Arus Kas Bersih Operasional         Rp14.225.000

AKTIVITAS INVESTASI
  Pembelian reksadana                (Rp2.000.000)
  Pembelian saham                    (Rp3.000.000)
Arus Kas Bersih Investasi           (Rp5.000.000)

AKTIVITAS PENDANAAN
  Cicilan motor dibayar              (Rp1.200.000)
  Bayar tagihan kartu kredit         (Rp2.300.000)
Arus Kas Bersih Pendanaan           (Rp3.500.000)

KENAIKAN KAS BERSIH                  Rp5.725.000`}</Code>

            <H2>Interpretasi</H2>
            <Table
              headers={["Aktivitas", "Positif artinya", "Negatif artinya"]}
              rows={[
                ["Operasional", "Kegiatan harian menghasilkan kas. Tanda keuangan sehat.", "Pengeluaran rutin melebihi pendapatan. Sinyal bahaya."],
                ["Investasi", "Jual lebih banyak dari beli investasi.", "Aktif berinvestasi. Bukan buruk kalau operasional positif."],
                ["Pendanaan", "Pinjam lebih banyak dari yang dilunasi.", "Melunasi utang lebih banyak. Umumnya baik."],
              ]}
            />
            <Note>Kamu bisa surplus di laba rugi tapi minus kas kalau klien belum bayar invoice. Arus kas menangkap realitas likuiditas ini.</Note>
          </div>
        ),
      },
    ],
  },

  // ── STANDAR AKUNTANSI ────────────────────────────────────────────────────
  {
    id: "standards",
    label: "Standar Akuntansi",
    icon: Scale,
    sections: [
      {
        id: "sak-overview",
        title: "Hierarki SAK Indonesia",
        content: (
          <div>
            <H2>Standar Akuntansi di Indonesia</H2>
            <P>IAI (Ikatan Akuntan Indonesia) menerbitkan beberapa standar berbeda tergantung jenis entitas.</P>
            <Table
              headers={["Standar", "Untuk Entitas", "Basis"]}
              rows={[
                [<><Badge color="red">SAK Umum</Badge> PSAK/ISAK</>, "Emiten, BUMN, bank, asuransi", "Konvergensi penuh IFRS"],
                [<><Badge color="blue">SAK EP</Badge> (menggantikan SAK ETAP, Jan 2025)</>, "Perusahaan menengah/privat non-publik", "Simplifikasi SAK Umum"],
                [<><Badge color="green">SAK EMKM</Badge></>, "Usaha Mikro, Kecil, dan Menengah", "Paling sederhana, biaya historis"],
                [<><Badge>SAK Syariah</Badge></>, "Bank syariah, asuransi syariah", "Prinsip syariah + konvergensi IFRS"],
                [<><Badge>SAP</Badge></>, "Instansi pemerintah", "Ditetapkan KSAP, bukan IAI"],
              ]}
            />
            <Tip>Freelancer dan UMKM paling relevan dengan SAK EMKM. Startup menengah relevan dengan SAK EP.</Tip>

            <H2>SAK EMKM — Standar untuk Usaha Kecil</H2>
            <P>Laporan keuangan minimal: neraca dan laporan laba rugi. Tidak wajib laporan arus kas atau CaLK panjang.</P>
            <UL>
              <li>Pengukuran berbasis biaya historis (tidak perlu nilai wajar)</li>
              <li>Tidak perlu menghitung pajak tangguhan</li>
              <li>CaLK sangat minimal: kebijakan akuntansi utama + daftar aset tetap</li>
            </UL>

            <H2>SAK EP — Baru Berlaku 2025</H2>
            <P>Menggantikan SAK ETAP mulai 1 Januari 2025. Lebih selaras dengan IFRS for SMEs 2019.</P>
            <Table
              headers={["Aspek", "SAK ETAP (lama)", "SAK EP (baru, 2025)"]}
              rows={[
                ["Instrumen keuangan", "Lebih sederhana", "Lebih dekat IFRS 9 (impairment ECL)"],
                ["Sewa", "Model lama", "Lebih mendekati IFRS 16"],
                ["Pengungkapan", "Minimal", "Diperluas"],
              ]}
            />

            <H2>Update Penting 2025–2026</H2>
            <UL>
              <li><strong>1 Jan 2025:</strong> SAK EP berlaku; PSAK 117 (Kontrak Asuransi/IFRS 17) efektif</li>
              <li><strong>1 Jan 2026:</strong> Revisi PSAK 338, amendemen PSAK 109 & 107, penyesuaian tahunan SAK 2024</li>
              <li><strong>Akan datang:</strong> PSAK 118 (setara IFRS 18) akan mengubah struktur penyajian laba rugi</li>
            </UL>
          </div>
        ),
      },
      {
        id: "ifrs",
        title: "IFRS & Standar Internasional",
        content: (
          <div>
            <H2>IFRS vs US GAAP</H2>
            <Table
              headers={["Aspek", "IFRS", "US GAAP"]}
              rows={[
                ["Diterbitkan oleh", "IASB (IFRS Foundation)", "FASB"],
                ["Pendekatan", "Principles-based (berbasis prinsip)", "Rules-based (berbasis aturan, lebih detail)"],
                ["Dipakai di", "140+ negara termasuk Indonesia", "Amerika Serikat"],
                ["Indonesia", "Konvergensi IFRS sejak 2012", "Tidak diikuti"],
                ["LIFO inventory", "Dilarang", "Diizinkan"],
              ]}
            />

            <H2>Penomoran PSAK Baru (sejak 1 Jan 2024)</H2>
            <Table
              headers={["Awalan", "Rujukan", "Contoh"]}
              rows={[
                ["PSAK 1xx", "IFRS Standards", "PSAK 109 ≈ IFRS 9 (Instrumen Keuangan)"],
                ["PSAK 2xx", "IAS Standards", "PSAK 228 ≈ IAS 28 (Investasi Asosiasi)"],
                ["PSAK 3xx", "PSAK Lokal", "PSAK 338 (Kombinasi Bisnis Sepengendali)"],
                ["PSAK 4xx", "PSAK Syariah", ""],
                ["ISAK 1xx", "Interpretasi IFRIC", ""],
                ["ISAK 3xx", "ISAK Lokal", ""],
              ]}
            />

            <H2>Kerangka Konseptual</H2>
            <H3>Asumsi dasar</H3>
            <UL>
              <li><strong>Going concern</strong> — entitas diasumsikan terus beroperasi</li>
              <li><strong>Akrual basis</strong> — transaksi dicatat saat hak/kewajiban timbul</li>
            </UL>
            <H3>Karakteristik kualitatif fundamental</H3>
            <UL>
              <li><strong>Relevan</strong> — bisa memengaruhi keputusan pengguna</li>
              <li><strong>Representasi jujur</strong> — lengkap, netral, bebas dari kesalahan material</li>
            </UL>

            <H2>Koreksi Fiskal: Akuntansi vs Pajak</H2>
            <P>Laporan keuangan (PSAK) dan laporan pajak (SPT) menggunakan aturan yang berbeda. Perbedaan ini disebut koreksi fiskal.</P>
            <Table
              headers={["Item", "Akuntansi (PSAK)", "Pajak (UU PPh)"]}
              rows={[
                ["Penyusutan kendaraan", "Sesuai estimasi umur ekonomis", "Tarif fiskal ditetapkan DJP"],
                ["Biaya entertainment", "Boleh dibebankan penuh", "Max 50%, wajib daftar nominatif"],
                ["Bunga deposito", "Masuk pendapatan laba rugi", "Sudah final 20%, bukan objek pajak lagi di SPT"],
              ]}
            />
          </div>
        ),
      },
    ],
  },

  // ── PAJAK ────────────────────────────────────────────────────────────────
  {
    id: "tax",
    label: "Pajak & SPT",
    icon: Receipt,
    sections: [
      {
        id: "tax-basics",
        title: "Dasar Perpajakan",
        content: (
          <div>
            <H2>Istilah Penting</H2>
            <Table
              headers={["Istilah", "Penjelasan"]}
              rows={[
                ["NPWP", "Nomor identitas pajak. NIK KTP sudah terintegrasi sebagai NPWP untuk OP."],
                ["Coretax DJP", "Sistem baru DJP (2025–2026) yang menggantikan DJP Online lama. 2026 = tahun pertama SPT via Coretax."],
                ["SPT Tahunan", "Laporan penghasilan, harta, kewajiban selama 1 tahun pajak. Wajib semua pemegang NPWP aktif."],
                ["SPT Masa", "Laporan pajak bulanan. Wajib kalau punya karyawan, PKP, atau memotong pajak pihak lain."],
                ["PTKP", "Penghasilan Tidak Kena Pajak — pengurang sebelum dihitung tarif progresif."],
                ["PKP", "Pengusaha Kena Pajak — wajib pungut PPN kalau omzet > Rp4,8 miliar/tahun."],
                ["BPE", "Bukti Penerimaan Elektronik — bukti sah sudah lapor SPT. Simpan minimal 5 tahun."],
                ["NTPN", "Nomor Transaksi Penerimaan Negara — bukti bayar pajak yang valid."],
              ]}
            />

            <H2>Pajak Pribadi vs Pajak Badan</H2>
            <Table
              headers={["Aspek", "Pribadi (OP)", "Badan (CV/PT)"]}
              rows={[
                ["Formulir SPT", "1770 (usaha/freelance)", "1771"],
                ["Deadline SPT", "31 Maret", "30 April"],
                ["Tarif", "Progresif 5–35% atau PPh Final 0,5%", "22% atau PPh Final 0,5% UMKM"],
                ["Pembukuan", "Pencatatan sederhana bisa cukup", "Pembukuan wajib"],
              ]}
            />
            <Note>Kalau belum daftar CV/PT secara resmi ke notaris, kemungkinan besar masih jalur Pajak Pribadi (OP).</Note>
          </div>
        ),
      },
      {
        id: "pph-types",
        title: "Jenis-Jenis PPh",
        content: (
          <div>
            <H2>PPh yang Relevan untuk Freelancer/UMKM</H2>

            <H3>PPh Final UMKM 0,5%</H3>
            <UL>
              <li>Berlaku kalau omzet ≤ Rp4,8 miliar/tahun</li>
              <li>Dihitung dari omzet bruto, bukan laba</li>
              <li>Dibayar bulanan, paling lambat tanggal 15 bulan berikutnya</li>
              <li>Sudah final — tidak ada kurang/lebih bayar di SPT</li>
              <li><strong>PP 20/2026:</strong> memperketat siapa yang boleh pakai. Penghasilan luar negeri dalam beberapa kasus dikecualikan</li>
            </UL>
            <Code>{`PPh Final = 0,5% × Omzet Bruto Bulan Ini

Contoh: Omzet Juni 2026 = Rp25.000.000
PPh Final = 0,5% × 25.000.000 = Rp125.000`}</Code>

            <H3>Tarif Progresif (alternatif)</H3>
            <Table
              headers={["Lapisan PKP", "Tarif"]}
              rows={[
                ["Sampai Rp60 juta", "5%"],
                ["Rp60 juta – Rp250 juta", "15%"],
                ["Rp250 juta – Rp500 juta", "25%"],
                ["Rp500 juta – Rp5 miliar", "30%"],
                ["Di atas Rp5 miliar", "35%"],
              ]}
            />
            <P>PKP = Penghasilan Neto dikurangi PTKP (TK/0 = Rp54 juta, K/0 = Rp58,5 juta, K/1 = Rp63 juta dst.)</P>

            <H3>PPh atas Investasi (sudah final, dipotong sumber)</H3>
            <Table
              headers={["Jenis", "Tarif", "Dipotong oleh"]}
              rows={[
                ["Bunga deposito/tabungan", "20% final", "Bank"],
                ["Dividen dari emiten", "10% final", "Emiten"],
                ["Capital gain saham di bursa", "0,1% dari nilai jual", "Broker"],
                ["Capital gain crypto", "0,1% dari nilai transaksi", "Exchange (cek PMK terbaru)"],
              ]}
            />

            <H3>PPN (Pajak Pertambahan Nilai)</H3>
            <P>Wajib kalau sudah PKP (omzet {">"} Rp4,8 miliar/tahun). Tarif 11%. Kalau belum PKP, tidak perlu pungut atau lapor PPN.</P>
          </div>
        ),
      },
      {
        id: "spt-guide",
        title: "Cara Lapor SPT via Coretax",
        content: (
          <div>
            <H2>Timeline Pajak</H2>
            <Table
              headers={["Kewajiban", "Deadline"]}
              rows={[
                ["Setor PPh Final 0,5% (per bulan)", "Maks tanggal 15 bulan berikutnya"],
                ["SPT Tahunan OP (Formulir 1770)", "31 Maret tahun berikutnya"],
                ["SPT Tahunan Badan (Formulir 1771)", "30 April tahun berikutnya"],
                ["SPT tahun pajak 2026", "31 Maret 2027"],
              ]}
            />
            <Warning>SPT tahun pajak 2025 (deadline 31 Maret 2026) sudah lewat. Kalau belum lapor, segera urus: denda Rp100.000 + risiko pemeriksaan.</Warning>

            <H2>Persiapan Sebelum Lapor</H2>
            <OL>
              <li>Aktivasi akun Coretax di pajak.go.id — buat Sertifikat Elektronik / Kode Otorisasi (KO)</li>
              <li>Siapkan rekap total penghasilan setahun per sumber</li>
              <li>Kumpulkan bukti potong dari klien (Formulir 1721-A1/A2) kalau ada</li>
              <li>Siapkan daftar harta per 31 Desember (rekening, investasi, kendaraan, elektronik)</li>
              <li>Siapkan daftar kewajiban/utang per 31 Desember</li>
            </OL>

            <H2>Step-by-Step Pengisian SPT via Coretax</H2>
            <OL>
              <li>Login ke pajak.go.id menggunakan NIK + password</li>
              <li>Pilih menu SPT Tahunan, konfirmasi formulir 1770 untuk freelancer/usaha</li>
              <li>Isi data penghasilan per sumber (PPh Final: input omzet bruto; progresif: input penghasilan + biaya)</li>
              <li>Masukkan PTKP sesuai status kawin/tanggungan</li>
              <li>Isi daftar harta per 31 Desember — Coretax pre-fill dari data tahun lalu, update yang berubah</li>
              <li>Isi daftar kewajiban/utang</li>
              <li>Cek hasil: Nihil / Kurang Bayar / Lebih Bayar</li>
              <li>Kalau kurang bayar: buat kode billing di Coretax, bayar via bank/ATM/marketplace, simpan NTPN</li>
              <li>Submit SPT dengan Kode Otorisasi</li>
              <li>Download dan simpan BPE (Bukti Penerimaan Elektronik) minimal 5 tahun</li>
            </OL>

            <H2>Menggunakan Data Laby untuk SPT</H2>
            <Table
              headers={["Akun Laby", "Kolom SPT 1770"]}
              rows={[
                ["4-101 Gaji", "Penghasilan dari pemberi kerja"],
                ["4-102 Freelance/Project", "Penghasilan usaha/pekerjaan bebas"],
                ["4-201 Dividen", "Penghasilan dividen (lampiran, sudah final)"],
                ["4-202 Bunga", "Penghasilan bunga (lampiran, sudah final)"],
                ["6-301 PPh Final 0,5%", "Total PPh Final yang sudah disetor"],
                ["Neraca 31 Des: akun 1-xxx", "Daftar harta"],
                ["Neraca 31 Des: akun 2-xxx", "Daftar kewajiban"],
              ]}
            />

            <H2>Denda dan Sanksi</H2>
            <Table
              headers={["Pelanggaran", "Sanksi"]}
              rows={[
                ["Terlambat lapor SPT Tahunan OP", "Rp100.000 per SPT"],
                ["Terlambat lapor SPT Tahunan Badan", "Rp1.000.000 per SPT"],
                ["Terlambat bayar pajak", "Bunga 2%/bulan dari pajak terutang (max 48 bulan)"],
                ["Pengisian tidak benar (material)", "Sanksi kenaikan 50–100% dari pajak kurang bayar"],
              ]}
            />
            <Tip>Lebih baik lapor meskipun terlambat daripada tidak lapor sama sekali. Denda terlambat jauh lebih kecil dari sanksi tidak lapor.</Tip>

            <H2>Kontak dan Bantuan</H2>
            <UL>
              <li><strong>Kring Pajak:</strong> 1500200 (gratis, bisa tanya prosedur)</li>
              <li><strong>AR KPP:</strong> Account Representative di KPP tempat NPWP terdaftar, konsultasi gratis</li>
              <li><strong>Portal Coretax:</strong> pajak.go.id</li>
            </UL>
          </div>
        ),
      },
    ],
  },

  // ── TECHNOLOGY ───────────────────────────────────────────────────────────
  {
    id: "technology",
    label: "Teknologi",
    icon: Code2,
    sections: [
      {
        id: "tech-stack",
        title: "Tech Stack",
        content: (
          <div>
            <H2>Stack yang Digunakan</H2>
            <Table
              headers={["Layer", "Pilihan", "Catatan"]}
              rows={[
                ["Framework", "Next.js 15 (App Router)", "SSR + API routes dalam satu proyek"],
                ["Language", "TypeScript 5", "Strict mode, full type-safety"],
                ["Styling", "Tailwind CSS v4", "Config via @theme di globals.css"],
                ["Animasi", "Framer Motion 12", "Transisi halaman, grafik, modal"],
                ["Icon", "Lucide React", "Konsisten, tidak ada emoji"],
                ["Database", "PostgreSQL via Neon", "Serverless Postgres"],
                ["ORM", "Prisma 6", "Migration + type-safety, schema-first"],
                ["Auth", "Auth.js v5 (NextAuth)", "JWT di cookie httpOnly"],
                ["AI", "Google Gemini API", "Gemini 2.0 Flash via @google/generative-ai"],
                ["Charting", "Recharts 2", "Net worth trend, income vs expense"],
                ["Hosting", "Vercel", "Deploy otomatis dari GitHub"],
              ]}
            />

            <H2>Keputusan Arsitektur</H2>
            <div className="space-y-3">
              {[
                {
                  q: "Mengapa Next.js App Router?",
                  a: "React Server Components native — data fetching laporan keuangan langsung di server, tanpa client loading state, lebih cepat dan aman.",
                },
                {
                  q: "Mengapa amounts disimpan sebagai integer (sen)?",
                  a: "Floating-point precision issue adalah bug klasik di sistem keuangan. 0.1 + 0.2 = 0.30000000000000004 di JavaScript. Integer aritmatika selalu exact.",
                },
                {
                  q: "Mengapa laporan dihitung real-time, bukan disimpan?",
                  a: "Menyimpan laporan berisiko inkonsistensi kalau data berubah tapi laporan tidak di-sync. Real-time query dari journal_lines selalu konsisten.",
                },
                {
                  q: "Mengapa single-user UI tapi multi-user DB schema?",
                  a: "Menambahkan user_id di semua tabel dari awal biayanya rendah, tapi membuka jalur multi-user (pasangan/keluarga) tanpa rewrite besar.",
                },
              ].map(({ q, a }) => (
                <div key={q} className="rounded-lg border border-gray-100 bg-white p-4">
                  <p className="mb-1 text-sm font-semibold text-gray-900">{q}</p>
                  <p className="text-sm text-gray-500">{a}</p>
                </div>
              ))}
            </div>
          </div>
        ),
      },
      {
        id: "database-schema",
        title: "Skema Database",
        content: (
          <div>
            <H2>Relasi Antar Tabel</H2>
            <Code>{`users
  └── journal_entries (1:N)
        └── journal_lines (1:N)
              └── accounts (N:1)
        └── attachments (1:N)
  └── accounts (1:N)         ← chart of accounts per user
  └── audit_log (1:N)
  └── recurring_rules (1:N)
  └── chat_sessions (1:N)
        └── chat_messages (1:N)
  └── portfolio_holdings (1:N)`}</Code>

            <H2>Tabel Utama</H2>
            <H3>journal_entries</H3>
            <Code>{`id          String    @id @default(cuid())
userId      String
entryDate   DateTime
description String?
source      EntrySource  -- MANUAL | SCREENSHOT_AI | CHAT_AI
status      EntryStatus  -- DRAFT | CONFIRMED
createdAt   DateTime  @default(now())`}</Code>

            <H3>journal_lines — Inti Double-Entry</H3>
            <Code>{`id              String    @id @default(cuid())
journalEntryId  String
accountId       String
debit           Int       @default(0)  -- dalam sen IDR
credit          Int       @default(0)  -- dalam sen IDR
note            String?

-- Invariant: SUM(debit) = SUM(credit) per journal_entry`}</Code>

            <H3>accounts — Chart of Accounts</H3>
            <Code>{`id          String    @id @default(cuid())
userId      String
code        String    -- "1-102", "5-101.1"
nameEn      String
nameId      String
type        AccountType  -- ASSET | LIABILITY | EQUITY | INCOME | EXPENSE
parentId    String?   -- hierarki (self-referential)
isActive    Boolean   @default(true)`}</Code>

            <H2>Perintah Database</H2>
            <Table
              headers={["Perintah", "Fungsi"]}
              rows={[
                ["npm run db:generate", "Generate ulang Prisma client setelah schema berubah"],
                ["npm run db:push", "Sync schema ke database (non-destructive, dev only)"],
                ["npm run db:seed", "Seed 62 chart of accounts bawaan"],
                ["npm run db:studio", "Buka Prisma Studio GUI di localhost:5555"],
              ]}
            />
          </div>
        ),
      },
      {
        id: "ai-system",
        title: "Sistem AI",
        content: (
          <div>
            <H2>Model yang Digunakan</H2>
            <P>Laby menggunakan <strong>Gemini 2.0 Flash</strong> via <code className="rounded bg-gray-100 px-1 text-xs">@google/generative-ai</code> untuk dua fitur utama.</P>

            <H2>Fitur 1 — Screenshot Extraction</H2>
            <OL>
              <li>User upload gambar (max 4MB setelah kompresi)</li>
              <li>Backend encode ke base64, kirim ke Gemini dengan system prompt</li>
              <li>Gemini ekstrak: tanggal, nominal IDR, deskripsi, tipe, saran kode akun, confidence 0–1</li>
              <li>Output divalidasi dengan Zod schema</li>
              <li>Tampil sebagai tabel draft di UI, baris confidence {"<"} 0.7 diberi warning kuning</li>
              <li>User konfirmasi, baru tersimpan sebagai CONFIRMED</li>
            </OL>

            <H2>Fitur 2 — Chat Parsing</H2>
            <OL>
              <li>User ketik pesan natural language</li>
              <li>Gemini deteksi intent: TRANSACTION / QUERY / CLARIFY</li>
              <li>TRANSACTION → preview konfirmasi sebelum disimpan</li>
              <li>QUERY → jalankan query DB, kirim hasil ke Gemini untuk jawaban natural</li>
              <li>CLARIFY → tampilkan pertanyaan balik ke user</li>
            </OL>

            <H2>Rate Limit & Error Handling</H2>
            <Table
              headers={["Skenario", "Handling"]}
              rows={[
                ["Rate limit (429)", "Retry exponential backoff: 1s, 2s, 4s. Max 3 kali."],
                ["JSON parse gagal", "Log error + raw response, kembalikan error ke client"],
                ["Confidence < 0.7", "Highlight kuning di UI, minta user periksa"],
                ["Field null dari AI", "Highlight field, blok submit sampai user isi manual"],
              ]}
            />
            <Note>GEMINI_API_KEY hanya ada di server-side (API routes). Tidak pernah ada di client bundle.</Note>

            <H2>Model Aktif di Free Tier</H2>
            <UL>
              <li>Gemini 3.7 Flash, 3.6 Flash, 3.5 Flash (terbaru, gratis)</li>
              <li>Gemini 2.0 Flash / Flash-Lite (legacy, masih gratis)</li>
              <li>Semua seri Pro sudah paid-only sejak April 2026</li>
            </UL>
            <Tip>Untuk dapat API key: buka aistudio.google.com, login, klik &quot;Get API key&quot;. Tidak perlu kartu kredit.</Tip>
          </div>
        ),
      },
      {
        id: "dev-setup",
        title: "Setup Development",
        content: (
          <div>
            <H2>Prasyarat</H2>
            <Table
              headers={["Tools", "Versi minimum"]}
              rows={[
                ["Node.js", "20.x (LTS)"],
                ["npm", "10.x"],
                ["Akun Neon", "Free tier cukup untuk dev"],
                ["Google AI Studio", "Untuk Gemini API key (gratis)"],
              ]}
            />

            <H2>Langkah Setup</H2>
            <Code>{`# 1. Clone dan install
git clone <repo-url> laby
cd laby/app
npm install

# 2. Konfigurasi environment
cp .env.example .env
# Isi DATABASE_URL, DIRECT_URL, AUTH_SECRET, GEMINI_API_KEY

# 3. Setup database
npm run db:generate   # generate Prisma client
npm run db:push       # buat tabel
npm run db:seed       # seed 62 chart of accounts

# 4. Jalankan dev server
npm run dev
# Buka http://localhost:3000`}</Code>

            <H2>Environment Variables</H2>
            <Table
              headers={["Variable", "Keterangan"]}
              rows={[
                ["DATABASE_URL", "Pooled connection URL dari Neon (untuk runtime)"],
                ["DIRECT_URL", "Direct connection URL dari Neon (untuk migrations)"],
                ["AUTH_SECRET", "Secret untuk sign JWT. Generate: openssl rand -base64 32"],
                ["GEMINI_API_KEY", "API key dari Google AI Studio — server-side only"],
                ["NEXT_PUBLIC_APP_NAME", "Nama app yang tampil di UI"],
              ]}
            />
            <Warning>Tidak ada variable NEXT_PUBLIC_ yang menyimpan secret. Semua yang public hanya data non-sensitif.</Warning>
          </div>
        ),
      },
    ],
  },
];

// ─── Main Component ───────────────────────────────────────────────────────────

export function DocsClient() {
  const [activeGroup, setActiveGroup] = useState(DOCS[0].id);
  const [activeSection, setActiveSection] = useState(DOCS[0].sections[0].id);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(
    new Set(DOCS.map((g) => g.id))
  );
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  const currentGroup = DOCS.find((g) => g.id === activeGroup) ?? DOCS[0];
  const currentSection =
    currentGroup.sections.find((s) => s.id === activeSection) ??
    currentGroup.sections[0];

  // Search filter
  const filteredDocs = searchQuery.trim()
    ? DOCS.map((group) => ({
        ...group,
        sections: group.sections.filter(
          (s) =>
            s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            group.label.toLowerCase().includes(searchQuery.toLowerCase())
        ),
      })).filter((g) => g.sections.length > 0)
    : DOCS;

  function selectSection(groupId: string, sectionId: string) {
    setActiveGroup(groupId);
    setActiveSection(sectionId);
    setMobileNavOpen(false);
    setSearchQuery("");
    contentRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  }

  function toggleGroup(groupId: string) {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(groupId)) next.delete(groupId);
      else next.add(groupId);
      return next;
    });
  }

  const NavContent = () => (
    <nav className="flex flex-col h-full">
      {/* Search */}
      <div className="p-4 border-b border-gray-100">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
          <input
            type="text"
            placeholder="Cari topik..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2 pl-8 pr-3 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Nav groups */}
      <div className="flex-1 overflow-y-auto px-2 py-3 space-y-0.5">
        {filteredDocs.map((group) => {
          const Icon = group.icon;
          const isExpanded = expandedGroups.has(group.id) || !!searchQuery;
          const isGroupActive = group.id === activeGroup;

          return (
            <div key={group.id}>
              <button
                onClick={() => toggleGroup(group.id)}
                className={cn(
                  "flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isGroupActive
                    ? "text-primary-700 bg-primary-50"
                    : "text-gray-700 hover:bg-gray-100"
                )}
              >
                <Icon className={cn("h-4 w-4 shrink-0", isGroupActive ? "text-primary-600" : "text-gray-400")} />
                <span className="flex-1 text-left">{group.label}</span>
                {isExpanded ? (
                  <ChevronDown className="h-3.5 w-3.5 text-gray-400" />
                ) : (
                  <ChevronRight className="h-3.5 w-3.5 text-gray-400" />
                )}
              </button>

              <AnimatePresence initial={false}>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.18 }}
                    className="overflow-hidden"
                  >
                    <div className="ml-3 mt-0.5 space-y-0.5 border-l border-gray-100 pl-3 pb-1">
                      {group.sections.map((section) => {
                        const isActive =
                          activeSection === section.id && activeGroup === group.id;
                        return (
                          <button
                            key={section.id}
                            onClick={() => selectSection(group.id, section.id)}
                            className={cn(
                              "flex w-full items-center rounded-md px-2.5 py-1.5 text-sm transition-colors text-left",
                              isActive
                                ? "bg-primary-600 text-white font-medium"
                                : "text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                            )}
                          >
                            {section.title}
                          </button>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </nav>
  );

  return (
    <div className="flex h-[calc(100vh-3.5rem)] lg:h-[calc(100vh-4rem)] -m-4 lg:-m-6 overflow-hidden">
      {/* ── Desktop sidebar nav ─────────────────────────────────────────── */}
      <aside className="hidden lg:flex w-60 shrink-0 flex-col border-r border-gray-200 bg-white overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Documentation</p>
        </div>
        <NavContent />
      </aside>

      {/* ── Mobile nav drawer ────────────────────────────────────────────── */}
      <AnimatePresence>
        {mobileNavOpen && (
          <>
            <motion.div
              key="docs-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
              onClick={() => setMobileNavOpen(false)}
            />
            <motion.aside
              key="docs-drawer"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-white border-r border-gray-200 lg:hidden"
              style={{ top: "3.5rem" }}
            >
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Documentation</p>
                <button
                  onClick={() => setMobileNavOpen(false)}
                  className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <NavContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ── Main content ─────────────────────────────────────────────────── */}
      <div className="flex flex-1 flex-col min-w-0 overflow-hidden">
        {/* Content topbar */}
        <div className="flex h-12 shrink-0 items-center justify-between border-b border-gray-200 bg-white px-4 lg:px-6">
          {/* Mobile: hamburger + breadcrumb */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileNavOpen(true)}
              className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-gray-600 hover:bg-gray-100 lg:hidden"
            >
              <BookOpen className="h-4 w-4" />
              <span>Menu</span>
            </button>
            <div className="hidden lg:flex items-center gap-1.5 text-sm">
              <span className="text-gray-400">{currentGroup.label}</span>
              <ChevronRight className="h-3.5 w-3.5 text-gray-300" />
              <span className="font-medium text-gray-700">{currentSection.title}</span>
            </div>
          </div>

          {/* Breadcrumb on mobile */}
          <div className="flex lg:hidden items-center gap-1.5 text-sm">
            <span className="text-gray-400 text-xs">{currentGroup.label}</span>
            <ChevronRight className="h-3 w-3 text-gray-300" />
            <span className="font-medium text-gray-700 text-xs">{currentSection.title}</span>
          </div>

          {/* GitHub link */}
          <a
            href="https://github.com/wayphantomme/laby-finance"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">GitHub</span>
          </a>
        </div>

        {/* Scrollable content */}
        <div ref={contentRef} className="flex-1 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeGroup + activeSection}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
              className="mx-auto max-w-3xl px-4 py-6 lg:px-8 lg:py-8"
            >
              {/* Section header */}
              <div className="mb-6 pb-4 border-b border-gray-100">
                <div className="mb-1 flex items-center gap-2">
                  {(() => {
                    const Icon = currentGroup.icon;
                    return <Icon className="h-4 w-4 text-primary-600" />;
                  })()}
                  <span className="text-xs font-semibold uppercase tracking-wide text-primary-600">
                    {currentGroup.label}
                  </span>
                </div>
                <h1 className="text-xl font-bold text-gray-900">{currentSection.title}</h1>
              </div>

              {/* Content */}
              <div>{currentSection.content}</div>

              {/* Prev/Next navigation */}
              <div className="mt-10 pt-6 border-t border-gray-100">
                <PrevNextNav
                  currentGroup={activeGroup}
                  currentSection={activeSection}
                  onNavigate={selectSection}
                />
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

// ─── Prev / Next Nav ─────────────────────────────────────────────────────────

function PrevNextNav({
  currentGroup,
  currentSection,
  onNavigate,
}: {
  currentGroup: string;
  currentSection: string;
  onNavigate: (groupId: string, sectionId: string) => void;
}) {
  // Flatten all sections in order
  const all: { groupId: string; groupLabel: string; sectionId: string; sectionTitle: string }[] = [];
  for (const group of DOCS) {
    for (const section of group.sections) {
      all.push({
        groupId: group.id,
        groupLabel: group.label,
        sectionId: section.id,
        sectionTitle: section.title,
      });
    }
  }

  const idx = all.findIndex(
    (item) => item.groupId === currentGroup && item.sectionId === currentSection
  );
  const prev = idx > 0 ? all[idx - 1] : null;
  const next = idx < all.length - 1 ? all[idx + 1] : null;

  return (
    <div className="flex items-stretch gap-3">
      {prev ? (
        <button
          onClick={() => onNavigate(prev.groupId, prev.sectionId)}
          className="flex flex-1 items-center gap-3 rounded-lg border border-gray-200 bg-white px-4 py-3 text-left hover:bg-gray-50 transition-colors"
        >
          <ChevronRight className="h-4 w-4 shrink-0 rotate-180 text-gray-400" />
          <div className="min-w-0">
            <p className="text-xs text-gray-400">{prev.groupLabel}</p>
            <p className="text-sm font-medium text-gray-800 truncate">{prev.sectionTitle}</p>
          </div>
        </button>
      ) : (
        <div className="flex-1" />
      )}
      {next ? (
        <button
          onClick={() => onNavigate(next.groupId, next.sectionId)}
          className="flex flex-1 items-center justify-end gap-3 rounded-lg border border-gray-200 bg-white px-4 py-3 text-right hover:bg-gray-50 transition-colors"
        >
          <div className="min-w-0">
            <p className="text-xs text-gray-400">{next.groupLabel}</p>
            <p className="text-sm font-medium text-gray-800 truncate">{next.sectionTitle}</p>
          </div>
          <ChevronRight className="h-4 w-4 shrink-0 text-gray-400" />
        </button>
      ) : (
        <div className="flex-1" />
      )}
    </div>
  );
}
