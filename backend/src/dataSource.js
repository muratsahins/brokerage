import { toSymbol } from './stocks.js';

// Yahoo Finance chart endpoint'i BIST hisseleri için ".IS" ekiyle çalışır
// ve crumb/cookie gerektirmez. 1 aylık günlük veriyi çekiyoruz.
const CHART_URL = 'https://query1.finance.yahoo.com/v8/finance/chart';
const SUMMARY_URL = 'https://query2.finance.yahoo.com/v10/finance/quoteSummary';
const UA = 'Mozilla/5.0 (brokerage-app)';

// --- Analist/temel veri için crumb + cookie yönetimi ------------------------
let session = { cookie: '', crumb: '' };

async function ensureSession(force = false) {
  if (session.crumb && !force) return session;
  const c = await fetch('https://fc.yahoo.com', { headers: { 'User-Agent': UA } });
  const cookie = (c.headers.get('set-cookie') || '').split(';')[0];
  const cr = await fetch('https://query2.finance.yahoo.com/v1/test/getcrumb', {
    headers: { 'User-Agent': UA, Cookie: cookie },
  });
  const crumb = await cr.text();
  session = { cookie, crumb };
  return session;
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
  const res = await fetch(url, { headers: { 'User-Agent': UA, Cookie: cookie } });

  if (res.status === 401 && retry) {
    await ensureSession(true); // crumb süresi dolmuş olabilir, tazele
    return fetchFundamentals(ticker, false);
  }
  if (!res.ok) return null; // temel veri zorunlu değil; yoksa null döneriz

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
