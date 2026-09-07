// Utility: amounts are stored as integer sen (1 IDR = 100 sen)
// Display always in IDR with dot-thousands separator per Indonesian convention

export function senToIdr(sen: number): number {
  return sen / 100;
}

export function idrToSen(idr: number): number {
  return Math.round(idr * 100);
}

export function formatRupiah(sen: number, opts?: { short?: boolean }): string {
  const idr = senToIdr(sen);
  if (opts?.short) {
    if (Math.abs(idr) >= 1_000_000_000)
      return `Rp${(idr / 1_000_000_000).toFixed(1)}M`;
    if (Math.abs(idr) >= 1_000_000)
      return `Rp${(idr / 1_000_000).toFixed(1)}jt`;
    if (Math.abs(idr) >= 1_000) return `Rp${(idr / 1_000).toFixed(0)}rb`;
  }
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(idr);
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

export function formatDateInput(date: Date | string): string {
  return new Date(date).toISOString().split("T")[0];
}

const MONTH_NAMES = [
  "Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
  "Jul", "Agu", "Sep", "Okt", "Nov", "Des",
];

export function monthName(monthIndex: number): string {
  return MONTH_NAMES[monthIndex] ?? "";
}
