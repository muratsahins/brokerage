// ABD büyük şirketler sekmesi için TEMEL ANALİZ ağırlıklı puanlama.
// recommend.js'teki BIST puanı momentum + analist hedefi ağırlıklıyken, bu
// sekme momentum yerine gelir büyümesi, net marj, kaldıraç (Net Debt/EBITDA)
// ve FCF marjını puanın merkezine koyar — YATIRIM TAVSİYESİ DEĞİLDİR.
//
// Eşikler BIST ile aynı: ≥65 AL, 45-64 TUT, <45 İZLE (README'deki tabloya
// tutarlı). Eksik bileşen varsa (ör. EBITDA negatifse kaldıraç hesaplanamaz)
// ağırlıklar kalan bileşenler arasında normalize edilir — recommend.js'teki
// priceDerived ile aynı desen.

import { clamp01, round, roundPrice } from './recommend.js';

export function scoreUsQuote(q) {
  const price = q.price;
  const hasTarget = q.targetMean != null && q.targetMean > 0 && price > 0;
  const upside12m = hasTarget ? (q.targetMean - price) / price : null;

  const nUpside = upside12m != null
    ? clamp01((upside12m * 100 + 20) / 80)              // -20%..+60%
    : null;
  const nRevGrowth = q.revenueGrowth != null
    ? clamp01((q.revenueGrowth * 100 + 10) / 40)         // -10%..+30% YoY
    : null;
  const nMargin = q.profitMargins != null
    ? clamp01(q.profitMargins / 0.30)                    // %0..%30 net marj
    : null;

  const netDebtToEbitda = (q.totalDebt != null && q.totalCash != null && q.ebitda != null && q.ebitda > 0)
    ? (q.totalDebt - q.totalCash) / q.ebitda
    : null;
  const nLeverage = netDebtToEbitda != null
    ? clamp01((3.5 - netDebtToEbitda) / 4.5)             // 3.5x (zayıf)..-1x (net nakit)
    : null;

  const fcfMargin = (q.freeCashflow != null && q.totalRevenue != null && q.totalRevenue > 0)
    ? q.freeCashflow / q.totalRevenue
    : null;
  const nFcf = fcfMargin != null
    ? clamp01(fcfMargin / 0.30)                          // %0..%30 FCF marjı
    : null;

  const parts = [
    { v: nUpside, w: 0.35 },
    { v: nRevGrowth, w: 0.20 },
    { v: nMargin, w: 0.15 },
    { v: nLeverage, w: 0.15 },
    { v: nFcf, w: 0.15 },
  ].filter((p) => p.v != null);
  const wsum = parts.reduce((s, p) => s + p.w, 0);
  const raw = wsum > 0 ? parts.reduce((s, p) => s + p.v * p.w, 0) / wsum : 0;
  const score = wsum > 0 ? Math.round(raw * 100) : null;

  let signal = 'İZLE';
  if (score != null) {
    if (score >= 65) signal = 'AL';
    else if (score >= 45) signal = 'TUT';
  }

  const band = (q.fiftyTwoWeekHigh != null && q.fiftyTwoWeekLow != null)
    ? q.fiftyTwoWeekHigh - q.fiftyTwoWeekLow
    : null;
  const pos52w = band != null && band > 0 ? clamp01((price - q.fiftyTwoWeekLow) / band) : null;

  return {
    ticker: q.ticker,
    price: roundPrice(price),
    currency: q.currency ?? 'USD',
    changePct: round(q.changePct),
    marketCap: q.marketCap ?? null,
    sector: q.sector ?? null,
    industry: q.industry ?? null,
    pos52w: pos52w != null ? round(pos52w, 3) : null,

    upside12m: upside12m != null ? round(upside12m * 100) : null,
    targetMean: round(q.targetMean),
    recommendationKey: q.recommendationKey ?? null,
    numAnalysts: q.numAnalysts ?? null,

    revenueGrowth: q.revenueGrowth != null ? round(q.revenueGrowth * 100) : null,
    revenue3yCagr: q.revenue3yCagr != null ? round(q.revenue3yCagr * 100) : null,
    profitMargins: q.profitMargins != null ? round(q.profitMargins * 100) : null,
    netDebtToEbitda: netDebtToEbitda != null ? round(netDebtToEbitda) : null,
    fcfMargin: fcfMargin != null ? round(fcfMargin * 100) : null,
    dividendYield: q.dividendYield != null ? round(q.dividendYield * 100) : null,
    forwardPE: round(q.forwardPE),
    trailingPE: round(q.trailingPE),
    priceToBook: round(q.priceToBook),

    score,
    signal,
  };
}

export function buildUsRecommendations(quotes) {
  return quotes.map(scoreUsQuote).sort((a, b) => (b.score ?? -1) - (a.score ?? -1));
}
