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
// bölgelerdeki kesişimlerde üretilir. Üst sınır yok: 60'ın ötesi de dahil.
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

// SuperTrend (Kıvanç Özbilgiç) tam serisi: her bar için trend yönü (1/-1).
// Pine mantığının birebir aktarımı (src=hl2, up/dn ratchet, trend flip).
export function supertrendSeries(highs, lows, closes, period = ST_ATR_PERIOD, mult = ST_MULTIPLIER) {
  const n = closes?.length ?? 0;
  const dir = new Array(n).fill(null);
  if (n < period + 2) return dir;
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

    dir[i] = trend;
    prevUp = up; prevDn = dn; prevTrend = trend; prevClose = closes[i];
  }

  return dir;
}

// SuperTrend: fiyat trend çizgisinin üstündeyse AL, altındaysa SAT (son bar).
export function supertrendSignal(highs, lows, closes, period = ST_ATR_PERIOD, mult = ST_MULTIPLIER) {
  const dir = supertrendSeries(highs, lows, closes, period, mult);
  const last = dir[dir.length - 1];
  return last == null ? null : (last === 1 ? 'AL' : 'SAT');
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

// --- YENİ sinyal tespiti (UYARI taraması) -----------------------------------
// Kalıcı durumu değil, sinyalin OLUŞTUĞU BARI arar: son `lookback` bar içinde
// SuperTrend trend dönüşü, WaveTrend kesişimi ve overzone (53-60) sinyalinin
// kurulması. Her biri için en yeni olay { dir, barsAgo } olarak döner (yoksa null).
export function recentSignals(highs, lows, closes, lookback = 6) {
  const n = closes?.length ?? 0;
  const out = { st: null, wt: null, oz: null };
  if (n < 3) return out;
  const from = Math.max(1, n - lookback);

  // SuperTrend: yön değişimi (AL <-> SAT)
  const dir = supertrendSeries(highs, lows, closes);
  for (let i = from; i < n; i++) {
    if (dir[i] == null || dir[i - 1] == null || dir[i] === dir[i - 1]) continue;
    out.st = { dir: dir[i] === 1 ? 'AL' : 'SAT', barsAgo: n - 1 - i };
  }

  const w = computeWaveTrend(highs, lows, closes);
  if (w) {
    const { wt1, wt2 } = w;
    for (let i = from; i < n; i++) {
      if (wt1[i - 1] == null || wt2[i - 1] == null || wt1[i] == null || wt2[i] == null) continue;
      const prev = wt1[i - 1] - wt2[i - 1], cur = wt1[i] - wt2[i];
      const up = prev <= 0 && cur > 0, down = prev >= 0 && cur < 0;
      if (up) out.wt = { dir: 'AL', barsAgo: n - 1 - i };
      else if (down) out.wt = { dir: 'SAT', barsAgo: n - 1 - i };
      // overzone: yalnızca aşırı bölgede kurulan kesişimler sinyaldir
      const level = wt2[i];
      if (up && level <= WT_OS_LEVEL) out.oz = { dir: 'AL', barsAgo: n - 1 - i };
      else if (down && level >= WT_OB_LEVEL) out.oz = { dir: 'SAT', barsAgo: n - 1 - i };
    }
  }
  return out;
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

// --- BIST Tarama: Göreceli Güç Çekirdekli Momentum/Pullback Sistemi --------
// Dört bacaklı bir tasarım (sohbette detaylı özet + backtest var):
//   Leg1 (kesitsel sıralama, top %20)  — BURADA YOK, tüm evreni aynı anda
//     gerektirir; bkz. alerts.js scan() (cross-sectional, per-symbol değil).
//   Leg2 (yön filtresi, reel/relative bazda) — rsYonFiltresi
//   Leg3 (giriş: basit geri çekilme)          — rsGirisTetigi
//   Leg4 (risk: ATR tabanlı başlangıç stopu)  — rsBaslangicStopu
//
// DÜRÜSTLÜK NOTU: Bu sistem BIST 100 üzerinde ~180 günlük tarihsel test
// edildi — MEDYAN R NEGATİF çıktı (tipik işlem kayıp), pozitif ortalama
// birkaç aykırı (outlier) işleme bağımlıydı (KTLEV, ASTOR). Kanıtlanmış bir
// kenarı YOKTUR — yalnızca bilgi amaçlı bir tarayıcı olarak kullanılmalı.
const RS_TREND_MA = 50;  // Leg2: yön filtresi MA uzunluğu
const RS_ENTRY_MA = 20;  // Leg3: giriş MA uzunluğu
const RS_ATR_LEN = 14;
const RS_ATR_K = 2.5;    // Leg4: stop/iz süren çarpanı — 3.0 denendi, medyan
                         // bazda iyileşme sağlamadığı (aşırı-optimizasyon
                         // olduğu) ölçüldü, 2.5'te bırakıldı.

// Leg2 — Yön filtresi: kapanış/benchmark ORANI, kendi yükselen RS_TREND_MA
// günlük ortalamasının üstünde mi? (BIST'te benchmark=XU100; nominal fiyat
// DEĞİL, enflasyon ortamında nominal trend ayırt ediciliğini kaybeder.)
export function rsYonFiltresi(closes, benchCloses) {
  const n = closes?.length ?? 0, m = benchCloses?.length ?? 0;
  const need = RS_TREND_MA + 4;
  if (n < need || m < need) return false;
  const k = Math.min(n, m);
  const ratio = new Array(k);
  for (let i = 0; i < k; i++) ratio[i] = closes[n - k + i] / benchCloses[m - k + i];
  const ma = sma(ratio, RS_TREND_MA);
  const last = k - 1;
  return ratio[last] > ma[last] && ma[last] > ma[last - 3];
}

// Leg3 — Giriş: basit geri çekilme. Kapanış, YÜKSELEN RS_ENTRY_MA günlük
// ortalamayı son barda yukarı kesti mi? Tek ve kaba bir kural (osilatör yok).
export function rsGirisTetigi(closes) {
  const n = closes?.length ?? 0;
  if (n < RS_ENTRY_MA + 4) return false;
  const ma = sma(closes, RS_ENTRY_MA);
  const last = n - 1;
  const rising = ma[last] > ma[last - 3];
  const crossed = closes[last - 1] <= ma[last - 1] && closes[last] > ma[last];
  return rising && crossed;
}

// Leg4 — Başlangıç stopu: Giriş − RS_ATR_K × ATR(14). Hesaplanamazsa null.
export function rsBaslangicStopu(highs, lows, closes) {
  const n = closes?.length ?? 0;
  if (n < RS_ATR_LEN + 1) return null;
  const atrArr = atr(highs, lows, closes, RS_ATR_LEN);
  const last = n - 1;
  if (atrArr[last] == null) return null;
  return closes[last] - RS_ATR_K * atrArr[last];
}
