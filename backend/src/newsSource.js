// Haber ve KAP kaynakları. RSS akışları (Investing, BloombergHT) ile KAP bildirimleri.
// Bellek içi kısa önbellek ile kaynakları yormadan servis eder.

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

// Analist/hedef fiyat haberlerini yakala.
const ANALYST_RE = /(hedef fiyat|fiyat hedef|tavsiye|"?al"? önerisi|yükseltti|düşürdü|not(unu)? (yükseltti|düşürdü)|araştırma|öneri|potansiyel getiri)/i;

const FEEDS = [
  { url: 'https://tr.investing.com/rss/news_25.rss', source: 'Investing', category: 'Hisse' },
  { url: 'https://tr.investing.com/rss/news_11.rss', source: 'Investing', category: 'Kıymetli Maden' },
  { url: 'https://tr.investing.com/rss/news_14.rss', source: 'Investing', category: 'Ekonomi' },
  { url: 'https://www.bloomberght.com/rss', source: 'BloombergHT', category: 'Ekonomi' },
];

async function fetchText(url, ms = 15000) {
  const res = await fetch(url, { headers: { 'User-Agent': UA }, signal: AbortSignal.timeout(ms) });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.text();
}

let newsCache = { at: 0, items: [] };
export async function fetchNews() {
  if (Date.now() - newsCache.at < 10 * 60 * 1000 && newsCache.items.length) return newsCache.items;
  const results = await Promise.allSettled(FEEDS.map((f) => fetchText(f.url).then((xml) => parseRss(xml, f.source, f.category))));
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

// --- KAP bildirimleri --------------------------------------------------------
// Bildirim kategorisini yatırımcı diline çevirir.
function kapSummary(title = '', category = '') {
  const t = `${category} ${title}`.toLowerCase();
  if (/finansal rapor|bilanço|faaliyet raporu/.test(t)) return 'Şirket dönemsel finansal sonuçlarını açıkladı.';
  if (/kar payı|temettü/.test(t)) return 'Kâr payı (temettü) dağıtımına ilişkin bildirim.';
  if (/sermaye artırım|bedelli|bedelsiz/.test(t)) return 'Sermaye artırımı / pay dağıtımına ilişkin bildirim.';
  if (/pay geri alım|geri alım/.test(t)) return 'Şirket kendi paylarını geri alımına ilişkin bildirim.';
  if (/pay alım|pay satım|ortaklık yapı/.test(t)) return 'Ortaklık/pay alım-satımına ilişkin bildirim.';
  if (/ihale|sözleşme|yatırım|anlaşma|sipariş/.test(t)) return 'Yeni iş/sözleşme veya yatırım açıklaması.';
  if (/genel kurul/.test(t)) return 'Genel kurul toplantısına ilişkin bildirim.';
  return 'Şirketten özel durum açıklaması.';
}

let kapCache = { at: 0, items: [], ok: false };
export async function fetchKap() {
  if (Date.now() - kapCache.at < 10 * 60 * 1000 && kapCache.items.length) return kapCache;
  try {
    const today = new Date();
    const from = new Date(today.getTime() - 3 * 864e5);
    const fmt = (d) => d.toISOString().slice(0, 10);
    const res = await fetch('https://www.kap.org.tr/tr/api/memberDisclosureQuery', {
      method: 'POST',
      headers: { 'User-Agent': UA, 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        fromDate: fmt(from), toDate: fmt(today), year: '', prd: '', term: '', ruleType: '',
        bdkReview: '', disclosureClass: '', index: '', market: '', isLate: '', subjectList: [],
        mkkMemberOidList: [], inactiveMkkMemberOidList: [], bdkMemberOidList: [], mainSector: '',
        sector: '', subSector: '', memberType: 'IGS', fromSrc: 'N', srcCategory: '', discloseIndex: '',
      }),
      signal: AbortSignal.timeout(25000),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const arr = Array.isArray(data) ? data : (data.disclosures || data.result || []);
    const items = arr.slice(0, 60).map((d) => {
      const b = d.basic || d;
      const company = b.companyName || b.stockCodes || d.companyName || '';
      const ticker = (b.stockCodes || d.stockCodes || '').split(',')[0]?.trim() || '';
      const title = b.title || d.title || b.kapTitle || d.disclosureCategory || '';
      const category = b.disclosureCategory || d.disclosureCategory || '';
      const oid = d.disclosureIndex || b.disclosureIndex || d.publishDate || '';
      return {
        company, ticker, title, category,
        summary: kapSummary(title, category),
        time: b.publishDate || d.publishDate || '',
        ts: Date.parse(b.publishDate || d.publishDate || '') || 0,
        link: oid ? `https://www.kap.org.tr/tr/Bildirim/${oid}` : 'https://www.kap.org.tr/tr/',
      };
    });
    items.sort((a, b) => b.ts - a.ts);
    kapCache = { at: Date.now(), items, ok: true };
  } catch (err) {
    console.warn(`[news] KAP alınamadı: ${err.message}`);
    kapCache = { at: Date.now(), items: [], ok: false, error: err.message };
  }
  return kapCache;
}
