// Veri odaklı, ŞEFFAF öneri ve beklenen getiri tahmini. YATIRIM TAVSİYESİ DEĞİLDİR.
//
// "Beklenen artış" tahminleri GERÇEK analist konsensüs hedef fiyatından türetilir:
//   upside12m = (analist ort. hedef - fiyat) / fiyat          (gerçek veri)
//   exp1m     = (1 + upside12m)^(1/12) - 1                     (zaman ölçekleme)
//   exp3m     = (1 + upside12m)^(3/12) - 1
// Analist kapsamı olmayan hisselerde tahmin üretilmez (null) — uydurmuyoruz.

function clamp01(x) {
  return Math.max(0, Math.min(1, x));
}
function round(x, digits = 2) {
  if (x == null || Number.isNaN(x)) return null;
  const f = 10 ** digits;
  return Math.round(x * f) / f;
}

const REC_SCORE = {
  strong_buy: 1.0,
  buy: 0.78,
  hold: 0.5,
  underperform: 0.28,
  sell: 0.05,
};

export function scoreQuote(q) {
  const f = q.fundamentals ?? {};
  const price = q.price;

  const changePct = ((price - q.previousClose) / q.previousClose) * 100;
  const momentum1m = ((price - q.firstClose) / q.firstClose) * 100;

  const band = q.fiftyTwoWeekHigh - q.fiftyTwoWeekLow;
  const pos52w = band > 0 ? clamp01((price - q.fiftyTwoWeekLow) / band) : 0.5;

  // --- Analist hedefine dayalı beklenen getiri --------------------------
  const hasTarget = f.targetMean != null && f.targetMean > 0 && price > 0;
  let upside12m = null, exp1m = null, exp3m = null;
  if (hasTarget) {
    upside12m = (f.targetMean - price) / price; // oran
    exp1m = Math.pow(1 + upside12m, 1 / 12) - 1;
    exp3m = Math.pow(1 + upside12m, 3 / 12) - 1;
  }

  // --- Puan bileşenleri (0..1) -----------------------------------------
  const nMomentum = clamp01((momentum1m + 20) / 40);      // -20%..+20%
  const nUpside = upside12m != null
    ? clamp01((upside12m * 100 + 20) / 80)                 // -20%..+60%
    : null;
  const nRec = f.recommendationKey && REC_SCORE[f.recommendationKey] != null
    ? REC_SCORE[f.recommendationKey]
    : null;
  // Değerleme: düşük ileri F/K daha cazip (0<PE<5 => ~1, PE>=30 => 0)
  const nValue = f.forwardPE != null && f.forwardPE > 0
    ? clamp01((30 - f.forwardPE) / 25)
    : null;

  // Mevcut bileşenlere göre ağırlıkları normalize et (eksik veriyi atla)
  const parts = [
    { v: nUpside, w: 0.45 },
    { v: nRec, w: 0.20 },
    { v: nMomentum, w: 0.20 },
    { v: nValue, w: 0.15 },
  ].filter((p) => p.v != null);
  const wsum = parts.reduce((s, p) => s + p.w, 0) || 1;
  const score = Math.round((parts.reduce((s, p) => s + p.v * p.w, 0) / wsum) * 100);

  let signal = 'İZLE';
  if (score >= 65) signal = 'AL';
  else if (score >= 45) signal = 'TUT';

  return {
    symbol: q.symbol,
    price: round(price),
    currency: q.currency,
    changePct: round(changePct),
    momentum1m: round(momentum1m),
    pos52w: round(pos52w, 3),
    // beklenen getiriler (yüzde)
    exp1m: exp1m != null ? round(exp1m * 100) : null,
    exp3m: exp3m != null ? round(exp3m * 100) : null,
    upside12m: upside12m != null ? round(upside12m * 100) : null,
    targetMean: round(f.targetMean),
    targetHigh: round(f.targetHigh),
    targetLow: round(f.targetLow),
    recommendationKey: f.recommendationKey ?? null,
    numAnalysts: f.numAnalysts ?? null,
    forwardPE: round(f.forwardPE),
    revenueGrowth: f.revenueGrowth != null ? round(f.revenueGrowth * 100) : null,
    score,
    signal,
  };
}

export function buildRecommendations(quotes) {
  return quotes.map(scoreQuote).sort((a, b) => b.score - a.score);
}
