// ABD Büyük Şirketler sekmesi (NASDAQ100 + S&P100) — temel analiz odaklı.
// BIST sekmelerinden bilinçli olarak izole: kendi veri kaynağı
// (/api/us-recommendations), kendi arama/sıralama state'i, teknik gösterge
// (overzone/WaveTrend/SuperTrend) YOK — bu sekme fundamentals'a odaklanıyor.
// App.jsx'ten yalnızca sekmeye tıklanınca lazy-load edilir (ChartModal ile
// aynı desen), böylece BIST kullanıcıları bu bundle'ı hiç indirmez.
import { useEffect, useMemo, useState } from 'react';
import { API_BASE, fmtNum, norm } from './lib/common.js';
import { Pct } from './lib/ui.jsx';

const SIGNAL_STYLES = {
  AL: { label: 'AL', bg: '#0f5132', fg: '#4ade80' },
  TUT: { label: 'TUT', bg: '#665200', fg: '#fbbf24' },
  'İZLE': { label: 'İZLE', bg: '#3a3a3a', fg: '#cbd5e1' },
};
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
      <span style={{ fontVariantNumeric: 'tabular-nums', width: 26, textAlign: 'right' }}>{score ?? '—'}</span>
    </div>
  );
}
const pctCell = (v) => (v == null ? <span className="muted-dash">—</span> : <span>%{fmtNum(v)}</span>);

function useUsRecommendations() {
  const [state, setState] = useState({ loading: true, items: [], updatedAt: null, ok: true });
  useEffect(() => {
    let cancelled = false;
    fetch(`${API_BASE}/api/us-recommendations`)
      .then((r) => r.json())
      .then((d) => { if (!cancelled) setState({ loading: false, items: d.items || [], updatedAt: d.updatedAt, ok: true }); })
      .catch(() => { if (!cancelled) setState((s) => ({ ...s, loading: false, ok: false })); });
    return () => { cancelled = true; };
  }, []);
  return state;
}

function QuantGrid({ item }) {
  const rows = [
    ['Piyasa Değeri', item.marketCap != null ? `${fmtNum(item.marketCap / 1e9, 1)} Mr$` : '—'],
    ['Gelir Büyümesi (YoY)', item.revenueGrowth != null ? `%${fmtNum(item.revenueGrowth)}` : '—'],
    ['Gelir CAGR (çok yıllık)', item.revenue3yCagr != null ? `%${fmtNum(item.revenue3yCagr)}` : '—'],
    ['Net Kâr Marjı', item.profitMargins != null ? `%${fmtNum(item.profitMargins)}` : '—'],
    ['Net Borç / FAVÖK', item.netDebtToEbitda != null ? `${fmtNum(item.netDebtToEbitda)}x` : '—'],
    ['FCF Marjı', item.fcfMargin != null ? `%${fmtNum(item.fcfMargin)}` : '—'],
    ['İleri F/K', item.forwardPE != null ? fmtNum(item.forwardPE) : '—'],
    ['Temettü Verimi', item.dividendYield != null ? `%${fmtNum(item.dividendYield)}` : '—'],
    ['Analist Hedefi (12 ay)', item.upside12m != null ? `%${fmtNum(item.upside12m)} (${item.numAnalysts ?? '?'} analist)` : '—'],
  ];
  return (
    <div className="us-quant-grid">
      {rows.map(([label, val]) => (
        <div key={label} className="metric">
          <span className="metric-label">{label}</span>
          <span>{val}</span>
        </div>
      ))}
    </div>
  );
}

function ReportPanel({ item, onClose }) {
  const r = item.report;
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal us-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <div className="modal-title">
            <span className="modal-ticker">{item.ticker} <SignalBadge signal={item.signal} /></span>
            <span className="modal-name">
              {item.name} · {fmtNum(item.price)} {item.currency} <Pct value={item.changePct} />
            </span>
          </div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="us-modal-body">
          <p className="exp-note">
            AL/TUT/İZLE rozeti; analist hedef potansiyeli, gelir büyümesi, net marj, kaldıraç ve FCF marjından
            hesaplanan puandan gelir (aşağıdaki metinden değil) — yatırım tavsiyesi değildir.
          </p>
          <QuantGrid item={item} />

          {!r ? (
            <div className="us-report-section">
              <p>Bu hisse için elle yazılmış tam analist raporu (segment/rakip/moat/güçlü-zayıf yön anlatısı)
                henüz kapsamda değil — yukarıdaki otomatik hesaplanan sayısal özetle sınırlı.</p>
            </div>
          ) : (
            <>
              <p className="exp-note us-report-asof">{r.asOf}</p>
              <div className="us-report-section">
                <h4>1. Gelir Modeli ve Büyüme</h4>
                <ul className="us-report-list">
                  {r.segments.map((s) => (
                    <li key={s.name}><strong>{s.name}</strong> (~%{s.sharePct}) — {s.note}</li>
                  ))}
                </ul>
                <p>{r.revenue3yNote}</p>
                <p>{r.marginNote}</p>
              </div>
              <div className="us-report-section">
                <h4>2. Bilanço Sağlığı</h4>
                <p>{r.balanceNote}</p>
                <p>{r.fcfNote}</p>
              </div>
              <div className="us-report-section">
                <h4>3. Rekabet Avantajı (Moat)</h4>
                <p><strong>Ana rakipler:</strong> {r.competitors.join(', ')}</p>
                <ul className="us-report-list">
                  {r.moat.map((m) => (
                    <li key={m.title}><strong>{m.title}</strong> — {m.desc}</li>
                  ))}
                </ul>
              </div>
              <div className="us-report-section">
                <h4>4. Güçlü ve Zayıf Yönler</h4>
                <div className="us-report-cols">
                  <div>
                    <div className="us-report-subhead us-report-good">Güçlü yönler</div>
                    <ul className="us-report-list">
                      {r.strengths.map((s, i) => <li key={i}>{s}</li>)}
                    </ul>
                  </div>
                  <div>
                    <div className="us-report-subhead us-report-bad">Riskler</div>
                    <ul className="us-report-list">
                      {r.risks.map((s, i) => <li key={i}>{s}</li>)}
                    </ul>
                  </div>
                </div>
              </div>
              <div className="us-report-section us-report-verdict">
                <h4>Değerleme Özeti</h4>
                <p>{r.verdict}</p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function UsStocksTab() {
  const { loading, items, updatedAt, ok } = useUsRecommendations();
  const [query, setQuery] = useState('');
  const [idx, setIdx] = useState('ALL'); // ALL | NDX | SPX
  const [sort, setSort] = useState('score'); // score | ticker
  const [selected, setSelected] = useState(null);

  const filtered = useMemo(() => {
    const nq = norm(query.trim());
    let list = items;
    if (idx !== 'ALL') list = list.filter((i) => i.indices?.includes(idx));
    if (nq) {
      list = list.filter((i) =>
        norm(i.ticker).includes(nq) || norm(i.name).includes(nq) || norm(i.sector || '').includes(nq));
    }
    list = [...list].sort((a, b) => (
      sort === 'score' ? (b.score ?? -1) - (a.score ?? -1) : a.ticker.localeCompare(b.ticker)
    ));
    return list;
  }, [items, query, idx, sort]);

  const reportCount = useMemo(() => items.filter((i) => i.hasReport).length, [items]);

  return (
    <>
      <div className="fav-note">
        <strong>ABD Büyük Şirketler</strong> — NASDAQ-100 + S&P 100 birleşimi ({items.length || '~170'} hisse),
        temel analiz ağırlıklı bir <strong>puan</strong>: analist 12 aylık hedef potansiyeli (%35), yıllık
        (YoY) gelir büyümesi (%20), net kâr marjı (%15), kaldıraç/<code>Net Debt-EBITDA</code> (%15) ve
        <code> FCF</code> marjı (%15) — BIST sekmesindeki momentum ağırlıklı puanla karıştırılmamalı.
        <strong> 📄 Analiz</strong> — segment/rakip/moat/güçlü-zayıf yön anlatısı içeren tam rapor — yalnızca
        elle hazırlanmış {reportCount || '~48'} mega-cap'te var; diğerlerinde ticker'a tıklayınca yalnızca
        otomatik sayısal özet açılır. Veriler <strong>günde bir yayınlanır</strong> (canlı tik akışı yok),
        fiyatlar USD'dir. <span className="muted-dash">Yatırım tavsiyesi değildir.</span>
      </div>

      <div className="search">
        <span className="search-icon">🔎</span>
        <input
          className="search-input"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Hisse ara… (ör. AAPL, Microsoft, yarı iletken)"
          aria-label="ABD hisselerinde ara"
        />
        {query && <button className="search-clear" onClick={() => setQuery('')} aria-label="Aramayı temizle">✕</button>}
      </div>

      <div className="filters">
        {[
          { key: 'ALL', label: 'Tümü' },
          { key: 'NDX', label: 'NASDAQ 100' },
          { key: 'SPX', label: 'S&P 100' },
        ].map((f) => (
          <button key={f.key} className={`filter ${idx === f.key ? 'active' : ''}`} onClick={() => setIdx(f.key)}>
            {f.label}
          </button>
        ))}
        <span className="filter-sep" aria-hidden="true" />
        {[
          { key: 'score', label: 'Puan' },
          { key: 'ticker', label: 'A→Z' },
        ].map((s) => (
          <button key={s.key} className={`filter sort ${sort === s.key ? 'active' : ''}`} onClick={() => setSort(s.key)}>
            {s.label}
          </button>
        ))}
        {updatedAt && (
          <span className="updated">Veri: {new Date(updatedAt).toLocaleString('tr-TR')}</span>
        )}
      </div>

      {loading && <div className="state">Yükleniyor… (ilk açılışta backend uyanması birkaç saniye sürebilir)</div>}
      {!loading && !ok && <div className="state error">ABD hisse verisi alınamadı.</div>}
      {!loading && ok && filtered.length === 0 && (
        <div className="state">{query.trim() ? `“${query.trim()}” ile eşleşen kayıt bulunamadı.` : 'Henüz veri yok.'}</div>
      )}

      {filtered.length > 0 && (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Hisse</th>
                <th className="num">Fiyat</th>
                <th className="num">Günlük</th>
                <th className="num">Gelir Büyümesi</th>
                <th className="num">Net Marj</th>
                <th className="num">Net Borç/FAVÖK</th>
                <th className="num">FCF Marjı</th>
                <th className="num">İleri F/K</th>
                <th style={{ minWidth: 110 }}>Puan</th>
                <th>Sinyal</th>
                <th>Rapor</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s, i) => (
                <tr key={s.ticker}>
                  <td className="rank">{i + 1}</td>
                  <td>
                    <button className="ticker ticker-link" onClick={() => setSelected(s)} title="Detay/rapor aç">
                      {s.ticker} <span className="chart-ico">📄</span>
                    </button>
                    <div className="name">{s.name}{s.sector ? ` · ${s.sector}` : ''}</div>
                  </td>
                  <td className="num">{fmtNum(s.price)} <span className="cur">{s.currency || 'USD'}</span></td>
                  <td className="num"><Pct value={s.changePct} /></td>
                  <td className="num">{pctCell(s.revenueGrowth)}</td>
                  <td className="num">{pctCell(s.profitMargins)}</td>
                  <td className="num">{s.netDebtToEbitda != null ? `${fmtNum(s.netDebtToEbitda)}x` : <span className="muted-dash">—</span>}</td>
                  <td className="num">{pctCell(s.fcfMargin)}</td>
                  <td className="num">{s.forwardPE != null ? fmtNum(s.forwardPE) : <span className="muted-dash">—</span>}</td>
                  <td><ScoreBar score={s.score} /></td>
                  <td><SignalBadge signal={s.signal} /></td>
                  <td>{s.hasReport ? <span title="Tam analist raporu mevcut">📄 var</span> : <span className="muted-dash">—</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selected && <ReportPanel item={selected} onClose={() => setSelected(null)} />}
    </>
  );
}
