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

// Tüm enstrümanları tarar. HİSSE BAŞINA TEK KAYIT döner; bir hisse birden çok
// göstergede tetiklenmişse hepsi `signals` içinde toplanır (teyit).
//
// SADECE GÜNCEL SEANS: bir hissenin son barı eski bir güne ait olabilir (bugün
// işlem görmemiş / durdurulmuş). Öyle bir hissenin "son bar" sinyali aslında
// önceki günlerde üretilmiştir; listeye girmemesi için önce piyasanın güncel
// seans günü bulunur (enstrümanların son bar tarihlerinin en yenisi), sonra
// yalnızca son barı O GÜNE ait olanlar taranır.
function scan() {
  const items = [];
  let ready = 0;

  const day = (ts, off) => Math.floor((ts + (off ?? 0)) / 86400);
  const series = [];
  let sessionDay = -Infinity, sessionOff = 0, sessionTs = null;
  for (const inst of INSTRUMENTS) {
    const s = liveDailySeries(inst.ticker);
    if (!s) continue; // bar geçmişi henüz önbellekte değil
    ready++;
    series.push({ inst, s });
    if (s.lastTs != null) {
      const d = day(s.lastTs, s.gmtoffset);
      if (d > sessionDay) { sessionDay = d; sessionOff = s.gmtoffset ?? 0; sessionTs = s.lastTs; }
    }
  }

  for (const { inst, s } of series) {
    // Son barı güncel seansa ait olmayan hisseyi atla (eski sinyal taze görünmesin).
    if (s.lastTs == null || day(s.lastTs, s.gmtoffset) !== sessionDay) continue;
    const r = recentSignals(s.high, s.low, s.close, LOOKBACK);

    const signals = [];
    for (const ind of ['oz', 'wt', 'st']) {
      const ev = r[ind];
      if (!ev) continue;
      signals.push({ ind, indLabel: IND_LABEL[ind], dir: ev.dir, barsAgo: ev.barsAgo });
    }
    if (signals.length === 0) continue;

    // Satır yönü: hepsi aynıysa o yön, karışıksa 'MIX'.
    const dirs = new Set(signals.map((x) => x.dir));
    items.push({
      ticker: inst.ticker,
      dir: dirs.size === 1 ? signals[0].dir : 'MIX',
      hits: signals.length,
      barsAgo: Math.min(...signals.map((x) => x.barsAgo)),
      signals,
    });
  }

  // Sıralama: (1) en taze; (2) birden çok gösterge tetiklenen hisse (teyit)
  // üstte; (3) ticker (kararlı sıra).
  items.sort((a, b) =>
    a.barsAgo - b.barsAgo
    || b.hits - a.hits
    || a.ticker.localeCompare(b.ticker));

  // Taranan seansın tarihi (borsa saatine göre) — arayüzde gösterilir.
  const sessionDate = sessionTs != null
    ? new Date((sessionTs + sessionOff) * 1000).toISOString().slice(0, 10)
    : null;
  const scanned = series.filter(({ s }) => s.lastTs != null && day(s.lastTs, s.gmtoffset) === sessionDay).length;

  return { items: items.slice(0, MAX_ITEMS), ready, scanned, sessionDate };
}

let scanCache = { at: 0, items: [], ready: 0, scanned: 0, sessionDate: null };
export function getAlerts() {
  if (Date.now() - scanCache.at > 60000) {
    scanCache = { at: Date.now(), ...scan() };
  }
  return {
    updatedAt: new Date(scanCache.at).toISOString(),
    sessionDate: scanCache.sessionDate,
    items: scanCache.items,
    stats: { ready: scanCache.ready, scanned: scanCache.scanned, total: INSTRUMENTS.length },
  };
}
