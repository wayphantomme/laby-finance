# Gemini API (Google AI Studio) — Free Tier Cheatsheet

*Update: September 2026*

## Apa Aja yang Bisa Dipakai Gratis

- **Text chat & reasoning** — tanya jawab, nulis, coding, terjemahan
- **Vision** — kirim gambar/screenshot, model bisa jelasin isinya
- **Web search grounding** — gratis 5.000 prompt/bulan buat keluarga Gemini 3.x
- **Function/tool calling** — model bisa manggil fungsi custom lo
- **Structured output (JSON)** — jawaban langsung dalam format terstruktur, gampang diproses program
- **Long context** — hampir semua model current support context window 1 juta token (~750K kata)
- **Document understanding** — baca PDF dan file lain

## Model yang AKTIF di Free Tier

| Model | Catatan |
|---|---|
| Gemini 3.7 Flash | Terbaru, punya native grounding |
| Gemini 3.6 Flash | |
| Gemini 3.5 Flash | |
| Gemini 3 Flash Preview | Gen sebelumnya |
| Gemini 3.5 Flash-Lite | Versi hemat token |
| Gemini 3.1 Flash-Lite | Versi hemat token |
| Gemini 2.5 Pro / Flash / Flash-Lite | Generasi lama, masih gratis |
| Gemini 2.0 Flash / Flash-Lite | Legacy, masih gratis |

Semua model di atas gratis di level API, tunduk pada rate limit dan ketentuan bahwa prompt bisa dipakai Google buat improve produk mereka.

## Model yang SUDAH NONAKTIF dari Free Tier

- **Gemini 3.1 Pro Preview** → sekarang paid-only
- Sejak **April 2026**, semua seri Pro (Gemini 2.5 Pro versi baru, Gemini 3.x Pro) dipindah ke paid-only

Kesimpulan: flagship/Pro model (reasoning paling kuat) sekarang bayar semua. Yang gratis tinggal seri **Flash & Flash-Lite**, tapi tetep cukup capable buat kebanyakan use case (vision, chat, tool calling).

## Contoh Rate Limit Free Tier (per model, bisa berubah)

| Model | RPM | TPM | RPD |
|---|---|---|---|
| Gemini 2.5 Flash Preview | 10 | 250.000 | 500 |
| Gemini 1.5 Flash | 15 | 1.000.000 | 1.500 |
| Gemini 1.5 Pro | 2 | 32.000 | 50 |
| Gemini 2.0 Flash Lite | 30 | 1.000.000 | 1.500 |

*RPM = requests per minute, TPM = tokens per minute, RPD = requests per day. Angka pasti selalu cek langsung di Google AI Studio karena bisa berubah.*

## Cara Dapat API Key

1. Buka [aistudio.google.com](https://aistudio.google.com)
2. Login pakai akun Google
3. Klik "Get API key" di sidebar kiri
4. Buat API key baru — nggak perlu kartu kredit buat free tier

## Provider Alternatif (Kalau Butuh Vision Gratis Juga)

- **OpenRouter** — aggregator banyak model gratis, format OpenAI-compatible
- **Groq** — inference cepat (LPU), ada model vision gratis
- **Cloudflare Workers AI** — ada Qwen3.8-27B, vision-language model, context 262K
- **Mistral API** — free tier ada, sebagian model support vision

## Generate Gambar (Text-to-Image, Beda dari Vision)

- **Google AI Studio** — free trial credit, bisa generate & edit gambar
- **Hugging Face** — free tier bulanan + akses gratis Spaces (Stable Diffusion/FLUX) via ZeroGPU, ada limit waktu GPU harian
- **Puter.js** — model "user-pays": user pakai akun Puter sendiri, developer nggak nanggung biaya AI sama sekali
- **Stability AI** — free credit awal, abis itu pay-as-you-go
