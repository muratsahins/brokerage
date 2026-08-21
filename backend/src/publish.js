import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { computeRecommendations } from './service.js';
import { turuDogrula } from './publishGuard.js';

// GitHub Actions'ta çalışır: Yahoo'dan veriyi çeker, puanlar ve JSON'a yazar.
// Kullanım: node src/publish.js <cikti-yolu>
const outPath = process.argv[2] || 'data/recommendations.json';

const items = await computeRecommendations();
// Eksik/boş tur sağlam veriyi ezmesin: kıyas bir önceki yayınla yapılır ve
// eşiğin altında kalırsa dosyaya HİÇ dokunulmaz (bkz. publishGuard.js).
const { onceki } = await turuDogrula(outPath, items);
const withAnalyst = items.filter((x) => x.upside12m != null).length;

const payload = {
  updatedAt: new Date().toISOString(),
  source: 'github-actions',
  count: items.length,
  withAnalyst,
  items,
};

await mkdir(path.dirname(outPath), { recursive: true });
await writeFile(outPath, JSON.stringify(payload, null, 2) + '\n', 'utf8');

console.log(`Yazıldı: ${outPath} — ${items.length} hisse (önceki yayın: ${onceki ?? '—'}), ${withAnalyst} tanesinde analist verisi.`);
process.exit(0);
