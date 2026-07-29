// Uygulama genelinde paylaşılan küçük yardımcılar. App.jsx ve tembel yüklenen
// ChartModal.jsx aynı kopyayı kullansın diye ayrı dosyada.

// Canlıda backend ayrı bir origin'de (Render). VITE_API_URL ile verilir.
// Dev'de boş kalır → '/api...' Vite proxy üzerinden backend'e gider.
export const API_BASE = import.meta.env.VITE_API_URL || '';

export function fmtNum(x, digits = 2) {
  if (x == null || Number.isNaN(x)) return '—';
  const a = Math.abs(x);
  const maxD = a > 0 && a < 1 ? (a >= 0.01 ? 4 : 8) : digits; // küçük fiyatlarda (kripto) daha çok ondalık
  return Number(x).toLocaleString('tr-TR', {
    minimumFractionDigits: Math.min(digits, maxD),
    maximumFractionDigits: Math.max(digits, maxD),
  });
}
export function roundPrice(x) {
  const a = Math.abs(x);
  const d = a >= 1 ? 2 : a >= 0.01 ? 6 : 10;
  const f = 10 ** d;
  return Math.round(x * f) / f;
}

// Türkçe karakter duyarsız normalleştirme (arama için): "Şişecam" -> "sisecam".
export function norm(s) {
  return (s || '')
    .replace(/[İIı]/g, 'i')
    .replace(/[Şş]/g, 's')
    .replace(/[Ğğ]/g, 'g')
    .replace(/[Üü]/g, 'u')
    .replace(/[Öö]/g, 'o')
    .replace(/[Çç]/g, 'c')
    .toLowerCase();
}
