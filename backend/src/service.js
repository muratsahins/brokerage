import { BIST_STOCKS, toSymbol } from './stocks.js';
import { fetchQuotes } from './dataSource.js';
import { buildRecommendations } from './recommend.js';
import {
  isDbAvailable,
  upsertStock,
  upsertRecommendation,
  getRecommendations as dbGetRecommendations,
} from './db.js';

// Analist verisi Render'ın datacenter IP'sinde throttle olduğu için,
// asıl veri GitHub Actions'ta (taze runner IP) çekilip repoya yayınlanır.
// Backend bu yayınlanan JSON'u runtime'da okur; yoksa canlı çekime düşer.
const PUBLISHED_DATA_URL =
  process.env.PUBLISHED_DATA_URL ||
  'https://raw.githubusercontent.com/muratsahins/brokerage/main/data/recommendations.json';

// Bellek içi önbellek (yayınlanan veri veya canlı çekim buraya yazılır)
const memory = {
  recommendations: [],
  updatedAt: null,
  source: null,
};

const byTicker = new Map(BIST_STOCKS.map((s) => [s.ticker, s]));

// Yahoo'dan çeker, puanlar, isim/sektör ile zenginleştirir. Yan etkisiz.
export async function computeRecommendations() {
  const quotes = await fetchQuotes(BIST_STOCKS.map((s) => s.ticker));
  const recos = buildRecommendations(quotes);
  return recos.map((r) => {
    const ticker = r.symbol.replace('.IS', '');
    const meta = byTicker.get(ticker) ?? { name: ticker, sector: null };
    return { ...r, ticker, name: meta.name, sector: meta.sector };
  });
}

// GitHub'da yayınlanan JSON'u çekip belleğe alır. Başarılıysa true.
export async function loadPublished() {
  try {
    const res = await fetch(`${PUBLISHED_DATA_URL}?t=${Date.now()}`, {
      headers: { 'Cache-Control': 'no-cache' },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (!Array.isArray(data.items) || data.items.length === 0) throw new Error('boş veri');
    memory.recommendations = data.items;
    memory.updatedAt = data.updatedAt ?? new Date().toISOString();
    memory.source = 'github';
    console.log(`[service] Yayınlanan veri yüklendi — ${data.items.length} hisse (${memory.updatedAt}).`);
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
