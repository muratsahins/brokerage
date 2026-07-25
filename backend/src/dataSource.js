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

// --- Fiyat + geçmiş (chart) -------------------------------------------------
async function fetchChart(ticker) {
  const symbol = toSymbol(ticker);
  const url = `${CHART_URL}/${symbol}?range=1mo&interval=1d`;
  const res = await fetch(url, { headers: { 'User-Agent': UA } });
  if (!res.ok) throw new Error(`Yahoo ${symbol} -> HTTP ${res.status}`);
  const json = await res.json();
  const result = json?.chart?.result?.[0];
  if (!result) throw new Error(`Yahoo ${symbol} -> boş sonuç`);

  const meta = result.meta;
  const closes = (result.indicators?.quote?.[0]?.close ?? []).filter((v) => v != null);
  if (closes.length === 0 || meta?.regularMarketPrice == null) {
    throw new Error(`Yahoo ${symbol} -> fiyat verisi yok`);
  }

  // Günlük değişim için ÖNCEKİ SEANS kapanışı gerekir = günlük serideki sondan
  // bir önceki kapanış. (meta.chartPreviousClose, 1 aylık aralıkta ~1 ay önceki
  // kapanışı verdiği için günlük değişimi yanlışlıkla aylık değişime eşitliyordu.)
  const previousClose = closes.length >= 2
    ? closes[closes.length - 2]
    : (meta.regularMarketPreviousClose ?? meta.chartPreviousClose ?? closes[0]);

  return {
    symbol,
    price: meta.regularMarketPrice,
    previousClose,
    currency: meta.currency ?? 'TRY',
    fiftyTwoWeekHigh: meta.fiftyTwoWeekHigh ?? Math.max(...closes),
    fiftyTwoWeekLow: meta.fiftyTwoWeekLow ?? Math.min(...closes),
    firstClose: closes[0],
    closes,
  };
}

// --- Analist hedefleri + temel veriler (quoteSummary) -----------------------
// Datacenter IP'lerinde quoteSummary istek bazında da throttle olabiliyor.
// Başarısızlıkta backoff'la tekrar; 401/403'te oturumu (crumb) tazele.
async function fetchFundamentals(ticker, attempt = 0) {
  const symbol = toSymbol(ticker);
  const { cookie, crumb } = await ensureSession();
  if (!crumb) return null; // oturum kurulamadı; fundamentals'ı sessizce atla
  const modules = 'financialData,defaultKeyStatistics';
  const url = `${SUMMARY_URL}/${symbol}?modules=${modules}&crumb=${encodeURIComponent(crumb)}`;

  let res;
  try {
    res = await fetch(url, { headers: { ...BROWSER_HEADERS, Cookie: cookie } });
  } catch (e) {
    if (attempt < 3) { await sleep(700 * (attempt + 1)); return fetchFundamentals(ticker, attempt + 1); }
    return null;
  }

  if (!res.ok) {
    if (attempt < 1) { // en fazla 1 tekrar — yenilemeyi hızlı tutmak için
      if (res.status === 401 || res.status === 403) await ensureSession(true); // crumb tazele
      else await sleep(600 + Math.random() * 400); // 429/5xx: kısa bekle
      return fetchFundamentals(ticker, attempt + 1);
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

// Tüm hisseleri sırayla (nazikçe) çeker; başarısız olanları atlar.
export async function fetchQuotes(tickers) {
  const out = [];
  for (const ticker of tickers) {
    try {
      const chart = await fetchChart(ticker);
      let fundamentals = null;
      try {
        fundamentals = await fetchFundamentals(ticker);
      } catch (e) {
        console.warn(`[data] ${ticker} temel veri alınamadı: ${e.message}`);
      }
      out.push({ ticker, ...chart, fundamentals });
    } catch (err) {
      console.warn(`[data] ${ticker} atlandı: ${err.message}`);
    }
    await sleep(500); // rate-limit'e takılmamak için hisseler arası bekleme
  }
  return out;
}
