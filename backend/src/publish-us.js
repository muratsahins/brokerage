import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { computeUsRecommendations } from './service.js';

// GitHub Actions'ta çalışır: Yahoo'dan ABD (NASDAQ100+S&P100) verisini çeker,
// puanlar ve JSON'a yazar. publish.js'in ABD karşılığı.
// Kullanım: node src/publish-us.js <cikti-yolu>
const outPath = process.argv[2] || 'data/us-recommendations.json';

const items = await computeUsRecommendations();
const withReport = items.filter((x) => x.hasReport).length;

const payload = {
  updatedAt: new Date().toISOString(),
  source: 'github-actions',
  count: items.length,
  withReport,
  items,
};

await mkdir(path.dirname(outPath), { recursive: true });
await writeFile(outPath, JSON.stringify(payload, null, 2) + '\n', 'utf8');

console.log(`Yazıldı: ${outPath} — ${items.length} hisse, ${withReport} tanesinde analist raporu.`);
process.exit(0);
