// ABD Büyük Şirketler sekmesi (NASDAQ100 + S&P100) — temel analiz odaklı.
// BIST sekmelerinden bilinçli olarak izole: kendi veri kaynağı
// (/api/us-recommendations + /api/us-prices) ve kendi arama/sıralama state'i.
// Puan temel analiz ağırlıklı (BIST momentum ağırlıklı), ama fiyat, göstergeler
// ve canlı puan artık BIST ile aynı ritimde (18 sn) — yalnızca ABD seansı
// açıkken çekilir.
// App.jsx'ten yalnızca sekmeye tıklanınca lazy-load edilir (ChartModal ile
// aynı desen), böylece BIST kullanıcıları bu bundle'ı hiç indirmez.
import { useEffect, useMemo, useState } from 'react';
import { API_BASE, fmtNum, norm } from './lib/common.js';
import { Expected, Pct } from './lib/ui.jsx';

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
// BIST'teki IndicatorBadge ile aynı görünüm.
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
const pctCell = (v) => (v == null ? <span className="muted-dash">—</span> : <span>%{fmtNum(v)}</span>);

// ABD seansı açık mı? 09:30–16:00 New York saati, hafta içi. Saat dilimini
// Intl ile soruyoruz: yaz saati (EDT/EST) geçişini kendisi hallediyor, elle
// UTC farkı tutmaya gerek kalmıyor.
function usSeansAcik(simdi = new Date()) {
  const bicim = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/New_York', weekday: 'short', hour: '2-digit', minute: '2-digit', hour12: false,
  });
  const parca = Object.fromEntries(bicim.formatToParts(simdi).map((p) => [p.type, p.value]));
  if (['Sat', 'Sun'].includes(parca.weekday)) return false;
  const dk = Number(parca.hour) * 60 + Number(parca.minute);
  return dk >= 9 * 60 + 30 && dk < 16 * 60; // resmi tatiller kapsanmıyor
}

// Canlı fiyatı yayınlanan kaleme işler. BIST'teki mergeLivePrices ile aynı
// mantık: hiçbir alan oynamadıysa ESKİ nesneyi döndürür, böylece değişmeyen
// satır yeniden render edilmez.
function mergeUsLive(items, live) {
  if (!live?.prices) return items;
  const { prices, signals = {}, scores = {} } = live;
  let degisti = false;
  const yeni = items.map((it) => {
    const p = prices[it.ticker];
    if (!p || p.price == null) return it;
    const n = { ...it, price: p.price };
    if (p.changePct != null) n.changePct = p.changePct;
    const s = signals[it.ticker];
    if (s) {
      n.stSignal = s.st ?? null;
      n.wtCrossSignal = s.wt ?? null;
      n.wtSignal = s.wo ?? null;
      n.smc = !!s.smc;
    }
    const sc = scores[it.ticker];
    if (sc) {
      n.score = sc.sc;
      n.signal = sc.sg;
      n.upside12m = sc.u ?? null;
    }
    const anahtarlar = Object.keys(n);
    if (anahtarlar.length === Object.keys(it).length && anahtarlar.every((k) => it[k] === n[k])) return it;
    degisti = true;
    return n;
  });
  return degisti ? yeni : items;
}

function useUsRecommendations() {
  // Yayınlanan liste ve canlı yanıt AYRI tutuluyor, birleştirme render'da
  // yapılıyor. Tek state'te birleştirseydik yarış olurdu: canlı yanıt öneri
  // listesinden önce dönerse boş diziyle birleşip kaybolurdu.
  const [base, setBase] = useState({ loading: true, items: [], updatedAt: null, ok: true });
  const [live, setLive] = useState(null);

  useEffect(() => {
    let cancelled = false;
    fetch(`${API_BASE}/api/us-recommendations`)
      .then((r) => r.json())
      .then((d) => { if (!cancelled) setBase({ loading: false, items: d.items || [], updatedAt: d.updatedAt, ok: true }); })
      .catch(() => { if (!cancelled) setBase((s) => ({ ...s, loading: false, ok: false })); });
    return () => { cancelled = true; };
  }, []);

  // Canlı fiyat/gösterge/puan — BIST ile aynı 18 saniyelik ritim.
  //
  // İlk çekim KOŞULSUZ: göstergeler (overzone/WaveTrend/SuperTrend) yalnızca bu
  // uçtan geliyor, yayınlanan JSON'da yoklar. Seans kapalıyken de bir kez
  // çekmezsek sütunlar sürekli boş kalırdı — Yahoo seans dışında son kapanışı
  // döndüğü için hesaplanan göstergeler yine doğru.
  // ANKET ise yalnızca ABD seansı açıkken ve sayfa görünürken: seans dışında
  // fiyat hareket etmiyor, 18 saniyede bir istek atmanın anlamı yok.
  useEffect(() => {
    let cancelled = false;
    const cek = () => {
      fetch(`${API_BASE}/api/us-prices`)
        .then((r) => (r.ok ? r.json() : null))
        .then((d) => { if (!cancelled && d?.prices) setLive(d); })
        .catch(() => { /* yoksay; bir sonraki turda tekrar denenir */ });
    };
    cek();
    const acik = () => !document.hidden && usSeansAcik();
    const id = setInterval(() => { if (acik()) cek(); }, 18 * 1000);
    const donunce = () => { if (acik()) cek(); };
    document.addEventListener('visibilitychange', donunce);
    return () => { cancelled = true; clearInterval(id); document.removeEventListener('visibilitychange', donunce); };
  }, []);

  const items = useMemo(() => (live ? mergeUsLive(base.items, live) : base.items), [base.items, live]);
  return { ...base, items, canliAt: live?.updatedAt ?? null };
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

// Mobil kart — BIST kartıyla aynı iskelet (card-top / card-price /
// card-metrics), yalnızca gösterge şeridi yerine temel analiz metrikleri.
function UsCard({ s, rank, onSelect }) {
  return (
    <div className="card">
      <div className="card-top">
        <div className="card-id">
          <span className="rank">{rank}</span>
          <div>
            <button className="ticker ticker-link" onClick={() => onSelect(s)} title="Detay/rapor aç">
              {s.ticker} <span className="chart-ico">📄</span>
            </button>
            <div className="name">{s.name}{s.sector ? ` · ${s.sector}` : ''}</div>
          </div>
        </div>
        <SignalBadge signal={s.signal} />
      </div>

      <div className="card-price">
        <span className="card-price-val">
          {fmtNum(s.price)} <span className="cur">{s.currency || 'USD'}</span>
        </span>
        <Pct value={s.changePct} />
      </div>

      <div className="card-metrics">
        <div className="metric">
          <span className="metric-label">Hedef</span>
          <Expected
            value={s.upside12m}
            note={s.upside12m != null
              ? `${s.numAnalysts ?? '?'} analist · hedef $${fmtNum(s.targetMean)}`
              : null}
          />
        </div>
        <div className="metric">
          <span className="metric-label">Puan</span>
          <ScoreBar score={s.score} />
        </div>
      </div>

      <div className="card-metrics">
        <div className="metric">
          <span className="metric-label">Gelir Büyümesi</span>
          <span>{pctCell(s.revenueGrowth)}</span>
        </div>
        <div className="metric">
          <span className="metric-label">Net Marj</span>
          <span>{pctCell(s.profitMargins)}</span>
        </div>
        <div className="metric">
          <span className="metric-label">Net Borç/FAVÖK</span>
          <span>{s.netDebtToEbitda != null ? `${fmtNum(s.netDebtToEbitda)}x` : <span className="muted-dash">—</span>}</span>
        </div>
        <div className="metric">
          <span className="metric-label">FCF Marjı</span>
          <span>{pctCell(s.fcfMargin)}</span>
        </div>
        <div className="metric">
          <span className="metric-label">İleri F/K</span>
          <span>{s.forwardPE != null ? fmtNum(s.forwardPE) : <span className="muted-dash">—</span>}</span>
        </div>
        <div className="metric">
          <span className="metric-label">Rapor</span>
          <span>{s.hasReport ? '📄 var' : <span className="muted-dash">—</span>}</span>
        </div>
      </div>

      <div className="card-signals">
        <div className="sig"><span className="metric-label">overzone</span><IndicatorBadge signal={s.wtSignal} /></div>
        <div className="sig"><span className="metric-label">WaveTrend</span><IndicatorBadge signal={s.wtCrossSignal} /></div>
        <div className="sig"><span className="metric-label">SuperTrend</span><IndicatorBadge signal={s.stSignal} /></div>
      </div>
    </div>
  );
}

export default function UsStocksTab({ view = 'web' }) {
  const { loading, items, updatedAt, ok, canliAt } = useUsRecommendations();
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
        {canliAt && (
          <span className="updated">Fiyat: {new Date(canliAt).toLocaleTimeString('tr-TR')}</span>
        )}
        {updatedAt && (
          <span className="updated">Veri: {new Date(updatedAt).toLocaleString('tr-TR')}</span>
        )}
      </div>

      {loading && <div className="state">Yükleniyor… (ilk açılışta backend uyanması birkaç saniye sürebilir)</div>}
      {!loading && !ok && <div className="state error">ABD hisse verisi alınamadı.</div>}
      {!loading && ok && filtered.length === 0 && (
        <div className="state">{query.trim() ? `“${query.trim()}” ile eşleşen kayıt bulunamadı.` : 'Henüz veri yok.'}</div>
      )}

      {filtered.length > 0 && view === 'web' && (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Hisse</th>
                <th className="num">Fiyat</th>
                <th className="num">Günlük</th>
                <th className="num">Hedef</th>
                <th style={{ minWidth: 110 }}>Puan</th>
                <th>Sinyal</th>
                <th className="num">Gelir Büyümesi</th>
                <th className="num">Net Marj</th>
                <th className="num">Net Borç/FAVÖK</th>
                <th className="num">FCF Marjı</th>
                <th className="num">İleri F/K</th>
                <th>Rapor</th>
                <th>overzone</th>
                <th>WaveTrend</th>
                <th>SuperTrend</th>
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
                  <td className="num">
                    <Expected
                      value={s.upside12m}
                      note={s.upside12m != null
                        ? `${s.numAnalysts ?? '?'} analist · hedef $${fmtNum(s.targetMean)}`
                        : null}
                    />
                  </td>
                  <td><ScoreBar score={s.score} /></td>
                  <td><SignalBadge signal={s.signal} /></td>
                  <td className="num">{pctCell(s.revenueGrowth)}</td>
                  <td className="num">{pctCell(s.profitMargins)}</td>
                  <td className="num">{s.netDebtToEbitda != null ? `${fmtNum(s.netDebtToEbitda)}x` : <span className="muted-dash">—</span>}</td>
                  <td className="num">{pctCell(s.fcfMargin)}</td>
                  <td className="num">{s.forwardPE != null ? fmtNum(s.forwardPE) : <span className="muted-dash">—</span>}</td>
                  <td>{s.hasReport ? <span title="Tam analist raporu mevcut">📄 var</span> : <span className="muted-dash">—</span>}</td>
                  <td><IndicatorBadge signal={s.wtSignal} /></td>
                  <td><IndicatorBadge signal={s.wtCrossSignal} /></td>
                  <td><IndicatorBadge signal={s.stSignal} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {filtered.length > 0 && view === 'mobile' && (
        <div className="cards">
          {filtered.map((s, i) => (
            <UsCard key={s.ticker} s={s} rank={i + 1} onSelect={setSelected} />
          ))}
        </div>
      )}

      {selected && <ReportPanel item={selected} onClose={() => setSelected(null)} />}
    </>
  );
}
