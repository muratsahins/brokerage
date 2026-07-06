import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import pg from 'pg';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Postgres bağlantısı. Bağlantı kurulamazsa uygulama çökmez;
// `available` false olur ve çağıran taraf bellek içi moda düşer.
let pool = null;
let available = false;

export async function initDb() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.warn('[db] DATABASE_URL tanımlı değil — bellek içi modda çalışılıyor.');
    return false;
  }

  pool = new pg.Pool({ connectionString, max: 5, connectionTimeoutMillis: 4000 });

  try {
    const schema = await readFile(path.join(__dirname, 'schema.sql'), 'utf8');
    await pool.query(schema);
    available = true;
    console.log('[db] PostgreSQL bağlantısı kuruldu, şema hazır.');
    return true;
  } catch (err) {
    console.warn(`[db] PostgreSQL kullanılamıyor (${err.message}) — bellek içi modda çalışılıyor.`);
    available = false;
    return false;
  }
}

export function isDbAvailable() {
  return available;
}

export async function query(text, params) {
  if (!available) throw new Error('DB kullanılamıyor');
  return pool.query(text, params);
}

export async function upsertStock({ symbol, ticker, name, sector }) {
  await query(
    `INSERT INTO stocks (symbol, ticker, name, sector)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (symbol) DO UPDATE SET ticker = $2, name = $3, sector = $4`,
    [symbol, ticker, name, sector ?? null]
  );
}

export async function upsertRecommendation(r) {
  await query(
    `INSERT INTO recommendations
       (symbol, price, currency, change_pct, momentum_1m, pos_52w,
        exp_1m, exp_3m, upside_12m, target_mean, target_high, target_low,
        rec_key, num_analysts, forward_pe, revenue_growth, score, signal, updated_at)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18, now())
     ON CONFLICT (symbol) DO UPDATE SET
       price=$2, currency=$3, change_pct=$4, momentum_1m=$5, pos_52w=$6,
       exp_1m=$7, exp_3m=$8, upside_12m=$9, target_mean=$10, target_high=$11, target_low=$12,
       rec_key=$13, num_analysts=$14, forward_pe=$15, revenue_growth=$16,
       score=$17, signal=$18, updated_at=now()`,
    [r.symbol, r.price, r.currency, r.changePct, r.momentum1m, r.pos52w,
     r.exp1m, r.exp3m, r.upside12m, r.targetMean, r.targetHigh, r.targetLow,
     r.recommendationKey, r.numAnalysts, r.forwardPE, r.revenueGrowth, r.score, r.signal]
  );
}

export async function getRecommendations() {
  const { rows } = await query(
    `SELECT s.ticker, s.name, s.sector,
            r.price, r.currency, r.change_pct AS "changePct",
            r.momentum_1m AS "momentum1m", r.pos_52w AS "pos52w",
            r.exp_1m AS "exp1m", r.exp_3m AS "exp3m", r.upside_12m AS "upside12m",
            r.target_mean AS "targetMean", r.target_high AS "targetHigh", r.target_low AS "targetLow",
            r.rec_key AS "recommendationKey", r.num_analysts AS "numAnalysts",
            r.forward_pe AS "forwardPE", r.revenue_growth AS "revenueGrowth",
            r.score, r.signal, r.updated_at AS "updatedAt"
     FROM recommendations r
     JOIN stocks s ON s.symbol = r.symbol
     ORDER BY r.score DESC`
  );
  const num = (v) => (v != null ? Number(v) : null);
  return rows.map((row) => ({
    ...row,
    price: num(row.price), changePct: num(row.changePct), momentum1m: num(row.momentum1m),
    pos52w: num(row.pos52w), exp1m: num(row.exp1m), exp3m: num(row.exp3m),
    upside12m: num(row.upside12m), targetMean: num(row.targetMean),
    targetHigh: num(row.targetHigh), targetLow: num(row.targetLow),
    numAnalysts: num(row.numAnalysts), forwardPE: num(row.forwardPE),
    revenueGrowth: num(row.revenueGrowth), score: num(row.score),
  }));
}
