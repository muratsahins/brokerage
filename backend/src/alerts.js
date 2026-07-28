// UYARI taraması: GÜNLÜK grafikte aşağıdaki İKİ koşulu BİRDEN sağlayan hisseler.
//
//   1) overzone AL: aşırı satım bölgesinde (wt2 <= -53) kurulan YUKARI kesişim,
//      SON BARDA oluşmuş olacak ("yeni" = kalıcı durum değil, oluştuğu bar).
//   2) SuperTrend SAT: trend hâlâ düşüşte (durum ölçütü, dönüş barı aranmaz).
//
// Yani trend daha dönmemişken aşırı satımdan gelen erken dönüş adayları. Aynı
// barda hem overzone AL hem SuperTrend SAT DÖNÜŞÜ olması pratikte imkânsız
// olduğu için SuperTrend'de bar değil DURUM aranır.
//
// Son bar BUGÜNE ait olmalıdır — bugün seans yoksa liste boştur.
//
// Veri: liveSignals'ın canlı fiyatla yamalı günlük bar geçmişi — UYARI için
// Yahoo'ya EK İSTEK YOK. Son barın kapanışı/hacmi canlı olduğu için sinyal,
// günlük bar kapanışını beklemeden gün içinde yakalanır.

import { INSTRUMENTS } from './stocks.js';
import { recentSignals, supertrendSignal } from './indicators.js';
import { liveDailySeries } from './liveSignals.js';

// Kaç bar geriye kadar "yeni" sayılır (1 = yalnızca bugünün günlük barı).
const LOOKBACK = Number(process.env.ALERT_LOOKBACK_BARS ?? 1);
const MAX_ITEMS = Number(process.env.ALERT_MAX_ITEMS ?? 600);
// "Bugün" hangi saate göre: enstrümanın kendi borsa saati (Yahoo meta.gmtoffset).
// Bilinmiyorsa BIST varsayılır (UTC+3).
const DEFAULT_OFF = Number(process.env.EXCHANGE_GMT_OFFSET ?? 10800);

const IND_LABEL = { oz: 'overzone', wt: 'WaveTrend', st: 'SuperTrend' };

// Tüm enstrümanları tarar; hisse başına tek kayıt döner.
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
    // 1) overzone AL, son barda oluşmuş olmalı.
    const oz = recentSignals(s.high, s.low, s.close, LOOKBACK).oz;
    if (!oz || oz.dir !== 'AL') continue;
    // 2) SuperTrend hâlâ SAT (trend dönmemiş).
    if (supertrendSignal(s.high, s.low, s.close) !== 'SAT') continue;

    items.push({
      ticker: inst.ticker,
      dir: 'AL', // aranan sinyal overzone AL; SuperTrend SAT trend süzgeci
      hits: 2,
      barsAgo: oz.barsAgo,
      signals: [
        { ind: 'oz', indLabel: IND_LABEL.oz, dir: 'AL', barsAgo: oz.barsAgo },
        { ind: 'st', indLabel: IND_LABEL.st, dir: 'SAT', state: true }, // durum, dönüş barı değil
      ],
    });
  }

  items.sort((a, b) => a.ticker.localeCompare(b.ticker));

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
