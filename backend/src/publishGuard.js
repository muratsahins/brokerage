import { readFile } from 'node:fs/promises';

// Eksik bir çekim turunun SAĞLAM yayınlanan veriyi ezmesini engeller.
//
// Neden gerekli: publish.js / publish-us.js, Yahoo'dan ne geldiyse onu yazıp
// commit'liyordu. fetchQuotes/fetchUsQuotes başarısız enstrümanı sessizce
// atladığı için, Yahoo veri merkezi IP'sini throttle ettiği bir turda dosya
// 169 yerine 20 kalemle (crumb hiç alınamadıysa 0 kalemle) yazılabiliyordu.
// Sonuç: site bir sonraki tura kadar (BIST'te 3 saat, ABD'de 1 gün) yarım
// listeyle — ya da hiç veri olmadan — kalırdı.
//
// Canlı fiyat hattında bu koruma ZATEN var (dataSource.js LIVE_MIN_ORAN:
// "Fiyat turu eksik geldi; önbellek korunuyor"). Yayın hattı aynı korumadan
// yoksundu; buradaki eşik onun karşılığı.
//
// Davranış: tur eksikse dosya YAZILMAZ ve hata fırlatılır — iş akışı kırmızıya
// düşer, eldeki yayınlanan veri olduğu gibi kalır ve bir sonraki tur yeniden
// dener. Sessizce yarım veri yayınlamaktansa gürültülü başarısız olmak yeğdir.
const VARSAYILAN_ORAN = Number(process.env.PUBLISH_MIN_RATIO ?? 0.8);

// Bir önceki yayının kalem sayısı. Dosya yoksa/bozuksa null (ilk yayın).
async function oncekiSayi(outPath) {
  try {
    const json = JSON.parse(await readFile(outPath, 'utf8'));
    return Array.isArray(json.items) ? json.items.length : null;
  } catch {
    return null; // ilk yayın ya da okunamayan dosya — kıyas yapılamaz
  }
}

export async function turuDogrula(outPath, items, minOran = VARSAYILAN_ORAN) {
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error(
      'Çekim turu BOŞ döndü — yayınlanan veri korunuyor. '
      + '(Yahoo oturumu/crumb alınamamış olabilir; bir sonraki tur yeniden dener.)',
    );
  }
  const onceki = await oncekiSayi(outPath);
  if (onceki != null && items.length < onceki * minOran) {
    throw new Error(
      `Çekim turu eksik geldi (${items.length}/${onceki} kalem, eşik %${Math.round(minOran * 100)}) `
      + '— yayınlanan veri korunuyor. Eşik PUBLISH_MIN_RATIO ile değiştirilebilir.',
    );
  }
  return { onceki, yeni: items.length };
}
