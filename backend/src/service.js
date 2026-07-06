import { BIST_STOCKS, toSymbol } from './stocks.js';
import { fetchQuotes } from './dataSource.js';
import { buildRecommendations } from './recommend.js';
import {
  isDbAvailable,
  upsertStock,
  upsertRecommendation,
  getRecommendations as dbGetRecommendations,
} from './db.js';

// Postgres yoksa kullanılan bellek içi önbellek
const memory = {
  recommendations: [],
  updatedAt: null,
};

const byTicker = new Map(BIST_STOCKS.map((s) => [s.ticker, s]));

// Yahoo'dan çeker, puanlar, DB varsa kaydeder, ayrıca belleğe yazar.
export async function refresh() {
  console.log('[service] Veri yenileniyor...');
  const quotes = await fetchQuotes(BIST_STOCKS.map((s) => s.ticker));
  const recos = buildRecommendations(quotes);

  const enriched = recos.map((r) => {
    const ticker = r.symbol.replace('.IS', '');
    const meta = byTicker.get(ticker) ?? { name: ticker, sector: null };
    return { ...r, ticker, name: meta.name, sector: meta.sector };
  });

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
  console.log(`[service] Yenileme tamam — ${enriched.length} hisse, kaynak canlı.`);
  return enriched;
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
  return { source: 'memory', updatedAt: memory.updatedAt, items: memory.recommendations };
}
