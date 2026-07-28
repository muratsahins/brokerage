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
import { fetchDailyBars, fetchLivePrices } from './dataSource.js';
import {
  supertrendSignal, wavetrendSignals, smcBullish, volumeReversal,
} from './indicators.js';

// Bar geçmişi önbelleği ömrü — geçmiş barlar seans içinde değişmediği için uzun
// tutulabilir; yalnızca yeni bir günlük bar kapandığında tazelenmesi gerekir.
const TTL_MS = Number(process.env.SERIES_TTL_MINUTES ?? 60) * 60 * 1000;
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

// Önbellekteki seriyi canlı fiyatla günceller: aynı seanssa son barı güncelle,
// yeni seansa geçildiyse canlı fiyattan yeni bar ekle. (Yalnızca değişen diziler
// kopyalanır; open/volume aynı seansta olduğu gibi kullanılır.)
function seriesWithLive(entry, price, priceTs) {
  const { gmtoffset: off } = entry;
  const newSession = priceTs != null && day(priceTs, off) > day(entry.lastTs, off);
  if (newSession) {
    return {
      opens: [...entry.open, price],
      highs: [...entry.high, price],
      lows: [...entry.low, price],
      closes: [...entry.close, price],
      volumes: [...entry.volume, 0], // yeni seansın hacmi henüz bilinmiyor
    };
  }
  const i = entry.close.length - 1;
  const closes = entry.close.slice();
  const highs = entry.high.slice();
  const lows = entry.low.slice();
  closes[i] = price;
  highs[i] = Math.max(highs[i], price);
  lows[i] = Math.min(lows[i], price);
  return { opens: entry.open, highs, lows, closes, volumes: entry.volume };
}

// Canlı fiyatlardan gösterge sinyallerini üretir. Yanıt küçük kalsın diye kısa
// anahtar + yalnızca dolu alanlar: st=SuperTrend, wt=WaveTrend kesişimi,
// wo=overzone (53-60), smc=SMC yükseliş, vr=hacim dönüşü.
export function computeLiveSignals(prices) {
  const out = {};
  for (const [ticker, p] of Object.entries(prices)) {
    const entry = cache.get(ticker);
    if (!entry || p?.price == null) continue; // geçmişi yoksa yayınlanan değer kalsın
    const s = seriesWithLive(entry, p.price, p.ts);
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

// /api/prices yanıtı: fiyat + aynı andaki gösterge sinyalleri.
// fetchLivePrices zaten ~15 sn önbellekli; sinyaller de aynı ana bağlanır.
let sigCache = { key: null, data: {} };
export async function getLivePrices() {
  const live = await fetchLivePrices();
  if (sigCache.key !== live.updatedAt) {
    const t0 = Date.now();
    sigCache = { key: live.updatedAt, data: computeLiveSignals(live.prices) };
    const ms = Date.now() - t0;
    if (ms > 500) console.log(`[live] ${Object.keys(sigCache.data).length} enstrümanın göstergeleri ${ms} ms'de hesaplandı.`);
  }
  return { ...live, signals: sigCache.data };
}
