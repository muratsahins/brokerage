// UYARI taraması: overzone / WaveTrend / SuperTrend sinyalini YENİ veren
// hisseler — GÜNLÜK grafikte.
//
// "Yeni" = sinyalin kalıcı durumu değil, OLUŞTUĞU bar. SuperTrend'de trend
// dönüşü, WaveTrend'de kesişim, overzone'da aşırı bölgede kurulan kesişim.
// Yalnızca SON bar taranır (dünkü kesişim "yeni" değildir).
//
// Veri: liveSignals'ın canlı fiyatla yamalı günlük bar geçmişi — UYARI için
// Yahoo'ya EK İSTEK YOK. Son barın kapanışı/hacmi canlı olduğu için sinyal,
// günlük bar kapanışını beklemeden gün içinde yakalanır.

import { INSTRUMENTS } from './stocks.js';
import { recentSignals } from './indicators.js';
import { liveDailySeries } from './liveSignals.js';

// Kaç bar geriye kadar "yeni" sayılır (1 = yalnızca bugünün günlük barı).
const LOOKBACK = Number(process.env.ALERT_LOOKBACK_BARS ?? 1);
const MAX_ITEMS = Number(process.env.ALERT_MAX_ITEMS ?? 600);

const IND_LABEL = { oz: 'overzone', wt: 'WaveTrend', st: 'SuperTrend' };

// Tüm enstrümanları tarar, YENİ sinyalleri döner. Aynı hisse birden çok
// göstergede tetiklenebilir (teyit).
function scan() {
  const items = [];
  let ready = 0;

  for (const inst of INSTRUMENTS) {
    const s = liveDailySeries(inst.ticker);
    if (!s) continue; // bar geçmişi henüz önbellekte değil
    ready++;
    const r = recentSignals(s.high, s.low, s.close, LOOKBACK);
    for (const ind of ['oz', 'wt', 'st']) {
      const ev = r[ind];
      if (!ev) continue;
      items.push({
        ticker: inst.ticker,
        ind,
        indLabel: IND_LABEL[ind],
        dir: ev.dir,
        barsAgo: ev.barsAgo,
      });
    }
  }

  // Sıralama: (1) en taze; (2) aynı anda birden çok gösterge tetiklenen hisse
  // (teyit) üstte; (3) ticker (kararlı sıra).
  const confluence = new Map();
  for (const it of items) confluence.set(it.ticker, (confluence.get(it.ticker) ?? 0) + 1);
  items.sort((a, b) =>
    a.barsAgo - b.barsAgo
    || confluence.get(b.ticker) - confluence.get(a.ticker)
    || a.ticker.localeCompare(b.ticker));

  return {
    items: items.slice(0, MAX_ITEMS).map((it) => ({ ...it, hits: confluence.get(it.ticker) })),
    ready,
  };
}

let scanCache = { at: 0, items: [], ready: 0 };
export function getAlerts() {
  if (Date.now() - scanCache.at > 60000) {
    const { items, ready } = scan();
    scanCache = { at: Date.now(), items, ready };
  }
  return {
    updatedAt: new Date(scanCache.at).toISOString(),
    items: scanCache.items,
    stats: { ready: scanCache.ready, total: INSTRUMENTS.length },
  };
}
