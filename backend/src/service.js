import { BIST_STOCKS, INSTRUMENTS, toSymbol } from './stocks.js';
import { fetchQuotes, fetchUsdTryRate, fetchAltinInPrices } from './dataSource.js';
import { buildRecommendations, roundPrice } from './recommend.js';
import {
  isDbAvailable,
  upsertStock,
  upsertRecommendation,
  getRecommendations as dbGetRecommendations,
} from './db.js';

// Analist verisi Render'ın datacenter IP'sinde throttle olduğu için,
// asıl veri GitHub Actions'ta (taze runner IP) çekilip repoya yayınlanır.
// Backend bu yayınlanan JSON'u runtime'da okur; yoksa canlı çekime düşer.
const GITHUB_REPO = process.env.GITHUB_REPO || 'muratsahins/brokerage';
const GITHUB_BRANCH = process.env.GITHUB_BRANCH || 'main';
const DATA_PATH = process.env.PUBLISHED_DATA_PATH || 'data/recommendations.json';
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

// Repo PUBLIC ise raw.githubusercontent yeterli. Repo PRIVATE ise raw 404 döner;
// bu durumda GITHUB_TOKEN tanımlıysa GitHub Contents API'si üzerinden okunur.
const PUBLISHED_DATA_URL =
  process.env.PUBLISHED_DATA_URL ||
  `https://raw.githubusercontent.com/${GITHUB_REPO}/${GITHUB_BRANCH}/${DATA_PATH}`;

const GITHUB_API_URL =
  `https://api.github.com/repos/${GITHUB_REPO}/contents/${DATA_PATH}?ref=${GITHUB_BRANCH}`;

// Bellek içi önbellek (yayınlanan veri veya canlı çekim buraya yazılır)
const memory = {
  recommendations: [],
  updatedAt: null,
  source: null,
};

const byTicker = new Map(INSTRUMENTS.map((s) => [s.ticker, s]));

const TROY_OUNCE_G = 31.1034768; // 1 troy ons = gram

// Yahoo'dan çeker, puanlar, isim/sektör/tür ile zenginleştirir. Yan etkisiz.
export async function computeRecommendations() {
  const quotes = await fetchQuotes(INSTRUMENTS);
  const recos = buildRecommendations(quotes);

  // USD fiyatlı enstrümanlar (kıymetli maden, kripto) için TCMB USD/TRY + altin.in.
  const hasMetal = INSTRUMENTS.some((i) => i.kind === 'metal');
  const hasUsd = INSTRUMENTS.some((i) => i.kind === 'metal' || i.kind === 'crypto' || i.kind === 'emtia');
  const [usdTry, altinIn] = hasUsd
    ? await Promise.all([fetchUsdTryRate(), hasMetal ? fetchAltinInPrices() : Promise.resolve({})])
    : [null, {}];

  return recos.map((r) => {
    const meta = byTicker.get(r.ticker) ?? { name: r.ticker, sector: null, bist: null, kind: 'stock' };
    const kind = meta.kind ?? 'stock';
    const item = {
      ...r,
      ticker: r.ticker,
      name: meta.name,
      sector: meta.sector,
      bist: meta.bist ?? null,
      kind,
    };
    if (kind === 'metal') {
      // Metal fiyatı USD/ons -> TRY/gram karşılığı.
      if (item.price != null && usdTry) {
        item.tryPerGram = Math.round((item.price / TROY_OUNCE_G) * usdTry * 100) / 100;
        item.usdTry = usdTry;
      }
      // altin.in alış/satış (o metal orada varsa).
      const ai = meta.altinInName ? altinIn[meta.altinInName] : null;
      if (ai) {
        item.buyPrice = ai.buy ?? null;
        item.sellPrice = ai.sell ?? null;
      }
    }
    if ((kind === 'crypto' || kind === 'emtia') && item.price != null && usdTry) {
      // USD fiyatının doğrudan ₺ karşılığı (sanal borsa ve ₺ gösterimi için).
      // Emtiada birim çevrimi YOK: Brent varil başına, dolayısıyla ₺/varil.
      item.tryPrice = roundPrice(item.price * usdTry);
      item.usdTry = usdTry;
      if (meta.unit) item.unit = meta.unit;
    }
    return item;
  });
}

// GitHub'da yayınlanan JSON'u çekip belleğe alır. Başarılıysa true.
export async function loadPublished() {
  try {
    // Token varsa (private repo) Contents API; yoksa (public repo) raw URL.
    const url = GITHUB_TOKEN
      ? `${GITHUB_API_URL}&t=${Date.now()}`
      : `${PUBLISHED_DATA_URL}?t=${Date.now()}`;
    const headers = { 'Cache-Control': 'no-cache' };
    if (GITHUB_TOKEN) {
      headers.Authorization = `Bearer ${GITHUB_TOKEN}`;
      // Contents API'sinden base64 sarmalı yerine ham içeriği iste.
      headers.Accept = 'application/vnd.github.raw';
    }
    const res = await fetch(url, { headers });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (!Array.isArray(data.items) || data.items.length === 0) throw new Error('boş veri');
    // Yayınlanan veri, takip listesinden ÇIKARILMIŞ enstrümanları hâlâ taşıyor
    // olabilir (bir sonraki yayın turuna kadar). Güncel listede olmayanları ele —
    // böylece liste değişikliği (ör. kriptonun kapatılması) anında geçerli olur.
    const items = data.items.filter((it) => byTicker.has(it.ticker));
    const dropped = data.items.length - items.length;
    memory.recommendations = items;
    memory.updatedAt = data.updatedAt ?? new Date().toISOString();
    memory.source = 'github';
    console.log(`[service] Yayınlanan veri yüklendi — ${items.length} hisse${dropped ? ` (${dropped} takip dışı kayıt elendi)` : ''} (${memory.updatedAt}).`);
    return true;
  } catch (err) {
    console.warn(`[service] Yayınlanan veri yüklenemedi: ${err.message}`);
    return false;
  }
}

// Aynı anda birden çok canlı yenileme başlamasın.
let inflight = null;
export function refresh() {
  if (inflight) return inflight;
  inflight = doRefresh().finally(() => { inflight = null; });
  return inflight;
}

// Canlı çekim (yedek yol): Yahoo'dan çeker, DB varsa kaydeder, belleğe yazar.
async function doRefresh() {
  console.log('[service] Canlı veri yenileniyor...');
  const enriched = await computeRecommendations();

  if (isDbAvailable()) {
    try {
      for (const s of BIST_STOCKS) {
        await upsertStock({ symbol: toSymbol(s.ticker), ticker: s.ticker, name: s.name, sector: s.sector });
      }
      for (const r of enriched) {
        await upsertRecommendation(r);
      }
      console.log(`[service] ${enriched.length} öneri PostgreSQL'e kaydedildi.`);
    } catch (err) {
      console.warn(`[service] DB'ye yazma başarısız: ${err.message}`);
    }
  }

  memory.recommendations = enriched;
  memory.updatedAt = new Date().toISOString();
  memory.source = 'memory';
  console.log(`[service] Canlı yenileme tamam — ${enriched.length} hisse.`);
  return enriched;
}

// Önce yayınlanan veriyi dener; olmazsa canlı çekime düşer.
export async function syncData() {
  if (await loadPublished()) return;
  await refresh();
}

// Bellekteki (yayınlanan ya da canlı çekilen) kalemler. Canlı fiyat tazelemesi
// puan/hedefi bunlardan yeniden hesaplar — DB'ye gitmeden, senkron ve ucuz.
export function getCachedItems() {
  return memory.recommendations;
}

export async function getRecommendations() {
  if (isDbAvailable()) {
    try {
      const rows = await dbGetRecommendations();
      if (rows.length > 0) {
        return { source: 'postgres', updatedAt: rows[0].updatedAt, items: rows };
      }
    } catch (err) {
      console.warn(`[service] DB okuma başarısız, belleğe düşülüyor: ${err.message}`);
    }
  }

  // Bellek boşsa (cold-start): yayınlanan veriyi çekmeyi ~8sn dene.
  if (memory.recommendations.length === 0) {
    const timeout = new Promise((r) => setTimeout(r, 8000));
    try {
      await Promise.race([syncData(), timeout]);
    } catch (err) {
      console.warn(`[service] İlk veri yüklemesi başarısız: ${err.message}`);
    }
  }

  return { source: memory.source ?? 'memory', updatedAt: memory.updatedAt, items: memory.recommendations };
}
