import { toSymbol, INSTRUMENTS } from './stocks.js';

// Yahoo Finance chart endpoint'i BIST hisseleri için ".IS" ekiyle çalışır
// ve crumb/cookie gerektirmez. 1 aylık günlük veriyi çekiyoruz.
const CHART_URL = 'https://query1.finance.yahoo.com/v8/finance/chart';
const SUMMARY_URL = 'https://query2.finance.yahoo.com/v10/finance/quoteSummary';
// Datacenter IP'lerinde Yahoo gerçekçi bir tarayıcı UA bekliyor.
const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
  '(KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36';
const BROWSER_HEADERS = {
  'User-Agent': UA,
  Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.9',
};

// undici .get('set-cookie') cookie'leri virgülle birleştirip bozabiliyor;
// getSetCookie() ile her cookie'yi ayrı alıp name=value kısmını topluyoruz.
function collectCookies(res) {
  const list = typeof res.headers.getSetCookie === 'function'
    ? res.headers.getSetCookie()
    : [res.headers.get('set-cookie')].filter(Boolean);
  return list.map((c) => c.split(';')[0]).join('; ');
}

// --- Analist/temel veri için crumb + cookie yönetimi ------------------------
let session = { cookie: '', crumb: '' };

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Geçerli crumb kısa, boşluksuz bir jetondur. "Too Many Requests",
// boş metin veya HTML hata sayfaları geçersizdir.
function isValidCrumb(s) {
  return !!s && s.length > 0 && s.length < 30 && !/\s/.test(s);
}

async function fetchCookie() {
  for (const url of ['https://finance.yahoo.com/', 'https://fc.yahoo.com/']) {
    try {
      const c = await fetch(url, { headers: BROWSER_HEADERS, redirect: 'follow' });
      const cookie = collectCookies(c);
      if (cookie) return cookie;
    } catch { /* sıradaki kaynağı dene */ }
  }
  return '';
}

const CRUMB_HOSTS = [
  'https://query1.finance.yahoo.com/v1/test/getcrumb',
  'https://query2.finance.yahoo.com/v1/test/getcrumb',
];

async function ensureSession(force = false) {
  if (isValidCrumb(session.crumb) && !force) return session;

  // getcrumb datacenter IP'lerinde throttle olabiliyor ("Too Many Requests").
  // Host'ları dönüşümlü deneyip artan beklemeyle birkaç kez tekrar ediyoruz.
  // (Yenileme süresini makul tutmak için sınırlı tutuldu.)
  const backoff = [0, 1500, 4000];
  let cookie = '';
  for (let attempt = 0; attempt < backoff.length; attempt++) {
    if (backoff[attempt]) await sleep(backoff[attempt]);
    cookie = await fetchCookie();
    const host = CRUMB_HOSTS[attempt % CRUMB_HOSTS.length];
    try {
      const cr = await fetch(host, { headers: { ...BROWSER_HEADERS, Cookie: cookie } });
      const crumb = (await cr.text()).trim();
      if (isValidCrumb(crumb)) {
        session = { cookie, crumb };
        return session;
      }
      console.warn(`[data] crumb denemesi ${attempt + 1} geçersiz: "${crumb.slice(0, 24)}"`);
    } catch (e) {
      console.warn(`[data] crumb denemesi ${attempt + 1} hata: ${e.message}`);
    }
  }

  session = { cookie, crumb: '' }; // başarısız — fundamentals atlanacak
  return session;
}

// Canlı ortamda hangi adımda kırıldığını görmek için teşhis.
export async function diagnose(ticker = 'THYAO') {
  const symbol = toSymbol(ticker);
  const steps = {};
  try {
    const { cookie, crumb } = await ensureSession(true);
    steps.cookieVar = cookie ? cookie.slice(0, 60) : '(boş)';
    steps.cookieLen = cookie.length;
    steps.crumb = crumb.slice(0, 40);
    steps.crumbLen = crumb.length;

    const url = `${SUMMARY_URL}/${symbol}?modules=financialData&crumb=${encodeURIComponent(crumb)}`;
    const res = await fetch(url, { headers: { ...BROWSER_HEADERS, Cookie: cookie } });
    steps.summaryStatus = res.status;
    const body = await res.text();
    steps.summaryBodyHead = body.slice(0, 200);
    try {
      const fd = JSON.parse(body)?.quoteSummary?.result?.[0]?.financialData;
      steps.targetMean = fd?.targetMeanPrice?.raw ?? null;
      steps.numAnalysts = fd?.numberOfAnalystOpinions?.raw ?? null;
    } catch { /* JSON değilse yukarıdaki body zaten görünür */ }
  } catch (e) {
    steps.error = e.message;
  }
  return steps;
}

// --- Toplu GÜNCEL (intraday) fiyatlar -- spark ucu (crumb'sız, hızlı) -------
// Sadece anlık fiyat + günlük değişim döner; göstergeler/analist bunun kapsamında
// değildir. Dakikalık yenileme için kullanılır. ~45sn bellek önbelleği.
const SPARK_URL = 'https://query1.finance.yahoo.com/v8/finance/spark';
// Küçük fiyatlarda (kripto) daha çok ondalık koru.
function roundPrice(x) {
  const a = Math.abs(x);
  const d = a >= 1 ? 2 : a >= 0.01 ? 6 : 10;
  const f = 10 ** d;
  return Math.round(x * f) / f;
}
let livePriceCache = { at: 0, data: null };
// Önbellekteki canlı fiyatları BEKLEMEDEN döner (yoksa/çok eskiyse null).
// Grafik ucu bunu kullanır: modal açılışı fiyat çekimini beklemesin.
export function peekLivePrices(maxAgeMs = 60000) {
  return Date.now() - livePriceCache.at < maxAgeMs ? livePriceCache.data : null;
}
// Aynı anda birden çok istek gelirse tek çekim yapılsın diye uçuştaki söz.
let livePriceInflight = null;
const LIVE_TTL_MS = 15000;
// Bayat veri en fazla bu kadar servis edilir; daha eskiyse istek çekimi bekler.
const LIVE_STALE_MS = Number(process.env.LIVE_PRICE_STALE_MS ?? 120000);
// Bir tur, önceki turun bu oranından az fiyat getirdiyse başarısız sayılır ve
// önbellek korunur. Normalde ~621 fiyat döner; tek tük sembol düşmesi olağan,
// yarıya inmesi değil.
const LIVE_MIN_ORAN = Number(process.env.LIVE_PRICE_MIN_RATIO ?? 0.5);

// Önbellek tazeyse onu döner. Bayatsa TAZELEMEYİ ARKA PLANDA başlatır ve elde
// olan veriyi HEMEN döner — istemci Yahoo turunu beklemez (ölçüldü: bekleyen
// istek 3,5 sn, önbellekten gelen 5 ms). Hiç veri yoksa (ilk istek) beklenir.
export async function fetchLivePrices() {
  const yas = Date.now() - livePriceCache.at;
  if (livePriceCache.data && yas < LIVE_TTL_MS) return livePriceCache.data;
  if (!livePriceInflight) {
    livePriceInflight = refreshLivePrices()
      .catch((err) => { console.warn(`[live] Fiyat tazelenemedi: ${err.message}`); return livePriceCache.data; })
      .finally(() => { livePriceInflight = null; });
  }
  if (livePriceCache.data && yas < LIVE_STALE_MS) return livePriceCache.data;
  return livePriceInflight;
}

async function refreshLivePrices() {
  const bySym = new Map(INSTRUMENTS.map((i) => [i.symbol, i.ticker]));
  const symbols = INSTRUMENTS.map((i) => i.symbol);
  const prices = {};
  const CHUNK = 20; // spark en fazla 20 sembol kabul ediyor
  const CONC = 5;   // eşzamanlı istek
  const chunks = [];
  for (let i = 0; i < symbols.length; i += CHUNK) chunks.push(symbols.slice(i, i + CHUNK));

  const doChunk = async (chunk) => {
    try {
      const url = `${SPARK_URL}?symbols=${chunk.map(encodeURIComponent).join(',')}&range=1d&interval=1d`;
      const res = await fetch(url, { headers: { 'User-Agent': UA }, signal: AbortSignal.timeout(12000) });
      if (!res.ok) return;
      const j = await res.json();
      for (const [sym, d] of Object.entries(j || {})) {
        const closes = (d?.close || []).filter((x) => x != null);
        const price = closes[closes.length - 1];
        const prev = d?.chartPreviousClose;
        const ticker = bySym.get(sym);
        if (ticker && price != null) {
          prices[ticker] = {
            price: roundPrice(price),
            changePct: prev ? Math.round(((price - prev) / prev) * 10000) / 100 : null,
            // Fiyatın ait olduğu an — canlı gösterge tazelemesinde yeni seansa
            // geçildi mi anlamak için (liveSignals.js).
            ts: d?.timestamp?.[d.timestamp.length - 1] ?? null,
          };
        }
      }
    } catch { /* bu parçayı atla */ }
  };

  for (let i = 0; i < chunks.length; i += CONC) {
    await Promise.all(chunks.slice(i, i + CONC).map(doChunk));
  }

  // Parça hataları yukarıda yutuluyor (bir parça düşerse tur devam etsin diye).
  // Ama TOPTAN başarısız bir tur da buraya boş `prices` ile geliyordu ve sağlam
  // veriyi eziyordu: ekranda fiyatlar yayınlanan (3 saatlik) değerlerde donuyor,
  // buna karşılık `updatedAt` taze damgalandığı için her şey yolundaymış gibi
  // görünüyordu — sessizce bayat veri. Yahoo'nun veri merkezi IP'lerini throttle
  // ettiği dönemlerde yaşanan tam olarak buydu.
  // Çözüm: eksik turu tur sayma. Eldeki veri ve ESKİ zaman damgası korunur,
  // böylece saat dürüstçe donar ve arayüz "gecikiyor" rozetini gösterebilir.
  const yeniSayi = Object.keys(prices).length;
  const oncekiSayi = Object.keys(livePriceCache.data?.prices ?? {}).length;
  if (oncekiSayi > 0 && yeniSayi < oncekiSayi * LIVE_MIN_ORAN) {
    console.warn(`[live] Fiyat turu eksik geldi (${yeniSayi}/${oncekiSayi}); önbellek korunuyor.`);
    // `at` yine de ilerletilir: bir sonraki denemeye kadar normal aralık (15 sn)
    // beklensin, her istek Yahoo turunu beklemek zorunda kalmasın.
    livePriceCache = { at: Date.now(), data: livePriceCache.data };
    return livePriceCache.data;
  }

  livePriceCache = { at: Date.now(), data: { updatedAt: new Date().toISOString(), prices } };
  return livePriceCache.data;
}

// --- Toplu GÜN İÇİ bar verisi (v7/quote) ------------------------------------
// Süregelen günlük barın HACMİ + gün içi yüksek/düşük/açılışı. 100'er sembol tek
// istekte geldiği için fiyatla aynı sıklıkta (~15 sn) tazelenebilir; tek tek
// chart çekmek 692 istek demek olurdu. crumb gerektirir (analist verisiyle aynı
// oturum); alınamazsa null döner ve çağıran taraf önbellekteki bara düşer.
const QUOTE_URL = 'https://query1.finance.yahoo.com/v7/finance/quote';
let liveBarCache = { at: 0, data: null };
// crumb datacenter IP'lerinde throttle olabiliyor; başarısızlıkta bir süre hiç
// denemeyiz ki /api/prices her seferinde crumb turunu beklemesin.
let liveBarPausedUntil = 0;
const LIVE_BAR_PAUSE_MS = 10 * 60 * 1000;
// Önbellekteki gün içi barları BEKLEMEDEN döner (yoksa/çok eskiyse null).
export function peekLiveBars(maxAgeMs = 5 * 60 * 1000) {
  return Date.now() - liveBarCache.at < maxAgeMs ? liveBarCache.data : null;
}
let liveBarInflight = null;
// Fiyatla aynı mantık: bayat önbellek varken istek bekletilmez, tazeleme arka
// planda döner. Eşzamanlı istekler tek çekimi paylaşır.
export async function fetchLiveBars() {
  const yas = Date.now() - liveBarCache.at;
  if (liveBarCache.data && yas < 15000) return liveBarCache.data;
  if (Date.now() < liveBarPausedUntil) return liveBarCache.data;
  if (!liveBarInflight) {
    liveBarInflight = refreshLiveBars()
      .catch((err) => { console.warn(`[live] Gün içi bar tazelenemedi: ${err.message}`); return liveBarCache.data; })
      .finally(() => { liveBarInflight = null; });
  }
  if (liveBarCache.data && yas < LIVE_STALE_MS) return liveBarCache.data;
  return liveBarInflight;
}

async function refreshLiveBars() {
  const { cookie, crumb } = await ensureSession();
  if (!crumb) {
    liveBarPausedUntil = Date.now() + LIVE_BAR_PAUSE_MS;
    return liveBarCache.data;
  }

  const bySym = new Map(INSTRUMENTS.map((i) => [i.symbol, i.ticker]));
  const symbols = INSTRUMENTS.map((i) => i.symbol);
  const out = {};
  const CHUNK = 100; // v7/quote çok sembol kabul ediyor
  const CONC = 3;
  const chunks = [];
  for (let i = 0; i < symbols.length; i += CHUNK) chunks.push(symbols.slice(i, i + CHUNK));

  let failed = 0;
  const doChunk = async (chunk) => {
    try {
      const url = `${QUOTE_URL}?symbols=${chunk.map(encodeURIComponent).join(',')}&crumb=${encodeURIComponent(crumb)}`;
      const res = await fetch(url, {
        headers: { ...BROWSER_HEADERS, Cookie: cookie },
        signal: AbortSignal.timeout(12000),
      });
      if (!res.ok) { failed++; return; }
      const j = await res.json();
      for (const q of j?.quoteResponse?.result ?? []) {
        const ticker = bySym.get(q.symbol);
        if (!ticker || q.regularMarketVolume == null) continue;
        out[ticker] = {
          open: q.regularMarketOpen ?? null,
          high: q.regularMarketDayHigh ?? null,
          low: q.regularMarketDayLow ?? null,
          volume: q.regularMarketVolume,
          ts: q.regularMarketTime ?? null,
        };
      }
    } catch { failed++; }
  };

  for (let i = 0; i < chunks.length; i += CONC) {
    await Promise.all(chunks.slice(i, i + CONC).map(doChunk));
  }
  if (Object.keys(out).length === 0) {
    if (failed) console.warn(`[data] v7/quote gün içi bar verisi alınamadı (${failed} parça) — ${LIVE_BAR_PAUSE_MS / 60000} dk duraklatılıyor.`);
    liveBarPausedUntil = Date.now() + LIVE_BAR_PAUSE_MS;
    return liveBarCache.data; // eldeki (varsa) veriyi koru
  }
  liveBarCache = { at: Date.now(), data: out };
  return out;
}

// --- TCMB USD/TRY kuru ------------------------------------------------------
// Kıymetli madenlerin (USD/ons) TRY/gram karşılığı için güncel döviz satış kuru.
// TCMB kuru iş günü başına bir kez yayınlanır; canlı fiyat yolu bunu 15-18
// saniyede bir isteyeceği için önbelleklenir.
let usdTryCache = { at: 0, rate: null };
const USD_TRY_TTL_MS = 30 * 60 * 1000;

export async function fetchUsdTryRate() {
  if (usdTryCache.rate != null && Date.now() - usdTryCache.at < USD_TRY_TTL_MS) return usdTryCache.rate;
  try {
    const res = await fetch('https://www.tcmb.gov.tr/kurlar/today.xml', {
      headers: { 'User-Agent': UA },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const xml = await res.text();
    const block = xml.match(/<Currency[^>]*CurrencyCode="USD"[\s\S]*?<\/Currency>/);
    const m = block?.[0].match(/<ForexSelling>([\d.]+)<\/ForexSelling>/);
    const rate = m ? parseFloat(m[1]) : NaN;
    if (!Number.isFinite(rate) || rate <= 0) throw new Error('geçersiz kur');
    usdTryCache = { at: Date.now(), rate };
    return rate;
  } catch (err) {
    console.warn(`[data] TCMB USD/TRY alınamadı: ${err.message}`);
    return usdTryCache.rate; // elde eski kur varsa onunla devam
  }
}

// --- Spot metal fiyatları (api.gold-api.com) --------------------------------
// Yahoo'daki GC=F/SI=F/PL=F/PA=F VADELİ kontratlar; ons fiyatı spottan ~%1,4
// yüksek (contango). Türkiye'deki gram fiyatına yaklaşmak için spot gerekiyor.
// Ücretsiz, anahtarsız, ~200 baytlık JSON döner.
let spotCache = { at: 0, data: {} };
const SPOT_TTL_MS = 60 * 1000;
const SPOT_SYMBOLS = ['XAU', 'XAG', 'XPT', 'XPD'];

export async function fetchSpotMetals() {
  if (Date.now() - spotCache.at < SPOT_TTL_MS && Object.keys(spotCache.data).length) return spotCache.data;
  const out = {};
  await Promise.all(SPOT_SYMBOLS.map(async (s) => {
    try {
      const res = await fetch(`https://api.gold-api.com/price/${s}`, {
        headers: { 'User-Agent': UA }, signal: AbortSignal.timeout(8000),
      });
      if (!res.ok) return;
      const j = await res.json();
      if (Number.isFinite(j?.price) && j.price > 0) out[s] = j.price;
    } catch { /* bu metali atla; zincirde bir alt kaynağa düşer */ }
  }));
  if (Object.keys(out).length) spotCache = { at: Date.now(), data: out };
  return Object.keys(out).length ? out : spotCache.data;
}

const TROY_OUNCE_G = 31.1034768;

// ₺/gram öncelik zinciri. Ölçüldü (Türkiye'de manşet gösterilen gram altın
// fiyatına sapma):
//   1) altin.in SATIŞ — sitelerin "gram altın" diye gösterdiği sayı    %0,00
//   2) spot ons × TCMB kuru                                          −%0,20
//   3) vadeli ons × TCMB kuru (en eski davranış, son çare)           +%1,23
// Serbest piyasa kuru denendi ve daha kötü çıktı; sapmanın neredeyse tamamı
// vadeli-spot farkından geliyor, kurdan değil.
//
// Neden ORTA değil SATIŞ: alış/satış ortası daha "adil" görünüyordu ama
// Türkiye'de gram altın fiyatı diye gösterilen sayı satış tarafı — doviz.com
// 6.206,88 ile altin.in satış 6.206,94 birebir örtüşüyor, orta ise %0,43 altta
// kalıyordu. Alış zaten kendi sütununda duruyor.
export function metalTryPerGram({ altinInEntry, spotUsd, futuresUsd, usdTry }) {
  const r2 = (x) => Math.round(x * 100) / 100;
  if (altinInEntry?.sell != null) {
    return { value: r2(altinInEntry.sell), source: 'altin.in' };
  }
  if (spotUsd != null && usdTry) return { value: r2((spotUsd / TROY_OUNCE_G) * usdTry), source: 'spot' };
  if (futuresUsd != null && usdTry) return { value: r2((futuresUsd / TROY_OUNCE_G) * usdTry), source: 'vadeli' };
  return { value: null, source: null };
}

// --- altin.in alış/satış fiyatları ------------------------------------------
// Sayfa Windows-1254 (Türkçe) kodlu HTML döndürür. Her metal için alış/satış
// değerlerini { "Gram Altın": {buy, sell}, ... } biçiminde döner.
// 112 KB'lık sayfa; canlı fiyat yolu bunu 15-18 saniyede bir isteyeceği için
// önbelleklenir. Çekim başarısız olursa elde eski veri varsa o kullanılır —
// böylece geçici bir hata ₺/gram'ı zincirin alt basamağına düşürmez.
let altinInCache = { at: 0, data: null };
const ALTIN_IN_TTL_MS = 60 * 1000;

export async function fetchAltinInPrices() {
  if (altinInCache.data && Date.now() - altinInCache.at < ALTIN_IN_TTL_MS) return altinInCache.data;
  try {
    const res = await fetch('https://altin.in/', { headers: { 'User-Agent': UA } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const html = new TextDecoder('windows-1254').decode(Buffer.from(await res.arrayBuffer()));
    // <li class='... alis|satis' title='Gram Altın - Alış'>6167.8780</li>
    const re = /class='[^']*(alis|satis)'[^>]*title='([^']*?)'>\s*([\d.,]+)/g;
    const out = {};
    let m;
    while ((m = re.exec(html))) {
      const name = m[2].replace(/\s*-\s*(Al[ıi]ş|Sat[ıi]ş)\s*$/i, '').trim();
      const val = parseFloat(m[3].replace(/,/g, ''));
      if (!Number.isFinite(val)) continue;
      (out[name] ??= {})[m[1] === 'alis' ? 'buy' : 'sell'] = Math.round(val * 100) / 100;
    }
    if (Object.keys(out).length) altinInCache = { at: Date.now(), data: out };
    return out;
  } catch (err) {
    console.warn(`[data] altin.in fiyatları alınamadı: ${err.message}`);
    return altinInCache.data ?? {};
  }
}

// --- Günlük barların normalleştirilmesi -------------------------------------
// Yahoo, İÇİNDE BULUNULAN seansın günlük barını BIST sembollerinde kapanışı
// `null` olarak döndürüyor (O/H/L ve hacim dolu). Bu bar atıldığında grafik ve
// göstergeler bir seans geride kalıyor, tabloda ise canlı fiyat (meta.
// regularMarketPrice) görünüyordu — ör. THYAO 318 iken grafikte 312.
// Çözüm: son bar canlı fiyatın seansına aitse kapanışını canlı fiyata eşitle
// (yoksa tamamla) ve gerekiyorsa yüksek/düşük değerlerini genişlet. Böylece
// tablo, grafik ve göstergeler AYNI son fiyattan hesaplanır.
function normalizeBars(result) {
  const ts = result.timestamp ?? [];
  const q = result.indicators?.quote?.[0] ?? {};
  const meta = result.meta ?? {};
  const live = meta.regularMarketPrice;
  // Borsa saat dilimine göre gün indeksi (son bar ile canlı fiyat aynı seansta mı?)
  const off = meta.gmtoffset ?? 0;
  const day = (t) => Math.floor((t + off) / 86400);
  const liveDay = meta.regularMarketTime != null ? day(meta.regularMarketTime) : null;

  const bars = [];
  for (let i = 0; i < ts.length; i++) {
    let o = q.open?.[i] ?? null, h = q.high?.[i] ?? null, l = q.low?.[i] ?? null;
    let c = q.close?.[i] ?? null;
    const isLast = i === ts.length - 1;
    if (isLast && live != null && liveDay != null && day(ts[i]) === liveDay) {
      c = live;
      o = o ?? live;
      h = h != null ? Math.max(h, live) : live;
      l = l != null ? Math.min(l, live) : live;
    }
    if (o == null || h == null || l == null || c == null) continue;
    bars.push({ ts: ts[i], open: o, high: h, low: l, close: c, volume: q.volume?.[i] ?? 0 });
  }
  return bars;
}

// Normalleştirilmiş barlar + meta — grafiğin, göstergelerin, canlı gösterge
// tazelemesinin (liveSignals.js) ve UYARI taramasının (alerts.js) ORTAK kaynağı.
// interval: '1d' (varsayılan), '1h', '4h' — Yahoo üçünü de yerel destekliyor.
export async function fetchBars(symbol, range = '1y', interval = '1d') {
  const url = `${CHART_URL}/${encodeURIComponent(symbol)}?range=${range}&interval=${interval}`;
  const res = await fetch(url, { headers: { 'User-Agent': UA } });
  if (!res.ok) throw new Error(`Yahoo ${symbol} -> HTTP ${res.status}`);
  const json = await res.json();
  const r = json?.chart?.result?.[0];
  if (!r) throw new Error(`Yahoo ${symbol} -> boş sonuç`);
  return { bars: normalizeBars(r), meta: r.meta ?? {} };
}

// --- Grafik için tam OHLC serisi (mum grafiği) ------------------------------
// Frontend'de Lightweight Charts ile çizmek üzere günlük mum verisini döner.
export async function fetchOhlc(symbol, range = '1y') {
  const { bars, meta } = await fetchBars(symbol, range);
  // Lightweight Charts günlük seri için 'yyyy-mm-dd' bekliyor; gün etiketi borsa
  // saatine göre hesaplanır (UTC'ye göre bir gün kaymasın).
  const off = meta.gmtoffset ?? 0;
  const candles = bars.map((b) => ({
    time: new Date((b.ts + off) * 1000).toISOString().slice(0, 10),
    open: b.open, high: b.high, low: b.low, close: b.close, volume: b.volume,
  }));
  // gmtoffset: çağıran taraf son mumun hangi seansa ait olduğunu doğrulayabilsin
  // diye (bkz. /api/chart — son mumu canlı fiyatla eşitleme).
  return { symbol, currency: meta.currency ?? null, gmtoffset: off, candles };
}

// --- Fiyat + geçmiş (chart) -------------------------------------------------
async function fetchChart(symbol) {
  // 1 yıllık günlük veri — grafik modalı (/api/chart) da 1y kullanıyor; sinyaller
  // grafiktekiyle BİREBİR aynı veri+aralıktan hesaplansın diye eşitlendi (özellikle
  // durumlu SuperTrend için). symbol tam Yahoo sembolüdür; '=' için URL-kodlanır.
  // Grafikle BİREBİR aynı barlar (son/canlı bar dahil) — fetchBars.
  const { bars, meta } = await fetchBars(symbol, '1y');
  const highs = bars.map((b) => b.high);
  const lows = bars.map((b) => b.low);
  const closes = bars.map((b) => b.close);
  // Mum rengi (açılış-kapanış) ve hacim taraması için — grafikteki mumların aynısı.
  const opens = bars.map((b) => b.open);
  const volumes = bars.map((b) => b.volume);
  if (closes.length === 0 || meta?.regularMarketPrice == null) {
    throw new Error(`Yahoo ${symbol} -> fiyat verisi yok`);
  }

  const n = closes.length;
  // Günlük değişim için ÖNCEKİ SEANS kapanışı = serideki sondan bir önceki kapanış.
  const previousClose = n >= 2
    ? closes[n - 2]
    : (meta.regularMarketPreviousClose ?? meta.chartPreviousClose ?? closes[0]);
  // 1 aylık momentum için ~21 işlem günü önceki kapanış (6 aylık aralıkta bile
  // "1 ay" anlamını korur).
  const monthAgoClose = closes[Math.max(0, n - 1 - 21)];

  return {
    symbol,
    price: meta.regularMarketPrice,
    previousClose,
    // Para birimi enstrümana göre çağıran tarafça (fetchQuotes) atanır — Yahoo'nun
    // meta.currency'sine güvenmiyoruz (BIST'te bazen hatalı GBp/GBP dönebiliyor).
    fiftyTwoWeekHigh: meta.fiftyTwoWeekHigh ?? Math.max(...closes),
    fiftyTwoWeekLow: meta.fiftyTwoWeekLow ?? Math.min(...closes),
    firstClose: monthAgoClose,
    highs, lows, closes, opens, volumes,
    // Haftalık toplama gerçek takvim haftasına göre yapılıyor (indicators.js).
    times: bars.map((b) => b.ts),
    gmtoffset: meta.gmtoffset ?? 0,
  };
}

// --- Analist hedefleri + temel veriler (quoteSummary) -----------------------
// Datacenter IP'lerinde quoteSummary istek bazında da throttle olabiliyor.
// Başarısızlıkta backoff'la tekrar; 401/403'te oturumu (crumb) tazele.
async function fetchFundamentals(symbol, attempt = 0) {
  const { cookie, crumb } = await ensureSession();
  if (!crumb) return null; // oturum kurulamadı; fundamentals'ı sessizce atla
  const modules = 'financialData,defaultKeyStatistics';
  const url = `${SUMMARY_URL}/${encodeURIComponent(symbol)}?modules=${modules}&crumb=${encodeURIComponent(crumb)}`;

  let res;
  try {
    res = await fetch(url, { headers: { ...BROWSER_HEADERS, Cookie: cookie } });
  } catch (e) {
    if (attempt < 3) { await sleep(700 * (attempt + 1)); return fetchFundamentals(symbol, attempt + 1); }
    return null;
  }

  if (!res.ok) {
    if (attempt < 1) { // en fazla 1 tekrar — yenilemeyi hızlı tutmak için
      if (res.status === 401 || res.status === 403) await ensureSession(true); // crumb tazele
      else await sleep(600 + Math.random() * 400); // 429/5xx: kısa bekle
      return fetchFundamentals(symbol, attempt + 1);
    }
    return null; // sessizce atla
  }

  const json = await res.json();
  const r = json?.quoteSummary?.result?.[0];
  const fd = r?.financialData ?? {};
  const ks = r?.defaultKeyStatistics ?? {};

  return {
    targetMean: fd.targetMeanPrice?.raw ?? null,
    targetHigh: fd.targetHighPrice?.raw ?? null,
    targetLow: fd.targetLowPrice?.raw ?? null,
    recommendationKey: fd.recommendationKey ?? null, // strong_buy/buy/hold/...
    recommendationMean: fd.recommendationMean?.raw ?? null,
    numAnalysts: fd.numberOfAnalystOpinions?.raw ?? null,
    revenueGrowth: fd.revenueGrowth?.raw ?? null,
    earningsGrowth: fd.earningsGrowth?.raw ?? null,
    forwardPE: ks.forwardPE?.raw ?? null,
    trailingPE: r?.trailingPE?.raw ?? null,
    priceToBook: ks.priceToBook?.raw ?? null,
  };
}

// Tüm enstrümanları sırayla (nazikçe) çeker; başarısız olanları atlar.
// instruments: { ticker, symbol, currency, kind } nesneleri.
export async function fetchQuotes(instruments) {
  const out = [];
  for (const inst of instruments) {
    try {
      const chart = await fetchChart(inst.symbol);
      let fundamentals = null;
      // Analist/temel veriyi tüm BIST hisselerinde çek; yalnızca kıymetli madenlerde atla.
      if (inst.kind === 'stock') {
        try {
          fundamentals = await fetchFundamentals(inst.symbol);
        } catch (e) {
          console.warn(`[data] ${inst.ticker} temel veri alınamadı: ${e.message}`);
        }
      }
      out.push({ ticker: inst.ticker, ...chart, currency: inst.currency, fundamentals });
    } catch (err) {
      console.warn(`[data] ${inst.ticker} atlandı: ${err.message}`);
    }
    await sleep(350); // rate-limit'e takılmamak için enstrümanlar arası bekleme
  }
  return out;
}
