// TradingView tarzı teknik göstergeler: Supertrend ve WaveTrend (LazyBear).
// Günlük OHLC dizilerini (eşit uzunlukta, eskiden yeniye sıralı) alır ve son
// bardaki AL/SAT sinyalini döner. Yeterli bar yoksa null döner.

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

// Wilder ATR (RMA yumuşatması).
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

// Supertrend: fiyat trend çizgisinin üstündeyse AL (yükseliş), altındaysa SAT.
export function supertrendSignal(highs, lows, closes, period = 10, mult = 3) {
  const n = closes?.length ?? 0;
  if (n < period + 2) return null;
  const atrArr = atr(highs, lows, closes, period);

  let prevFinalUpper = Infinity;
  let prevFinalLower = -Infinity;
  let dir = 1; // 1: yükseliş, -1: düşüş
  let started = false;

  for (let i = 0; i < n; i++) {
    const a = atrArr[i];
    if (a == null) continue;
    const hl2 = (highs[i] + lows[i]) / 2;
    const basicUpper = hl2 + mult * a;
    const basicLower = hl2 - mult * a;

    let finalUpper;
    let finalLower;
    if (!started) {
      finalUpper = basicUpper;
      finalLower = basicLower;
      dir = closes[i] >= hl2 ? 1 : -1;
      started = true;
    } else {
      finalUpper = (basicUpper < prevFinalUpper || closes[i - 1] > prevFinalUpper)
        ? basicUpper : prevFinalUpper;
      finalLower = (basicLower > prevFinalLower || closes[i - 1] < prevFinalLower)
        ? basicLower : prevFinalLower;
      if (closes[i] > prevFinalUpper) dir = 1;
      else if (closes[i] < prevFinalLower) dir = -1;
      // aksi halde yön korunur
    }
    prevFinalUpper = finalUpper;
    prevFinalLower = finalLower;
  }

  return dir === 1 ? 'AL' : 'SAT';
}

// WaveTrend (LazyBear): wt1, wt2 sinyal çizgisinin üstündeyse AL, altındaysa SAT.
export function wavetrendSignal(highs, lows, closes, n1 = 10, n2 = 21) {
  const n = closes?.length ?? 0;
  if (n < n2 + 5) return null;
  const ap = closes.map((c, i) => (highs[i] + lows[i] + c) / 3); // hlc3
  const esa = ema(ap, n1);
  const de = ema(ap.map((v, i) => Math.abs(v - esa[i])), n1);
  const ci = ap.map((v, i) => {
    const d = de[i];
    return d === 0 ? 0 : (v - esa[i]) / (0.015 * d);
  });
  const wt1 = ema(ci, n2);
  const wt2 = sma(wt1, 4);
  const last = n - 1;
  return wt1[last] >= wt2[last] ? 'AL' : 'SAT';
}
