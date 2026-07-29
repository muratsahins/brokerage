// Tabloyu ilk boyamada backend'i beklemeden gösterebilmek için, repoda
// yayınlanmış veriyi (data/recommendations.json — GitHub Actions 3 saatte bir
// tazeliyor) build çıktısına statik tohum olarak kopyalar.
//
// Kazanç: seed.json Vercel'in CDN'inden ~50 ms'de gelir, oysa Render'daki
// /api/recommendations sıcakken ~1 sn, uykudayken 30-60 sn sürüyor. Tablo hemen
// çıkar; gerçek API yanıtı gelince üstüne yazılır (App.jsx > loadSeed).
//
// Tohum en fazla bir deploy kadar bayat olabilir; fiyat/gösterge/puan zaten
// birkaç saniye içinde /api/prices ile canlıya çekiliyor, bayat kalabilecek tek
// şey analist hedefi gibi yavaş değişen alanlar.
import { copyFileSync, existsSync, mkdirSync, statSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const src = resolve(here, '../../data/recommendations.json');
const dest = resolve(here, '../public/seed.json');

// Dosya yoksa (ör. yalnızca frontend klasörü çekilmişse) derlemeyi kırma:
// uygulama tohumsuz da çalışır, sadece ilk boyama API'yi bekler.
if (!existsSync(src)) {
  console.warn(`[seed] ${src} bulunamadı — tohum verisi olmadan derleniyor.`);
  process.exit(0);
}

mkdirSync(dirname(dest), { recursive: true });
copyFileSync(src, dest);
console.log(`[seed] public/seed.json yazıldı (${Math.round(statSync(dest).size / 1024)} KB).`);
