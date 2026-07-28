// TradingView göstergeleri (belirtilen yazarların scriptlerine göre):
//  - WaveTrend Oscillator — LazyBear
//  - SuperTrend — Kıvanç Özbilgiç
// Günlük OHLC dizilerini (eşit uzunlukta, eskiden yeniye) alır ve son bardaki
// AL/SAT sinyalini döner. Yeterli bar yoksa null döner.

// --- Gösterge parametreleri --------------------------------------------------
// SuperTrend (Kıvanç Özbilgiç): kaynak hl2, ATR periyodu 10, çarpan 3, ATR=RMA.
const ST_ATR_PERIOD = 10;
const ST_MULTIPLIER = 3;
// WaveTrend (LazyBear): kanal 10, ortalama 21, sinyal çizgisi SMA(wt1,4).
const WT_CHANNEL_LEN = 10;
const WT_AVERAGE_LEN = 21;
const WT_SIGNAL_LEN = 4;
// Aşırı bölge seviyeleri (LazyBear -53/-60 ve +53/+60). Sinyal yalnızca bu
// bölgelerdeki kesişimlerde üretilir.
const WT_OS_LEVEL = -53; // aşırı satım eşiği (bu değer ve altı)
const WT_OB_LEVEL = 53;  // aşırı alım eşiği (bu değer ve üstü)

// Üstel hareketli ortalama (ilk değerle tohumlanır).
function ema(values, period) {
  if (values.length === 0) return [];
  const k = 2 / (period + 1);
  const out = [values[0]];
  for (let i = 1; i < values.length; i++) {
    out.push(values[i] * k + out[i - 1] * (1 - k));
  }
  return out;
}

// Basit hareketli ortalama (tam pencere dolana kadar kısmi ortalama).
function sma(values, period) {
  const out = [];
  let sum = 0;
  for (let i = 0; i < values.length; i++) {
    sum += values[i];
    if (i >= period) sum -= values[i - period];
    out.push(i >= period - 1 ? sum / period : sum / (i + 1));
  }
  return out;
}

// RSI (Wilder) tam serisi.
function rsiSeries(closes, period = 14) {
  const n = closes?.length ?? 0;
  const out = new Array(n).fill(null);
  if (n <= period) return out;
  let gain = 0, loss = 0;
  for (let i = 1; i <= period; i++) {
    const ch = closes[i] - closes[i - 1];
    if (ch >= 0) gain += ch; else loss -= ch;
  }
  let ag = gain / period, al = loss / period;
  out[period] = al === 0 ? 100 : 100 - 100 / (1 + ag / al);
  for (let i = period + 1; i < n; i++) {
    const ch = closes[i] - closes[i - 1];
    ag = (ag * (period - 1) + (ch > 0 ? ch : 0)) / period;
    al = (al * (period - 1) + (ch < 0 ? -ch : 0)) / period;
    out[i] = al === 0 ? 100 : 100 - 100 / (1 + ag / al);
  }
  return out;
}
export function rsiValue(closes, period = 14) {
  const s = rsiSeries(closes, period);
  return s.length ? s[s.length - 1] : null;
}

// RSI aşırı satım DÖNÜŞÜ: son `lookback` barda 30'un altına inip yukarı dönmüş
// (aşırı satımdan çıkıp 30 üstüne yükselen, yukarı yönlü) hisseler.
export function rsiBullishReversal(closes, period = 14, lookback = 14) {
  const rsi = rsiSeries(closes, period);
  const n = rsi.length;
  if (n < period + 3) return false;
  const start = Math.max(period, n - lookback);
  let minR = Infinity;
  for (let i = start; i < n; i++) if (rsi[i] != null && rsi[i] < minR) minR = rsi[i];
  const last = rsi[n - 1], prev = rsi[n - 2];
  if (last == null || prev == null || minR === Infinity) return false;
  const oversoldRecently = minR < 30;             // 30 altını gördü
  const turningUp = last > prev;                  // yukarı dönüyor
  const recovered = last > 30 && last > minR + 2; // aşırı satımdan çıktı
  return oversoldRecently && turningUp && recovered;
}

// MACD (12/26/9): mavi (MACD) çizgisi sarı (sinyal) çizgisinin ÜSTÜNDE mi?
export function macdBullish(closes, fast = 12, slow = 26, sig = 9) {
  const n = closes?.length ?? 0;
  if (n < slow + sig + 2) return false;
  const ef = ema(closes, fast);
  const es = ema(closes, slow);
  const macd = closes.map((_, i) => ef[i] - es[i]);
  const signal = ema(macd, sig);
  return macd[n - 1] > signal[n - 1];
}

// MACD pozitif kesişim: son `lookback` barda MACD çizgisi sinyali yukarı kesmiş
// (sıfır çizgisi şartı yok — mavi çizgi sarıyı nerede olursa olsun yukarı kessin).
export function macdBullCross(closes, fast = 12, slow = 26, sig = 9, lookback = 5) {
  const n = closes?.length ?? 0;
  if (n < slow + sig + 2) return false;
  const ef = ema(closes, fast);
  const es = ema(closes, slow);
  const macd = closes.map((_, i) => ef[i] - es[i]);
  const signal = ema(macd, sig);
  for (let i = Math.max(1, n - lookback); i < n; i++) {
    if (macd[i - 1] <= signal[i - 1] && macd[i] > signal[i]) return true;
  }
  return false;
}

// --- Smart Money Concept (SMC) yükseliş sinyali -----------------------------
// Fractal swing high/low (pivot) tespiti (k bar sol+sağ).
function findPivots(highs, lows, k = 2) {
  const n = highs.length;
  const sh = [], sl = [];
  for (let i = k; i < n - k; i++) {
    let isH = true, isL = true;
    for (let j = 1; j <= k; j++) {
      if (highs[i] <= highs[i - j] || highs[i] <= highs[i + j]) isH = false;
      if (lows[i] >= lows[i - j] || lows[i] >= lows[i + j]) isL = false;
    }
    if (isH) sh.push({ i, p: highs[i] });
    if (isL) sl.push({ i, p: lows[i] });
  }
  return { sh, sl };
}

// SMC yükseliş: likidite süpürme (son dip önceki dibin altına inip döndü) + yapı
// kırılımı (kapanış son swing high'ı yukarı kesip üstünde tutuyor = BOS/CHoCH).
export function smcBullish(highs, lows, closes, recent = 5) {
  const n = closes?.length ?? 0;
  if (n < 30) return false;
  const { sh, sl } = findPivots(highs, lows, 2);
  if (sh.length < 2 || sl.length < 2) return false;
  const lastSH = sh[sh.length - 1];
  let brokeUp = false;
  for (let i = Math.max(1, n - recent); i < n; i++) {
    if (closes[i - 1] <= lastSH.p && closes[i] > lastSH.p) brokeUp = true;
  }
  const holding = closes[n - 1] > lastSH.p;           // kırılım geçerli (üstünde)
  const sweep = sl[sl.length - 1].p < sl[sl.length - 2].p; // son dip önceki dibin altına indi
  return brokeUp && holding && sweep;
}

// --- Hacim dönüşü: kırmızı mumların ardından güçlü yeşil mum ----------------
// Hacim grafiğinde arka arkaya gelen 2-3 (en çok 5) KIRMIZI mumun ardından bir
// YEŞİL mum gelir ve bu yeşil mumun hacmi kırmızıların HEPSİNDEN yüksekse:
// satıcı tükenmiş, alıcı hacimle dönmüş demektir. Yeşil mumun ayrıca "güçlü"
// olması aranır: gövdesi mumun boyuna hâkim ve kırmızıların gövdesinden büyük.
const VR_MIN_REDS = 2;      // en az 2 ardışık kırmızı mum
const VR_MAX_REDS = 5;      // en çok bu kadar geriye ardışık kırmızı say
const VR_BODY_RATIO = 0.5;  // güçlü mum: gövde / (yüksek-düşük)
const VR_AVG_WINDOW = 20;   // hacim ortalaması penceresi (bilgi amaçlı)

export function volumeReversal(opens, highs, lows, closes, volumes, lookback = 3) {
  const n = closes?.length ?? 0;
  if (!opens || !volumes || opens.length !== n || volumes.length !== n) return null;
  if (n < VR_MIN_REDS + 2) return null;

  const body = (i) => Math.abs(closes[i] - opens[i]);
  const isRed = (i) => closes[i] < opens[i];
  const isGreen = (i) => closes[i] > opens[i];

  // Son `lookback` bar içinde EN YENİ formasyonu ara (en yeniden geriye doğru).
  for (let g = n - 1; g >= n - lookback && g >= VR_MIN_REDS; g--) {
    if (!isGreen(g) || !(volumes[g] > 0)) continue;

    // g'den geriye ardışık kırmızı mumlar (reds[0] = yeşile en yakın olan).
    const reds = [];
    for (let j = g - 1; j >= 0 && reds.length < VR_MAX_REDS && isRed(j); j--) reds.push(j);
    if (reds.length < VR_MIN_REDS) continue;

    // Yeşil mumun hacmi kırmızıların hepsinden yüksek olmalı.
    const maxRedVol = Math.max(...reds.map((i) => volumes[i]));
    if (!(volumes[g] > maxRedVol)) continue;

    // "Güçlü" yeşil mum: gövde baskın + kırmızıların en büyük gövdesinden büyük.
    const range = highs[g] - lows[g];
    if (range > 0 && body(g) / range < VR_BODY_RATIO) continue;
    if (body(g) < Math.max(...reds.map(body))) continue;

    // Bilgi: hacim, formasyon öncesi ortalamaya göre kaç kat?
    const from = Math.max(0, g - VR_AVG_WINDOW);
    const prevVols = volumes.slice(from, g).filter((v) => v > 0);
    const avgVol = prevVols.length
      ? prevVols.reduce((s, v) => s + v, 0) / prevVols.length
      : null;

    const firstRed = reds[reds.length - 1]; // en eski kırmızı
    return {
      barsAgo: n - 1 - g,                                 // kaç bar önce oluştu (0 = son bar)
      reds: reds.length,                                  // kaç kırmızı mumdan sonra
      volRatio: volumes[g] / maxRedVol,                   // yeşil hacim / en yüksek kırmızı hacim
      volAvgRatio: avgVol ? volumes[g] / avgVol : null,   // yeşil hacim / 20 bar ortalaması
      gainPct: ((closes[g] - opens[g]) / opens[g]) * 100, // yeşil mumun gövde kazancı
      dropPct: ((closes[reds[0]] - opens[firstRed]) / opens[firstRed]) * 100, // öncesindeki düşüş
    };
  }
  return null;
}

// Wilder ATR (RMA yumuşatması) — Pine'daki ta.atr ile aynı.
function atr(highs, lows, closes, period) {
  const n = closes.length;
  const out = new Array(n).fill(null);
  if (n < period) return out;
  const tr = new Array(n);
  tr[0] = highs[0] - lows[0];
  for (let i = 1; i < n; i++) {
    tr[i] = Math.max(
      highs[i] - lows[i],
      Math.abs(highs[i] - closes[i - 1]),
      Math.abs(lows[i] - closes[i - 1]),
    );
  }
  let prev = 0;
  for (let i = 0; i < period; i++) prev += tr[i];
  prev /= period;
  out[period - 1] = prev;
  for (let i = period; i < n; i++) {
    prev = (prev * (period - 1) + tr[i]) / period;
    out[i] = prev;
  }
  return out;
}

// SuperTrend (Kıvanç Özbilgiç): fiyat trend çizgisinin üstündeyse AL, altındaysa SAT.
// Pine mantığının birebir aktarımı (src=hl2, up/dn ratchet, trend flip).
export function supertrendSignal(highs, lows, closes, period = ST_ATR_PERIOD, mult = ST_MULTIPLIER) {
  const n = closes?.length ?? 0;
  if (n < period + 2) return null;
  const atrArr = atr(highs, lows, closes, period);

  let prevUp = null, prevDn = null, prevTrend = 1, prevClose = null;
  let trend = 1;
  let started = false;

  for (let i = 0; i < n; i++) {
    const a = atrArr[i];
    if (a == null) continue;
    const src = (highs[i] + lows[i]) / 2;
    let up = src - mult * a; // destek (support)
    let dn = src + mult * a; // direnç (resistance)

    if (!started) {
      trend = 1; // Pine varsayılanı
      started = true;
    } else {
      up = prevClose > prevUp ? Math.max(up, prevUp) : up;
      dn = prevClose < prevDn ? Math.min(dn, prevDn) : dn;
      trend = prevTrend;
      if (prevTrend === -1 && closes[i] > prevDn) trend = 1;
      else if (prevTrend === 1 && closes[i] < prevUp) trend = -1;
    }

    prevUp = up; prevDn = dn; prevTrend = trend; prevClose = closes[i];
  }

  return trend === 1 ? 'AL' : 'SAT';
}

// WaveTrend Oscillator (LazyBear): yeşil çizgi wt1, sinyal (kırmızı) çizgi wt2.
// wt1 (yeşil çizgi) ve wt2 (kırmızı sinyal çizgisi) dizilerini hesaplar.
function computeWaveTrend(highs, lows, closes, n1 = WT_CHANNEL_LEN, n2 = WT_AVERAGE_LEN) {
  const n = closes?.length ?? 0;
  if (n < n2 + WT_SIGNAL_LEN + 2) return null;
  const ap = closes.map((c, i) => (highs[i] + lows[i] + c) / 3); // hlc3
  const esa = ema(ap, n1);
  const de = ema(ap.map((v, i) => Math.abs(v - esa[i])), n1);
  const ci = ap.map((v, i) => {
    const d = de[i];
    return d === 0 ? 0 : (v - esa[i]) / (0.015 * d);
  });
  const wt1 = ema(ci, n2);             // yeşil çizgi
  const wt2 = sma(wt1, WT_SIGNAL_LEN); // kırmızı sinyal çizgisi
  return { wt1, wt2, n };
}

// Standart WaveTrend kesişimi (herhangi bölge): yeşil çizgi (wt1) kırmızıyı (wt2)
// YUKARI kestiğinde AL, AŞAĞI kestiğinde SAT. Son kesişimin yönünü döner.
export function wavetrendCrossSignal(highs, lows, closes) {
  const w = computeWaveTrend(highs, lows, closes);
  return w ? crossFrom(w) : null;
}
function crossFrom(w) {
  const { wt1, wt2, n } = w;
  let signal = null;
  for (let i = 1; i < n; i++) {
    const prevDiff = wt1[i - 1] - wt2[i - 1];
    const diff = wt1[i] - wt2[i];
    if (prevDiff <= 0 && diff > 0) signal = 'AL';        // yukarı kesişim
    else if (prevDiff >= 0 && diff < 0) signal = 'SAT';  // aşağı kesişim
  }
  if (signal == null) signal = wt1[n - 1] >= wt2[n - 1] ? 'AL' : 'SAT';
  return signal;
}

// 53-60 WaveTrend: sinyal TERS kesişime kadar kalıcıdır, sonra boşalır (null).
//   AL  : aşırı satımda (wt2 <= -53) YUKARI kesişimle kurulur;
//         sonraki AŞAĞI kesişim (tersi) olunca boşalır.
//   SAT : aşırı alımda  (wt2 >= +53) AŞAĞI kesişimle kurulur;
//         sonraki YUKARI kesişim (tersi) olunca boşalır.
export function wavetrendSignal(highs, lows, closes) {
  const w = computeWaveTrend(highs, lows, closes);
  return w ? overzoneFrom(w) : null;
}

// İki WaveTrend sinyalini TEK geçişte döner (seriyi iki kez hesaplamamak için).
export function wavetrendSignals(highs, lows, closes) {
  const w = computeWaveTrend(highs, lows, closes);
  if (!w) return { cross: null, overzone: null };
  return { cross: crossFrom(w), overzone: overzoneFrom(w) };
}

function overzoneFrom(w) {
  const { wt1, wt2, n } = w;
  let signal = null;
  for (let i = 1; i < n; i++) {
    const prevDiff = wt1[i - 1] - wt2[i - 1];
    const diff = wt1[i] - wt2[i];
    const upCross = prevDiff <= 0 && diff > 0;
    const downCross = prevDiff >= 0 && diff < 0;
    const level = wt2[i]; // kesişimin gerçekleştiği bölge (kırmızı çizgi değeri)
    if (upCross) {
      if (level <= WT_OS_LEVEL) signal = 'AL';   // aşırı satımda yukarı kesişim -> AL
      else if (signal === 'SAT') signal = null;  // SAT'ın tersi -> boşalt
    } else if (downCross) {
      if (level >= WT_OB_LEVEL) signal = 'SAT';  // aşırı alımda aşağı kesişim -> SAT
      else if (signal === 'AL') signal = null;   // AL'ın tersi -> boşalt
    }
  }
  return signal;
}
