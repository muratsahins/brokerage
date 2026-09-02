// Sohbet asistanı: "kıdemli finansal analist" kimliğiyle, YALNIZCA bu sitenin
// takip ettiği enstrümanlar (BIST 100, kıymetli maden, ABD büyük şirketleri)
// hakkında soru cevaplar. Claude'a serbestçe rakam uydurtmamak için, kullanıcı
// mesajında geçen ticker/isim eşleşmeleri bu dosyada ÇÖZÜLÜP sitenin kendi
// canlı verisi (fiyat, teknik sinyaller, analist hedefi, ABD'de nitel rapor)
// JSON olarak sistem promptuna eklenir — model yalnızca bu veriye dayanır.
//
// Model tercihi: varsayılan claude-opus-5 (CHAT_MODEL ile değiştirilebilir).
// Ücretsiz/az trafikli bir yan proje olduğu için maliyeti sınırlamak istenirse
// CHAT_MODEL=claude-sonnet-5 yapılabilir — kod tarafında değişiklik gerekmez.
import Anthropic from '@anthropic-ai/sdk';
import { INSTRUMENTS } from './stocks.js';
import { US_STOCKS } from './usStocks.js';
import { getRecommendations, getUsRecommendations } from './service.js';
import { getLivePrices, getUsLivePrices } from './liveSignals.js';
import { fetchNews } from './newsSource.js';

const client = new Anthropic(); // ANTHROPIC_API_KEY ortam değişkeninden okunur
const MODEL = process.env.CHAT_MODEL || 'claude-opus-5';

const MAX_HISTORY = 12;      // sohbette geriye dönük tutulan mesaj sayısı
const MAX_MSG_LEN = 800;     // tek mesaj için karakter sınırı
const MAX_MATCHES = 6;       // bir istekte veri eklenecek enstrüman sayısı üst sınırı

// --- Türkçe karakter duyarsız normalleştirme (frontend/src/lib/common.js'teki
// norm() ile aynı mantık; backend ayrı paket olduğu için burada tekrarlanıyor).
function norm(s) {
  return (s || '')
    .replace(/[İIı]/g, 'i').replace(/[Şş]/g, 's').replace(/[Ğğ]/g, 'g')
    .replace(/[Üü]/g, 'u').replace(/[Öö]/g, 'o').replace(/[Çç]/g, 'c')
    .toLowerCase();
}

// Eşleştirme kataloğu: ticker + isim + tür (BIST hisse/maden + ABD hissesi).
const CATALOG = [
  ...INSTRUMENTS.map((i) => ({ ticker: i.ticker, name: i.name, kind: i.kind })),
  ...US_STOCKS.map((u) => ({ ticker: u.ticker, name: u.name, kind: 'us-stock' })),
];

// Çok sık kullanılan kısaltma/argo isimler — tam unvan eşleşmesi yakalamayan
// yaygın kullanıcı yazımları için küçük bir takma ad tablosu. Kapsamı büyütmek
// isterseniz buraya ekleyin (normalize edilmiş anahtar -> ticker).
const ALIASES = {
  thy: 'THYAO',
  isbank: 'ISCTR', 'is bankasi': 'ISCTR',
  koc: 'KCHOL',
  sabanci: 'SAHOL',
  yapikredi: 'YKBNK',
  altin: 'XAU', gumus: 'XAG', platin: 'XPT', paladyum: 'XPD',
};

// Kullanıcı metninde geçen ticker/isim/takma adları kataloğa çözer.
function matchInstruments(text) {
  const upper = ` ${(text || '').toLocaleUpperCase('tr-TR')} `;
  const n = norm(text);
  const hits = new Map();

  for (const [alias, ticker] of Object.entries(ALIASES)) {
    if (n.includes(alias)) {
      const c = CATALOG.find((c) => c.ticker === ticker);
      if (c) hits.set(c.ticker, c);
    }
  }
  for (const c of CATALOG) {
    if (hits.has(c.ticker)) continue;
    const re = new RegExp(`[^A-ZÇĞİÖŞÜ0-9]${c.ticker}[^A-ZÇĞİÖŞÜ0-9]`);
    if (re.test(upper)) { hits.set(c.ticker, c); continue; }
    const nn = norm(c.name);
    if (nn.length >= 5 && n.includes(nn)) hits.set(c.ticker, c);
  }
  return [...hits.values()].slice(0, MAX_MATCHES);
}

// live.prices/signals/scores/metals'ı TEK bir BIST kalemine uygular
// (frontend/src/App.jsx mergeLivePrices ile aynı desen, tek kalem için).
function overlayBistLive(it, live) {
  const next = { ...it };
  const p = live?.prices?.[it.ticker];
  if (p?.price != null) {
    next.price = p.price;
    if (p.changePct != null) next.changePct = p.changePct;
  }
  if (it.kind === 'metal') {
    const mt = live?.metals?.[it.ticker];
    if (mt) {
      next.tryPerGram = mt.g;
      if (mt.a != null) next.buyPrice = mt.a;
      if (mt.s != null) next.sellPrice = mt.s;
    }
  }
  const s = live?.signals?.[it.ticker];
  if (s) { next.wtSignal = s.wo ?? null; next.wtCrossSignal = s.wt ?? null; next.stSignal = s.st ?? null; }
  const sc = live?.scores?.[it.ticker];
  if (sc) {
    next.score = sc.sc; next.signal = sc.sg;
    if (sc.m != null) next.momentum1m = sc.m;
    if (sc.u != null) { next.upside12m = sc.u; next.exp1m = sc.e1; next.exp3m = sc.e3; }
  }
  return next;
}

function overlayUsLive(it, live) {
  const next = { ...it };
  const p = live?.prices?.[it.ticker];
  if (p?.price != null) { next.price = p.price; if (p.changePct != null) next.changePct = p.changePct; }
  const s = live?.signals?.[it.ticker];
  if (s) { next.wtSignal = s.wo ?? null; next.wtCrossSignal = s.wt ?? null; next.stSignal = s.st ?? null; }
  const sc = live?.scores?.[it.ticker];
  if (sc) { next.score = sc.sc; next.signal = sc.sg; if (sc.u != null) next.upside12m = sc.u; }
  return next;
}

const num = (x) => (x == null || Number.isNaN(x) ? undefined : x);

// BIST hissesi / kıymetli maden kalemini modele verilecek dar, etiketli
// JSON'a çevirir. `undefined` alanlar JSON.stringify ile otomatik düşer.
function formatBist(it) {
  if (it.kind === 'metal') {
    return {
      ticker: it.ticker, ad: it.name, tur: 'kıymetli maden',
      fiyatUSD: num(it.price), gunlukDegisimYuzde: num(it.changePct),
      tryGram: num(it.tryPerGram), alisTRY: num(it.buyPrice), satisTRY: num(it.sellPrice),
    };
  }
  return {
    ticker: it.ticker, ad: it.name, tur: 'BIST hissesi', sektor: it.sector ?? undefined,
    endeks: it.bist ? `BIST ${it.bist}` : undefined,
    fiyatTRY: num(it.price), gunlukDegisimYuzde: num(it.changePct),
    puan: num(it.score), sinyal: it.signal ?? undefined,
    momentum1AyYuzde: num(it.momentum1m), pozisyon52Hafta0_1: num(it.pos52w),
    rsi14: num(it.rsi), macdBogaKesisim: it.macdCross ?? undefined, macdCizgiUstte: it.macdBull ?? undefined,
    waveTrendSinyal: it.wtSignal ?? undefined, waveTrendKesisimSinyal: it.wtCrossSignal ?? undefined,
    superTrendSinyal: it.stSignal ?? undefined,
    analistTavsiyesi: it.recommendationKey ?? undefined, analistSayisi: it.numAnalysts ?? undefined,
    analistHedefOrtalama: num(it.targetMean), analistHedefUpside12AyYuzde: num(it.upside12m),
    ileriFK: num(it.forwardPE), gelirBuyumeYuzde: num(it.revenueGrowth),
  };
}

function formatUs(it) {
  const r = it.report;
  return {
    ticker: it.ticker, ad: it.name, tur: 'ABD hissesi', sektor: it.sector ?? undefined, endeks: (it.indices || []).join('/') || undefined,
    fiyatUSD: num(it.price), gunlukDegisimYuzde: num(it.changePct),
    puan: num(it.score), sinyal: it.signal ?? undefined, pozisyon52Hafta0_1: num(it.pos52w),
    waveTrendSinyal: it.wtSignal ?? undefined, waveTrendKesisimSinyal: it.wtCrossSignal ?? undefined,
    superTrendSinyal: it.stSignal ?? undefined,
    analistTavsiyesi: it.recommendationKey ?? undefined, analistSayisi: it.numAnalysts ?? undefined,
    analistHedefOrtalama: num(it.targetMean), analistHedefUpside12AyYuzde: num(it.upside12m),
    ileriFK: num(it.forwardPE), izFK: num(it.trailingPE), pdDD: num(it.priceToBook),
    gelirBuyumeYuzde: num(it.revenueGrowth), gelir3YCagrYuzde: num(it.revenue3yCagr),
    netKarMarjiYuzde: num(it.profitMargins), netBorcEbitda: num(it.netDebtToEbitda),
    fcfMarjiYuzde: num(it.fcfMargin), temettuVerimiYuzde: num(it.dividendYield),
    nitelRapor: r ? {
      donem: r.asOf, segmentler: r.segments, rakipler: r.competitors,
      hendekler: (r.moat || []).map((m) => `${m.title}: ${m.desc}`),
      guclu: r.strengths, zayif: r.risks, sonuc: r.verdict,
      gelirNotu: r.revenue3yNote, marjNotu: r.marginNote, bilancoNotu: r.balanceNote, fcfNotu: r.fcfNote,
    } : undefined,
  };
}

// Eşleşen ticker için son 2 gün içindeki (varsa) ilgili haber başlıklarını
// ekler — "bugün neden düştü" tarzı sorularda bağlam sağlar. BIST/maden
// dışında (ABD hisseleri) kaynak kapsam dışı olduğu için boş döner.
async function relatedNews(ticker, kind) {
  try {
    const items = await fetchNews();
    const filtered = kind === 'metal'
      ? items.filter((n) => n.category === 'Kıymetli Maden')
      : items.filter((n) => n.ticker === ticker);
    return filtered.slice(0, 3).map((n) => ({ baslik: n.title, kaynak: n.source, ozet: n.summary || undefined }));
  } catch { return []; }
}

// Kullanıcı mesajlarında geçen enstrümanları çözüp sitenin canlı verisiyle
// zenginleştirilmiş, modele verilecek JSON kaydını üretir.
export async function buildContext(userText) {
  const matches = matchInstruments(userText);
  if (!matches.length) return [];

  const bistWanted = matches.filter((m) => m.kind !== 'us-stock');
  const usWanted = matches.filter((m) => m.kind === 'us-stock');
  const out = [];

  if (bistWanted.length) {
    const { items } = await getRecommendations();
    const live = await getLivePrices(items).catch(() => null);
    for (const m of bistWanted) {
      const base = items.find((i) => i.ticker === m.ticker);
      if (!base) continue;
      const merged = overlayBistLive(base, live);
      out.push({ ...formatBist(merged), sonHaberler: await relatedNews(m.ticker, merged.kind) });
    }
  }
  if (usWanted.length) {
    const { items } = await getUsRecommendations();
    const live = await getUsLivePrices(items).catch(() => null);
    for (const m of usWanted) {
      const base = items.find((i) => i.ticker === m.ticker);
      if (!base) continue;
      out.push(formatUs(overlayUsLive(base, live)));
    }
  }
  return out;
}

const PERSONA_SYSTEM = `Sen bu sitenin (BIST hisse önerileri platformu) sohbet asistanısın: 15 yıllık piyasa
tecrübesine sahip kıdemli, tarafsız bir finansal analist gibi davranıyorsun. Hem temel
analiz (bilgin dahilinde iş modeli/sektör/makro değerlendirmesi + sitenin sağladığı
çarpan/büyüme verisi) hem teknik analiz (trend, RSI, MACD, WaveTrend, SuperTrend,
52 haftalık bant konumu) konusunda uzmansın.

KAPSAM: Yalnızca bu sitede takip edilen üç grup hakkında konuş: (1) BIST 100 hisseleri,
(2) kıymetli madenler (altın, gümüş, platin, paladyum), (3) ABD büyük şirketleri
(NASDAQ-100 + S&P 100). Kapsam dışı bir konu sorulursa (kripto para, emtia/petrol,
sitenin izlemediği bir BIST hissesi, hukuki/vergisel tavsiye, siteyle ilgisiz genel
sohbet vb.) bunu nazikçe belirt ve sitenin neyi kapsadığını hatırlat — konuyu zorlama.

VERİ KURALI — ÇOK ÖNEMLİ: Her kullanıcı mesajından önce, mesajda geçen enstrüman(lar)
için sitenin KENDİ canlı verisi sana JSON dizisi olarak ekleniyor (aşağıdaki şemaya göre).
SADECE bu veriye ve genel piyasa/şirket bilgine dayan; sana verilmeyen hiçbir sayıyı
(ör. detaylı bilanço kalemleri, PD/DD/F/K harici çarpanlar, kesin haber, kesin destek/
direnç fiyat seviyesi) ASLA uydurma. Bu site sana ham mum/bar geçmişi VERMEZ, yalnızca
pozisyon52Hafta0_1 (0=52 haftalık dip, 1=zirve) verir — kesin ₺/$ destek-direnç
rakamı isteneni bu yüzden veremezsin; bunun yerine bant içindeki konumu yorumla ve
kullanıcıyı hisse koduna tıklayıp siteki grafiği açmaya yönlendirebilirsin. JSON dizisi
boşsa (hiçbir enstrüman eşleşmediyse) kullanıcıya hangi hisse/madeni sorduğunu
netleştirmesini iste — tahmini rakam üretme.

CEVAP TARZI:
- Türkçe, net ve profesyonel bir dil kullan; kısa sohbet ekranında okunacağını unutma.
- Tam bir "analiz" istendiğinde (ör. "X hissesini analiz eder misin", "X nasıl görünüyor")
  şu başlıklarla yanıt ver: **Temel Analiz**, **Teknik Analiz**, **Riskler ve Olası
  Senaryolar** (Boğa/Ayı). Bu site tam bilanço/finansal tablo sağlamadığı için Temel
  Analiz'i elindeki sınırlı veriyle (ileri F/K, gelir büyümesi, analist hedefi/tavsiyesi,
  ABD hisselerinde ayrıca nitel segment/moat/güçlü-zayıf yön notları) yap; eksik olanı
  açıkça "bu detay sitede yok" diye belirt, uydurma.
- Dar/takip sorularında (ör. "hedef fiyatı kaç", "RSI'ı ne") tüm formatı tekrarlama,
  doğrudan ve kısa cevap ver — ama analist tonunu koru.
- Kesin "AL/SAT/TUT" tavsiyesi VERME. Sitenin kendi AL/TUT/İZLE rozeti (JSON'daki
  sinyal alanı) mekanik bir puandan gelir — bunu bir veri noktası olarak aktarabilirsin,
  kişisel tavsiye gibi sunma. Bunun yerine risk/ödül çerçevesi ve olası senaryolar sun.
- Analiz/yorum İÇEREN her yanıtın SONUNA şunu ekle: "⚠️ Yatırım tavsiyesi değildir."
  Salt bir rakamı yanıtlayan çok kısa/dar sorularda (yalnız "hedef fiyat kaç" gibi) bu
  ibareyi tekrar etmek zorunda değilsin.

VERİ ŞEMASI (sana eklenen JSON dizisindeki her kayıt):
BIST hissesi: ticker, ad, sektor, endeks, fiyatTRY, gunlukDegisimYuzde, puan(0-100),
  sinyal(AL/TUT/İZLE), momentum1AyYuzde, pozisyon52Hafta0_1, rsi14, macdBogaKesisim,
  macdCizgiUstte, waveTrendSinyal, waveTrendKesisimSinyal, superTrendSinyal(AL/SAT/yok),
  analistTavsiyesi(strong_buy/buy/hold/underperform/sell), analistSayisi,
  analistHedefOrtalama, analistHedefUpside12AyYuzde, ileriFK, gelirBuyumeYuzde, sonHaberler[].
Kıymetli maden: ticker, ad, fiyatUSD(ons), gunlukDegisimYuzde, tryGram, alisTRY, satisTRY,
  sonHaberler[] (sektör geneli, o madene özel olmayabilir).
ABD hissesi: BIST'e benzer alanlar + izFK, pdDD, gelir3YCagrYuzde, netKarMarjiYuzde,
  netBorcEbitda, fcfMarjiYuzde, temettuVerimiYuzde, nitelRapor{donem, segmentler,
  rakipler, hendekler, guclu, zayif, sonuc, gelirNotu, marjNotu, bilancoNotu, fcfNotu}.
`;

function toApiMessages(history) {
  const trimmed = (Array.isArray(history) ? history : [])
    .filter((m) => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string' && m.content.trim())
    .slice(-MAX_HISTORY)
    .map((m) => ({ role: m.role, content: m.content.trim().slice(0, MAX_MSG_LEN) }));
  // İlk mesaj user olmalı (API kısıtı) — baştaki assistant mesajlarını at.
  while (trimmed.length && trimmed[0].role !== 'user') trimmed.shift();
  return trimmed;
}

// --- Basit istek başına IP hız sınırlaması (public, ücretsiz uç — kontrolsüz
// kullanım Anthropic faturasını doğrudan büyütür). Sunucu belleğinde tutulur,
// yeniden başlayınca sıfırlanır; bu bir MVP korumasıdır, dağıtık değildir.
const RATE_LIMIT = Number(process.env.CHAT_RATE_LIMIT ?? 12);
const RATE_WINDOW_MS = Number(process.env.CHAT_RATE_WINDOW_MINUTES ?? 5) * 60 * 1000;
const buckets = new Map();
export function chatRateLimit(req, res, next) {
  const ip = req.ip || req.headers['x-forwarded-for'] || 'unknown';
  const now = Date.now();
  const b = buckets.get(ip);
  if (!b || now > b.resetAt) {
    buckets.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return next();
  }
  if (b.count >= RATE_LIMIT) {
    const waitMin = Math.ceil((b.resetAt - now) / 60000);
    return res.status(429).json({ error: `Çok fazla istek. Lütfen ~${waitMin} dk sonra tekrar deneyin.` });
  }
  b.count++;
  next();
}

// POST /api/chat — { messages: [{role:'user'|'assistant', content:string}] }
// Yanıtı düz metin olarak CHUNKED akıtır (SSE değil): istemci fetch +
// ReadableStream ile okuyup arttırarak ekrana basar.
export async function chatHandler(req, res) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(503).json({ error: 'Sohbet asistanı şu an devre dışı (ANTHROPIC_API_KEY tanımlı değil).' });
  }
  const messages = toApiMessages(req.body?.messages);
  if (!messages.length) {
    return res.status(400).json({ error: 'Geçerli bir mesaj gönderin.' });
  }
  const lastUser = [...messages].reverse().find((m) => m.role === 'user')?.content || '';
  // Bağlam için TÜM kullanıcı mesajlarını tara (takip sorularında önceki
  // ticker'ı hatırlamak için), ama ana odak son mesajdır.
  const scanText = messages.filter((m) => m.role === 'user').map((m) => m.content).join(' \n ');

  let contextItems = [];
  try {
    contextItems = await buildContext(scanText || lastUser);
  } catch (err) {
    console.warn(`[chat] Bağlam verisi hazırlanamadı: ${err.message}`);
  }

  const system = [
    { type: 'text', text: PERSONA_SYSTEM, cache_control: { type: 'ephemeral' } },
    {
      type: 'text',
      text: contextItems.length
        ? `Sitenin canlı verisi (bu mesajla ilgili enstrümanlar):\n${JSON.stringify(contextItems)}`
        : 'Bu mesajda site kapsamındaki (BIST 100 / kıymetli maden / ABD büyük şirket) bir sembol veya isim tespit edilemedi; hiçbir enstrüman verisi eklenmedi.',
    },
  ];

  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache');
  let wroteAny = false;
  try {
    const stream = client.messages.stream({
      model: MODEL,
      max_tokens: 4096,
      output_config: { effort: 'medium' },
      system,
      messages,
    });
    for await (const event of stream) {
      if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
        wroteAny = true;
        res.write(event.delta.text);
      }
    }
    res.end();
  } catch (err) {
    console.error(`[chat] Anthropic hatası: ${err.message}`);
    if (wroteAny) {
      res.end(`\n\n⚠️ Yanıt tamamlanamadı (bağlantı hatası): ${err.message}`);
    } else {
      res.status(502).json({ error: `Sohbet asistanına ulaşılamadı: ${err.message}` });
    }
  }
}
