// UYARI taraması — GÜNLÜK grafikte, İKİ AYRI grup:
//
//   items  (ALIM ADAYLARI, tüm enstrümanlar): overzone AL — aşırı satım
//          bölgesinde (wt2 <= -50) kurulan YUKARI kesişim, SON BARDA oluşmuş
//          olacak — ARTI iki süzgeç (o ANKİ durum, kesişim değil): MACD AL
//          (mavi çizgi sinyalin üstünde) ve RSI 0-40 arası (aşırı satıma
//          yakın/içinde). Üçü birden sağlanmayınca liste dışı kalır. Bilgi
//          olarak SuperTrend'in o anki durumu da eklenir (süzgeç değil).
//          Not: eskiden ayrıca hacim dönüşü teyidi de aranıyordu; o formasyon
//          tümden kaldırıldı, MACD+RSI süzgeçleri onun yerini alıyor.
//   stSell (SATIŞ UYARISI adayları): SuperTrend'in SON BARDA SAT'a döndüğü
//          hisseler. Arayüz bunu kullanıcının Sanal Borsa portföyüyle kesiştirir
//          ("kendi hisselerim"); portföy tarayıcıda durduğu için sunucuya
//          gönderilmez, süzme istemcide yapılır.
//
// Her iki grupta da "yeni" = kalıcı durum değil, sinyalin OLUŞTUĞU bar; ve o
// son bar BUGÜNE ait olmalıdır — bugün seans yoksa listeler boştur.
//
// Veri: liveSignals'ın canlı fiyatla yamalı günlük bar geçmişi — UYARI için
// Yahoo'ya EK İSTEK YOK. Son barın kapanışı/hacmi canlı olduğu için sinyal,
// günlük bar kapanışını beklemeden gün içinde yakalanır.

import { INSTRUMENTS } from './stocks.js';
import { recentSignals, supertrendSignal, macdBullish, rsiValue } from './indicators.js';
import { liveDailySeries } from './liveSignals.js';

// Kaç bar geriye kadar "yeni" sayılır (1 = yalnızca bugünün günlük barı).
const LOOKBACK = Number(process.env.ALERT_LOOKBACK_BARS ?? 1);
const MAX_ITEMS = Number(process.env.ALERT_MAX_ITEMS ?? 600);
// "Bugün" hangi saate göre: enstrümanın kendi borsa saati (Yahoo meta.gmtoffset).
// Bilinmiyorsa BIST varsayılır (UTC+3).
const DEFAULT_OFF = Number(process.env.EXCHANGE_GMT_OFFSET ?? 10800);
// RSI süzgeci: bu değerin altı/eşiti (0'dan bu değere kadar) kabul edilir.
const RSI_MAX = Number(process.env.ALERT_RSI_MAX ?? 40);

const IND_LABEL = { oz: 'overzone', wt: 'WaveTrend', st: 'SuperTrend', macd: 'MACD', rsi: 'RSI' };

// Tüm enstrümanları tarar; hisse başına tek kayıt döner.
//
// YALNIZCA BUGÜN: bir hissenin son barı eski bir güne ait olabilir (bugün işlem
// görmemiş/durdurulmuş; ya da hafta sonu/tatil, yeniden başlatma sonrası henüz
// canlı fiyat gelmemiş). Öyle bir barın "son bar" sinyali aslında önceki
// günlerde üretilmiştir. Bu yüzden ölçüt GÖRECELİ DEĞİL: son bar, borsa saatine
// göre BUGÜNÜN gününe ait olmalı. Bugün seans yoksa liste boş döner — dünün
// sinyalleri bugünmüş gibi gösterilmez.
function scan() {
  const items = [];   // alım adayları (overzone AL)
  const stSell = [];  // SuperTrend SAT dönüşü — portföy süzgeci istemcide
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

    // ALIM ADAYI: overzone AL (son bar, TETİK) + MACD AL ve RSI 0-{RSI_MAX}
    // arası (o ANKİ durum, SÜZGEÇ — SMC sekmesindeki tetik/süzgeç desenin
    // aynısı). Üçü birden sağlanmazsa liste dışı kalır.
    if (r.oz && r.oz.dir === 'AL') {
      const macdOk = macdBullish(s.close);
      const rsi = rsiValue(s.close);
      const rsiOk = rsi != null && rsi >= 0 && rsi <= RSI_MAX;
      if (macdOk && rsiOk) {
        const stState = supertrendSignal(s.high, s.low, s.close); // bilgi amaçlı trend
        items.push({
          ticker: inst.ticker,
          grup: 'al',
          dir: 'AL',
          barsAgo: r.oz.barsAgo,
          signals: [
            { ind: 'oz', indLabel: IND_LABEL.oz, dir: 'AL', barsAgo: r.oz.barsAgo },
            { ind: 'macd', indLabel: IND_LABEL.macd, dir: 'AL', state: true },
            { ind: 'rsi', indLabel: IND_LABEL.rsi, dir: 'AL', state: true },
            ...(stState ? [{ ind: 'st', indLabel: IND_LABEL.st, dir: stState, state: true }] : []),
          ],
        });
      }
    }

    // SATIŞ UYARISI adayı: SuperTrend son barda SAT'a döndü. (Arayüz portföyle
    // kesiştirir; burada tüm hisseler için üretilir.)
    if (r.st && r.st.dir === 'SAT') {
      stSell.push({
        ticker: inst.ticker,
        grup: 'pf',
        dir: 'SAT',
        barsAgo: r.st.barsAgo,
        signals: [{ ind: 'st', indLabel: IND_LABEL.st, dir: 'SAT', barsAgo: r.st.barsAgo }],
      });
    }
  }

  items.sort((a, b) => a.ticker.localeCompare(b.ticker));
  stSell.sort((a, b) => a.ticker.localeCompare(b.ticker));

  // Taranan gün (borsa saatine göre bugün) ve önbellekteki en yeni bar tarihi —
  // ikisi farklıysa arayüz "bugün seans yok" diyebilsin diye ayrı döner.
  const sessionDate = iso(now, lastOff);
  const lastBarDate = lastTs != null ? iso(lastTs, lastOff) : null;
  const scanned = series.filter(({ s }) =>
    s.lastTs != null && day(s.lastTs, s.gmtoffset ?? DEFAULT_OFF) === day(now, s.gmtoffset ?? DEFAULT_OFF)).length;

  return {
    items: items.slice(0, MAX_ITEMS),
    stSell: stSell.slice(0, MAX_ITEMS),
    ready, scanned, sessionDate, lastBarDate,
  };
}

let scanCache = { at: 0, items: [], stSell: [], ready: 0, scanned: 0, sessionDate: null, lastBarDate: null };
export function getAlerts() {
  if (Date.now() - scanCache.at > 60000) {
    scanCache = { at: Date.now(), ...scan() };
  }
  return {
    updatedAt: new Date(scanCache.at).toISOString(),
    sessionDate: scanCache.sessionDate,
    lastBarDate: scanCache.lastBarDate,
    items: scanCache.items,
    stSell: scanCache.stSell,
    stats: { ready: scanCache.ready, scanned: scanCache.scanned, total: INSTRUMENTS.length },
  };
}
