import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { initDb } from './db.js';
import { syncData, getRecommendations } from './service.js';
import { diagnose } from './dataSource.js';

const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ ok: true, time: new Date().toISOString() });
});

// Analist verisinin neden gelmediğini canlıda görmek için teşhis ucu.
app.get('/api/debug/fundamentals', async (req, res) => {
  try {
    res.json(await diagnose(req.query.ticker || 'THYAO'));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Öneri listesi
app.get('/api/recommendations', async (req, res) => {
  try {
    const data = await getRecommendations();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Manuel yenileme: yayınlanan veriyi yeniden çek (yoksa canlı çekim)
app.post('/api/refresh', async (req, res) => {
  try {
    const data = await (async () => { await syncData(); return getRecommendations(); })();
    res.json({ ok: true, count: data.items.length, source: data.source });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 4000;

async function start() {
  await initDb();

  // İlk veriyi yükle (yayınlanan JSON → yoksa canlı). Sunucuyu bloklama.
  syncData().catch((err) => console.warn(`[start] İlk veri yüklemesi başarısız: ${err.message}`));

  const minutes = Number(process.env.REFRESH_INTERVAL_MINUTES ?? 30);
  if (minutes > 0) {
    setInterval(() => {
      syncData().catch((err) => console.warn(`[cron] Veri senkronizasyonu başarısız: ${err.message}`));
    }, minutes * 60 * 1000);
    console.log(`[start] Otomatik veri senkronizasyonu her ${minutes} dakikada bir açık.`);
  }

  app.listen(PORT, () => console.log(`[start] Backend hazır: http://localhost:${PORT}`));
}

start();
