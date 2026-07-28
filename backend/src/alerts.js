// UYARI taraması: overzone / WaveTrend / SuperTrend sinyalini YENİ veren
// hisseler — GÜNLÜK grafikte.
//
// "Yeni" = sinyalin kalıcı durumu değil, OLUŞTUĞU bar. SuperTrend'de trend
// dönüşü, WaveTrend'de kesişim, overzone'da aşırı bölgede kurulan kesişim.
// Yalnızca SON bar taranır (dünkü kesişim "yeni" değildir) ve o son bar
// BUGÜNE ait olmalıdır — bugün seans yoksa liste boştur.
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
// "Bugün" hangi saate göre: enstrümanın kendi borsa saati (Yahoo meta.gmtoffset).
// Bilinmiyorsa BIST varsayılır (UTC+3).
const DEFAULT_OFF = Number(process.env.EXCHANGE_GMT_OFFSET ?? 10800);

const IND_LABEL = { oz: 'overzone', wt: 'WaveTrend', st: 'SuperTrend' };

// Tüm enstrümanları tarar. HİSSE BAŞINA TEK KAYIT döner; bir hisse birden çok
// göstergede tetiklenmişse hepsi `signals` içinde toplanır (teyit).
//
// YALNIZCA BUGÜN: bir hissenin son barı eski bir güne ait olabilir (bugün işlem
// görmemiş/durdurulmuş; ya da hafta sonu/tatil, yeniden başlatma sonrası henüz
// canlı fiyat gelmemiş). Öyle bir barın "son bar" sinyali aslında önceki
// günlerde üretilmiştir. Bu yüzden ölçüt GÖRECELİ DEĞİL: son bar, borsa saatine
// göre BUGÜNÜN gününe ait olmalı. Bugün seans yoksa liste boş döner — dünün
// sinyalleri bugünmüş gibi gösterilmez.
function scan() {
  const items = [];
  let ready = 0;

  const day = (ts, off) => Math.floor((ts + (off ?? 0)) / 86400);
  const iso = (ts, off) => new Date((ts + (off ?? 0)) * 1000).toISOString().slice(0, 10);
  const now = Math.floor(Date.now() / 1000);

  const series = [];
  let lastDay = -Infinity, lastOff = DEFAULT_OFF, lastTs = null; // en yeni bar (bugün olmayabilir)
  for (const inst of INSTRUMENTS) {
    const s = liveDailySeries(inst.ticker);
    if (!s) continue; // bar geçmişi henüz önbellekte değil
    ready++;
    series.push({ inst, s });
    if (s.lastTs != null) {
      const off = s.gmtoffset ?? DEFAULT_OFF;
      const d = day(s.lastTs, off);
      if (d > lastDay) { lastDay = d; lastOff = off; lastTs = s.lastTs; }
    }
  }

  for (const { inst, s } of series) {
    // Son barı BUGÜNE ait olmayan hisseyi atla (eski sinyal taze görünmesin).
    const off = s.gmtoffset ?? DEFAULT_OFF;
    if (s.lastTs == null || day(s.lastTs, off) !== day(now, off)) continue;
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

  // Taranan gün (borsa saatine göre bugün) ve önbellekteki en yeni bar tarihi —
  // ikisi farklıysa arayüz "bugün seans yok" diyebilsin diye ayrı döner.
  const sessionDate = iso(now, lastOff);
  const lastBarDate = lastTs != null ? iso(lastTs, lastOff) : null;
  const scanned = series.filter(({ s }) =>
    s.lastTs != null && day(s.lastTs, s.gmtoffset ?? DEFAULT_OFF) === day(now, s.gmtoffset ?? DEFAULT_OFF)).length;

  return { items: items.slice(0, MAX_ITEMS), ready, scanned, sessionDate, lastBarDate };
}

let scanCache = { at: 0, items: [], ready: 0, scanned: 0, sessionDate: null, lastBarDate: null };
export function getAlerts() {
  if (Date.now() - scanCache.at > 60000) {
    scanCache = { at: Date.now(), ...scan() };
  }
  return {
    updatedAt: new Date(scanCache.at).toISOString(),
    sessionDate: scanCache.sessionDate,
    lastBarDate: scanCache.lastBarDate,
    items: scanCache.items,
    stats: { ready: scanCache.ready, scanned: scanCache.scanned, total: INSTRUMENTS.length },
  };
}
