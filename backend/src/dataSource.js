import { toSymbol } from './stocks.js';

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

// --- TCMB USD/TRY kuru ------------------------------------------------------
// Kıymetli madenlerin (USD/ons) TRY/gram karşılığı için güncel döviz satış kuru.
export async function fetchUsdTryRate() {
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
    return rate;
  } catch (err) {
    console.warn(`[data] TCMB USD/TRY alınamadı: ${err.message}`);
    return null;
  }
}

// --- altin.in alış/satış fiyatları ------------------------------------------
// Sayfa Windows-1254 (Türkçe) kodlu HTML döndürür. Her metal için alış/satış
// değerlerini { "Gram Altın": {buy, sell}, ... } biçiminde döner.
export async function fetchAltinInPrices() {
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
    return out;
  } catch (err) {
    console.warn(`[data] altin.in fiyatları alınamadı: ${err.message}`);
    return {};
  }
}

// --- Fiyat + geçmiş (chart) -------------------------------------------------
async function fetchChart(symbol) {
  // 6 aylık günlük veri: hem 1 aylık momentum hem de teknik göstergeler
  // (WaveTrend, Supertrend) için yeterli bar sağlar. symbol tam Yahoo sembolüdür
  // (ör. THYAO.IS veya GC=F) — '=' gibi karakterler için URL-kodlanır.
  const url = `${CHART_URL}/${encodeURIComponent(symbol)}?range=6mo&interval=1d`;
  const res = await fetch(url, { headers: { 'User-Agent': UA } });
  if (!res.ok) throw new Error(`Yahoo ${symbol} -> HTTP ${res.status}`);
  const json = await res.json();
  const result = json?.chart?.result?.[0];
  if (!result) throw new Error(`Yahoo ${symbol} -> boş sonuç`);

  const meta = result.meta;
  const q = result.indicators?.quote?.[0] ?? {};
  const rawC = q.close ?? [], rawH = q.high ?? [], rawL = q.low ?? [];
  // OHLC'yi hizalı tut: yalnızca kapanış/yüksek/düşük değerlerinin üçü de dolu
  // olan barları al (göstergeler eşit uzunlukta diziler bekliyor).
  const highs = [], lows = [], closes = [];
  for (let i = 0; i < rawC.length; i++) {
    if (rawC[i] == null || rawH[i] == null || rawL[i] == null) continue;
    closes.push(rawC[i]); highs.push(rawH[i]); lows.push(rawL[i]);
  }
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
    highs, lows, closes,
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
      // Analist/temel veriyi yalnızca endeks hisselerinde (BIST 30/50/100) çek;
      // geniş evren (bist=null) ve kıymetli madenlerde atla — yenilemeyi hızlı tutmak için.
      if (inst.kind === 'stock' && inst.bist != null) {
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
