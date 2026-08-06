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
// Aşırı bölge seviyeleri (LazyBear -50/-60 ve +50/+60). Sinyal yalnızca bu
// bölgelerdeki kesişimlerde üretilir.
const WT_OS_LEVEL = -50; // aşırı satım eşiği (bu değer ve altı)
const WT_OB_LEVEL = 50;  // aşırı alım eşiği (bu değer ve üstü)

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

// --- Hacim profili: Point of Control (POC) ----------------------------------
// Pencerenin fiyat aralığı POC_BINS dilime bölünür; her barın hacmi, o barın
// yüksek-düşük aralığına düşen dilimlere EŞİT dağıtılır (bar içi dağılımı
// bilmediğimiz için standart yaklaşım). En çok hacim biriken dilimin orta
// fiyatı POC: piyasanın en çok işlem gördüğü, yani kabul ettiği denge seviyesi.
const POC_WINDOW = 250; // ~1 yıl (elimizdeki tüm günlük geçmiş)
const POC_BINS = 50;
// Fiyatın POC'u geçmiş sayılması için gereken pay. Payszken sinyallerin yarısı
// POC'un %1-2 üstünde duruyordu — o kadarlık bir hareket koşulu ters çevirir,
// yani süzgeç iş görmüyordu. Ölçüldü: canlı listede ALBRK %2, EDIP %1,
// NUGYO %2, ISFIN %4, BINHO %4.
const POC_PAY = 0.03;
// ChoCh için ayrı ve KISA pencere. 250 barla "düşüşü sonlandıran dip" pratikte
// YILIN DİBİ oluyordu: canlı listede dipin yaşı ortanca 168 bar (~8 ay), 10
// sinyalin 7'sinde 90 bardan eski. Aylardır yükselen bir hissede yılın dibini
// referans almak karakter değişimi değil, sadece yeni zirveye çıkış demek.
// 90 bara çekilince kurulum tazeleşti (dip yaşı ortancası 99 -> 14 bar) ama
// sinyal sayısı 10'dan 18'e çıktı: pencere daraldıkça "en düşük dip" yakınlaşıp
// kırılması gereken tepe alçalıyor, dolayısıyla daha çok hisse eşiği geçiyor.
// Seçiciliği geri almak için 60'a indirildi.
const CHOCH_WINDOW = 60;

export function pointOfControl(highs, lows, volumes, window = POC_WINDOW, bins = POC_BINS) {
  const n = highs?.length ?? 0;
  if (!volumes || volumes.length !== n || n < 20) return null;
  const from = Math.max(0, n - window);
  let lo = Infinity, hi = -Infinity;
  for (let i = from; i < n; i++) {
    if (lows[i] < lo) lo = lows[i];
    if (highs[i] > hi) hi = highs[i];
  }
  if (!Number.isFinite(lo) || !Number.isFinite(hi) || !(hi > lo)) return null;

  const w = (hi - lo) / bins;
  const acc = new Array(bins).fill(0);
  let toplam = 0;
  for (let i = from; i < n; i++) {
    const v = volumes[i];
    if (!(v > 0)) continue;
    toplam += v;
    const a = Math.max(0, Math.min(bins - 1, Math.floor((lows[i] - lo) / w)));
    const b = Math.max(0, Math.min(bins - 1, Math.floor((highs[i] - lo) / w)));
    const pay = v / (b - a + 1);
    for (let k = a; k <= b; k++) acc[k] += pay;
  }
  if (!(toplam > 0)) return null;

  let best = 0;
  for (let k = 1; k < bins; k++) if (acc[k] > acc[best]) best = k;
  return lo + (best + 0.5) * w;
}

// --- ChoCh / MSB seviyesi ---------------------------------------------------
// Düşüş trendini sonlandıran dip = penceredeki EN DÜŞÜK swing low. O dipten
// ÖNCEKİ son swing high, düşüşü başlatan tepedir; yukarı kırılması karakter
// değişimi (Change of Character / Market Structure Break) sayılır.
// Not: "son swing high"dan farklıdır — genelde daha yukarıda ve daha anlamlı.
export function chochLevel(highs, lows, window = CHOCH_WINDOW, k = 2) {
  const n = highs?.length ?? 0;
  if (n < 30) return null;
  const from = Math.max(0, n - window);
  const { sh, sl } = findPivots(highs, lows, k);
  const dipler = sl.filter((x) => x.i >= from);
  if (!dipler.length) return null;

  let dip = dipler[0];
  for (const d of dipler) if (d.p < dip.p) dip = d;

  let tepe = null;
  for (const h of sh) { if (h.i < dip.i) tepe = h; else break; }
  return tepe ? { seviye: tepe.p, dipIdx: dip.i, tepeIdx: tepe.i } : null;
}

// --- HTF (üst zaman dilimi) -------------------------------------------------
// Günlük barlar 5'erli gruplanıp haftalığa toplanır. Gruplama SONDAN hizalanır
// ki en güncel hafta son barla bitsin. Gerçek takvim haftası değil (bar
// dizilerinde zaman damgası taşımıyoruz; tatiller bir miktar kaydırır) — trend
// yönü için kabul edilebilir bir yaklaşım.
// Pazartesi başlangıçlı hafta indeksi. Unix gün 0 = Perşembe olduğu için +3
// kaydırınca hafta sınırı pazartesiye oturur.
const haftaNo = (ts, off) => Math.floor((Math.floor((ts + off) / 86400) + 3) / 7);

// Günlük barları GERÇEK TAKVİM HAFTALARINA toplar ve İÇİNDE BULUNULAN HAFTAYI
// dışarıda bırakır.
//
// Neden: eskiden barlar 5'erli gruplanıyordu, sondan hizalı. İki sorun vardı —
//   (1) son grup her zaman bugünün canlı barını içeriyordu, dolayısıyla en
//       güncel "haftalık" mum gün içinde oynuyor ve SuperTrend yanıp sönüyordu;
//   (2) hizalama sondan yapıldığı için her yeni günde bütün gruplar bir kayıyor,
//       yani geçmiş "haftalar" da her gün yeniden şekilleniyordu.
// Gerçek hafta sınırı kullanılınca ikisi de kalkıyor: tamamlanmış haftalar sabit
// kalır ve sinyal ancak hafta kapandığında değişir.
//
// Zaman damgası verilmezse (eski çağrı biçimi) 5'erli gruplamaya düşülür.
function haftalik(highs, lows, closes, times, off = 0, simdi = Date.now() / 1000) {
  const n = closes?.length ?? 0;
  if (!times || times.length !== n) {
    const groupSize = 5;
    const adet = Math.floor(n / groupSize);
    const h = new Array(adet), l = new Array(adet), c = new Array(adet);
    const bas = n - adet * groupSize;
    for (let g = 0; g < adet; g++) {
      const from = bas + g * groupSize, end = from + groupSize;
      let hh = -Infinity, ll = Infinity;
      for (let i = from; i < end; i++) {
        if (highs[i] > hh) hh = highs[i];
        if (lows[i] < ll) ll = lows[i];
      }
      h[g] = hh; l[g] = ll; c[g] = closes[end - 1];
    }
    return { h, l, c };
  }

  const buHafta = haftaNo(simdi, off);
  const h = [], l = [], c = [];
  let aktif = null, hh = -Infinity, ll = Infinity, kapanis = null;
  const yaz = () => {
    if (aktif == null || aktif === buHafta) return; // devam eden haftayı alma
    h.push(hh); l.push(ll); c.push(kapanis);
  };
  for (let i = 0; i < n; i++) {
    const w = haftaNo(times[i], off);
    if (w !== aktif) { yaz(); aktif = w; hh = -Infinity; ll = Infinity; }
    if (highs[i] > hh) hh = highs[i];
    if (lows[i] < ll) ll = lows[i];
    kapanis = closes[i];
  }
  yaz();
  return { h, l, c };
}

// HTF yükseliş — GEVŞEK tanım: haftalık SuperTrend AL.
// Üç aday 247 hisselik gerçek taramada ölçüldü:
//   haftalık SuperTrend  %51  <- en gevşek, seçilen
//   haftalık 20 EMA üstü %26
//   haftalık HH+HL       %21  <- en sıkı
// (20 EMA'nın SuperTrend'den gevşek olacağı varsayımı ölçümle çürüdü.)
// SuperTrend ayrıca uygulamanın günlük grafikte zaten kullandığı gösterge —
// kullanıcı aynı mantığı tanıyor.
export function htfBullish(highs, lows, closes, times, gmtoffset) {
  const { h, l, c } = haftalik(highs, lows, closes, times, gmtoffset);
  if (c.length < ST_ATR_PERIOD + 5) return false;
  return supertrendSignal(h, l, c) === 'AL';
}

// SMC yükseliş:
//   TETİK  : ChoCh/MSB kırılımı — kapanış, düşüşü başlatan tepeyi son `recent`
//            barda yukarı kesti ve hâlâ üstünde.
//   SÜZGEÇ : kapanış POC'un üstünde (piyasa değer bölgesini kabul etmiş)
//   SÜZGEÇ : HTF (haftalık) yükseliş
// Eski "likidite süpürme + son swing high kırılımı" yerini ChoCh'a bıraktı:
// aynı fikrin daha doğru tanımlanmış hali.
export function smcBullish(highs, lows, closes, volumes, sec = {}) {
  const d = smcDetay(highs, lows, closes, volumes, sec);
  return !!d && d.choch && d.pocUstunde && d.htf;
}

// Koşulların tek tek sonucu (ayar/ölçüm için).
export function smcDetay(highs, lows, closes, volumes, sec = {}) {
  const { times, gmtoffset, recent = 5 } = sec;
  const n = closes?.length ?? 0;
  if (n < 30) return null;
  const son = closes[n - 1];

  const ch = chochLevel(highs, lows);
  const poc = pointOfControl(highs, lows, volumes);

  // Seviyeyi son `recent` barda aşağıdan yukarı kesip üstünde kaldı mı?
  let choch = false;
  if (ch?.seviye != null) {
    for (let i = Math.max(1, n - recent); i < n; i++) {
      if (closes[i - 1] <= ch.seviye && closes[i] > ch.seviye) choch = true;
    }
    choch = choch && son > ch.seviye;
  }

  return {
    choch,
    // "Üstünde" değil "belirgin biçimde üstünde": POC'a yapışık fiyat, değer
    // bölgesinin kabul edildiği anlamına gelmiyor.
    pocUstunde: poc != null && son > poc * (1 + POC_PAY),
    htf: htfBullish(highs, lows, closes, times, gmtoffset),
    pocSeviye: poc,
    chochSeviye: ch?.seviye ?? null,
  };
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
// SuperTrend trend dönüşü, WaveTrend kesişimi ve overzone (50-60) sinyalinin
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

// 50-60 WaveTrend: sinyal TERS kesişime kadar kalıcıdır, sonra boşalır (null).
//   AL  : aşırı satımda (wt2 <= -50) YUKARI kesişimle kurulur;
//         sonraki AŞAĞI kesişim (tersi) olunca boşalır.
//   SAT : aşırı alımda  (wt2 >= +50) AŞAĞI kesişimle kurulur;
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

// --- Profesyonel 4 Faktörlü Tarama (Tarama sekmesi) -------------------------
// Weinstein Stage Analysis (ana trend) + IBD RS Line (göreceli güç) +
// Minervini VCP tarzı pullback konumu + hacim/MACD tetikleyicisi. KATI VE:
// dördü birden sağlanmadıkça tarama sonucu false'tur.
//   1) Ana Trend : haftalık kapanış > haftalık EMA(30), günlük kapanış >
//                  SMA(200), EMA(50) > SMA(200), SMA(200) yatay/yükseliş
//                  eğiminde (düşen bıçak filtresi).
//   2) Göreceli Güç: hissenin N-bar getirisi karşılaştırma endeksinden
//                  (XU100/S&P 500) yüksek VE Fiyat/Endeks oranı (RS çizgisi)
//                  kendi ortalamasının üstünde ve yükselişte.
//   3) Pullback  : referans EMA'ya (21) yakın VEYA ATR cinsinden aşırı
//                  uzamamış, 52 haftalık zirveden çok uzak değil (ölü hisse
//                  değil), referans EMA yükselişte (destek geçerli).
//   4) Tetik     : hacim ortalamasının X katı VE yükselen gün VE MACD son
//                  birkaç barda sinyal çizgisini yukarı kesmiş.
const TARAMA_VARSAYILAN = {
  weeklyEmaLen: 30, dailySmaLen: 200, fastEmaLen: 50, slopeLookback: 20,
  rsLookback: 63, rsMaLen: 20,
  pullbackEmaLen: 21, maxDistancePct: 5, maxExtensionAtr: 2.5, maxDistFromHighPct: 35, highWindow: 252,
  volMaLen: 20, volMultiplier: 1.5, macdFast: 12, macdSlow: 26, macdSignalLen: 9, macdLookback: 3,
};

// series: liveDailySeries() çıktısıyla AYNI şekil — { open, high, low, close,
// volume, time, gmtoffset } (tekil isimler, diziler). benchCloses: karşılaştırma
// endeksinin (XU100/S&P 500) günlük kapanış dizisi — yoksa RS filtresi geçilmiş
// sayılmaz (rs=false), diğer üç filtre yine değerlendirilir.
export function taramaDetay(series, benchCloses, opts = {}) {
  const o = { ...TARAMA_VARSAYILAN, ...opts };
  const { open: opens, high: highs, low: lows, close: closes, volume: volumes, time: times, gmtoffset } = series || {};
  const n = closes?.length ?? 0;
  if (n < o.dailySmaLen + o.slopeLookback + 5) return null; // yetersiz geçmiş (ör. yeni IPO)

  // 1) ANA TREND ------------------------------------------------------------
  const sma200 = sma(closes, o.dailySmaLen);
  const ema50 = ema(closes, o.fastEmaLen);
  const { c: haftalikKapanis } = haftalik(highs, lows, closes, times, gmtoffset);
  const haftalikEma = ema(haftalikKapanis, o.weeklyEmaLen);
  const trendWeekly = haftalikKapanis.length > 0
    && haftalikKapanis[haftalikKapanis.length - 1] > haftalikEma[haftalikEma.length - 1];
  const trendDaily = closes[n - 1] > sma200[n - 1];
  const trendYapi = ema50[n - 1] > sma200[n - 1];
  const trendEgim = sma200[n - 1] > sma200[n - 1 - o.slopeLookback];
  const trend = trendWeekly && trendDaily && trendYapi && trendEgim;

  // 2) GÖRECELİ GÜÇ (RS) -----------------------------------------------------
  let rsUst = false, rsCizgi = false;
  if (benchCloses && benchCloses.length >= o.rsLookback + o.rsMaLen + 2) {
    const m = Math.min(n, benchCloses.length);
    const stokGetiri = (closes[m - 1] - closes[m - 1 - o.rsLookback]) / closes[m - 1 - o.rsLookback] * 100;
    const endeksGetiri = (benchCloses[m - 1] - benchCloses[m - 1 - o.rsLookback]) / benchCloses[m - 1 - o.rsLookback] * 100;
    const rsSeries = new Array(m);
    for (let i = 0; i < m; i++) rsSeries[i] = closes[i] / benchCloses[i];
    const rsOrt = sma(rsSeries, o.rsMaLen);
    rsUst = stokGetiri > endeksGetiri;
    rsCizgi = rsSeries[m - 1] > rsOrt[m - 1] && rsSeries[m - 1] > rsSeries[m - 1 - o.rsMaLen];
  }
  const rs = rsUst && rsCizgi;

  // 3) PULLBACK / FİYAT BÖLGESİ ----------------------------------------------
  const emaPb = ema(closes, o.pullbackEmaLen);
  const atrArr = atr(highs, lows, closes, 14);
  const uzaklikYuzde = (closes[n - 1] - emaPb[n - 1]) / emaPb[n - 1] * 100;
  const genislemeAtr = atrArr[n - 1] ? (closes[n - 1] - emaPb[n - 1]) / atrArr[n - 1] : null;
  const pencereBas = Math.max(0, n - o.highWindow);
  let zirve = -Infinity;
  for (let i = pencereBas; i < n; i++) if (highs[i] > zirve) zirve = highs[i];
  const zirveUzaklikYuzde = (zirve - closes[n - 1]) / zirve * 100;
  const destekYakin = Math.abs(uzaklikYuzde) <= o.maxDistancePct
    || (genislemeAtr != null && closes[n - 1] > emaPb[n - 1] && genislemeAtr <= o.maxExtensionAtr);
  const kovalamiyor = genislemeAtr == null || genislemeAtr <= o.maxExtensionAtr;
  const canli = zirveUzaklikYuzde <= o.maxDistFromHighPct;
  const emaYukselis = emaPb[n - 1] > emaPb[n - 6];
  const pullback = destekYakin && kovalamiyor && canli && emaYukselis;

  // 4) HACİM VE MOMENTUM TETİKLEYİCİSİ ----------------------------------------
  const volOrt = sma(volumes, o.volMaLen);
  const hacimPatlamasi = volumes[n - 1] > volOrt[n - 1] * o.volMultiplier && closes[n - 1] > opens[n - 1];
  const ef = ema(closes, o.macdFast), es = ema(closes, o.macdSlow);
  const macdLine = closes.map((_, i) => ef[i] - es[i]);
  const macdSinyal = ema(macdLine, o.macdSignalLen);
  let macdKesisim = false;
  for (let i = Math.max(1, n - o.macdLookback); i < n; i++) {
    if (macdLine[i - 1] <= macdSinyal[i - 1] && macdLine[i] > macdSinyal[i]) macdKesisim = true;
  }
  const tetik = hacimPatlamasi && macdKesisim;

  return {
    pass: trend && rs && pullback && tetik,
    trend, rs, pullback, tetik,
  };
}

export function taramaGecti(series, benchCloses, opts) {
  return !!taramaDetay(series, benchCloses, opts)?.pass;
}

// series'i SONDAN k bar kırpar (geriye dönük gün kontrolü için) — diğer
// alanlar (gmtoffset) olduğu gibi kalır.
function seriKirp(series, k) {
  if (!k) return series;
  const kes = (arr) => (arr ? arr.slice(0, Math.max(0, arr.length - k)) : arr);
  return {
    open: kes(series.open), high: kes(series.high), low: kes(series.low),
    close: kes(series.close), volume: kes(series.volume), time: kes(series.time),
    gmtoffset: series.gmtoffset,
  };
}

// 4 Faktörlü Tarama'yı SON `gunSayisi` gün için sırayla dener (bugünden
// geriye) — dördü birden bugün değil de dün sağlanmışsa da yakalar. Neden:
// dört bağımsız koşulun TAM OLARAK aynı günde çakışması istatistiksel olarak
// çok nadir (~%0,02); iki günlük pencere, eşikleri gevşetmeden pratik isabet
// oranını artırır. İlk geçen günü (barsAgo) döner.
export function taramaSonNGun(series, benchCloses, gunSayisi = 2, opts = {}) {
  for (let k = 0; k < gunSayisi; k++) {
    const s = seriKirp(series, k);
    const bench = benchCloses && k ? benchCloses.slice(0, Math.max(0, benchCloses.length - k)) : benchCloses;
    const d = taramaDetay(s, bench, opts);
    if (d?.pass) return { ...d, barsAgo: k };
  }
  return null;
}
