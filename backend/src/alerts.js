// BIST TARAMA — Göreceli Güç Çekirdekli Momentum/Pullback Sistemi.
// Evren: yalnızca BIST 100 hisseleri — kıymetli madenler hariç (bkz. SCAN_INSTRUMENTS).
// ABD hisseleri bu sekmede taranmıyor — Leg1'in kesitsel sıralaması tek bir
// endekse (XU100) göre yapılıyor, karışık bir BIST+ABD evreni anlamsız
// olurdu (aynı yüzdelik dilimde farklı piyasaların hisselerini kıyaslamak).
//
//   items (ALIM ADAYLARI) — üç bacak hepsi birden:
//     Leg1 — Göreceli Güç sıralaması: evren son N_RS=60 barlık göreceli
//       getiriye (hisse − XU100) göre sıralanır, en güçlü TOP_PCT=%20'de
//       kalanlar aday havuzu (bkz. aşağıdaki cross-sectional hesap — bu,
//       indicators.js'teki per-symbol fonksiyonlardan FARKLI olarak tüm
//       evreni aynı anda gerektirir).
//     Leg2 — Yön filtresi (reel/relative bazda): kapanış/XU100 oranı,
//       yükselen 50 günlük ortalamasının üstünde mi (bkz. indicators.js
//       rsYonFiltresi). Nominal TL fiyat trendi KULLANILMIYOR — enflasyon
//       ortamında ayırt ediciliğini kaybeder.
//     Leg3 — Giriş: basit geri çekilme, kapanış yükselen 20 günlük
//       ortalamayı yukarı kesmiş mi (bkz. indicators.js rsGirisTetigi).
//   Leg4 (risk/çıkış: ATR tabanlı başlangıç stopu, indicators.js
//   rsBaslangicStopu) bilgi amaçlı `stopSeviye` alanında taşınır — süzgeç
//   değil, ama tasarımın "asıl bölümü" risk/çıkış olduğu için gösterilir.
//   GÜNCEL bardan hesaplanır (sinyal barından değil): sinyal günler önce
//   oluşmuş olabilir, gösterilen stop bugün girildiğinde geçerli olandır.
//
//   DÜRÜSTLÜK NOTU: Bu sistem BIST 100 üzerinde ~180 günlük tarihsel test
//   edildi (46 işlem) — MEDYAN R NEGATİF (−0,26) çıktı, pozitif ortalama
//   1-2 aykırı (outlier) işleme bağımlıydı. Kanıtlanmış bir kenarı YOKTUR;
//   yalnızca bilgi amaçlı bir tarayıcıdır, YATIRIM TAVSİYESİ DEĞİLDİR.
//
//   Sinyal bir DURUM taraması, kesişim değil: "AL" bugünün sinyali olmayabilir
//   — son GUN_PENCERESI iş günü içinde herhangi bir gün üç bacak birlikte
//   sağlanmışsa yakalanır, hangi gün olduğu (barsAgo) döner.
//
//   stSell (SATIŞ UYARISI adayları): SuperTrend'in SON BARDA SAT'a döndüğü
//   BIST hisseleri. Arayüz bunu kullanıcının Sanal Borsa portföyüyle
//   kesiştirir ("kendi hisselerim"); portföy tarayıcıda durduğu için
//   sunucuya gönderilmez, süzme istemcide yapılır.
//
//   Son bar, hissenin en güncel barı olmalıdır — duvar saatine göre "bugün"
//   değil. Seans kapalıyken (mesai dışı, hafta sonu, tatil) son tamamlanan
//   seansın sonucu gösterilmeye devam eder; yalnızca bayat kalan (ör. işlemi
//   durdurulmuş) hisse elenir.
//
// Veri: liveSignals'ın canlı fiyatla yamalı günlük bar geçmişi — TARAMA için
// Yahoo'ya EK İSTEK YOK.

import { INSTRUMENTS } from './stocks.js';
import { recentSignals, supertrendSignal, rsYonFiltresi, rsGirisTetigi, rsBaslangicStopu } from './indicators.js';
import { liveDailySeries, XU100_TICKER } from './liveSignals.js';

// Leg1 (kesitsel sıralama) parametreleri.
const N_RS = 60;      // Göreceli Güç lookback (bar)
const TOP_PCT = 0.20; // top yüzde

// BIST Tarama kaç iş günü geriye kadar denenir (durum taraması, kesişim değil).
const GUN_PENCERESI = Number(process.env.BIST_TARAMA_GUN_PENCERESI ?? 5);

// Taranan evren: yalnızca BIST hisseleri (kıymetli madenler hariç).
// `kind !== 'metal'` yerine `kind === 'stock'`: niyeti doğrudan ifade eder ve
// INSTRUMENTS'a ileride yeni bir kind eklenirse sessizce sızmaz. (Bu filtre bir
// dönem emtiayı elemiyordu ve BRENT taramaya karışıyordu; emtia artık siteden
// tamamen kaldırıldı — bkz. stocks.js KAPSAM notu.)
const SCAN_INSTRUMENTS = INSTRUMENTS.filter((i) => i.kind === 'stock');
const META = new Map(INSTRUMENTS.map((i) => [i.ticker, i]));

// Satış uyarısı (SuperTrend dönüşü) kaç bar geriye kadar "yeni" sayılır.
const LOOKBACK = Number(process.env.ALERT_LOOKBACK_BARS ?? 1);
const MAX_ITEMS = Number(process.env.ALERT_MAX_ITEMS ?? 600);
// "Bugün" hangi saate göre: enstrümanın kendi borsa saati (Yahoo meta.gmtoffset).
// Bilinmiyorsa BIST varsayılır (UTC+3).
const DEFAULT_OFF = Number(process.env.EXCHANGE_GMT_OFFSET ?? 10800);

const IND_LABEL = {
  rs: 'Göreceli Güç', yon: 'Yön Filtresi', giris: 'Giriş', st: 'SuperTrend',
};

// series'i SONDAN k bar kırpar (geriye dönük gün kontrolü için).
function kes(arr, k) {
  return arr ? arr.slice(0, Math.max(0, arr.length - k)) : arr;
}

// Tüm enstrümanları tarar; hisse başına tek kayıt döner.
function scan() {
  const items = [];   // alım adayları (RS sistemi)
  const stSell = [];  // SuperTrend SAT dönüşü — portföy süzgeci istemcide
  let ready = 0;

  const day = (ts, off) => Math.floor((ts + (off ?? 0)) / 86400);
  const iso = (ts, off) => new Date((ts + (off ?? 0)) * 1000).toISOString().slice(0, 10);

  const xu100 = liveDailySeries(XU100_TICKER);
  if (!xu100) return { items: [], stSell: [], ready: 0, scanned: 0, lastBarDate: null };

  const series = [];
  // En güncel bar tek grup için izlenir (evren artık yalnızca BIST).
  let lastDay = -Infinity, lastOff = DEFAULT_OFF, lastTs = null;
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

  // Leg1: her geçmiş gün (k=0..GUN_PENCERESI-1) için kesitsel top-%20 kümesi.
  // LOOKAHEAD YOK: k gününe ait küme yalnızca o güne kadar kırpılmış veriyle
  // hesaplanır (seriKirp mantığı).
  const topSetByK = [];
  for (let k = 0; k < GUN_PENCERESI; k++) {
    const benchC = kes(xu100.close, k);
    const bn = benchC.length;
    if (bn < N_RS + 5) { topSetByK.push(new Set()); continue; }
    const endeksGetiri = benchC[bn - 1] / benchC[bn - 1 - N_RS] - 1;
    const gunluk = [];
    for (const { inst, s } of series) {
      const c = kes(s.close, k);
      const n = c.length;
      if (n < N_RS + 5) continue;
      gunluk.push({ ticker: inst.ticker, relRet: (c[n - 1] / c[n - 1 - N_RS] - 1) - endeksGetiri });
    }
    gunluk.sort((a, b) => b.relRet - a.relRet);
    const topN = Math.max(1, Math.round(gunluk.length * TOP_PCT));
    topSetByK.push(new Set(gunluk.slice(0, topN).map((x) => x.ticker)));
  }

  for (const { inst, s } of series) {
    // Son barı en güncel bardan eski olan hisseyi atla.
    const off = s.gmtoffset ?? DEFAULT_OFF;
    if (s.lastTs == null || day(s.lastTs, off) !== lastDay) continue;

    // ALIM ADAYI: Leg1 (top %20) + Leg2 (yön filtresi) + Leg3 (giriş) —
    // son GUN_PENCERESI gün içinde herhangi birinde birlikte sağlanmış mı.
    // İlk (en güncel) geçen gün kullanılır.
    for (let k = 0; k < GUN_PENCERESI; k++) {
      if (!topSetByK[k].has(inst.ticker)) continue;
      const c = kes(s.close, k), h = kes(s.high, k), l = kes(s.low, k);
      const benchC = kes(xu100.close, k);
      if (!rsYonFiltresi(c, benchC)) continue;
      if (!rsGirisTetigi(c)) continue;

      // Stop GÜNCEL bardan hesaplanır, sinyal barından değil. Sinyal 5 gün
      // önce oluşmuş olabilir (GUN_PENCERESI) ve `kes(..., k)` ile hesaplanan
      // stop o günkü kapanış−ATR seviyesiydi: bugün girecek kullanıcıya, arada
      // fiyat stop mesafesi kadar hareket etmişken eski seviyeyi göstermek
      // yanıltıcıydı. Kullanılabilir olan, bugün girildiğinde geçerli stop.
      const stopSeviye = rsBaslangicStopu(s.high, s.low, s.close);
      const stState = supertrendSignal(s.high, s.low, s.close); // bilgi amaçlı trend
      items.push({
        ticker: inst.ticker,
        name: META.get(inst.ticker)?.name ?? null,
        grup: 'al',
        dir: 'AL',
        barsAgo: k, // durum taraması — kaç gün önce (0=bugün, 1=dün...) sağlanmış
        stopSeviye, // Leg4: ATR tabanlı başlangıç stopu (bilgi amaçlı)
        signals: [
          { ind: 'rs', indLabel: IND_LABEL.rs, dir: 'AL', state: true },
          { ind: 'yon', indLabel: IND_LABEL.yon, dir: 'AL', state: true },
          { ind: 'giris', indLabel: IND_LABEL.giris, dir: 'AL', barsAgo: k },
          ...(stState ? [{ ind: 'st', indLabel: IND_LABEL.st, dir: stState, state: true }] : []),
        ],
      });
      break;
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

  // TAZELİK ÖNCE: Leg3 bir zamanlama tetiği ve değeri günler içinde eriyor.
  // Alfabetik sıralamada 5 gün önceki tetik bugünkünün üstünde çıkabiliyordu;
  // artık bugün sağlananlar başta, eşitlikte alfabetik.
  items.sort((a, b) => a.barsAgo - b.barsAgo || a.ticker.localeCompare(b.ticker));
  stSell.sort((a, b) => a.ticker.localeCompare(b.ticker));

  const lastBarDate = lastTs != null ? iso(lastTs, lastOff) : null;
  const scanned = series.filter(({ s }) =>
    s.lastTs != null && day(s.lastTs, s.gmtoffset ?? DEFAULT_OFF) === lastDay).length;

  return {
    items: items.slice(0, MAX_ITEMS),
    stSell: stSell.slice(0, MAX_ITEMS),
    ready, scanned, lastBarDate,
  };
}

let scanCache = { at: 0, items: [], stSell: [], ready: 0, scanned: 0, lastBarDate: null };
export function getAlerts() {
  if (Date.now() - scanCache.at > 60000) {
    scanCache = { at: Date.now(), ...scan() };
  }
  return {
    updatedAt: new Date(scanCache.at).toISOString(),
    lastBarDate: scanCache.lastBarDate,
    items: scanCache.items,
    stSell: scanCache.stSell,
    stats: { ready: scanCache.ready, scanned: scanCache.scanned, total: SCAN_INSTRUMENTS.length },
  };
}
