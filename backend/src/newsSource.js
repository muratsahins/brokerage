// Haber ve KAP kaynakları. RSS akışları (Investing, BloombergHT) ile KAP bildirimleri.
// Bellek içi kısa önbellek ile kaynakları yormadan servis eder.
import { INSTRUMENTS } from './stocks.js';

const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
  '(KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36';

function decodeEntities(s) {
  return (s || '')
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(+n))
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function parseRss(xml, source, category) {
  const out = [];
  const re = /<item[\s\S]*?<\/item>/gi;
  const blocks = xml.match(re) || [];
  for (const block of blocks) {
    const pick = (tag) => {
      const r = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, 'i').exec(block);
      return r ? decodeEntities(r[1]) : '';
    };
    const title = pick('title');
    if (!title) continue;
    out.push({
      title,
      link: pick('link'),
      summary: pick('description').slice(0, 280),
      pubDate: pick('pubDate'),
      ts: Date.parse(pick('pubDate')) || 0,
      source,
      category,
    });
  }
  return out;
}

// Google News RSS parser (başlık "Başlık - Kaynak" biçiminde; <source> etiketi var).
function parseGoogleNews(xml, category) {
  const out = [];
  const blocks = xml.match(/<item[\s\S]*?<\/item>/gi) || [];
  for (const block of blocks) {
    const pick = (tag) => {
      const r = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, 'i').exec(block);
      return r ? decodeEntities(r[1]) : '';
    };
    let title = pick('title');
    if (!title) continue;
    const src = pick('source');
    if (src && title.endsWith(` - ${src}`)) title = title.slice(0, -(src.length + 3)).trim();
    out.push({
      title, link: pick('link'), summary: '',
      pubDate: pick('pubDate'), ts: Date.parse(pick('pubDate')) || 0,
      source: src || 'Google Haberler', category,
    });
  }
  return out;
}

const gnews = (q) => `https://news.google.com/rss/search?q=${encodeURIComponent(q)}&hl=tr-TR&gl=TR&ceid=TR:tr`;

// Analist/hedef fiyat haberlerini yakala.
const ANALYST_RE = /(hedef fiyat|fiyat hedef|tavsiye|"?al"? önerisi|yükseltti|düşürdü|not(unu)? (yükseltti|düşürdü)|araştırma|öneri|potansiyel getiri)/i;

const FEEDS = [
  { url: 'https://tr.investing.com/rss/news_25.rss', source: 'Investing', category: 'Hisse' },
  { url: 'https://tr.investing.com/rss/news_11.rss', source: 'Investing', category: 'Kıymetli Maden' },
  { url: 'https://tr.investing.com/rss/news_14.rss', source: 'Investing', category: 'Ekonomi' },
  { url: 'https://www.bloomberght.com/rss', source: 'BloombergHT', category: 'Ekonomi' },
  // BIST şirket ve kıymetli maden haberleri için Google News (Türkçe kaynaklar).
  { url: gnews('BIST hisse şirket haber when:2d'), category: 'Hisse', google: true },
  { url: gnews('(gram altın OR ons altın OR gümüş OR platin) fiyat when:2d'), category: 'Kıymetli Maden', google: true },
  { url: gnews('(hedef fiyat OR "AL önerisi" OR tavsiye) hisse aracı kurum when:3d'), category: 'Öneri', google: true },
];

async function fetchText(url, ms = 15000) {
  const res = await fetch(url, { headers: { 'User-Agent': UA }, signal: AbortSignal.timeout(ms) });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.text();
}

let newsCache = { at: 0, items: [] };
export async function fetchNews() {
  if (Date.now() - newsCache.at < 10 * 60 * 1000 && newsCache.items.length) return newsCache.items;
  const results = await Promise.allSettled(FEEDS.map((f) => fetchText(f.url).then((xml) => (f.google ? parseGoogleNews(xml, f.category) : parseRss(xml, f.source, f.category)))));
  let items = results.flatMap((r) => (r.status === 'fulfilled' ? r.value : []));
  // Analist haberlerini "Öneri" kategorisine taşı.
  for (const it of items) {
    if (ANALYST_RE.test(it.title) || ANALYST_RE.test(it.summary)) it.category = 'Öneri';
  }
  // Başlığa göre tekilleştir, tarihe göre sırala.
  const seen = new Set();
  items = items.filter((it) => { const k = it.title.toLowerCase(); if (seen.has(k)) return false; seen.add(k); return true; });
  items.sort((a, b) => b.ts - a.ts);
  items = items.slice(0, 80);
  if (items.length) newsCache = { at: Date.now(), items };
  return items;
}

// --- KAP bildirimleri (KULLANILMIYOR) ---------------------------------------
// KAP sekmesi kaldırıldı, yerini UYARI (yeni sinyal taraması) aldı; /api/kap ucu
// da yok. Fonksiyon geri açmak istenirse dursun diye bırakıldı.
// kap.org.tr datacenter IP'lerini bloklıyor; KAP odaklı haberleri Google News
// üzerinden (her yerden erişilebilir) çekip yatırımcı diline sınıflandırıyoruz.
function kapClassify(text) {
  const t = (text || '').toLowerCase();
  if (/finansal|bilanço|net kâr|net kar|faaliyet raporu|çeyrek|dönem kâr|zarar açıkla/.test(t))
    return { label: 'Finansal Sonuç', summary: 'Şirket dönemsel finansal sonuçlarını açıkladı.' };
  if (/temett|kar payı|kâr payı/.test(t))
    return { label: 'Temettü', summary: 'Kâr payı (temettü) dağıtımına ilişkin gelişme.' };
  if (/sermaye art|bedelli|bedelsiz/.test(t))
    return { label: 'Sermaye Artırımı', summary: 'Sermaye artırımı / pay dağıtımına ilişkin gelişme.' };
  if (/geri alım/.test(t))
    return { label: 'Pay Geri Alım', summary: 'Şirketin kendi paylarını geri alımına ilişkin gelişme.' };
  if (/genel kurul/.test(t))
    return { label: 'Genel Kurul', summary: 'Genel kurul toplantısına ilişkin gelişme.' };
  if (/ihale|sözleşme|sipariş|anlaşma|yeni iş|proje|satın al|devral|birleşme|iş birliği|imzala/.test(t))
    return { label: 'İş / Yatırım', summary: 'Yeni iş, sözleşme veya yatırım gelişmesi.' };
  if (/halka arz/.test(t))
    return { label: 'Halka Arz', summary: 'Halka arza ilişkin gelişme.' };
  if (/pay|ortaklık|hisse devri|iştirak/.test(t))
    return { label: 'Ortaklık / Pay', summary: 'Ortaklık yapısı / pay hareketine ilişkin gelişme.' };
  return { label: 'Bildirim', summary: 'Şirkete ilişkin önemli gelişme / KAP bildirimi.' };
}

// --- Başlıktan ilgili BIST hisse kodunu tespit --------------------------------
function normTr(s) {
  return (s || '')
    .replace(/[İIı]/g, 'i').replace(/[Şş]/g, 's').replace(/[Ğğ]/g, 'g')
    .replace(/[Üü]/g, 'u').replace(/[Öö]/g, 'o').replace(/[Çç]/g, 'c').toLowerCase();
}
const STOCK_INSTR = INSTRUMENTS.filter((i) => i.kind === 'stock');
// Ticker kodu (büyük harf) başlıkta aynen geçiyorsa yakala.
const TICKER_RE = new RegExp(`(?<![A-Z0-9])(${STOCK_INSTR.map((i) => i.ticker).join('|')})(?![A-Z0-9])`);
// Şirket adı eşleşmesi (Türkçe duyarsız); uzun adlar önce (daha spesifik).
const NAME_INDEX = STOCK_INSTR
  .map((i) => [normTr(i.name), i.ticker])
  .filter(([n]) => n.length >= 6)
  .sort((a, b) => b[0].length - a[0].length);

function detectTicker(title) {
  const m = TICKER_RE.exec(title || '');
  if (m) return m[1];
  const nt = normTr(title);
  for (const [name, ticker] of NAME_INDEX) {
    if (nt.includes(name)) return ticker;
  }
  return null;
}

const KAP_QUERIES = [
  'KAP bildirim hisse when:2d',
  '(bedelsiz OR bedelli OR "sermaye artırımı" OR temettü OR "kar payı") borsa şirket when:3d',
  '(bilanço OR "finansal sonuç" OR "net kâr") BIST şirket when:3d',
  '(ihale OR sözleşme OR "satın alma" OR yatırım OR "geri alım") halka açık şirket when:3d',
];

let kapCache = { at: 0, items: [], ok: false };
export async function fetchKap() {
  if (Date.now() - kapCache.at < 10 * 60 * 1000 && kapCache.items.length) return kapCache;
  try {
    const results = await Promise.allSettled(KAP_QUERIES.map((q) => fetchText(gnews(q)).then((xml) => parseGoogleNews(xml))));
    let items = results.flatMap((r) => (r.status === 'fulfilled' ? r.value : []));
    // "Google Haberler" gibi başlıksız/menü ögelerini ve tekrarları ayıkla.
    const seen = new Set();
    items = items.filter((it) => {
      if (!it.title || it.title.length < 12 || /^google haberler/i.test(it.title)) return false;
      const k = it.title.toLowerCase();
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    }).map((it) => {
      const c = kapClassify(it.title);
      return { ticker: detectTicker(it.title), title: it.title, category: c.label, summary: c.summary, source: it.source, time: it.pubDate, ts: it.ts, link: it.link };
    });
    items.sort((a, b) => b.ts - a.ts);
    items = items.slice(0, 60);
    kapCache = { at: Date.now(), items, ok: true };
  } catch (err) {
    console.warn(`[news] KAP alınamadı: ${err.message}`);
    kapCache = { at: Date.now(), items: [], ok: false, error: err.message };
  }
  return kapCache;
}
