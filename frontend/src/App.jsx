import { useEffect, useState, useMemo, useRef } from 'react';
import { createChart } from 'lightweight-charts';

// --- Gösterge hesaplayıcıları (kapanışlardan) --------------------------------
function emaArr(vals, period) {
  const k = 2 / (period + 1);
  const out = new Array(vals.length).fill(null);
  let prev = null;
  for (let i = 0; i < vals.length; i++) {
    if (vals[i] == null) continue;
    prev = prev == null ? vals[i] : vals[i] * k + prev * (1 - k);
    out[i] = prev;
  }
  return out;
}
function computeRSI(closes, period = 14) {
  const out = new Array(closes.length).fill(null);
  if (closes.length <= period) return out;
  let gain = 0, loss = 0;
  for (let i = 1; i <= period; i++) {
    const ch = closes[i] - closes[i - 1];
    if (ch >= 0) gain += ch; else loss -= ch;
  }
  let ag = gain / period, al = loss / period;
  out[period] = al === 0 ? 100 : 100 - 100 / (1 + ag / al);
  for (let i = period + 1; i < closes.length; i++) {
    const ch = closes[i] - closes[i - 1];
    ag = (ag * (period - 1) + (ch > 0 ? ch : 0)) / period;
    al = (al * (period - 1) + (ch < 0 ? -ch : 0)) / period;
    out[i] = al === 0 ? 100 : 100 - 100 / (1 + ag / al);
  }
  return out;
}
function computeMACD(closes, fast = 12, slow = 26, sig = 9) {
  const ef = emaArr(closes, fast);
  const es = emaArr(closes, slow);
  const macd = closes.map((_, i) => (ef[i] != null && es[i] != null && i >= slow - 1) ? ef[i] - es[i] : null);
  const signal = emaArr(macd, sig);
  const hist = macd.map((v, i) => (v != null && signal[i] != null) ? v - signal[i] : null);
  return { macd, signal, hist };
}

// Grafik pop-up'ı: kendi Yahoo OHLC verimizi (backend /api/chart) Lightweight
// Charts (açık kaynak, ücretsiz) ile çizer — mum + hacim, altında RSI ve MACD
// panelleri (zaman eksenleri senkron). TradingView embed'i BIST verisini
// göstermediği için harici widget yerine kendi grafiğimizi çiziyoruz.
function ChartModal({ item, onClose }) {
  const priceRef = useRef(null);
  const rsiRef = useRef(null);
  const macdRef = useRef(null);
  const [status, setStatus] = useState('loading'); // loading | ok | error

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    let charts = [];
    let cancelled = false;

    const G = '#20242d', BORDER = '#262a33', UP = '#4ade80', DOWN = '#f87171';
    const base = {
      autoSize: true,
      layout: { background: { color: '#171a21' }, textColor: '#8b93a1' },
      grid: { vertLines: { color: G }, horzLines: { color: G } },
      rightPriceScale: { borderColor: BORDER, minimumWidth: 60 },
      crosshair: { horzLine: { labelVisible: false } },
    };

    (async () => {
      try {
        const res = await fetch(`${API_BASE}/api/chart?ticker=${encodeURIComponent(item.ticker)}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (cancelled || !priceRef.current) return;
        const candles = data.candles || [];
        if (candles.length === 0) throw new Error('boş veri');
        setStatus('ok');
        const closes = candles.map((c) => c.close);

        // --- Fiyat + hacim ---
        const priceChart = createChart(priceRef.current, { ...base, timeScale: { visible: false, borderColor: BORDER } });
        const candleSeries = priceChart.addCandlestickSeries({ upColor: UP, downColor: DOWN, wickUpColor: UP, wickDownColor: DOWN, borderVisible: false });
        candleSeries.setData(candles);
        const volSeries = priceChart.addHistogramSeries({ priceFormat: { type: 'volume' }, priceScaleId: '' });
        volSeries.priceScale().applyOptions({ scaleMargins: { top: 0.82, bottom: 0 } });
        volSeries.setData(candles.map((c) => ({ time: c.time, value: c.volume, color: c.close >= c.open ? 'rgba(74,222,128,0.4)' : 'rgba(248,113,113,0.4)' })));

        // --- RSI 14 (0..100, 30/70 çizgileri) ---
        const rsi = computeRSI(closes);
        const rsiChart = createChart(rsiRef.current, { ...base, timeScale: { visible: false, borderColor: BORDER } });
        const rsiSeries = rsiChart.addLineSeries({ color: '#c084fc', lineWidth: 2, priceLineVisible: false, autoscaleInfoProvider: () => ({ priceRange: { minValue: 0, maxValue: 100 } }) });
        rsiSeries.setData(candles.map((c, i) => ({ time: c.time, value: rsi[i] })).filter((d) => d.value != null));
        rsiSeries.createPriceLine({ price: 70, color: 'rgba(248,113,113,0.6)', lineWidth: 1, lineStyle: 2 });
        rsiSeries.createPriceLine({ price: 30, color: 'rgba(74,222,128,0.6)', lineWidth: 1, lineStyle: 2 });

        // --- MACD 12/26/9 ---
        const { macd, signal, hist } = computeMACD(closes);
        const macdChart = createChart(macdRef.current, { ...base, timeScale: { visible: true, borderColor: BORDER } });
        const histSeries = macdChart.addHistogramSeries({ priceLineVisible: false });
        histSeries.setData(candles.map((c, i) => ({ time: c.time, value: hist[i], color: hist[i] >= 0 ? 'rgba(74,222,128,0.55)' : 'rgba(248,113,113,0.55)' })).filter((d) => d.value != null));
        const macdLine = macdChart.addLineSeries({ color: '#60a5fa', lineWidth: 1, priceLineVisible: false, lastValueVisible: false });
        macdLine.setData(candles.map((c, i) => ({ time: c.time, value: macd[i] })).filter((d) => d.value != null));
        const sigLine = macdChart.addLineSeries({ color: '#fbbf24', lineWidth: 1, priceLineVisible: false, lastValueVisible: false });
        sigLine.setData(candles.map((c, i) => ({ time: c.time, value: signal[i] })).filter((d) => d.value != null));

        // --- Zaman eksenlerini senkronla ---
        charts = [priceChart, rsiChart, macdChart];
        let syncing = false;
        charts.forEach((src) => {
          src.timeScale().subscribeVisibleLogicalRangeChange((range) => {
            if (!range || syncing) return;
            syncing = true;
            charts.forEach((c) => { if (c !== src) c.timeScale().setVisibleLogicalRange(range); });
            syncing = false;
          });
        });
        priceChart.timeScale().fitContent();
      } catch {
        if (!cancelled) setStatus('error');
      }
    })();

    return () => {
      cancelled = true;
      document.removeEventListener('keydown', onKey);
      charts.forEach((c) => { try { c.remove(); } catch { /* yoksay */ } });
    };
  }, [item, onClose]);

  const cur = item.currency || (item.kind === 'metal' ? 'USD' : 'TRY');
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <div className="modal-title">
            <span className="modal-ticker">{item.ticker} · {fmtNum(item.price)} {cur}</span>
            <span className="modal-name">{item.name}{item.sector ? ` · ${item.sector}` : ''} · son 1 yıl (günlük)</span>
          </div>
          <button className="modal-close" onClick={onClose} aria-label="Kapat">✕</button>
        </div>
        <div className="modal-chart">
          <div className="chart-panes">
            <div className="pane" style={{ flex: 3 }} ref={priceRef}><span className="pane-label">Fiyat · Hacim</span></div>
            <div className="pane" style={{ flex: 1.4 }} ref={rsiRef}><span className="pane-label">RSI 14</span></div>
            <div className="pane" style={{ flex: 1.7 }} ref={macdRef}><span className="pane-label">MACD 12/26/9</span></div>
          </div>
          {status !== 'ok' && (
            <div className="chart-state">
              {status === 'loading' ? 'Grafik yükleniyor…' : 'Grafik verisi alınamadı.'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Canlıda backend ayrı bir origin'de (Render). VITE_API_URL ile verilir.
// Dev'de boş kalır → '/api...' Vite proxy üzerinden backend'e gider.
const API_BASE = import.meta.env.VITE_API_URL || '';

const SIGNAL_STYLES = {
  AL: { label: 'AL', bg: '#0f5132', fg: '#4ade80' },
  TUT: { label: 'TUT', bg: '#665200', fg: '#fbbf24' },
  'İZLE': { label: 'İZLE', bg: '#3a3a3a', fg: '#cbd5e1' },
};

function fmtNum(x, digits = 2) {
  if (x == null || Number.isNaN(x)) return '—';
  return Number(x).toLocaleString('tr-TR', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}

// Türkçe karakter duyarsız normalleştirme (arama için): "Şişecam" -> "sisecam".
function norm(s) {
  return (s || '')
    .replace(/[İIı]/g, 'i')
    .replace(/[Şş]/g, 's')
    .replace(/[Ğğ]/g, 'g')
    .replace(/[Üü]/g, 'u')
    .replace(/[Öö]/g, 'o')
    .replace(/[Çç]/g, 'c')
    .toLowerCase();
}

function Pct({ value, strong }) {
  if (value == null) return <span className="muted-dash">—</span>;
  const up = value >= 0;
  return (
    <span style={{
      color: up ? '#4ade80' : '#f87171',
      fontVariantNumeric: 'tabular-nums',
      fontWeight: strong ? 700 : 400,
    }}>
      {up ? '▲' : '▼'} %{fmtNum(Math.abs(value))}
    </span>
  );
}

// Analist beklentisine dayalı ileriye dönük getiri hücresi
function Expected({ value, note }) {
  if (value == null) {
    return (
      <div className="exp">
        <span className="muted-dash">—</span>
        <div className="exp-note">analist yok</div>
      </div>
    );
  }
  return (
    <div className="exp">
      <Pct value={value} strong />
      {note && <div className="exp-note">{note}</div>}
    </div>
  );
}

// WaveTrend / Supertrend gibi teknik göstergelerin AL/SAT sinyali
function IndicatorBadge({ signal }) {
  if (!signal) return <span className="muted-dash">—</span>;
  const buy = signal === 'AL';
  return (
    <span style={{
      background: buy ? '#0f5132' : '#5b1a1a',
      color: buy ? '#4ade80' : '#f87171',
      padding: '3px 10px', borderRadius: 999,
      fontSize: 12, fontWeight: 700, letterSpacing: 0.5,
    }}>
      {signal}
    </span>
  );
}

function SignalBadge({ signal }) {
  const s = SIGNAL_STYLES[signal] ?? SIGNAL_STYLES['İZLE'];
  return (
    <span style={{
      background: s.bg, color: s.fg, padding: '3px 10px', borderRadius: 999,
      fontSize: 12, fontWeight: 700, letterSpacing: 0.5,
    }}>
      {s.label}
    </span>
  );
}

function ScoreBar({ score }) {
  const pct = Math.max(0, Math.min(100, score ?? 0));
  const color = pct >= 65 ? '#4ade80' : pct >= 45 ? '#fbbf24' : '#64748b';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{ flex: 1, height: 6, background: '#2a2a2a', borderRadius: 4, minWidth: 60 }}>
        <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 4 }} />
      </div>
      <span style={{ fontVariantNumeric: 'tabular-nums', width: 26, textAlign: 'right' }}>{pct}</span>
    </div>
  );
}

function fmtNewsTime(ts) {
  if (!ts) return '';
  const diff = Date.now() - ts;
  if (diff < 3600000) return `${Math.max(1, Math.floor(diff / 60000))} dk önce`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)} saat önce`;
  return new Date(ts).toLocaleDateString('tr-TR');
}

// Haberler / KAP sekmesi içeriği: backend'den çeker, liste olarak gösterir.
function NewsList({ kind }) {
  const [state, setState] = useState({ loading: true, items: [], ok: true });
  const [cat, setCat] = useState('ALL');

  useEffect(() => {
    let cancelled = false;
    setState({ loading: true, items: [], ok: true });
    setCat('ALL');
    fetch(`${API_BASE}/api/${kind}`)
      .then((r) => r.json())
      .then((d) => { if (!cancelled) setState({ loading: false, items: d.items || [], ok: d.ok !== false }); })
      .catch(() => { if (!cancelled) setState({ loading: false, items: [], ok: false }); });
    return () => { cancelled = true; };
  }, [kind]);

  if (state.loading) return <div className="state">Yükleniyor… (ilk açılışta backend uyanması birkaç saniye sürebilir)</div>;
  if (kind === 'kap' && !state.ok && state.items.length === 0)
    return <div className="state">KAP bildirimleri şu an alınamadı. Birazdan tekrar deneyin.</div>;
  if (state.items.length === 0) return <div className="state">İçerik bulunamadı.</div>;

  const cats = ['ALL', 'Hisse', 'Kıymetli Maden', 'Öneri', 'Ekonomi'];
  const items = (kind === 'news' && cat !== 'ALL') ? state.items.filter((i) => i.category === cat) : state.items;

  return (
    <>
      {kind === 'news' && (
        <div className="filters">
          {cats.map((c) => (
            <button key={c} className={`filter ${cat === c ? 'active' : ''}`} onClick={() => setCat(c)}>
              {c === 'ALL' ? 'Tümü' : c}
            </button>
          ))}
        </div>
      )}
      <div className="news-list">
        {items.map((n, i) => (
          <a key={i} className="news-item" href={n.link} target="_blank" rel="noopener noreferrer">
            <div className="news-top">
              <span className="news-catwrap">
                {n.ticker && <span className="news-ticker">{n.ticker}</span>}
                <span className="news-cat">{n.category}</span>
              </span>
              <span className="news-time">{fmtNewsTime(n.ts)}</span>
            </div>
            <div className="news-title">{n.title}</div>
            {n.summary && <div className="news-summary">{n.summary}</div>}
            <div className="news-src">{n.source}</div>
          </a>
        ))}
      </div>
    </>
  );
}

// Sanal borsa (paper trading): e-posta ile giriş, localStorage'da portföy.
// Gerçek para/işlem yok; fiyatlar sitedeki verilerden. Cihaza özeldir.
const VB_START = 100000; // başlangıç sanal bakiye (₺)
function VirtualTrade({ items }) {
  const [email, setEmail] = useState(() => { try { return localStorage.getItem('vb_email') || ''; } catch { return ''; } });
  const [emailInput, setEmailInput] = useState('');
  const [pf, setPf] = useState(null);
  const [q, setQ] = useState('');
  const [sel, setSel] = useState('');
  const [qty, setQty] = useState('');
  const [msg, setMsg] = useState(null);

  const byTicker = useMemo(() => new Map(items.map((i) => [i.ticker, i])), [items]);
  const unitPrice = (it) => (it ? (it.kind === 'metal' ? it.tryPerGram : it.price) : null);
  const unitLabel = (it) => (it && it.kind === 'metal' ? 'gr' : 'adet');

  useEffect(() => {
    if (!email) { setPf(null); return; }
    let p = null;
    try { const raw = localStorage.getItem('vb_pf_' + email); p = raw ? JSON.parse(raw) : null; } catch { p = null; }
    setPf(p || { cash: VB_START, positions: {}, history: [] });
  }, [email]);

  function persist(next) { setPf(next); try { localStorage.setItem('vb_pf_' + email, JSON.stringify(next)); } catch { /* yoksay */ } }
  function login(e) {
    e.preventDefault();
    const em = emailInput.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em)) { setMsg({ t: 'err', m: 'Geçerli bir e-posta girin.' }); return; }
    try { localStorage.setItem('vb_email', em); } catch { /* */ }
    setEmail(em); setMsg(null);
  }
  function logout() { try { localStorage.removeItem('vb_email'); } catch { /* */ } setEmail(''); setEmailInput(''); setSel(''); setQ(''); }
  function reset() {
    if (!window.confirm('Portföyü sıfırlamak istediğine emin misin?')) return;
    persist({ cash: VB_START, positions: {}, history: [] });
    setMsg({ t: 'ok', m: 'Portföy sıfırlandı.' });
  }
  function trade(side) {
    const it = byTicker.get(sel); const price = unitPrice(it); const n = Number(qty);
    if (!it || price == null) { setMsg({ t: 'err', m: 'Önce bir enstrüman seç.' }); return; }
    if (!(n > 0)) { setMsg({ t: 'err', m: 'Geçerli miktar gir.' }); return; }
    const cost = n * price;
    const pos = pf.positions[sel] || { qty: 0, avgCost: 0 };
    if (side === 'buy') {
      if (cost > pf.cash + 1e-6) { setMsg({ t: 'err', m: 'Yetersiz bakiye.' }); return; }
      const nqp = pos.qty + n;
      const positions = { ...pf.positions, [sel]: { qty: nqp, avgCost: (pos.qty * pos.avgCost + cost) / nqp } };
      persist({ cash: pf.cash - cost, positions, history: [{ time: new Date().toISOString(), ticker: sel, side: 'AL', qty: n, price }, ...pf.history].slice(0, 100) });
      setMsg({ t: 'ok', m: `${fmtNum(n)} ${unitLabel(it)} ${sel} alındı.` });
    } else {
      if (n > pos.qty + 1e-6) { setMsg({ t: 'err', m: 'Elinde yeterli miktar yok.' }); return; }
      const nqp = pos.qty - n;
      const positions = { ...pf.positions };
      if (nqp <= 1e-6) delete positions[sel]; else positions[sel] = { qty: nqp, avgCost: pos.avgCost };
      persist({ cash: pf.cash + cost, positions, history: [{ time: new Date().toISOString(), ticker: sel, side: 'SAT', qty: n, price }, ...pf.history].slice(0, 100) });
      setMsg({ t: 'ok', m: `${fmtNum(n)} ${unitLabel(it)} ${sel} satıldı.` });
    }
    setQty('');
  }

  if (!email) {
    return (
      <div className="vb-login">
        <p className="subtitle">E-posta ile giriş yap; <strong>{fmtNum(VB_START)} ₺</strong> sanal bakiye ile başla. (Gerçek para/işlem değildir.)</p>
        <form onSubmit={login} className="vb-loginform">
          <input className="search-input vb-emailin" type="email" placeholder="e-posta adresin" value={emailInput} onChange={(e) => setEmailInput(e.target.value)} />
          <button className="refresh-btn" type="submit">Giriş</button>
        </form>
        {msg && <div className={`vb-msg ${msg.t}`}>{msg.m}</div>}
      </div>
    );
  }
  if (!pf) return <div className="state">Yükleniyor…</div>;

  const posList = Object.entries(pf.positions).map(([t, p]) => {
    const it = byTicker.get(t); const price = unitPrice(it);
    const value = p.qty * (price != null ? price : p.avgCost);
    const cost = p.qty * p.avgCost;
    return { t, it, qty: p.qty, avgCost: p.avgCost, price, value, pnl: value - cost, pnlPct: cost ? (value - cost) / cost * 100 : 0 };
  }).sort((a, b) => b.value - a.value);
  const holdings = posList.reduce((s, p) => s + p.value, 0);
  const total = pf.cash + holdings;
  const totalPnl = total - VB_START;

  const nq = norm(q.trim());
  const results = nq ? items.filter((i) => (i.kind === 'stock' || i.kind === 'metal') && unitPrice(i) != null && (norm(i.ticker).includes(nq) || norm(i.name).includes(nq))).slice(0, 8) : [];
  const selIt = byTicker.get(sel);

  return (
    <div className="vb">
      <div className="vb-user">{email} · <button className="vb-link" onClick={logout}>çıkış</button> · <button className="vb-link" onClick={reset}>sıfırla</button></div>
      <div className="vb-summary">
        <div className="vb-stat"><span className="metric-label">Toplam Değer</span><span className="vb-big">{fmtNum(total)} ₺</span></div>
        <div className="vb-stat"><span className="metric-label">Nakit</span><span>{fmtNum(pf.cash)} ₺</span></div>
        <div className="vb-stat"><span className="metric-label">Kâr / Zarar</span><span style={{ color: totalPnl >= 0 ? '#4ade80' : '#f87171' }}>{totalPnl >= 0 ? '+' : ''}{fmtNum(totalPnl)} ₺ · %{fmtNum(totalPnl / VB_START * 100)}</span></div>
      </div>

      <div className="vb-trade">
        <input className="search-input vb-search" placeholder="Al/sat için hisse veya maden ara (ör. GARAN, altın)" value={q} onChange={(e) => setQ(e.target.value)} />
        {results.length > 0 && (
          <div className="vb-results">
            {results.map((i) => (
              <button key={i.ticker} className="vb-result" onClick={() => { setSel(i.ticker); setQ(''); }}>
                <span><strong>{i.ticker}</strong> · {i.name}</span>
                <span>{fmtNum(unitPrice(i))} ₺/{unitLabel(i)}</span>
              </button>
            ))}
          </div>
        )}
        {selIt && (
          <div className="vb-order">
            <div className="vb-orderhead">{selIt.ticker} · {selIt.name} — <strong>{fmtNum(unitPrice(selIt))} ₺</strong>/{unitLabel(selIt)}</div>
            <div className="vb-orderrow">
              <input className="search-input" type="number" min="0" step="any" placeholder={`miktar (${unitLabel(selIt)})`} value={qty} onChange={(e) => setQty(e.target.value)} />
              <button className="vb-buy" onClick={() => trade('buy')}>AL</button>
              <button className="vb-sell" onClick={() => trade('sell')}>SAT</button>
            </div>
            {Number(qty) > 0 && <div className="exp-note">Tutar: {fmtNum(Number(qty) * unitPrice(selIt))} ₺</div>}
          </div>
        )}
        {msg && <div className={`vb-msg ${msg.t}`}>{msg.m}</div>}
      </div>

      <div className="vb-section">Portföy ({posList.length})</div>
      {posList.length === 0 ? (
        <div className="state">Henüz pozisyon yok. Yukarıdan arayıp AL ile başla.</div>
      ) : (
        <div className="news-list">
          {posList.map((p) => (
            <div key={p.t} className="vb-pos" onClick={() => { setSel(p.t); setQty(String(p.qty)); }}>
              <div className="vb-posmain">
                <div><strong>{p.t}</strong> <span className="name">{p.it?.name}</span></div>
                <div className="vb-posval">{fmtNum(p.value)} ₺</div>
              </div>
              <div className="vb-posdetail">
                {fmtNum(p.qty)} {unitLabel(p.it)} · maliyet {fmtNum(p.avgCost)} ₺ · fiyat {fmtNum(p.price)} ₺
                <span style={{ color: p.pnl >= 0 ? '#4ade80' : '#f87171', marginLeft: 8 }}>{p.pnl >= 0 ? '+' : ''}{fmtNum(p.pnl)} ₺ (%{fmtNum(p.pnlPct)})</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {pf.history.length > 0 && (
        <>
          <div className="vb-section">İşlem Geçmişi</div>
          <div className="vb-history">
            {pf.history.slice(0, 20).map((h, i) => (
              <div key={i} className="vb-hrow">
                <span className={h.side === 'AL' ? 'vb-al' : 'vb-sat'}>{h.side}</span>
                <span className="ticker">{h.ticker}</span>
                <span>{fmtNum(h.qty)} × {fmtNum(h.price)} ₺</span>
                <span className="news-time">{new Date(h.time).toLocaleDateString('tr-TR')}</span>
              </div>
            ))}
          </div>
        </>
      )}

      <p className="disclaimer" style={{ marginTop: 16 }}>
        ⚠️ Sanal borsa — <strong>gerçek para değildir</strong>, gerçek işlem yapılmaz. Fiyatlar sitedeki
        (gecikmeli) verilerdir. Portföy bu tarayıcıda saklanır (cihaza özel, güvenli giriş değildir).
      </p>
    </div>
  );
}

export default function App() {
  const [data, setData] = useState({ items: [], updatedAt: null, source: null });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('ALL');
  const [tab, setTab] = useState('bist30');
  const [query, setQuery] = useState('');
  const [chartItem, setChartItem] = useState(null); // grafik pop-up'ı için seçili enstrüman
  // Görünüm: 'mobile' (kart, yatay scroll yok) | 'web' (tam tablo).
  const [view, setView] = useState(() => {
    try { return localStorage.getItem('viewMode') || (window.innerWidth <= 640 ? 'mobile' : 'web'); }
    catch { return 'web'; }
  });

  async function load() {
    try {
      setError(null);
      const res = await fetch(`${API_BASE}/api/recommendations`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setData(json);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function triggerRefresh() {
    setRefreshing(true);
    try {
      await fetch(`${API_BASE}/api/refresh`, { method: 'POST' });
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setRefreshing(false);
    }
  }

  // İlk yükleme + kendini yenileme: her 5 dakikada bir ve sekmeye geri dönünce
  // arka planda sessizce yeniden çeker (spinner göstermeden).
  useEffect(() => {
    load();
    const id = setInterval(load, 5 * 60 * 1000);
    const onFocus = () => { if (document.visibilityState === 'visible') load(); };
    document.addEventListener('visibilitychange', onFocus);
    window.addEventListener('focus', onFocus);
    return () => {
      clearInterval(id);
      document.removeEventListener('visibilitychange', onFocus);
      window.removeEventListener('focus', onFocus);
    };
  }, []);

  // Sekmeler: BIST 30/50/100 iç içe (30⊂50⊂100) + ayrı Kıymetli Maden sekmesi.
  const TABS = [
    { key: 'all',     label: 'BIST',           match: (i) => i.kind === 'stock' },
    { key: 'bist30',  label: 'BIST 30',        match: (i) => i.bist != null && i.bist <= 30 },
    { key: 'bist50',  label: 'BIST 50',        match: (i) => i.bist != null && i.bist <= 50 },
    { key: 'bist100', label: 'BIST 100',       match: (i) => i.bist != null && i.bist <= 100 },
    { key: 'metal',   label: 'Kıymetli Maden', match: (i) => i.kind === 'metal' },
  ];
  const NEWS_TABS = [
    { key: 'news', label: '📰 Haberler', news: 'news' },
    { key: 'kap',  label: '📋 KAP',      news: 'kap' },
  ];
  // Favori listesi: 5 teknik koşulu birden sağlayan hisseler.
  const FAV_TAB = {
    key: 'fav',
    label: '⭐ Favori Listesi',
    match: (i) => i.kind === 'stock'
      && i.wtSignal === 'AL' && i.wtCrossSignal === 'AL' && i.stSignal === 'AL'
      && (i.recommendationKey === 'buy' || i.recommendationKey === 'strong_buy'),
  };
  // SMC (Smart Money Concept) yükseliş: likidite süpürme + yapı kırılımı.
  const SMC_TAB = {
    key: 'smc',
    label: '🎯 SMC',
    match: (i) => i.kind === 'stock' && i.smc === true,
  };
  const TRADE_TAB = { key: 'trade', label: '💼 Sanal Borsa' };
  const activeTab = [...TABS, FAV_TAB, SMC_TAB, TRADE_TAB, ...NEWS_TABS].find((t) => t.key === tab) ?? TABS[0];
  const isNews = !!activeTab.news;

  // Önce aktif sekmeye göre, sonra sinyale göre süz.
  const inTab = useMemo(
    () => (activeTab.match ? data.items.filter(activeTab.match) : []),
    [data.items, tab],
  );

  // Arama varsa TÜM enstrümanlarda (sekmeden bağımsız), yoksa aktif sekmede süz.
  const searching = query.trim().length > 0;
  const items = useMemo(() => {
    const nq = norm(query.trim());
    let list = nq
      ? data.items.filter((i) =>
          norm(i.ticker).includes(nq) || norm(i.name).includes(nq) || norm(i.sector).includes(nq))
      : inTab;
    if (filter !== 'ALL') list = list.filter((i) => i.signal === filter);
    return list;
  }, [data.items, inTab, query, filter]);

  // Alış/Satış sütunları: görünen listede kıymetli maden varsa göster.
  const showBuySell = items.some((s) => s.kind === 'metal');

  useEffect(() => { try { localStorage.setItem('viewMode', view); } catch { /* yoksay */ } }, [view]);

  return (
    <div className="page">
      <header className="header">
        <div>
          <h1>📈 BIST Hisse Önerileri</h1>
          <p className="subtitle">
            {tab === 'trade'
              ? 'Sanal borsa · e-posta ile giriş, sanal alım-satım (gerçek para değildir)'
              : isNews
              ? (activeTab.news === 'kap' ? 'KAP bildirimleri · yatırımcı diline özet' : 'Piyasa, kıymetli maden ve analist önerisi haberleri')
              : <>Analist hedef fiyatı + temel verilere dayalı beklenen getiri · {searching ? `“${query.trim()}” için ${items.length} sonuç` : `${inTab.length} kayıt`}
                {data.source && <> · kaynak: {data.source === 'postgres' ? 'PostgreSQL' : 'bellek'}</>}</>}
          </p>
        </div>
        <div className="header-actions">
          <div className="view-toggle" role="group" aria-label="Görünüm">
            <button
              className={view === 'mobile' ? 'active' : ''}
              onClick={() => setView('mobile')}
            >
              📱 Mobil
            </button>
            <button
              className={view === 'web' ? 'active' : ''}
              onClick={() => setView('web')}
            >
              🖥 Web
            </button>
          </div>
          <button className="refresh-btn" onClick={triggerRefresh} disabled={refreshing}>
            {refreshing ? 'Yenileniyor…' : '↻ Yenile'}
          </button>
        </div>
      </header>

      <div className="news-nav">
        {NEWS_TABS.map((t) => (
          <button
            key={t.key}
            className={`news-tab ${tab === t.key ? 'active' : ''}`}
            onClick={() => setTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="news-nav">
        <button
          className={`news-tab fav-tab ${tab === 'fav' ? 'active' : ''}`}
          onClick={() => setTab('fav')}
        >
          {FAV_TAB.label}
        </button>
        <button
          className={`news-tab smc-tab ${tab === 'smc' ? 'active' : ''}`}
          onClick={() => setTab('smc')}
        >
          {SMC_TAB.label}
        </button>
        <button
          className={`news-tab trade-tab ${tab === 'trade' ? 'active' : ''}`}
          onClick={() => setTab('trade')}
        >
          {TRADE_TAB.label}
        </button>
      </div>

      <div className="tabs">
        {TABS.map((t) => (
          <button
            key={t.key}
            className={`tab ${tab === t.key ? 'active' : ''}`}
            onClick={() => setTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {isNews ? (
        <NewsList kind={activeTab.news} />
      ) : tab === 'trade' ? (
        <VirtualTrade items={data.items} />
      ) : (
      <>
      <div className="search">
        <span className="search-icon">🔎</span>
        <input
          className="search-input"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Hisse veya kıymetli maden ara… (ör. GARAN, altın, banka)"
          aria-label="Ara"
        />
        {query && (
          <button className="search-clear" onClick={() => setQuery('')} aria-label="Aramayı temizle">✕</button>
        )}
      </div>

      <div className="filters">
        {['ALL', 'AL', 'TUT', 'İZLE'].map((f) => (
          <button
            key={f}
            className={`filter ${filter === f ? 'active' : ''}`}
            onClick={() => setFilter(f)}
          >
            {f === 'ALL' ? 'Tümü' : f}
          </button>
        ))}
        {data.updatedAt && (
          <span className="updated">
            Son güncelleme: {new Date(data.updatedAt).toLocaleString('tr-TR')}
          </span>
        )}
      </div>

      {loading && <div className="state">Yükleniyor…</div>}
      {error && <div className="state error">Hata: {error}</div>}
      {tab === 'fav' && (
        <div className="fav-note">
          <strong>Favori kriterleri (hepsi birden):</strong> overzone <code>AL</code> · WaveTrend <code>AL</code> ·
          SuperTrend <code>AL</code> · analist tavsiyesi <code>AL / Güçlü AL</code>.
          <span className="muted-dash"> (Analist verisi BIST 30/50/100 hisselerinde bulunur.)</span>
        </div>
      )}

      {tab === 'smc' && (
        <div className="fav-note">
          <strong>SMC (Smart Money Concept) — günlük AL:</strong> önce likidite süpürme (fiyat önceki dibin
          altına inip döndü), ardından yükseliş yapı kırılımı (kapanış son swing high’ı yukarı kesip üstünde
          tutuyor = BOS/CHoCH). Günlük grafikte akıllı para birikimi → yükseliş sinyali.
        </div>
      )}

      {!loading && !error && items.length === 0 && (
        <div className="state">
          {searching
            ? `“${query.trim()}” ile eşleşen kayıt bulunamadı.`
            : tab === 'fav'
              ? 'Şu an üç sinyali (overzone + WaveTrend + SuperTrend) birden AL olan ve analist AL tavsiyesi bulunan hisse yok.'
            : tab === 'smc'
              ? 'Şu an SMC yükseliş sinyali (likidite süpürme + yapı kırılımı) veren hisse yok.'
              : data.items.length > 0
                ? 'Bu sekme/filtrede gösterilecek hisse yok.'
                : 'Henüz veri yok. “Yenile”ye basın veya backend’in çalıştığından emin olun.'}
        </div>
      )}

      {items.length > 0 && view === 'web' && (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Hisse</th>
                <th className="num">Fiyat</th>
                {showBuySell && <th className="num">Alış</th>}
                {showBuySell && <th className="num">Satış</th>}
                <th className="num">Günlük</th>
                <th className="num">Hedef</th>
                <th style={{ minWidth: 110 }}>Puan</th>
                <th>Sinyal</th>
                <th>overzone</th>
                <th>WaveTrend</th>
                <th>SuperTrend</th>
              </tr>
            </thead>
            <tbody>
              {items.map((s, i) => (
                <tr key={s.ticker}>
                  <td className="rank">{i + 1}</td>
                  <td>
                    <button className="ticker ticker-link" onClick={() => setChartItem(s)} title="Grafiği aç">
                      {s.ticker} <span className="chart-ico">📈</span>
                    </button>
                    <div className="name">{s.name}{s.sector ? ` · ${s.sector}` : ''}</div>
                  </td>
                  <td className="num">
                    {fmtNum(s.price)} <span className="cur">{s.currency || 'TRY'}</span>
                    {s.tryPerGram != null && (
                      <div className="exp-note">≈ {fmtNum(s.tryPerGram)} ₺/gr</div>
                    )}
                  </td>
                  {showBuySell && (
                    <td className="num">
                      {s.buyPrice != null
                        ? <>{fmtNum(s.buyPrice)} <span className="cur">₺</span></>
                        : <span className="muted-dash">—</span>}
                    </td>
                  )}
                  {showBuySell && (
                    <td className="num">
                      {s.sellPrice != null
                        ? <>{fmtNum(s.sellPrice)} <span className="cur">₺</span></>
                        : <span className="muted-dash">—</span>}
                    </td>
                  )}
                  <td className="num"><Pct value={s.changePct} /></td>
                  <td className="num">
                    <Expected
                      value={s.upside12m}
                      note={s.upside12m != null
                        ? `${s.numAnalysts ?? '?'} analist · hedef ${fmtNum(s.targetMean)}₺`
                        : null}
                    />
                  </td>
                  <td><ScoreBar score={s.score} /></td>
                  <td><SignalBadge signal={s.signal} /></td>
                  <td><IndicatorBadge signal={s.wtSignal} /></td>
                  <td><IndicatorBadge signal={s.wtCrossSignal} /></td>
                  <td><IndicatorBadge signal={s.stSignal} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {items.length > 0 && view === 'mobile' && (
        <div className="cards">
          {items.map((s, i) => (
            <div className="card" key={s.ticker}>
              <div className="card-top">
                <div className="card-id">
                  <span className="rank">{i + 1}</span>
                  <div>
                    <button className="ticker ticker-link" onClick={() => setChartItem(s)} title="Grafiği aç">
                      {s.ticker} <span className="chart-ico">📈</span>
                    </button>
                    <div className="name">{s.name}{s.sector ? ` · ${s.sector}` : ''}</div>
                  </div>
                </div>
                <SignalBadge signal={s.signal} />
              </div>

              <div className="card-price">
                <span className="card-price-val">
                  {fmtNum(s.price)} <span className="cur">{s.currency || 'TRY'}</span>
                </span>
                <Pct value={s.changePct} />
              </div>
              {s.tryPerGram != null && (
                <div className="exp-note">≈ {fmtNum(s.tryPerGram)} ₺/gr</div>
              )}

              {s.kind === 'metal' && (
                <div className="card-metrics">
                  <div className="metric">
                    <span className="metric-label">Alış</span>
                    <span>{s.buyPrice != null ? <>{fmtNum(s.buyPrice)} ₺</> : <span className="muted-dash">—</span>}</span>
                  </div>
                  <div className="metric">
                    <span className="metric-label">Satış</span>
                    <span>{s.sellPrice != null ? <>{fmtNum(s.sellPrice)} ₺</> : <span className="muted-dash">—</span>}</span>
                  </div>
                </div>
              )}

              <div className="card-metrics">
                <div className="metric">
                  <span className="metric-label">Hedef</span>
                  <Expected
                    value={s.upside12m}
                    note={s.upside12m != null
                      ? `${s.numAnalysts ?? '?'} analist · hedef ${fmtNum(s.targetMean)}₺`
                      : null}
                  />
                </div>
                <div className="metric">
                  <span className="metric-label">Puan</span>
                  <ScoreBar score={s.score} />
                </div>
              </div>

              <div className="card-signals">
                <div className="sig"><span className="metric-label">overzone</span><IndicatorBadge signal={s.wtSignal} /></div>
                <div className="sig"><span className="metric-label">WaveTrend</span><IndicatorBadge signal={s.wtCrossSignal} /></div>
                <div className="sig"><span className="metric-label">SuperTrend</span><IndicatorBadge signal={s.stSignal} /></div>
              </div>
            </div>
          ))}
        </div>
      )}
      </>
      )}

      <footer className="disclaimer">
        <p>
          <strong>Beklenen getiri</strong> tahminleri, hisseyi izleyen analistlerin <strong>ortalama 12 aylık hedef
          fiyatından</strong> hesaplanır: <code>12 ay potansiyel = (hedef − fiyat) / fiyat</code>; 1 ay ve 3 ay değerleri
          bu potansiyelin zamana bölünmüş (bileşik) karşılığıdır. Analist kapsamı olmayan hisselerde tahmin gösterilmez.
        </p>
        <p>
          <strong>WaveTrend</strong> (LazyBear WaveTrend Oscillator) ve <strong>SuperTrend</strong>
          (Kıvanç Özbilgiç), günlük fiyat verisinden hesaplanan teknik göstergelerdir.
          <strong>overzone</strong>: yeşil çizgi kırmızı sinyal çizgisini aşırı satım bölgesinde
          (−53/−60) yukarı kestiğinde <code>AL</code>, aşırı alım bölgesinde (+53/+60) aşağı kestiğinde
          <code>SAT</code>; ters kesişim olunca boşalır. <strong>WaveTrend</strong>: yeşil çizgi
          kırmızıyı (herhangi bölgede) yukarı kestiğinde <code>AL</code>, aşağı kestiğinde <code>SAT</code>.
          SuperTrend'de fiyat trend çizgisinin üstünde <code>AL</code>, altında <code>SAT</code>.
          Kısa vadeli, gecikmeli sinyallerdir; analist tahminlerinden bağımsızdır.
        </p>
        <p>
          <strong>Kıymetli madenler</strong> USD/ons cinsinden gösterilir; <strong>₺/gr</strong> karşılığı
          TCMB güncel USD döviz satış kuru ve 1 troy ons = 31,1035 gram üzerinden hesaplanır.
          <strong>Alış/Satış</strong> (₺) fiyatları <strong>altin.in</strong>'den alınır (paladyum orada
          bulunmadığından boş görünebilir).
        </p>
        <p>
          ⚠️ Bu tahminler geleceğin garantisi <strong>değildir</strong> ve <strong>yatırım tavsiyesi değildir</strong>.
          Veriler Yahoo Finance / analist konsensüsü kaynaklıdır, gecikmeli olabilir.
        </p>
      </footer>

      {chartItem && <ChartModal item={chartItem} onClose={() => setChartItem(null)} />}
    </div>
  );
}
