// TARAMA — GÜNLÜK grafikte, İKİ AYRI grup:
//
//   Taranan evren: BIST 100 + Maden & Emtia + ABD hisseleri (NASDAQ-100 +
//   S&P 100) — bar geçmişi üçü için de aynı önbellekte tutulur (liveSignals.js).
//
//   items  (ALIM ADAYLARI): 4 Faktörlü Profesyonel Tarama Sistemi
//          (bkz. indicators.js taramaDetay) — KATI VE, dördü birden
//          sağlanmayan hisse listeye girmez:
//            1) Ana Trend    — haftalık kapanış > haftalık EMA(30), günlük
//               kapanış > SMA(200), EMA(50) > SMA(200), SMA(200) yatay/
//               yükseliş eğiminde (düşen bıçak filtresi).
//            2) Göreceli Güç — hissenin getirisi karşılaştırma endeksinden
//               (BIST'te XU100, ABD'de S&P 500) yüksek VE Fiyat/Endeks oranı
//               (RS çizgisi) kendi ortalamasının üstünde ve yükselişte.
//            3) Pullback     — referans EMA'ya (21) yakın veya ATR cinsinden
//               aşırı uzamamış, 52 haftalık zirveden çok uzak değil, referans
//               EMA yükselişte.
//            4) Tetik        — hacim ortalamasının 1.5 katı + yükselen gün +
//               MACD son birkaç barda sinyal çizgisini yukarı kesmiş.
//          Dördünün TAM OLARAK aynı günde çakışması istatistiksel olarak çok
//          nadir (~%0,02) — eşikleri gevşetmeden pratik isabeti artırmak için
//          son 2 gün (bugün, olmazsa dün) taranır (bkz. taramaSonNGun).
//          Bilgi amaçlı SuperTrend durumu da eklenir (süzgeç değil).
//   stSell (SATIŞ UYARISI adayları): SuperTrend'in SON BARDA SAT'a döndüğü
//          hisseler. Arayüz bunu kullanıcının Sanal Borsa portföyüyle kesiştirir
//          ("kendi hisselerim"); portföy tarayıcıda durduğu için sunucuya
//          gönderilmez, süzme istemcide yapılır.
//
// stSell'de "yeni" = kalıcı durum değil, sinyalin OLUŞTUĞU bar; items'ta ise
// o ANKİ durum (4 Faktörlü Tarama bir kesişim değil, bir durum taramasıdır).
// İkisinde de son bar BUGÜNE ait olmalıdır — bugün seans yoksa listeler boştur.
//
// Veri: liveSignals'ın canlı fiyatla yamalı günlük bar geçmişi — TARAMA için
// Yahoo'ya EK İSTEK YOK. Son barın kapanışı/hacmi canlı olduğu için sinyal,
// günlük bar kapanışını beklemeden gün içinde yakalanır.

import { INSTRUMENTS } from './stocks.js';
import { US_STOCKS } from './usStocks.js';
import { recentSignals, supertrendSignal, taramaSonNGun } from './indicators.js';
import { liveDailySeries, XU100_TICKER, SPX_TICKER } from './liveSignals.js';

// 4 Faktörlü Tarama kaç gün geriye kadar (bugünden başlayarak) denenir.
const TARAMA_GUN_PENCERESI = Number(process.env.TARAMA_GUN_PENCERESI ?? 2);

// Taranan evren: BIST (+ maden/emtia) ile ABD hisseleri (ayrı bir ticker
// kümesi — ".IS" eki yok, isim/sektör de yok; sadece görüntü için aşağıda
// META'dan tamamlanır). Bar geçmişi ikisi için de aynı önbellekte (liveSignals.js
// SERIES_INSTRUMENTS) tutulduğu için ek istek gerekmez.
const SCAN_INSTRUMENTS = [...INSTRUMENTS, ...US_STOCKS.map((u) => ({ ticker: u.ticker }))];
// Uyarı satırında isim/sektör göstermek için (frontend BIST dışı ticker'ları
// kendi listesinde bulamaz — /api/recommendations yalnızca BIST taşır).
const META = new Map([...INSTRUMENTS, ...US_STOCKS].map((i) => [i.ticker, i]));
// Göreceli Güç filtresi hangi endeksle kıyaslanacağını bu kümeden anlar.
const US_TICKER_SET = new Set(US_STOCKS.map((u) => u.ticker));

// Satış uyarısı (SuperTrend dönüşü) kaç bar geriye kadar "yeni" sayılır.
const LOOKBACK = Number(process.env.ALERT_LOOKBACK_BARS ?? 1);
const MAX_ITEMS = Number(process.env.ALERT_MAX_ITEMS ?? 600);
// "Bugün" hangi saate göre: enstrümanın kendi borsa saati (Yahoo meta.gmtoffset).
// Bilinmiyorsa BIST varsayılır (UTC+3).
const DEFAULT_OFF = Number(process.env.EXCHANGE_GMT_OFFSET ?? 10800);

const IND_LABEL = {
  trend: 'Ana Trend', rs: 'Göreceli Güç', pullback: 'Pullback', tetik: 'Tetik', st: 'SuperTrend',
};

// Tüm enstrümanları tarar; hisse başına tek kayıt döner.
//
// YALNIZCA BUGÜN: bir hissenin son barı eski bir güne ait olabilir (bugün işlem
// görmemiş/durdurulmuş; ya da hafta sonu/tatil, yeniden başlatma sonrası henüz
// canlı fiyat gelmemiş). Öyle bir barın "son bar" sinyali aslında önceki
// günlerde üretilmiştir. Bu yüzden ölçüt GÖRECELİ DEĞİL: son bar, borsa saatine
// göre BUGÜNÜN gününe ait olmalı. Bugün seans yoksa liste boş döner — dünün
// sinyalleri bugünmüş gibi gösterilmez.
function scan() {
  const items = [];   // alım adayları (4 Faktörlü Tarama)
  const stSell = [];  // SuperTrend SAT dönüşü — portföy süzgeci istemcide
  let ready = 0;

  const day = (ts, off) => Math.floor((ts + (off ?? 0)) / 86400);
  const iso = (ts, off) => new Date((ts + (off ?? 0)) * 1000).toISOString().slice(0, 10);
  const now = Math.floor(Date.now() / 1000);

  // Göreceli Güç karşılaştırma endeksleri — enstrümanlarla AYNI önbellekten
  // (liveSignals.js) gelir, ek çekim gerekmez.
  const xu100 = liveDailySeries(XU100_TICKER);
  const spx = liveDailySeries(SPX_TICKER);

  const series = [];
  let lastDay = -Infinity, lastOff = DEFAULT_OFF, lastTs = null; // en yeni bar (bugün olmayabilir)
  for (const inst of SCAN_INSTRUMENTS) {
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

    // ALIM ADAYI: 4 Faktörlü Profesyonel Tarama — Ana Trend + Göreceli Güç +
    // Pullback + Tetik hepsi birden (bkz. indicators.js taramaDetay). Yetersiz
    // geçmişte (ör. yeni IPO, ~225 günden az bar) taramaDetay null döner.
    const benchCloses = (US_TICKER_SET.has(inst.ticker) ? spx : xu100)?.close;
    const tarama = taramaSonNGun(s, benchCloses, TARAMA_GUN_PENCERESI);
    if (tarama?.pass) {
      const stState = supertrendSignal(s.high, s.low, s.close); // bilgi amaçlı trend
      items.push({
        ticker: inst.ticker,
        name: META.get(inst.ticker)?.name ?? null, // ABD hisseleri BIST listesinde yok, istemci join edemez
        grup: 'al',
        dir: 'AL',
        barsAgo: tarama.barsAgo, // durum taraması — kaç gün önce (0=bugün, 1=dün...) sağlanmış
        signals: [
          { ind: 'trend', indLabel: IND_LABEL.trend, dir: 'AL', state: true },
          { ind: 'rs', indLabel: IND_LABEL.rs, dir: 'AL', state: true },
          { ind: 'pullback', indLabel: IND_LABEL.pullback, dir: 'AL', state: true },
          { ind: 'tetik', indLabel: IND_LABEL.tetik, dir: 'AL', state: true },
          ...(stState ? [{ ind: 'st', indLabel: IND_LABEL.st, dir: stState, state: true }] : []),
        ],
      });
    }

    // SATIŞ UYARISI adayı: SuperTrend son barda SAT'a döndü. (Arayüz portföyle
    // kesiştirir; burada tüm hisseler için üretilir.)
    const r = recentSignals(s.high, s.low, s.close, LOOKBACK);
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
    stats: { ready: scanCache.ready, scanned: scanCache.scanned, total: SCAN_INSTRUMENTS.length },
  };
}
