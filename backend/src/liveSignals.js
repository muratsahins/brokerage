// Teknik göstergeleri FİYATLA AYNI ANDA tazeler.
//
// Neden önbellek: göstergeler 1 yıllık günlük bar geçmişi ister; 692 enstrüman
// için bunu her fiyat yenilemesinde (~18 sn) Yahoo'dan çekmek mümkün değil.
// Ama seans içinde geçmiş barlar DEĞİŞMEZ — yalnızca son bar hareket eder.
// Bu yüzden bar geçmişi bellekte tutulur, her fiyat yenilemesinde son bar canlı
// fiyatla güncellenip göstergeler yeniden hesaplanır. Sonuç, her seferinde
// 1 yıllık veriyi yeniden çekmekle aynıdır (yalnızca son barın hacmi ve
// gün içi yüksek/düşüğü önbellek tazeliği kadar gecikir).

import { INSTRUMENTS } from './stocks.js';
import { fetchDailyBars, fetchLivePrices, fetchLiveBars } from './dataSource.js';
import {
  supertrendSignal, wavetrendSignals, smcBullish, volumeReversal,
} from './indicators.js';
import { priceDerived } from './recommend.js';

// Bar geçmişi önbelleği ömrü. Geçmiş barlar seans içinde değişmez; tazelik
// yalnızca SON barın gün içi yüksek/düşük ve HACİM değerleri için gerekir
// (kapanışı zaten canlı fiyatla güncelleniyor). 30 dk: tam tur ~4 dk sürdüğü
// için saatte ~8 dk arka plan çekimi demek.
const TTL_MS = Number(process.env.SERIES_TTL_MINUTES ?? 30) * 60 * 1000;
// Yahoo'yu yormamak için enstrümanlar arası bekleme.
const GAP_MS = Number(process.env.SERIES_FETCH_GAP_MS ?? 350);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const day = (t, off) => Math.floor((t + off) / 86400);
const round = (x, d = 2) => (x == null ? null : Math.round(x * 10 ** d) / 10 ** d);

// ticker -> { open[], high[], low[], close[], volume[], lastTs, gmtoffset, at }
const cache = new Map();
let filling = false;

export function seriesStats() {
  return { cached: cache.size, total: INSTRUMENTS.length, filling };
}

// Eksik/bayat bar geçmişlerini arka planda (sırayla, nazikçe) tazeler.
export async function refreshSeries() {
  if (filling) return;
  filling = true;
  let ok = 0, fail = 0, skip = 0;
  try {
    for (const inst of INSTRUMENTS) {
      const cur = cache.get(inst.ticker);
      if (cur && Date.now() - cur.at < TTL_MS) { skip++; continue; }
      try {
        const { bars, meta } = await fetchDailyBars(inst.symbol);
        if (bars.length) {
          cache.set(inst.ticker, {
            open: bars.map((b) => b.open),
            high: bars.map((b) => b.high),
            low: bars.map((b) => b.low),
            close: bars.map((b) => b.close),
            volume: bars.map((b) => b.volume),
            lastTs: bars[bars.length - 1].ts,
            gmtoffset: meta.gmtoffset ?? 0,
            at: Date.now(),
          });
          ok++;
        } else fail++;
      } catch {
        fail++; // bu enstrümanı atla; bir sonraki turda tekrar denenir
      }
      await sleep(GAP_MS);
    }
  } finally {
    filling = false;
  }
  if (ok || fail) {
    console.log(`[live] Bar geçmişi tazelendi — ${ok} yeni, ${skip} taze, ${fail} başarısız (önbellek ${cache.size}/${INSTRUMENTS.length}).`);
  }
}

// Önbellekteki seriyi canlı veriyle günceller: kapanış canlı fiyattan, son barın
// açılış/yüksek/düşük/HACİM değerleri ise canlı gün içi bardan (v7/quote) gelir —
// böylece son bar fiyatla tamamen aynı tazelikte olur. Canlı bar yoksa (crumb
// alınamadıysa) önbellekteki değerler kullanılır, kapanış yine canlıdır.
// Yeni seansa geçildiyse yeni bar eklenir.
function seriesWithLive(entry, price, priceTs, bar) {
  const { gmtoffset: off } = entry;
  const lastDay = day(entry.lastTs, off);
  const liveDay = priceTs != null ? day(priceTs, off)
    : (bar?.ts != null ? day(bar.ts, off) : null);
  // Gün içi bar yalnızca canlı fiyatla AYNI seansa aitse kullanılabilir.
  const b = (bar && bar.ts != null && liveDay != null && day(bar.ts, off) === liveDay)
    ? bar : null;

  if (liveDay != null && liveDay > lastDay) {
    // Yeni seans: önbellekte henüz barı yok.
    return {
      opens: [...entry.open, b?.open ?? price],
      highs: [...entry.high, Math.max(b?.high ?? price, price)],
      lows: [...entry.low, Math.min(b?.low ?? price, price)],
      closes: [...entry.close, price],
      volumes: [...entry.volume, b?.volume ?? 0],
    };
  }

  const i = entry.close.length - 1;
  const closes = entry.close.slice();
  const highs = entry.high.slice();
  const lows = entry.low.slice();
  closes[i] = price;
  highs[i] = Math.max(b?.high ?? -Infinity, highs[i], price);
  lows[i] = Math.min(b?.low ?? Infinity, lows[i], price);
  let opens = entry.open, volumes = entry.volume;
  if (b) {
    if (b.open != null) { opens = entry.open.slice(); opens[i] = b.open; }
    volumes = entry.volume.slice();
    volumes[i] = b.volume; // gün içi hacim (önbellektekinin yerine)
  }
  return { opens, highs, lows, closes, volumes };
}

// Canlı fiyatlardan gösterge sinyallerini üretir. Yanıt küçük kalsın diye kısa
// anahtar + yalnızca dolu alanlar: st=SuperTrend, wt=WaveTrend kesişimi,
// wo=overzone (53-60), smc=SMC yükseliş, vr=hacim dönüşü.
export function computeLiveSignals(prices, bars = {}) {
  const out = {};
  for (const [ticker, p] of Object.entries(prices)) {
    const entry = cache.get(ticker);
    if (!entry || p?.price == null) continue; // geçmişi yoksa yayınlanan değer kalsın
    const s = seriesWithLive(entry, p.price, p.ts, bars?.[ticker]);
    const sig = {};
    const st = supertrendSignal(s.highs, s.lows, s.closes);
    if (st) sig.st = st;
    const { cross, overzone } = wavetrendSignals(s.highs, s.lows, s.closes);
    if (cross) sig.wt = cross;
    if (overzone) sig.wo = overzone;
    if (smcBullish(s.highs, s.lows, s.closes)) sig.smc = 1;
    const vr = volumeReversal(s.opens, s.highs, s.lows, s.closes, s.volumes);
    if (vr) {
      sig.vr = {
        barsAgo: vr.barsAgo,
        reds: vr.reds,
        volRatio: round(vr.volRatio),
        volAvgRatio: round(vr.volAvgRatio),
        gainPct: round(vr.gainPct),
        dropPct: round(vr.dropPct),
      };
    }
    out[ticker] = sig; // boş nesne de anlamlı: "hesaplandı, sinyal yok"
  }
  return out;
}

// Analist potansiyeli, momentum, puan ve AL/TUT/İZLE sinyalini canlı fiyattan
// yeniden hesaplar (formül recommend.js'te — tek yerde). Analist hedefi ve temel
// veriler yayınlanan kalemden gelir; yalnızca fiyat tazedir.
// 1 ay önceki kapanış (firstClose) yayında yok: yayındaki fiyat + momentum1m'den
// birebir geri türetilir.
export function computeLiveScores(items, prices) {
  const out = {};
  for (const it of items) {
    const p = prices[it.ticker];
    if (!p || p.price == null) continue;
    const firstClose = it.momentum1m != null && it.price
      ? it.price / (1 + it.momentum1m / 100)
      : null;
    const d = priceDerived({
      price: p.price,
      firstClose,
      targetMean: it.targetMean,
      recommendationKey: it.recommendationKey,
      forwardPE: it.forwardPE,
    });
    const o = { sc: d.score, sg: d.signal };
    if (d.momentum1m != null) o.m = d.momentum1m;
    if (d.upside12m != null) { o.u = d.upside12m; o.e1 = d.exp1m; o.e3 = d.exp3m; }
    out[it.ticker] = o;
  }
  return out;
}

// /api/prices yanıtı: fiyat + aynı andaki gösterge sinyalleri + puan/hedef.
// fetchLivePrices zaten ~15 sn önbellekli; hesaplar da aynı ana bağlanır.
let sigCache = { key: null, signals: {}, scores: {} };
export async function getLivePrices(items = []) {
  // Fiyat ve gün içi bar (hacim/yüksek/düşük) paralel çekilir; ikisi de ~15 sn
  // önbellekli. Gün içi bar alınamazsa göstergeler önbellekteki barla hesaplanır.
  const [live, bars] = await Promise.all([
    fetchLivePrices(),
    fetchLiveBars().catch(() => null),
  ]);
  if (sigCache.key !== live.updatedAt) {
    const t0 = Date.now();
    sigCache = {
      key: live.updatedAt,
      signals: computeLiveSignals(live.prices, bars ?? {}),
      scores: computeLiveScores(items, live.prices),
    };
    const ms = Date.now() - t0;
    if (ms > 500) console.log(`[live] ${Object.keys(sigCache.signals).length} enstrüman ${ms} ms'de hesaplandı.`);
  }
  return { ...live, signals: sigCache.signals, scores: sigCache.scores };
}
