// UYARI taraması: overzone / WaveTrend / SuperTrend sinyalini YENİ veren
// hisseler — saatlik (1h), 4 saatlik (4h) ve günlük (1d) grafiklerde.
//
// "Yeni" = sinyalin kalıcı durumu değil, OLUŞTUĞU bar. SuperTrend'de trend
// dönüşü, WaveTrend'de kesişim, overzone'da aşırı bölgede kurulan kesişim.
// Her zaman dilimi için son birkaç bar taranır (aşağıdaki lookback).
//
// Veri: Yahoo 1h ve 4h aralıklarını yerel destekliyor (dataGranularity ile
// doğrulandı), bu yüzden toplama/örnekleme yapılmıyor. Gün içi barlar saatte
// bir değiştiği için önbellek ömrü zaman dilimine göre ayarlı. Günlük zaman
// dilimi zaten liveSignals'ın bar geçmişini kullanır — ek istek yok.

import { INSTRUMENTS } from './stocks.js';
import { fetchBars, peekLivePrices } from './dataSource.js';
import { recentSignals } from './indicators.js';
import { liveDailySeries } from './liveSignals.js';

// Zaman dilimleri. lookback: kaç bar geriye kadar "yeni" sayılır. Amaç GÜN İÇİ
// tazelik olduğu için pencereler dar tutuldu:
//   1h -> son 6 bar   (BIST seansı 8 saat; bugünün büyük kısmı)
//   4h -> son 2 bar   (bugün)
//   1d -> son 1 bar   (yalnızca bugünün günlük barı; dünkü kesişim "yeni" değil)
export const TIMEFRAMES = [
  { key: '1h', label: '1 saat',  range: '3mo', lookback: 6, ttlMin: 20 },
  { key: '4h', label: '4 saat',  range: '3mo', lookback: 2, ttlMin: 60 },
  { key: '1d', label: 'Günlük',  range: null,  lookback: 1, ttlMin: null }, // liveSignals'tan
];
const GAP_MS = Number(process.env.ALERT_FETCH_GAP_MS ?? 350);
const MAX_ITEMS = Number(process.env.ALERT_MAX_ITEMS ?? 600);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// `${tf}:${ticker}` -> { high[], low[], close[], lastTs, at }
const cache = new Map();
let filling = false;

export function alertStats() {
  const per = {};
  for (const tf of TIMEFRAMES) {
    if (!tf.range) continue;
    per[tf.key] = [...cache.keys()].filter((k) => k.startsWith(`${tf.key}:`)).length;
  }
  return { cached: per, total: INSTRUMENTS.length, filling };
}

// Gün içi barları arka planda (sırayla, nazikçe) tazeler.
export async function refreshIntraday() {
  if (filling) return;
  filling = true;
  let ok = 0, fail = 0, skip = 0;
  try {
    for (const tf of TIMEFRAMES) {
      if (!tf.range) continue; // günlük: liveSignals'ın önbelleği
      const ttl = tf.ttlMin * 60 * 1000;
      for (const inst of INSTRUMENTS) {
        const key = `${tf.key}:${inst.ticker}`;
        const cur = cache.get(key);
        if (cur && Date.now() - cur.at < ttl) { skip++; continue; }
        try {
          const { bars } = await fetchBars(inst.symbol, tf.range, tf.key);
          if (bars.length >= 30) {
            cache.set(key, {
              high: bars.map((b) => b.high),
              low: bars.map((b) => b.low),
              close: bars.map((b) => b.close),
              lastTs: bars[bars.length - 1].ts,
              at: Date.now(),
            });
            ok++;
          } else fail++;
        } catch {
          fail++; // sonraki turda tekrar denenir
        }
        await sleep(GAP_MS);
      }
    }
  } finally {
    filling = false;
  }
  if (ok || fail) {
    console.log(`[uyarı] Gün içi barlar tazelendi — ${ok} yeni, ${skip} taze, ${fail} başarısız.`);
  }
}

// Son barın kapanışını canlı fiyata çeker (gün içi bar en fazla önbellek ömrü
// kadar eski olabilir; kapanışı tazelemek sinyali erken yakalar).
function withLiveClose(entry, price) {
  if (price == null) return entry;
  const i = entry.close.length - 1;
  const close = entry.close.slice();
  const high = entry.high.slice();
  const low = entry.low.slice();
  close[i] = price;
  high[i] = Math.max(high[i], price);
  low[i] = Math.min(low[i], price);
  return { high, low, close, lastTs: entry.lastTs };
}

const IND_LABEL = { oz: 'overzone', wt: 'WaveTrend', st: 'SuperTrend' };

// Tüm enstrümanları tüm zaman dilimlerinde tarar, YENİ sinyalleri döner.
// En yeni olay üstte; aynı anda birden çok gösterge tetiklenebilir.
function scan() {
  const prices = peekLivePrices(5 * 60 * 1000)?.prices ?? {};
  const items = [];

  for (const inst of INSTRUMENTS) {
    const price = prices[inst.ticker]?.price ?? null;
    for (const tf of TIMEFRAMES) {
      let series = null;
      if (tf.range) {
        const entry = cache.get(`${tf.key}:${inst.ticker}`);
        if (entry) series = withLiveClose(entry, price);
      } else {
        series = liveDailySeries(inst.ticker); // canlı fiyatla yamalı günlük seri
      }
      if (!series) continue;

      const r = recentSignals(series.high, series.low, series.close, tf.lookback);
      for (const ind of ['oz', 'wt', 'st']) {
        const ev = r[ind];
        if (!ev) continue;
        items.push({
          ticker: inst.ticker,
          tf: tf.key,
          tfLabel: tf.label,
          ind,
          indLabel: IND_LABEL[ind],
          dir: ev.dir,
          barsAgo: ev.barsAgo,
        });
      }
    }
  }

  // Sıralama: (1) en taze — yaş, zaman dilimi büyüklüğüne göre dakikaya çevrilir;
  // (2) aynı tazelikte, aynı anda birden çok gösterge/zaman diliminde tetiklenen
  // hisse (teyit) üstte; (3) ticker (kararlı sıra).
  const tfMin = { '1h': 60, '4h': 240, '1d': 1440 };
  const confluence = new Map();
  for (const it of items) confluence.set(it.ticker, (confluence.get(it.ticker) ?? 0) + 1);
  items.sort((a, b) =>
    (a.barsAgo * tfMin[a.tf]) - (b.barsAgo * tfMin[b.tf])
    || confluence.get(b.ticker) - confluence.get(a.ticker)
    || a.ticker.localeCompare(b.ticker));
  return items.slice(0, MAX_ITEMS).map((it) => ({ ...it, hits: confluence.get(it.ticker) }));
}

let scanCache = { at: 0, items: [] };
export function getAlerts() {
  if (Date.now() - scanCache.at > 60000) {
    const t0 = Date.now();
    scanCache = { at: Date.now(), items: scan() };
    const ms = Date.now() - t0;
    if (ms > 1000) console.log(`[uyarı] ${scanCache.items.length} uyarı ${ms} ms'de tarandı.`);
  }
  return { updatedAt: new Date(scanCache.at).toISOString(), items: scanCache.items, stats: alertStats() };
}
