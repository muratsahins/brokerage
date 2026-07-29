// Sanal borsa (paper trading): e-posta ile giriş, localStorage'da portföy.
// Gerçek para/işlem yok; fiyatlar sitedeki verilerden. Cihaza özeldir.
// Sanal Borsa sekmesi (App.jsx) ve grafik pop-up'ındaki AL/SAT (ChartModal.jsx)
// aynı portföyü kullandığı için ortak dosyada.
import { fmtNum } from './common.js';

export const VB_START = 100000; // başlangıç sanal bakiye (₺)

export function vbEmail() { try { return localStorage.getItem('vb_email') || ''; } catch { return ''; } }
export function vbLoad(email) {
  if (!email) return null;
  try { const raw = localStorage.getItem('vb_pf_' + email); return raw ? JSON.parse(raw) : { cash: VB_START, positions: {}, history: [] }; }
  catch { return { cash: VB_START, positions: {}, history: [] }; }
}
export function vbSave(email, pf) { try { localStorage.setItem('vb_pf_' + email, JSON.stringify(pf)); } catch { /* yoksay */ } }
export function vbUnitPrice(it) {
  if (!it) return null;
  if (it.kind === 'metal') return it.tryPerGram;
  if (it.kind === 'crypto') return it.tryPrice;
  return it.price;
}
export function vbUnitLabel(it) { return it && it.kind === 'metal' ? 'gr' : 'adet'; }

// Takip dışı bırakılan enstrümanlar (kripto). Sitede artık yoklar; sanal
// portföyde kalırlarsa fiyatsız görünür ve satılamazlar. Portföy açılırken
// MALİYET fiyatından tasfiye edilirler: kâr/zarar yaratmaz, para nakde döner.
// (BIST ticker'larıyla çakışma yok — kontrol edildi.) Başka bir enstrüman
// takipten çıkarsa ticker'ını buraya eklemek yeterli.
const VB_RETIRED = new Set([
  'BTC', 'ETH', 'USDT', 'BNB', 'USDC', 'XRP', 'SOL', 'TRX', 'WBT', 'HYPE', 'DOGE',
  'USDS', 'RAIN', 'LEO', 'ZEC', 'XMR', 'XLM', 'ADA', 'CC', 'DAI', 'BCH', 'USD1', 'GRAM',
  'USDE', 'LTC', 'USDG', 'HBAR', 'SHIB', 'SUI', 'AVAX', 'CRO', 'PYUSD', 'BUIDL', 'XAUT',
  'UNI', 'NEAR', 'USDY', 'ONDO', 'TAO', 'PAXG', 'OKB', 'WLFI', 'ASTER', 'HTX', 'RLUSD',
  'AAVE', 'USDD', 'USDF', 'DOT', 'MNT', 'SKY', 'BFUSD', 'WLD', 'MORPHO', 'BEAT', 'PEPE',
  'ICP', 'BGB', 'USDGO', 'ETC', 'STABLE', 'KCS', 'QNT', 'PI', 'ENA', 'JST', 'POL',
  'KAS', 'RENDER', 'ALGO', 'NEXO', 'ATOM', 'GT', 'BDX', 'GHO', 'VVV', 'JUP', 'FIL',
  'YLDS', 'LIT', 'XDC', 'FLR', 'USD0', 'ARB', 'APT', 'USX', 'TUSD', 'INJ',
]);

// Portföydeki takip dışı pozisyonları maliyet fiyatından tasfiye eder.
// Değişiklik yoksa portföyü olduğu gibi (aynı nesneyle) döner.
export function vbCleanRetired(pf) {
  const hit = Object.entries(pf.positions || {}).filter(([t]) => VB_RETIRED.has(t));
  if (hit.length === 0) return { pf, note: null };
  const positions = { ...pf.positions };
  const time = new Date().toISOString();
  const entries = [];
  let cash = pf.cash;
  for (const [t, p] of hit) {
    delete positions[t];
    cash += p.qty * p.avgCost;
    entries.push({ time, ticker: t, side: 'SAT', qty: p.qty, price: p.avgCost });
  }
  const refund = cash - pf.cash;
  return {
    pf: { ...pf, cash, positions, history: [...entries, ...(pf.history || [])].slice(0, 100) },
    note: `${hit.length} kripto pozisyonu (${hit.map(([t]) => t).join(', ')}) artık takip edilmediği için `
      + `maliyet fiyatından tasfiye edildi; ${fmtNum(refund)} ₺ nakde geçti.`,
  };
}
export function vbTrade(email, item, side, qtyRaw) {
  const pf = vbLoad(email);
  if (!pf) return { ok: false, msg: 'Önce Sanal Borsa sekmesinden e-posta ile giriş yap.' };
  const price = vbUnitPrice(item);
  const n = Number(qtyRaw);
  if (!item || price == null) return { ok: false, msg: 'Fiyat bulunamadı.' };
  if (!(n > 0)) return { ok: false, msg: 'Geçerli miktar gir.' };
  const cost = n * price;
  const t = item.ticker;
  const pos = pf.positions[t] || { qty: 0, avgCost: 0 };
  let next;
  if (side === 'buy') {
    if (cost > pf.cash + 1e-6) return { ok: false, msg: 'Yetersiz bakiye.' };
    const nq = pos.qty + n;
    next = { ...pf, cash: pf.cash - cost, positions: { ...pf.positions, [t]: { qty: nq, avgCost: (pos.qty * pos.avgCost + cost) / nq } }, history: [{ time: new Date().toISOString(), ticker: t, side: 'AL', qty: n, price }, ...pf.history].slice(0, 100) };
  } else {
    if (n > pos.qty + 1e-6) return { ok: false, msg: 'Elinde yeterli miktar yok.' };
    const nq = pos.qty - n;
    const positions = { ...pf.positions };
    if (nq <= 1e-6) delete positions[t]; else positions[t] = { qty: nq, avgCost: pos.avgCost };
    next = { ...pf, cash: pf.cash + cost, positions, history: [{ time: new Date().toISOString(), ticker: t, side: 'SAT', qty: n, price }, ...pf.history].slice(0, 100) };
  }
  vbSave(email, next);
  return { ok: true, msg: `${fmtNum(n)} ${vbUnitLabel(item)} ${t} ${side === 'buy' ? 'alındı' : 'satıldı'}.`, pf: next };
}
