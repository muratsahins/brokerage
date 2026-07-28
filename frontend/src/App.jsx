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
// Basit hareketli ortalama (pencere içinde null varsa null).
function smaArr(vals, period) {
  const out = new Array(vals.length).fill(null);
  for (let i = period - 1; i < vals.length; i++) {
    let sum = 0, ok = true;
    for (let j = i - period + 1; j <= i; j++) { if (vals[j] == null) { ok = false; break; } sum += vals[j]; }
    if (ok) out[i] = sum / period;
  }
  return out;
}
// WaveTrend (LazyBear) — tablo sinyaliyle aynı: wt1 (yeşil), wt2 (kırmızı sinyal).
function computeWaveTrend(highs, lows, closes, n1 = 10, n2 = 21) {
  const ap = closes.map((c, i) => (highs[i] + lows[i] + c) / 3);
  const esa = emaArr(ap, n1);
  const de = emaArr(ap.map((v, i) => Math.abs(v - esa[i])), n1);
  const ci = ap.map((v, i) => { const d = de[i]; return d === 0 ? 0 : (v - esa[i]) / (0.015 * d); });
  const wt1 = emaArr(ci, n2);
  const wt2 = smaArr(wt1, 4);
  return { wt1, wt2 };
}
// Stochastic RSI (14,14,3,3): %K ve %D (0..100).
function computeStochRSI(closes, rsiLen = 14, stochLen = 14, kS = 3, dS = 3) {
  const rsi = computeRSI(closes, rsiLen);
  const n = closes.length;
  const stoch = new Array(n).fill(null);
  for (let i = 0; i < n; i++) {
    if (rsi[i] == null || i < rsiLen + stochLen - 1) continue;
    let mn = Infinity, mx = -Infinity, ok = true;
    for (let j = i - stochLen + 1; j <= i; j++) { const r = rsi[j]; if (r == null) { ok = false; break; } if (r < mn) mn = r; if (r > mx) mx = r; }
    if (ok) stoch[i] = mx === mn ? 0 : ((rsi[i] - mn) / (mx - mn)) * 100;
  }
  const k = smaArr(stoch, kS);
  const d = smaArr(k, dS);
  return { k, d };
}

// Wilder ATR + SuperTrend (Kıvanç) — fiyat overlay'i, tablo sinyaliyle uyumlu.
function atrArr(highs, lows, closes, period = 10) {
  const n = closes.length;
  const out = new Array(n).fill(null);
  if (n < period) return out;
  const tr = new Array(n);
  tr[0] = highs[0] - lows[0];
  for (let i = 1; i < n; i++) tr[i] = Math.max(highs[i] - lows[i], Math.abs(highs[i] - closes[i - 1]), Math.abs(lows[i] - closes[i - 1]));
  let prev = 0; for (let i = 0; i < period; i++) prev += tr[i]; prev /= period;
  out[period - 1] = prev;
  for (let i = period; i < n; i++) { prev = (prev * (period - 1) + tr[i]) / period; out[i] = prev; }
  return out;
}
function computeSuperTrend(highs, lows, closes, period = 10, mult = 3) {
  const a = atrArr(highs, lows, closes, period);
  const n = closes.length;
  const line = new Array(n).fill(null), dir = new Array(n).fill(null);
  let prevUp = null, prevDn = null, prevTrend = 1, prevClose = null, started = false;
  for (let i = 0; i < n; i++) {
    const av = a[i]; if (av == null) continue;
    const src = (highs[i] + lows[i]) / 2;
    let up = src - mult * av, dn = src + mult * av, trend;
    if (!started) { trend = 1; started = true; }
    else {
      up = prevClose > prevUp ? Math.max(up, prevUp) : up;
      dn = prevClose < prevDn ? Math.min(dn, prevDn) : dn;
      trend = prevTrend;
      if (prevTrend === -1 && closes[i] > prevDn) trend = 1;
      else if (prevTrend === 1 && closes[i] < prevUp) trend = -1;
    }
    line[i] = trend === 1 ? up : dn; dir[i] = trend;
    prevUp = up; prevDn = dn; prevTrend = trend; prevClose = closes[i];
  }
  return { line, dir };
}

const CHART_INDS = [
  { key: 'supertrend', label: 'SuperTrend' },
  { key: 'volume', label: 'Hacim' },
  { key: 'wavetrend', label: 'WaveTrend' },
  { key: 'stochrsi', label: 'Stoch RSI' },
  { key: 'macd', label: 'MACD' },
];
function loadChartInds() {
  const def = { supertrend: true, volume: true, wavetrend: true, stochrsi: true, macd: true };
  try { const raw = localStorage.getItem('chart_inds'); return raw ? { ...def, ...JSON.parse(raw) } : def; }
  catch { return def; }
}

// Grafik pop-up'ı: kendi Yahoo OHLC verimizi (backend /api/chart) Lightweight
// Charts (açık kaynak, ücretsiz) ile çizer — mum + hacim, altında RSI ve MACD
// panelleri (zaman eksenleri senkron). TradingView embed'i BIST verisini
// göstermediği için harici widget yerine kendi grafiğimizi çiziyoruz.
function ChartModal({ item, onClose }) {
  const priceRef = useRef(null);
  const wtRef = useRef(null);
  const stochRef = useRef(null);
  const macdRef = useRef(null);
  const [status, setStatus] = useState('loading'); // loading | ok | error
  const [tqty, setTqty] = useState('');
  const [tmsg, setTmsg] = useState(null);
  const [inds, setInds] = useState(loadChartInds);
  const indKey = JSON.stringify(inds);
  const toggleInd = (k) => setInds((s) => {
    const next = { ...s, [k]: !s[k] };
    try { localStorage.setItem('chart_inds', JSON.stringify(next)); } catch { /* yoksay */ }
    return next;
  });
  const vbe = vbEmail();
  const doTrade = (side) => {
    const res = vbTrade(vbe, item, side, tqty);
    setTmsg({ ok: res.ok, m: res.msg });
    if (res.ok) setTqty('');
  };

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
        // Değeri olmayan barları whitespace (yalnız time) yapar; böylece tüm seriler
        // aynı zaman aralığını kaplar ve paneller birebir hizalı olur.
        const ws = (arr, colorFn) => candles.map((c, i) => (arr[i] != null
          ? (colorFn ? { time: c.time, value: arr[i], color: colorFn(i) } : { time: c.time, value: arr[i] })
          : { time: c.time }));

        const highs = candles.map((c) => c.high);
        const lows = candles.map((c) => c.low);
        // Aktif alt paneller (zaman ekseni son panelde görünür).
        const paneKeys = ['price'];
        if (inds.wavetrend) paneKeys.push('wt');
        if (inds.stochrsi) paneKeys.push('stoch');
        if (inds.macd) paneKeys.push('macd');
        const lastKey = paneKeys[paneKeys.length - 1];
        const tsOpt = (key) => ({ visible: key === lastKey, borderColor: BORDER });
        const panes = [];

        // --- Fiyat (+ hacim + SuperTrend overlay) ---
        const priceChart = createChart(priceRef.current, { ...base, timeScale: tsOpt('price') });
        const candleSeries = priceChart.addCandlestickSeries({ upColor: UP, downColor: DOWN, wickUpColor: UP, wickDownColor: DOWN, borderVisible: false });
        candleSeries.setData(candles);
        if (inds.volume) {
          const volSeries = priceChart.addHistogramSeries({ priceFormat: { type: 'volume' }, priceScaleId: '', lastValueVisible: false, priceLineVisible: false });
          volSeries.priceScale().applyOptions({ scaleMargins: { top: 0.82, bottom: 0 } });
          volSeries.setData(candles.map((c) => ({ time: c.time, value: c.volume, color: c.close >= c.open ? 'rgba(74,222,128,0.4)' : 'rgba(248,113,113,0.4)' })));
        }
        if (inds.supertrend) {
          const { line: stLine, dir: stDir } = computeSuperTrend(highs, lows, closes);
          const stOpt = { lineWidth: 2, priceLineVisible: false, lastValueVisible: false, crosshairMarkerVisible: false };
          // Yükseliş trendinde yeşil (destek), düşüşte kırmızı (direnç); dönüşte
          // çizgi kopar (zıplama yok), yönü AL/SAT okları belirtir.
          const stUp = priceChart.addLineSeries({ color: UP, ...stOpt });
          stUp.setData(candles.map((c, i) => (stDir[i] === 1 && stLine[i] != null) ? { time: c.time, value: stLine[i] } : { time: c.time }));
          const stDown = priceChart.addLineSeries({ color: DOWN, ...stOpt });
          stDown.setData(candles.map((c, i) => (stDir[i] === -1 && stLine[i] != null) ? { time: c.time, value: stLine[i] } : { time: c.time }));
          // Trend dönüşlerine AL/SAT ok işaretleri (TradingView gibi net sinyal).
          const stMarkers = [];
          for (let i = 1; i < candles.length; i++) {
            if (stDir[i] == null || stDir[i - 1] == null) continue;
            if (stDir[i - 1] === -1 && stDir[i] === 1) stMarkers.push({ time: candles[i].time, position: 'belowBar', color: UP, shape: 'arrowUp', text: 'AL' });
            else if (stDir[i - 1] === 1 && stDir[i] === -1) stMarkers.push({ time: candles[i].time, position: 'aboveBar', color: DOWN, shape: 'arrowDown', text: 'SAT' });
          }
          candleSeries.setMarkers(stMarkers);
        }
        panes.push({ chart: priceChart, series: candleSeries });

        // --- WaveTrend (LazyBear) — tablo sinyaliyle uyumlu ---
        if (inds.wavetrend && wtRef.current) {
          const { wt1, wt2 } = computeWaveTrend(highs, lows, closes);
          const wtChart = createChart(wtRef.current, { ...base, timeScale: tsOpt('wt') });
          const wt1s = wtChart.addLineSeries({ color: '#4ade80', lineWidth: 2, priceLineVisible: false, lastValueVisible: false });
          wt1s.setData(ws(wt1));
          const wt2s = wtChart.addLineSeries({ color: '#f87171', lineWidth: 1, priceLineVisible: false, lastValueVisible: false });
          wt2s.setData(ws(wt2));
          [60, 53, 0, -53, -60].forEach((lvl) => wt1s.createPriceLine({ price: lvl, color: lvl === 0 ? 'rgba(139,147,161,0.45)' : 'rgba(139,147,161,0.25)', lineWidth: 1, lineStyle: 2 }));
          panes.push({ chart: wtChart, series: wt1s });
        }

        // --- Stochastic RSI (14,14,3,3) ---
        if (inds.stochrsi && stochRef.current) {
          const { k: srK, d: srD } = computeStochRSI(closes);
          const stochChart = createChart(stochRef.current, { ...base, timeScale: tsOpt('stoch') });
          const kSeries = stochChart.addLineSeries({ color: '#60a5fa', lineWidth: 2, priceLineVisible: false, lastValueVisible: false, autoscaleInfoProvider: () => ({ priceRange: { minValue: 0, maxValue: 100 } }) });
          kSeries.setData(ws(srK));
          const dSeries = stochChart.addLineSeries({ color: '#fbbf24', lineWidth: 1, priceLineVisible: false, lastValueVisible: false });
          dSeries.setData(ws(srD));
          kSeries.createPriceLine({ price: 80, color: 'rgba(248,113,113,0.6)', lineWidth: 1, lineStyle: 2 });
          kSeries.createPriceLine({ price: 20, color: 'rgba(74,222,128,0.6)', lineWidth: 1, lineStyle: 2 });
          panes.push({ chart: stochChart, series: kSeries });
        }

        // --- MACD 12/26/9 ---
        if (inds.macd && macdRef.current) {
          const { macd, signal, hist } = computeMACD(closes);
          const macdChart = createChart(macdRef.current, { ...base, timeScale: tsOpt('macd') });
          const histSeries = macdChart.addHistogramSeries({ priceLineVisible: false, lastValueVisible: false });
          histSeries.setData(ws(hist, (i) => (hist[i] >= 0 ? 'rgba(74,222,128,0.55)' : 'rgba(248,113,113,0.55)')));
          const macdLine = macdChart.addLineSeries({ color: '#60a5fa', lineWidth: 1, priceLineVisible: false, lastValueVisible: false });
          macdLine.setData(ws(macd));
          const sigLine = macdChart.addLineSeries({ color: '#fbbf24', lineWidth: 1, priceLineVisible: false, lastValueVisible: false });
          sigLine.setData(ws(signal));
          panes.push({ chart: macdChart, series: macdLine });
        }

        // --- Senkron: zaman ekseni + imleç (crosshair) ---
        charts = panes.map((p) => p.chart);
        let syncing = false;
        panes.forEach(({ chart }) => {
          chart.timeScale().subscribeVisibleLogicalRangeChange((range) => {
            if (!range || syncing) return;
            syncing = true;
            charts.forEach((c) => { if (c !== chart) c.timeScale().setVisibleLogicalRange(range); });
            syncing = false;
          });
        });
        let syncingC = false;
        panes.forEach(({ chart }) => {
          chart.subscribeCrosshairMove((param) => {
            if (syncingC) return;
            syncingC = true;
            panes.forEach((p) => {
              if (p.chart === chart) return;
              if (param.time !== undefined && param.point) p.chart.setCrosshairPosition(0, param.time, p.series);
              else p.chart.clearCrosshairPosition();
            });
            syncingC = false;
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
  }, [item, indKey]);

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
        <div className="modal-trade">
          {vbe ? (
            <>
              <span className="modal-trade-price">{fmtNum(vbUnitPrice(item))} ₺/{vbUnitLabel(item)}</span>
              <input
                className="search-input" type="number" min="0" step="any"
                placeholder={`miktar (${vbUnitLabel(item)})`}
                value={tqty} onChange={(e) => setTqty(e.target.value)}
              />
              <button className="vb-buy" onClick={() => doTrade('buy')}>AL</button>
              <button className="vb-sell" onClick={() => doTrade('sell')}>SAT</button>
            </>
          ) : (
            <span className="muted-dash">Alım-satım için Sanal Borsa sekmesinden e-posta ile giriş yap.</span>
          )}
        </div>
        {tmsg && <div className={`vb-msg ${tmsg.ok ? 'ok' : 'err'}`} style={{ margin: '0 14px' }}>{tmsg.m}</div>}
        <div className="modal-ind">
          {CHART_INDS.map((ind) => (
            <button
              key={ind.key}
              className={`ind-chip ${inds[ind.key] ? 'active' : ''}`}
              onClick={() => toggleInd(ind.key)}
            >
              {ind.label}
            </button>
          ))}
        </div>
        <div className="modal-chart">
          <div className="chart-panes">
            <div className="pane" style={{ flex: 3 }} ref={priceRef}>
              <span className="pane-label">Fiyat{inds.volume ? ' · Hacim' : ''}{inds.supertrend ? ' · SuperTrend' : ''}</span>
            </div>
            {inds.wavetrend && <div className="pane" style={{ flex: 1.5 }} ref={wtRef}><span className="pane-label">WaveTrend (LazyBear)</span></div>}
            {inds.stochrsi && <div className="pane" style={{ flex: 1.5 }} ref={stochRef}><span className="pane-label">Stoch RSI 14</span></div>}
            {inds.macd && <div className="pane" style={{ flex: 1.5 }} ref={macdRef}><span className="pane-label">MACD 12/26/9</span></div>}
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

// Güncel fiyatları (/api/prices) mevcut veriye işler: fiyat + günlük değişim
// (+ metal ₺/gram), AYNI ANDA hesaplanan teknik göstergeler ve canlı fiyattan
// yeniden hesaplanan analist potansiyeli / momentum / puan / sinyal.
// Analist hedefi ve temel veriler yayınlanan veriden gelir (3 saatte bir).
function mergeLivePrices(data, live) {
  if (!live || !live.prices || !data || !data.items) return data;
  const signals = live.signals || {};
  const scores = live.scores || {};
  let changed = false;
  const items = data.items.map((it) => {
    const p = live.prices[it.ticker];
    if (!p || p.price == null) return it;
    changed = true;
    const next = { ...it, price: p.price };
    if (p.changePct != null) next.changePct = p.changePct;
    if (it.kind === 'metal' && it.usdTry) next.tryPerGram = Math.round((p.price / 31.1034768) * it.usdTry * 100) / 100;
    if (it.kind === 'crypto' && it.usdTry) next.tryPrice = roundPrice(p.price * it.usdTry);
    // Göstergeler: backend bar geçmişi + canlı fiyattan yeniden hesapladıysa
    // yayınlanan (3 saatte bir) değerlerin üstüne yazılır. Sinyal yoksa alan
    // boştur — bu da "artık sinyal yok" demektir, o yüzden temizlenir.
    const s = signals[it.ticker];
    if (s) {
      next.stSignal = s.st ?? null;
      next.wtCrossSignal = s.wt ?? null;
      next.wtSignal = s.wo ?? null;
      next.smc = !!s.smc;
      next.volRev = s.vr ?? null;
      next.signalsLive = true;
    }
    // Analist potansiyeli, momentum, puan ve AL/TUT/İZLE sinyali de canlı
    // fiyattan yeniden hesaplanır (analist hedefi/temel veri yayından gelir).
    const sc = scores[it.ticker];
    if (sc) {
      next.score = sc.sc;
      next.signal = sc.sg;
      next.momentum1m = sc.m ?? null;
      next.upside12m = sc.u ?? null;
      next.exp1m = sc.e1 ?? null;
      next.exp3m = sc.e3 ?? null;
      next.signalsLive = true;
    }
    return next;
  });
  return changed ? { ...data, items, priceUpdatedAt: live.updatedAt } : data;
}

const SIGNAL_STYLES = {
  AL: { label: 'AL', bg: '#0f5132', fg: '#4ade80' },
  TUT: { label: 'TUT', bg: '#665200', fg: '#fbbf24' },
  'İZLE': { label: 'İZLE', bg: '#3a3a3a', fg: '#cbd5e1' },
};

function fmtNum(x, digits = 2) {
  if (x == null || Number.isNaN(x)) return '—';
  const a = Math.abs(x);
  const maxD = a > 0 && a < 1 ? (a >= 0.01 ? 4 : 8) : digits; // küçük fiyatlarda (kripto) daha çok ondalık
  return Number(x).toLocaleString('tr-TR', {
    minimumFractionDigits: Math.min(digits, maxD),
    maximumFractionDigits: Math.max(digits, maxD),
  });
}
function roundPrice(x) {
  const a = Math.abs(x);
  const d = a >= 1 ? 2 : a >= 0.01 ? 6 : 10;
  const f = 10 ** d;
  return Math.round(x * f) / f;
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

// Hacim dönüşü formasyonu: kaç kırmızı mumdan sonra geldi, yeşil mumun hacmi
// kırmızıların en yükseğinin kaç katı, mum ne kadar kazandırdı, kaç bar önce oldu.
function VolRevCell({ v }) {
  if (!v) return <span className="muted-dash">—</span>;
  return (
    <div className="exp">
      <span className="volrev-main">
        {v.reds} kırmızı → yeşil <strong>×{fmtNum(v.volRatio)}</strong>
      </span>
      <div className="exp-note">
        {v.volAvgRatio != null && <>ort. hacmin ×{fmtNum(v.volAvgRatio)}’ı · </>}
        mum %{fmtNum(v.gainPct)} · öncesi %{fmtNum(v.dropPct)} ·{' '}
        {v.barsAgo === 0 ? 'son bar' : `${v.barsAgo} bar önce`}
      </div>
    </div>
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
const VB_OZ = 31.1034768;

// --- Sanal borsa paylaşımlı yardımcıları (localStorage) ----------------------
// Hem Sanal Borsa sekmesi hem grafik pop-up'ındaki AL/SAT aynı portföyü kullanır.
function vbEmail() { try { return localStorage.getItem('vb_email') || ''; } catch { return ''; } }
function vbLoad(email) {
  if (!email) return null;
  try { const raw = localStorage.getItem('vb_pf_' + email); return raw ? JSON.parse(raw) : { cash: VB_START, positions: {}, history: [] }; }
  catch { return { cash: VB_START, positions: {}, history: [] }; }
}
function vbSave(email, pf) { try { localStorage.setItem('vb_pf_' + email, JSON.stringify(pf)); } catch { /* yoksay */ } }
function vbUnitPrice(it) {
  if (!it) return null;
  if (it.kind === 'metal') return it.tryPerGram;
  if (it.kind === 'crypto') return it.tryPrice;
  return it.price;
}
function vbUnitLabel(it) { return it && it.kind === 'metal' ? 'gr' : 'adet'; }
function vbTrade(email, item, side, qtyRaw) {
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

function VirtualTrade({ items }) {
  const [email, setEmail] = useState(() => { try { return localStorage.getItem('vb_email') || ''; } catch { return ''; } });
  const [emailInput, setEmailInput] = useState('');
  const [pf, setPf] = useState(null);
  const [q, setQ] = useState('');
  const [sel, setSel] = useState('');
  const [qty, setQty] = useState('');
  const [msg, setMsg] = useState(null);

  const byTicker = useMemo(() => new Map(items.map((i) => [i.ticker, i])), [items]);
  const unitPrice = (it) => vbUnitPrice(it);
  const unitLabel = (it) => vbUnitLabel(it);

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
    const res = vbTrade(email, byTicker.get(sel), side, qty);
    setMsg({ t: res.ok ? 'ok' : 'err', m: res.msg });
    if (res.ok) { setPf(res.pf); setQty(''); }
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
  const results = nq ? items.filter((i) => i.kind !== undefined && unitPrice(i) != null && (norm(i.ticker).includes(nq) || norm(i.name).includes(nq))).slice(0, 8) : [];
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
      const [recRes, priceRes] = await Promise.allSettled([
        fetch(`${API_BASE}/api/recommendations`).then((r) => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); }),
        fetch(`${API_BASE}/api/prices`).then((r) => (r.ok ? r.json() : null)).catch(() => null),
      ]);
      if (recRes.status !== 'fulfilled') throw recRes.reason;
      let json = recRes.value;
      if (priceRes.status === 'fulfilled' && priceRes.value) json = mergeLivePrices(json, priceRes.value);
      setData(json);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  // Sadece güncel fiyatları çekip mevcut veriye işler (anlık ~10 sn).
  async function refreshPrices() {
    if (typeof document !== 'undefined' && document.hidden) return; // sekme arkadaysa atla
    try {
      const r = await fetch(`${API_BASE}/api/prices`);
      if (!r.ok) return;
      const live = await r.json();
      setData((prev) => mergeLivePrices(prev, live));
    } catch { /* yoksay */ }
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
    const idFull = setInterval(load, 15 * 60 * 1000);      // tüm veri (göstergeler) 15 dk
    const idPrice = setInterval(refreshPrices, 18 * 1000); // sadece fiyat ~18 sn (throttle'a takılmadan)
    const onFocus = () => { if (document.visibilityState === 'visible') refreshPrices(); };
    document.addEventListener('visibilitychange', onFocus);
    window.addEventListener('focus', onFocus);
    return () => {
      clearInterval(idFull);
      clearInterval(idPrice);
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
    { key: 'crypto',  label: 'Kripto',         match: (i) => i.kind === 'crypto' },
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
  // Hacim dönüşü: 2-3 (en çok 5) kırmızı mumun ardından, hacmi o kırmızıların
  // HEPSİNDEN yüksek olan güçlü bir yeşil mum — satıcı tükendi, alıcı hacimle döndü.
  // Kıymetli madenlerde hacim verisi güvenilir olmadığı için onlar hariç.
  const VOL_TAB = {
    key: 'vol',
    label: '📊 Hacim Dönüşü',
    match: (i) => i.kind !== 'metal' && i.volRev != null,
  };
  const TRADE_TAB = { key: 'trade', label: '💼 Sanal Borsa' };
  const activeTab = [...TABS, FAV_TAB, SMC_TAB, VOL_TAB, TRADE_TAB, ...NEWS_TABS].find((t) => t.key === tab) ?? TABS[0];
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
    // Hacim dönüşü sekmesi puana değil, formasyonun tazeliğine göre sıralanır
    // (eşitlikte hacim patlaması güçlü olan üstte).
    if (tab === 'vol' && !nq) {
      list = [...list].sort((a, b) =>
        (a.volRev.barsAgo - b.volRev.barsAgo) || (b.volRev.volRatio - a.volRev.volRatio));
    } else {
      // Puan canlı fiyatla değiştiği için sıralamayı da tazele — liste "puana
      // göre sıralı" kalsın (yayınlanan sıra bayatlamasın).
      list = [...list].sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
    }
    return list;
  }, [data.items, inTab, query, filter, tab]);

  // Alış/Satış sütunları: görünen listede kıymetli maden varsa göster.
  const showBuySell = items.some((s) => s.kind === 'metal');
  // Hacim dönüşü sütunu yalnızca kendi sekmesinde.
  const showVolRev = tab === 'vol' && !searching;

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
          className={`news-tab vol-tab ${tab === 'vol' ? 'active' : ''}`}
          onClick={() => setTab('vol')}
        >
          {VOL_TAB.label}
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
        {(data.priceUpdatedAt || data.updatedAt) && (
          <span className="updated">
            {items.some((i) => i.signalsLive) ? 'Fiyat + göstergeler' : 'Fiyat'}:{' '}
            {new Date(data.priceUpdatedAt || data.updatedAt).toLocaleTimeString('tr-TR')}
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

      {tab === 'vol' && (
        <div className="fav-note">
          <strong>Hacim Dönüşü — günlük:</strong> arka arkaya <code>2-5</code> kırmızı mumun ardından gelen
          <code>yeşil</code> mumun hacmi, o kırmızı mumların <strong>hepsinden yüksek</strong>; ayrıca mum
          “güçlü”: gövdesi mum boyunun en az yarısı ve kırmızıların gövdesinden büyük. Satıcı tükenip alıcının
          hacimle döndüğü noktalar. Son <code>3</code> barda oluşan formasyonlar listelenir; en tazesi üstte.
          <span className="muted-dash"> (Hacim verisi güvenilir olmadığından kıymetli madenler hariçtir.)</span>
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
            : tab === 'vol'
              ? 'Son 3 barda hacim dönüşü formasyonu (2-5 kırmızı mum → hacmi hepsinden yüksek güçlü yeşil mum) veren enstrüman yok.'
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
                {showVolRev && <th style={{ minWidth: 190 }}>Hacim Dönüşü</th>}
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
                    {s.tryPrice != null && (
                      <div className="exp-note">≈ {fmtNum(s.tryPrice)} ₺</div>
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
                  {showVolRev && <td><VolRevCell v={s.volRev} /></td>}
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
              {s.tryPrice != null && (
                <div className="exp-note">≈ {fmtNum(s.tryPrice)} ₺</div>
              )}

              {showVolRev && (
                <div className="card-metrics">
                  <div className="metric">
                    <span className="metric-label">Hacim Dönüşü</span>
                    <VolRevCell v={s.volRev} />
                  </div>
                </div>
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
          <strong>Puan</strong>; analist potansiyeli (%45), analist tavsiyesi (%20), 1 aylık momentum (%20) ve
          ileri F/K (%15) bileşenlerinden hesaplanır; eksik bileşen varsa kalanların ağırlığı normalize edilir.
          <strong>Analist kapsamı olmayan</strong> enstrümanlarda (kripto, kıymetli maden ve analist izlemeyen
          hisseler) puanın yalnızca fiyat hareketinden geldiği için <strong>tavanı 60'tır</strong> — sıralama
          korunur ama analist teyitli hisselerle aynı puana çıkamaz ve <code>AL</code> rozeti almaz.
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
