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

// MACD SIFIR ÇİZGİSİNİN ÜZERİNDE pozitif kesişim: son `lookback` barda MACD çizgisi
// sinyali yukarı kesmiş VE kesişim MACD > 0 (sıfır çizgisi üstünde) gerçekleşmiş.
export function macdBullCrossAboveZero(closes, fast = 12, slow = 26, sig = 9, lookback = 5) {
  const n = closes?.length ?? 0;
  if (n < slow + sig + 2) return false;
  const ef = ema(closes, fast);
  const es = ema(closes, slow);
  const macd = closes.map((_, i) => ef[i] - es[i]);
  const signal = ema(macd, sig);
  for (let i = Math.max(1, n - lookback); i < n; i++) {
    if (macd[i - 1] <= signal[i - 1] && macd[i] > signal[i] && macd[i] > 0) return true;
  }
  return false;
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
  if (!w) return null;
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
  if (!w) return null;
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
