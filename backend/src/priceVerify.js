// Fiyat doğrulama: yayınladığımız (Yahoo kaynaklı) canlı BIST fiyatlarını
// bağımsız ikinci bir kaynakla (Google Finance) periyodik olarak karşılaştırır.
// Amaç veri KAYNAĞI değiştirmek değil — Yahoo'nun ürettiği fiyatın makul olduğunu
// doğrulamak. Google Finance'ın hisse sayfaları sunucu tarafında render ediliyor
// (JS gerekmiyor), bu yüzden basit bir regex ile fiyat çekilebiliyor; resmi bir
// API değil ama Yahoo hattıyla aynı risk kategorisinde (ücretsiz, anahtarsız,
// kırılgan olabilir).
import { INSTRUMENTS } from './stocks.js';
import { peekLivePrices } from './dataSource.js';

const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
  '(KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36';
const QUOTE_URL = 'https://www.google.com/finance/quote';
// "TRY 301.00" gibi bir para birimi kodu + rakam. jsname="Pdsbrc" son fiyatın
// bulunduğu span; sayfa yapısı değişirse bu regex hiç eşleşmez ve doğrulama
// sessizce atlanır (aşağıda try/catch) — siteyi bozmaz, sadece rozet kaybolur.
const PRICE_RE = /<span jsname="Pdsbrc"[^>]*><span>[A-Z]{3}\s*([\d.,]+)<\/span>/;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function fetchGooglePrice(ticker) {
  const url = `${QUOTE_URL}/${encodeURIComponent(ticker)}:IST`;
  const res = await fetch(url, { headers: { 'User-Agent': UA }, signal: AbortSignal.timeout(10000) });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const html = await res.text();
  const m = html.match(PRICE_RE);
  if (!m) throw new Error('fiyat bulunamadı');
  const price = parseFloat(m[1].replace(/,/g, ''));
  if (!Number.isFinite(price) || price <= 0) throw new Error('geçersiz fiyat');
  return price;
}

// İki kaynak arasında bu yüzdeden fazla fark "uyuşmazlık" sayılır. Seans içi
// birkaç saniyelik kotasyon farkı ve yuvarlama payı bırakmak için gevşek
// tutuldu — amaç anlamlı sapmaları (yanlış sembol eşleşmesi, donmuş veri vb.)
// yakalamak, normal gürültüyü değil.
const MISMATCH_THRESHOLD_PCT = Number(process.env.PRICE_VERIFY_THRESHOLD_PCT ?? 2);
// İki istek arası bekleme — Google'ı kısa sürede çok sayıda istekle yormamak için.
const REQUEST_GAP_MS = 300;

let state = { checkedAt: null, thresholdPct: MISMATCH_THRESHOLD_PCT, checked: 0, mismatches: [], error: null };

// Son doğrulama sonucunu BEKLEMEDEN döner (yoksa ilk tur tamamlanana kadar null alanlarla).
export function peekVerification() {
  return state;
}

// BIST hisselerinin (kıymetli madenler hariç) canlı fiyatını Google Finance'la
// karşılaştırır. Yavaş bir tur (~104 istek × 300ms ≈ 30sn) olduğu için
// live-price döngüsünden (15-18 sn) AYRI, seyrek bir arka plan işi olarak
// çağrılmalı (bkz. server.js).
export async function verifyAllPrices() {
  const live = peekLivePrices()?.prices ?? {};
  const stocks = INSTRUMENTS.filter((i) => i.kind === 'stock');
  const mismatches = [];
  let checked = 0;

  for (const inst of stocks) {
    const ours = live[inst.ticker]?.price;
    if (ours == null) continue; // canlı fiyatımız yoksa karşılaştırılacak bir şey yok

    try {
      const ref = await fetchGooglePrice(inst.ticker);
      checked++;
      const diffPct = Math.round((Math.abs(ours - ref) / ref) * 10000) / 100;
      if (diffPct > MISMATCH_THRESHOLD_PCT) {
        mismatches.push({ ticker: inst.ticker, ours, ref, diffPct });
      }
    } catch (err) {
      // Tek sembolün doğrulanamaması normal (Google'ın geçici hatası, sembol
      // eşleşmemesi vb.) — turun geri kalanını etkilemez.
      console.warn(`[verify] ${inst.ticker} doğrulanamadı: ${err.message}`);
    }
    await sleep(REQUEST_GAP_MS);
  }

  state = {
    checkedAt: new Date().toISOString(),
    thresholdPct: MISMATCH_THRESHOLD_PCT,
    checked,
    mismatches,
    error: checked === 0 ? 'Doğrulama turu hiç sembol kontrol edemedi' : null,
  };
  if (mismatches.length) {
    console.warn(`[verify] ${mismatches.length}/${checked} hissede fiyat uyuşmazlığı (>${MISMATCH_THRESHOLD_PCT}%): ${mismatches.map((m) => m.ticker).join(', ')}`);
  }
  return state;
}
