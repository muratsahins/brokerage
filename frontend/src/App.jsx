import { useEffect, useState, useMemo, useRef } from 'react';

// TradingView sembolü: BIST hisseleri "BIST:TICKER", kıymetli madenler TVC spot.
const METAL_TV = { XAU: 'TVC:GOLD', XAG: 'TVC:SILVER', XPT: 'TVC:PLATINUM', XPD: 'TVC:PALLADIUM' };
function tvSymbol(s) {
  if (s.kind === 'metal') return METAL_TV[s.ticker] || `BIST:${s.ticker}`;
  return `BIST:${s.ticker}`;
}

// Grafik pop-up'ı: TradingView resmi "Advanced Chart" embed'i (sembolü JSON'dan
// okur; legacy tv.js'in aksine BIST sembolünü doğru uygular).
function ChartModal({ item, onClose }) {
  const containerRef = useRef(null);

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);

    const el = containerRef.current;
    if (el) {
      el.innerHTML = '';
      const widget = document.createElement('div');
      widget.className = 'tradingview-widget-container__widget';
      widget.style.height = '100%';
      widget.style.width = '100%';
      el.appendChild(widget);

      const script = document.createElement('script');
      script.type = 'text/javascript';
      script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js';
      script.async = true;
      script.innerHTML = JSON.stringify({
        autosize: true,
        symbol: tvSymbol(item),
        interval: 'D',
        timezone: 'Europe/Istanbul',
        theme: 'dark',
        style: '1',
        locale: 'tr',
        allow_symbol_change: false,
        hide_side_toolbar: false,
      });
      el.appendChild(script);
    }

    return () => { document.removeEventListener('keydown', onKey); };
  }, [item, onClose]);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <div className="modal-title">
            <span className="modal-ticker">{item.ticker}</span>
            <span className="modal-name">{item.name}{item.sector ? ` · ${item.sector}` : ''}</span>
          </div>
          <button className="modal-close" onClick={onClose} aria-label="Kapat">✕</button>
        </div>
        <div className="modal-chart">
          <div className="tradingview-widget-container" ref={containerRef} style={{ height: '100%', width: '100%' }} />
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
    { key: 'all',     label: 'Tümü',           match: (i) => i.kind === 'stock' },
    { key: 'bist30',  label: 'BIST 30',        match: (i) => i.bist != null && i.bist <= 30 },
    { key: 'bist50',  label: 'BIST 50',        match: (i) => i.bist != null && i.bist <= 50 },
    { key: 'bist100', label: 'BIST 100',       match: (i) => i.bist != null && i.bist <= 100 },
    { key: 'metal',   label: 'Kıymetli Maden', match: (i) => i.kind === 'metal' },
  ];
  const activeTab = TABS.find((t) => t.key === tab) ?? TABS[0];

  // Önce aktif sekmeye göre, sonra sinyale göre süz.
  const inTab = useMemo(
    () => data.items.filter(activeTab.match),
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
            Analist hedef fiyatı + temel verilere dayalı beklenen getiri · {searching ? `“${query.trim()}” için ${items.length} sonuç` : `${inTab.length} kayıt`}
            {data.source && <> · kaynak: {data.source === 'postgres' ? 'PostgreSQL' : 'bellek'}</>}
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
      {!loading && !error && items.length === 0 && (
        <div className="state">
          {searching
            ? `“${query.trim()}” ile eşleşen kayıt bulunamadı.`
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
                <th className="num">1 Ay Bek.</th>
                <th className="num">3 Ay Bek.</th>
                <th className="num">12 Ay Potansiyel</th>
                <th style={{ minWidth: 110 }}>Puan</th>
                <th>Sinyal</th>
                <th>53-60 WaveTrend</th>
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
                  <td className="num"><Expected value={s.exp1m} /></td>
                  <td className="num"><Expected value={s.exp3m} /></td>
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
                  <span className="metric-label">1 Ay Bek.</span>
                  <Expected value={s.exp1m} />
                </div>
                <div className="metric">
                  <span className="metric-label">3 Ay Bek.</span>
                  <Expected value={s.exp3m} />
                </div>
                <div className="metric">
                  <span className="metric-label">12 Ay Potansiyel</span>
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
                <div className="sig"><span className="metric-label">53-60 WaveTrend</span><IndicatorBadge signal={s.wtSignal} /></div>
                <div className="sig"><span className="metric-label">WaveTrend</span><IndicatorBadge signal={s.wtCrossSignal} /></div>
                <div className="sig"><span className="metric-label">SuperTrend</span><IndicatorBadge signal={s.stSignal} /></div>
              </div>
            </div>
          ))}
        </div>
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
          <strong>53-60 WaveTrend</strong>: yeşil çizgi kırmızı sinyal çizgisini aşırı satım bölgesinde
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
