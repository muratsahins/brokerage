import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { initDb } from './db.js';
import { refresh, getRecommendations } from './service.js';

const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ ok: true, time: new Date().toISOString() });
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

// Manuel yenileme tetikle
app.post('/api/refresh', async (req, res) => {
  try {
    const items = await refresh();
    res.json({ ok: true, count: items.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 4000;

async function start() {
  await initDb();

  // İlk veriyi çek (arka planda, sunucuyu bloklamadan)
  refresh().catch((err) => console.warn(`[start] İlk yenileme başarısız: ${err.message}`));

  const minutes = Number(process.env.REFRESH_INTERVAL_MINUTES ?? 30);
  if (minutes > 0) {
    setInterval(() => {
      refresh().catch((err) => console.warn(`[cron] Yenileme başarısız: ${err.message}`));
    }, minutes * 60 * 1000);
    console.log(`[start] Otomatik yenileme her ${minutes} dakikada bir açık.`);
  }

  app.listen(PORT, () => console.log(`[start] Backend hazır: http://localhost:${PORT}`));
}

start();
