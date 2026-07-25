import { useEffect, useState, useMemo } from 'react';

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
  const [indexTab, setIndexTab] = useState(30); // 30 | 50 | 100 (iç içe: 30⊂50⊂100)

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

  // Önce endeks sekmesine göre (BIST 30/50/100 iç içe), sonra sinyale göre süz.
  const inIndex = useMemo(
    () => data.items.filter((i) => (i.bist ?? 100) <= indexTab),
    [data.items, indexTab],
  );

  const items = useMemo(() => {
    if (filter === 'ALL') return inIndex;
    return inIndex.filter((i) => i.signal === filter);
  }, [inIndex, filter]);

  const TABS = [
    { tier: 30, label: 'BIST 30' },
    { tier: 50, label: 'BIST 50' },
    { tier: 100, label: 'BIST 100' },
  ];

  return (
    <div className="page">
      <header className="header">
        <div>
          <h1>📈 BIST Hisse Önerileri</h1>
          <p className="subtitle">
            Analist hedef fiyatı + temel verilere dayalı beklenen getiri · {inIndex.length} hisse
            {data.source && <> · kaynak: {data.source === 'postgres' ? 'PostgreSQL' : 'bellek'}</>}
          </p>
        </div>
        <button className="refresh-btn" onClick={triggerRefresh} disabled={refreshing}>
          {refreshing ? 'Yenileniyor…' : '↻ Yenile'}
        </button>
      </header>

      <div className="tabs">
        {TABS.map((t) => {
          const count = data.items.filter((i) => (i.bist ?? 100) <= t.tier).length;
          return (
            <button
              key={t.tier}
              className={`tab ${indexTab === t.tier ? 'active' : ''}`}
              onClick={() => setIndexTab(t.tier)}
            >
              {t.label}
              {count > 0 && <span className="tab-count">{count}</span>}
            </button>
          );
        })}
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
          {data.items.length > 0
            ? 'Bu sekme/filtrede gösterilecek hisse yok.'
            : 'Henüz veri yok. “Yenile”ye basın veya backend’in çalıştığından emin olun.'}
        </div>
      )}

      {items.length > 0 && (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Hisse</th>
                <th className="num">Fiyat</th>
                <th className="num">Günlük</th>
                <th className="num">1 Ay Bek.</th>
                <th className="num">3 Ay Bek.</th>
                <th className="num">12 Ay Potansiyel</th>
                <th style={{ minWidth: 110 }}>Puan</th>
                <th>Sinyal</th>
                <th>WaveTrend</th>
                <th>Supertrend</th>
              </tr>
            </thead>
            <tbody>
              {items.map((s, i) => (
                <tr key={s.ticker}>
                  <td className="rank">{i + 1}</td>
                  <td>
                    <div className="ticker">{s.ticker}</div>
                    <div className="name">{s.name}{s.sector ? ` · ${s.sector}` : ''}</div>
                  </td>
                  <td className="num">{fmtNum(s.price)} <span className="cur">{s.currency || 'TRY'}</span></td>
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
                  <td><IndicatorBadge signal={s.stSignal} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <footer className="disclaimer">
        <p>
          <strong>Beklenen getiri</strong> tahminleri, hisseyi izleyen analistlerin <strong>ortalama 12 aylık hedef
          fiyatından</strong> hesaplanır: <code>12 ay potansiyel = (hedef − fiyat) / fiyat</code>; 1 ay ve 3 ay değerleri
          bu potansiyelin zamana bölünmüş (bileşik) karşılığıdır. Analist kapsamı olmayan hisselerde tahmin gösterilmez.
        </p>
        <p>
          <strong>WaveTrend</strong> (LazyBear) ve <strong>Supertrend</strong>, günlük fiyat verisinden
          hesaplanan teknik göstergelerdir: <code>AL</code> yükseliş, <code>SAT</code> düşüş yönünü belirtir.
          Kısa vadeli ve gecikmeli sinyallerdir; analist tahminlerinden bağımsızdır.
        </p>
        <p>
          ⚠️ Bu tahminler geleceğin garantisi <strong>değildir</strong> ve <strong>yatırım tavsiyesi değildir</strong>.
          Veriler Yahoo Finance / analist konsensüsü kaynaklıdır, gecikmeli olabilir.
        </p>
      </footer>
    </div>
  );
}
