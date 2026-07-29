import { useEffect, useRef, useState } from "react";
import { createChart } from "lightweight-charts";
import { API_BASE, fmtNum } from './lib/common.js';
import { Pct, Tutar } from './lib/ui.jsx';
import { vbEmail, vbLoad, vbTrade, vbUnitLabel, vbUnitPrice } from './lib/vb.js';

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
export default function ChartModal({ item, onClose }) {
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
  // Portföyü pop-up içinde tutuyoruz ki alım-satımdan hemen sonra pozisyon ve
  // kâr/zarar satırı tazelensin (Sanal Borsa sekmesine gitmeye gerek kalmasın).
  const [pf, setPf] = useState(() => (vbe ? vbLoad(vbe) : null));
  const doTrade = (side) => {
    const res = vbTrade(vbe, item, side, tqty);
    setTmsg({ ok: res.ok, m: res.msg });
    if (res.ok) { setTqty(''); setPf(res.pf); }
  };

  // --- Pozisyon ve kâr/zarar -------------------------------------------------
  // Portföy ₺ birim fiyatı üzerinden tutulur (kıymetli madende ₺/gram),
  // o yüzden K/Z hesabı item.price değil vbUnitPrice ile yapılır.
  const birim = vbUnitPrice(item);
  const birimAdi = vbUnitLabel(item);
  const poz = pf?.positions?.[item.ticker] || null;
  const nakit = pf?.cash ?? 0;

  const toplamKZ = poz && birim != null ? poz.qty * (birim - poz.avgCost) : null;
  const toplamKZPct = poz && birim != null && poz.avgCost
    ? (birim - poz.avgCost) / poz.avgCost * 100
    : null;

  // Bugünkü K/Z: dünkü kapanış = fiyat / (1 + günlük% / 100).
  // Yalnızca hisselerde gösteriliyor — kıymetli madende changePct USD/ons
  // değişimi, ₺/gram ise ayrıca kurdan etkileniyor; ikisini karıştırmak
  // yanlış sayı üretirdi.
  const bugunKZ = poz && item.kind === 'stock' && birim != null && item.changePct != null
    ? poz.qty * (birim - birim / (1 + item.changePct / 100))
    : null;

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
    // item her fiyat tazelemesinde yeni bir nesne; bağımlılık `item` olsaydı
    // grafik 18 saniyede bir baştan çizilirdi. Grafik yalnızca ENSTRÜMANA
    // bağlı, fiyat değişimi başlıktaki canlı alanlara yansıyor.
  }, [item.ticker, indKey]);

  const cur = item.currency || (item.kind === 'metal' ? 'USD' : 'TRY');
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <div className="modal-title">
            <span className="modal-ticker">
              {item.ticker} · {fmtNum(item.price)} {cur}
              <span className="modal-gunluk"><Pct value={item.changePct} strong /> bugün</span>
            </span>
            <span className="modal-name">{item.name}{item.sector ? ` · ${item.sector}` : ''} · son 1 yıl (günlük)</span>
          </div>
          <button className="modal-close" onClick={onClose} aria-label="Kapat">✕</button>
        </div>

        {/* Şerit giriş yapılmışsa HER ZAMAN görünür. Pozisyon yokken gizlemek,
            "K/Z neden yok?" sorusunu cevapsız bırakıyordu: eksik özellikle
            hatasız-ama-boş durum ayırt edilemiyordu. */}
        {vbe && (
          <div className="modal-pos">
            {poz ? (
              <>
                <div className="modal-pos-kalem">
                  <span className="metric-label">Pozisyonum</span>
                  <span>{fmtNum(poz.qty)} {birimAdi} · maliyet {fmtNum(poz.avgCost)} ₺</span>
                </div>
                <div className="modal-pos-kalem">
                  <span className="metric-label">Bugün</span>
                  {bugunKZ != null
                    ? <span><Tutar value={bugunKZ} /> <Pct value={item.changePct} /></span>
                    : (
                      <span
                        className="muted-dash"
                        title="Günlük yüzde USD/ons değişimi; ₺/gram fiyatı ayrıca döviz kurundan etkilendiği için günlük kâr/zarar hesaplanmıyor."
                      >
                        — kur etkisi nedeniyle yok
                      </span>
                    )}
                </div>
                <div className="modal-pos-kalem">
                  <span className="metric-label">Toplam K/Z</span>
                  <span><Tutar value={toplamKZ} /> <Pct value={toplamKZPct} /></span>
                </div>
                <div className="modal-pos-kalem">
                  <span className="metric-label">Değeri</span>
                  <span>{fmtNum(poz.qty * birim)} ₺</span>
                </div>
              </>
            ) : (
              <div className="modal-pos-bos">
                Bu enstrümanda pozisyonun yok. <strong>AL</strong> ile açtığında
                bugünkü ve toplam kâr/zararın burada görünür.
              </div>
            )}
          </div>
        )}

        <div className="modal-trade">
          {vbe ? (
            <>
              <span className="modal-trade-price">{fmtNum(birim)} ₺/{birimAdi}</span>
              <input
                className="search-input" type="number" min="0" step="any"
                placeholder={`miktar (${birimAdi})`}
                value={tqty} onChange={(e) => setTqty(e.target.value)}
              />
              <button className="vb-buy" onClick={() => doTrade('buy')}>AL</button>
              <button className="vb-sell" onClick={() => doTrade('sell')} disabled={!poz}>SAT</button>
              {/* Hızlı miktar: alımda nakde sığan tam miktar, satışta elde ne varsa. */}
              {birim > 0 && (
                <button
                  className="vb-tumu"
                  onClick={() => setTqty(String(poz ? poz.qty : Math.floor(nakit / birim)))}
                  title={poz ? 'Elimdeki tüm miktar' : 'Nakde sığan en çok miktar'}
                >
                  Tümü
                </button>
              )}
              <span className="modal-trade-limit">
                nakit {fmtNum(nakit)} ₺{poz ? ` · elimde ${fmtNum(poz.qty)} ${birimAdi}` : ''}
              </span>
            </>
          ) : (
            <span className="muted-dash">
              Alım-satım ve kâr/zarar için <strong>Sanal Borsa</strong> sekmesinden e-posta ile giriş yap.
              (Sanal para; gerçek işlem değildir.)
            </span>
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
