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

async function ensureSession(force = false) {
  if (session.crumb && !force) return session;

  // 1) Cookie: önce ana sayfa, olmazsa fc.yahoo.com
  let cookie = '';
  for (const url of ['https://finance.yahoo.com/', 'https://fc.yahoo.com/']) {
    try {
      const c = await fetch(url, { headers: BROWSER_HEADERS, redirect: 'follow' });
      cookie = collectCookies(c);
      if (cookie) break;
    } catch { /* sıradaki kaynağı dene */ }
  }

  // 2) Crumb
  const cr = await fetch('https://query2.finance.yahoo.com/v1/test/getcrumb', {
    headers: { ...BROWSER_HEADERS, Cookie: cookie },
  });
  const crumb = (await cr.text()).trim();

  session = { cookie, crumb };
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

  return {
    symbol,
    price: meta.regularMarketPrice,
    previousClose: meta.chartPreviousClose ?? meta.previousClose ?? closes[0],
    currency: meta.currency ?? 'TRY',
    fiftyTwoWeekHigh: meta.fiftyTwoWeekHigh ?? Math.max(...closes),
    fiftyTwoWeekLow: meta.fiftyTwoWeekLow ?? Math.min(...closes),
    firstClose: closes[0],
    closes,
  };
}

// --- Analist hedefleri + temel veriler (quoteSummary) -----------------------
async function fetchFundamentals(ticker, retry = true) {
  const symbol = toSymbol(ticker);
  const { cookie, crumb } = await ensureSession();
  const modules = 'financialData,defaultKeyStatistics';
  const url = `${SUMMARY_URL}/${symbol}?modules=${modules}&crumb=${encodeURIComponent(crumb)}`;
  const res = await fetch(url, { headers: { ...BROWSER_HEADERS, Cookie: cookie } });

  if ((res.status === 401 || res.status === 403) && retry) {
    await ensureSession(true); // crumb/cookie süresi dolmuş olabilir, tazele
    return fetchFundamentals(ticker, false);
  }
  if (!res.ok) {
    if (retry) console.warn(`[data] ${symbol} fundamentals HTTP ${res.status}`);
    return null; // temel veri zorunlu değil; yoksa null döneriz
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
    await new Promise((r) => setTimeout(r, 150)); // rate-limit'e takılmamak için
  }
  return out;
}
