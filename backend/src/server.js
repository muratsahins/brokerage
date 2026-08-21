import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import compression from 'compression';
import { initDb } from './db.js';
import {
  syncData, getRecommendations, getCachedItems, getUsRecommendations, syncUsData,
} from './service.js';
import { diagnose, fetchOhlc, peekLivePrices, peekUsLivePrices } from './dataSource.js';
import { getLivePrices, getUsLivePrices, refreshSeries, seriesStats } from './liveSignals.js';
import { fetchNews } from './newsSource.js';
import { getAlerts } from './alerts.js';
import { INSTRUMENTS } from './stocks.js';
import { US_STOCKS } from './usStocks.js';

// Ticker -> Yahoo sembolü. ABD hisselerinde sembol ticker'ın kendisi (AAPL),
// BIST'te .IS ekli. Grafik ucu ikisini de servis ediyor.
const symbolByTicker = new Map([
  ...INSTRUMENTS.map((i) => [i.ticker, i.symbol]),
  ...US_STOCKS.map((u) => [u.ticker, u.symbol || u.ticker]), // BRK.B -> BRK-B gibi istisnalar
]);
const usTickers = new Set(US_STOCKS.map((u) => u.ticker));
const VALID_RANGE = /^(1mo|3mo|6mo|1y|2y|5y)$/;

const app = express();
app.use(cors());
// /api/prices artık fiyatla birlikte ~104 enstrümanın gösterge sinyallerini de
// taşıyor ve 18 sn'de bir çekiliyor — gzip ile tel üstünde ~10 kat küçülüyor.
app.use(compression());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ ok: true, time: new Date().toISOString(), series: seriesStats() });
});

// Toplu güncel (intraday) fiyatlar + AYNI ANDAKİ gösterge sinyalleri ve
// puan/analist potansiyeli. Göstergeler bellekteki bar geçmişi + canlı fiyattan,
// puan/hedef ise yayınlanan analist verisi + canlı fiyattan hesaplanır
// (liveSignals.js). Veri yoksa alan boş kalır, yayınlanan değer geçerlidir.
app.get('/api/prices', async (req, res) => {
  try {
    res.json(await getLivePrices(getCachedItems()));
  } catch (err) {
    res.status(502).json({ error: err.message, prices: {}, signals: {}, scores: {} });
  }
});

// Grafik için günlük OHLC mum verisi (frontend Lightweight Charts ile çizer).
app.get('/api/chart', async (req, res) => {
  try {
    const ticker = String(req.query.ticker || '').toUpperCase();
    if (!ticker) return res.status(400).json({ error: 'ticker gerekli' });
    const symbol = symbolByTicker.get(ticker) || `${ticker}.IS`;
    const range = VALID_RANGE.test(String(req.query.range)) ? String(req.query.range) : '1y';
    const data = await fetchOhlc(symbol, range);
    // Son mumu, tablonun kullandığı CANLI fiyatla (spark) eşitle. Grafik verisi
    // Yahoo'nun chart ucundan, tablo fiyatı spark ucundan geliyor; ikisi arasında
    // saniyelik kotasyon farkı kalmasın diye grafik tabloya bağlanır.
    // Yalnızca canlı fiyat son mumla AYNI seansa aitse uygulanır.
    const last = data.candles[data.candles.length - 1];
    // Son mumu canlı fiyata eşitlerken doğru hattan oku (ABD ayrı önbellek).
    const lp = (usTickers.has(ticker) ? peekUsLivePrices() : peekLivePrices())?.prices?.[ticker];
    if (last && lp?.price != null && lp.ts != null) {
      const d = new Date((lp.ts + (data.gmtoffset ?? 0)) * 1000).toISOString().slice(0, 10);
      if (d === last.time) {
        last.close = lp.price;
        last.high = Math.max(last.high, lp.price);
        last.low = Math.min(last.low, lp.price);
      }
    }
    res.json(data);
  } catch (err) {
    res.status(502).json({ error: err.message });
  }
});

// Haberler (BIST/hisse, kıymetli maden, ekonomi, analist önerileri).
app.get('/api/news', async (req, res) => {
  try {
    res.json({ items: await fetchNews() });
  } catch (err) {
    res.status(502).json({ error: err.message, items: [] });
  }
});

// UYARI: overzone / WaveTrend / SuperTrend sinyalini YENİ veren hisseler
// (günlük grafik). KAP bildirimlerinin yerini aldı. Bar geçmişi zaten bellekte
// olduğu için ek veri çekimi gerektirmez.
app.get('/api/alerts', (req, res) => {
  try {
    res.json(getAlerts());
  } catch (err) {
    res.status(500).json({ error: err.message, items: [] });
  }
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

// ABD büyük şirketler (NASDAQ100+S&P100) — temel analiz ağırlıklı öneri listesi.
// BIST hattından bağımsız: günlük yayınlanan ayrı bir JSON'dan okunur.
app.get('/api/us-recommendations', async (req, res) => {
  try {
    const data = await getUsRecommendations();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ABD canlı fiyat + göstergeler + puan. /api/prices'ın ABD karşılığı; ayrı
// fiyat hattından beslenir ve puan ABD formülüyle (usPriceDerived) yeniden
// hesaplanır — analist hedefi yayından gelir, potansiyel fiyattan türer.
app.get('/api/us-prices', async (req, res) => {
  try {
    const { items } = await getUsRecommendations();
    res.json(await getUsLivePrices(items));
  } catch (err) {
    res.status(502).json({ error: err.message, prices: {}, signals: {}, scores: {} });
  }
});

// Manuel yenileme (ABD): önce YAYINLANAN veriyi okur, olmazsa canlı çekime
// düşer — /api/refresh (BIST) ile aynı davranış.
//
// Eskiden doğrudan refreshUs() çağırıyordu, yani yayınlanan JSON'u atlayıp
// Yahoo'dan canlı çekime gidiyordu. Bu ucun asıl işe yaradığı an, yayın turu
// yeni veri ürettiği ama sürecin 3 saatlik ABD senkronunun (US_REFRESH_
// INTERVAL_MINUTES) henüz gelmediği andır; tam o anda taze yayını atlayıp
// Render'ın throttle'lı IP'sinden 200 hisse çekmeye kalkıyordu — hem yavaş
// hem de yayından daha kötü veri. Yaşandı: 2026-08-21'de yayın 200 kaleme
// çıktı, süreç 168'de kaldı ve "manuel yenileme" bunu düzeltemiyordu.
app.post('/api/us-refresh', async (req, res) => {
  try {
    await syncUsData();
    const data = await getUsRecommendations();
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
  syncUsData().catch((err) => console.warn(`[start] ABD ilk veri yüklemesi başarısız: ${err.message}`));

  // Canlı gösterge tazelemesi için bar geçmişini arka planda doldur ve
  // periyodik olarak (yeni günlük barlar kapandıkça) tazele. Sunucuyu bloklamaz.
  refreshSeries().catch((err) => console.warn(`[live] Bar geçmişi doldurulamadı: ${err.message}`));
  const seriesCheck = Number(process.env.SERIES_CHECK_MINUTES ?? 15);
  if (seriesCheck > 0) {
    setInterval(() => {
      refreshSeries().catch((err) => console.warn(`[live] Bar geçmişi tazelenemedi: ${err.message}`));
    }, seriesCheck * 60 * 1000);
  }

  const minutes = Number(process.env.REFRESH_INTERVAL_MINUTES ?? 30);
  if (minutes > 0) {
    setInterval(() => {
      syncData().catch((err) => console.warn(`[cron] Veri senkronizasyonu başarısız: ${err.message}`));
    }, minutes * 60 * 1000);
    console.log(`[start] Otomatik veri senkronizasyonu her ${minutes} dakikada bir açık.`);
  }

  // ABD verisi (NASDAQ100+S&P100) günde 1 kez yayınlanıyor (refresh-us-data.yml);
  // BIST'ten daha seyrek tazelenmesi yeterli. Süreç yeniden başlamadan
  // getUsRecommendations() ilk çağrıdan sonra belleği hiç güncellemediği için
  // bu periyodik senkronizasyon olmadan yayınlanan yeni veri hiç görünmezdi.
  const usMinutes = Number(process.env.US_REFRESH_INTERVAL_MINUTES ?? 180);
  if (usMinutes > 0) {
    setInterval(() => {
      syncUsData().catch((err) => console.warn(`[cron] ABD veri senkronizasyonu başarısız: ${err.message}`));
    }, usMinutes * 60 * 1000);
    console.log(`[start] ABD veri senkronizasyonu her ${usMinutes} dakikada bir açık.`);
  }

  app.listen(PORT, () => console.log(`[start] Backend hazır: http://localhost:${PORT}`));
}

start();
