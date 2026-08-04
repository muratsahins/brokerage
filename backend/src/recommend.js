// Veri odaklı, ŞEFFAF öneri ve beklenen getiri tahmini. YATIRIM TAVSİYESİ DEĞİLDİR.
//
// "Beklenen artış" tahminleri GERÇEK analist konsensüs hedef fiyatından türetilir:
//   upside12m = (analist ort. hedef - fiyat) / fiyat          (gerçek veri)
//   exp1m     = (1 + upside12m)^(1/12) - 1                     (zaman ölçekleme)
//   exp3m     = (1 + upside12m)^(3/12) - 1
// Analist kapsamı olmayan hisselerde tahmin üretilmez (null) — uydurmuyoruz.

import {
  supertrendSignal, wavetrendSignal, wavetrendCrossSignal,
  rsiValue, macdBullish, rsiBullishReversal, macdBullCross, smcBullish,
} from './indicators.js';

function clamp01(x) {
  return Math.max(0, Math.min(1, x));
}
// Fiyat için uyarlamalı yuvarlama: küçük fiyatlarda (kripto) daha çok ondalık.
export function roundPrice(x) {
  if (x == null || Number.isNaN(x)) return null;
  const a = Math.abs(x);
  const d = a >= 1 ? 2 : a >= 0.01 ? 6 : 10;
  const f = 10 ** d;
  return Math.round(x * f) / f;
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

// --- Fiyata bağlı türetilmiş alanlar ---------------------------------------
// Analist potansiyeli, 1 aylık momentum, puan ve AL/TUT/İZLE sinyali yalnızca
// fiyata (+ değişmeyen analist/temel verilere) bağlıdır. Canlı fiyat tazelemesi
// bunları AYNI formülle yeniden hesaplasın diye ayrı fonksiyon (liveSignals.js).
export function priceDerived({ price, firstClose, targetMean, recommendationKey, forwardPE }) {
  const momentum1m = firstClose != null && firstClose > 0
    ? ((price - firstClose) / firstClose) * 100
    : null;

  // --- Analist hedefine dayalı beklenen getiri --------------------------
  const hasTarget = targetMean != null && targetMean > 0 && price > 0;
  let upside12m = null, exp1m = null, exp3m = null;
  if (hasTarget) {
    upside12m = (targetMean - price) / price; // oran
    exp1m = Math.pow(1 + upside12m, 1 / 12) - 1;
    exp3m = Math.pow(1 + upside12m, 3 / 12) - 1;
  }

  // --- Puan bileşenleri (0..1) -----------------------------------------
  const nMomentum = momentum1m != null
    ? clamp01((momentum1m + 20) / 40)                      // -20%..+20%
    : null;
  const nUpside = upside12m != null
    ? clamp01((upside12m * 100 + 20) / 80)                 // -20%..+60%
    : null;
  const nRec = recommendationKey && REC_SCORE[recommendationKey] != null
    ? REC_SCORE[recommendationKey]
    : null;
  // Değerleme: düşük ileri F/K daha cazip (0<PE<5 => ~1, PE>=30 => 0)
  const nValue = forwardPE != null && forwardPE > 0
    ? clamp01((30 - forwardPE) / 25)
    : null;

  // Mevcut bileşenlere göre ağırlıkları normalize et (eksik veriyi atla)
  const parts = [
    { v: nUpside, w: 0.45 },
    { v: nRec, w: 0.20 },
    { v: nMomentum, w: 0.20 },
    { v: nValue, w: 0.15 },
  ].filter((p) => p.v != null);
  const wsum = parts.reduce((s, p) => s + p.w, 0) || 1;
  const raw = parts.reduce((s, p) => s + p.v * p.w, 0) / wsum;

  // Analist kapsamı yoksa (hedef fiyat da tavsiye de yok) puan yalnızca fiyat
  // hareketinden geliyor demektir — puanın %65'i normalde analist bileşenlerinden
  // gelir. Böyle bir enstrüman analist teyitli hisseyle aynı kefeye konmasın diye
  // puan tavanla ORANTILI ölçeklenir: sıralama korunur, tam puan verilmez
  // (ham 100 -> 60). Tavanın altında kaldığı için AL rozeti de çıkamaz (eşik 65).
  const NO_ANALYST_CAP = 60;
  const hasAnalystCoverage = nUpside != null || nRec != null;
  const score = Math.round(raw * (hasAnalystCoverage ? 100 : NO_ANALYST_CAP));

  let signal = 'İZLE';
  if (score >= 65) signal = 'AL';
  else if (score >= 45) signal = 'TUT';
  // AL için analist "Güçlü AL" (strong_buy) teyidi şart: yoksa AL -> TUT'a indir.
  if (signal === 'AL' && recommendationKey !== 'strong_buy') signal = 'TUT';

  return {
    momentum1m: round(momentum1m),
    upside12m: upside12m != null ? round(upside12m * 100) : null,
    exp1m: exp1m != null ? round(exp1m * 100) : null,
    exp3m: exp3m != null ? round(exp3m * 100) : null,
    score,
    signal,
  };
}

export function scoreQuote(q) {
  const f = q.fundamentals ?? {};
  const price = q.price;

  const changePct = ((price - q.previousClose) / q.previousClose) * 100;

  const band = q.fiftyTwoWeekHigh - q.fiftyTwoWeekLow;
  const pos52w = band > 0 ? clamp01((price - q.fiftyTwoWeekLow) / band) : 0.5;

  const d = priceDerived({
    price,
    firstClose: q.firstClose,
    targetMean: f.targetMean,
    recommendationKey: f.recommendationKey,
    forwardPE: f.forwardPE,
  });

  // --- TradingView teknik gösterge sinyalleri (AL/SAT) -----------------------
  // WaveTrend Oscillator (LazyBear): standart kesişim + 53-60 aşırı bölge sürümü.
  const wtCrossSignal = wavetrendCrossSignal(q.highs, q.lows, q.closes);
  const wtSignal = wavetrendSignal(q.highs, q.lows, q.closes);
  const stSignal = supertrendSignal(q.highs, q.lows, q.closes);
  const rsi = rsiValue(q.closes);
  const macdBull = macdBullish(q.closes);
  const rsiReversal = rsiBullishReversal(q.closes);   // aşırı satımdan yukarı dönüş
  const macdCross = macdBullCross(q.closes);          // MACD pozitif kesişim
  const smc = smcBullish(q.highs, q.lows, q.closes, q.volumes);  // SMC yükseliş yapı kırılımı

  return {
    symbol: q.symbol,
    ticker: q.ticker,
    price: roundPrice(price),
    currency: q.currency,
    changePct: round(changePct),
    momentum1m: d.momentum1m,
    pos52w: round(pos52w, 3),
    // beklenen getiriler (yüzde)
    exp1m: d.exp1m,
    exp3m: d.exp3m,
    upside12m: d.upside12m,
    targetMean: round(f.targetMean),
    targetHigh: round(f.targetHigh),
    targetLow: round(f.targetLow),
    recommendationKey: f.recommendationKey ?? null,
    numAnalysts: f.numAnalysts ?? null,
    forwardPE: round(f.forwardPE),
    revenueGrowth: f.revenueGrowth != null ? round(f.revenueGrowth * 100) : null,
    score: d.score,
    signal: d.signal,
    wtSignal,      // 53-60 WaveTrend (aşırı bölge kesişimi): 'AL' | 'SAT' | null
    wtCrossSignal, // WaveTrend standart kesişim (LazyBear): 'AL' | 'SAT' | null
    stSignal,      // SuperTrend (Kıvanç Özbilgiç): 'AL' | 'SAT' | null
    rsi: rsi != null ? round(rsi, 1) : null, // RSI 14 (son)
    macdBull,           // MACD mavi çizgi sinyal çizgisinin üstünde mi
    rsiReversal,   // RSI aşırı satımdan (30 altı) yukarı dönüş
    macdCross,     // MACD pozitif kesişim (sıfır çizgisi şartsız)
    smc,           // SMC yükseliş (likidite süpürme + yapı kırılımı)
  };
}

export function buildRecommendations(quotes) {
  return quotes.map(scoreQuote).sort((a, b) => b.score - a.score);
}
