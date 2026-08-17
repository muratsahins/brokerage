import { useEffect, useMemo, useRef, useState, lazy, memo, Suspense } from 'react';
import { API_BASE, fmtNum, norm, roundPrice } from './lib/common.js';
import { Expected, Pct, Tutar } from './lib/ui.jsx';
import { useModalBack } from './lib/useModalBack.js';
import {
  VB_START, vbCleanRetired, vbEmail, vbLoad, vbSave, vbTrade, vbUnitLabel, vbUnitPrice,
} from './lib/vb.js';

// Grafik pop-up'ı lightweight-charts'a bağlı: bundle'ın 109 KB gzip'inin
// 48 KB'ı ondan geliyordu. Yalnızca bir enstrümana tıklanınca gerektiği için
// tembel yükleniyor — ilk açılışta inen JS neredeyse yarıya iniyor.
const ChartModal = lazy(() => import('./ChartModal.jsx'));

// ABD Büyük Şirketler sekmesi (NASDAQ100+S&P100) BIST'ten tamamen izole bir
// veri kaynağı ve arayüz kullanıyor; kendi bundle'ı yalnızca sekmeye
// tıklanınca iner (ChartModal ile aynı tembel yükleme gerekçesi).
const UsStocksTab = lazy(() => import('./UsStocksTab.jsx'));


// Güncel fiyatları (/api/prices) mevcut veriye işler: fiyat + günlük değişim
// (+ metal ₺/gram), AYNI ANDA hesaplanan teknik göstergeler ve canlı fiyattan
// yeniden hesaplanan analist potansiyeli / momentum / puan / sinyal.
// Analist hedefi ve temel veriler yayınlanan veriden gelir (3 saatte bir).
// next, it'in kopyası üzerine kurulduğu için anahtar kümesi it'i kapsar;
// sayıları eşitse alan alan karşılaştırmak yeterli.
function sameItem(it, next) {
  const kn = Object.keys(next);
  if (kn.length !== Object.keys(it).length) return false;
  // Tüm alanlar artık ilkel (sayı/metin/boolean); iç içe nesne kalmadığı için
  // referans karşılaştırması yeterli.
  for (const k of kn) if (it[k] !== next[k]) return false;
  return true;
}

function mergeLivePrices(data, live) {
  if (!live || !live.prices || !data || !data.items) return data;
  const signals = live.signals || {};
  const scores = live.scores || {};
  const metals = live.metals || {};
  let changed = false;
  const items = data.items.map((it) => {
    const p = live.prices[it.ticker];
    if (!p || p.price == null) return it;
    const next = { ...it, price: p.price };
    if (p.changePct != null) next.changePct = p.changePct;
    // Madenlerde ₺/gram artık sunucudan geliyor (Türkiye gram fiyatı ->
    // spot x kur -> vadeli x kur zinciri). Sunucu veremezse eski davranışa
    // düşülür: vadeli USD fiyatın kurla çevrimi.
    if (it.kind === 'metal') {
      const mt = metals[it.ticker];
      if (mt) {
        next.tryPerGram = mt.g;
        next.tryPerGramSource = mt.k;
        if (mt.a != null) next.buyPrice = mt.a;
        if (mt.s != null) next.sellPrice = mt.s;
      } else if (it.usdTry) {
        next.tryPerGram = Math.round((p.price / 31.1034768) * it.usdTry * 100) / 100;
      }
    }
    // Göstergeler: backend bar geçmişi + canlı fiyattan yeniden hesapladıysa
    // yayınlanan (3 saatte bir) değerlerin üstüne yazılır. Sinyal yoksa alan
    // boştur — bu da "artık sinyal yok" demektir, o yüzden temizlenir.
    const s = signals[it.ticker];
    if (s) {
      next.stSignal = s.st ?? null;
      next.wtCrossSignal = s.wt ?? null;
      next.wtSignal = s.wo ?? null;
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
    // Hiçbir alan oynamadıysa ESKİ nesneyi döndür. Satır bileşenleri memo'lu
    // olduğu için aynı referans = o satır hiç yeniden render edilmez. Seans
    // dışında hiçbir şey değişmediğinden data da aynı kalır ve React tüm
    // güncellemeyi baştan iptal eder.
    if (sameItem(it, next)) return it;
    changed = true;
    return next;
  });
  // Hiçbir kalem oynamadıysa ESKİ diziyi geri veriyoruz: "Fiyat: …" saati yine
  // ilerler (anket çalışıyor, ekran donmuş görünmez) ama liste referansı
  // değişmediği için süzme/sıralama useMemo'ları ve tüm satırlar atlanır.
  return { ...data, items: changed ? items : data.items, priceUpdatedAt: live.updatedAt };
}

// ₺/gram hangi kaynaktan geldi? Yahoo'nun ons fiyatı VADELİ kontrat olduğu için
// doğrudan çevirmek Türkiye gram fiyatından ~%1,7 sapıyor; zincir en yakından
// başlar. Fare ile üstüne gelince kaynağı görünür.
const GRAM_KAYNAK = {
  'altin.in': 'altin.in satış fiyatı — Türkiye’de gösterilen gram fiyatının kendisi',
  spot: 'Spot ons fiyatı × TCMB döviz satış kuru (~%0,2 sapma)',
  vadeli: 'Vadeli ons fiyatı × TCMB döviz satış kuru — yaklaşık (~%1,2 sapma)',
};

const SIGNAL_STYLES = {
  AL: { label: 'AL', bg: '#0f5132', fg: '#4ade80' },
  TUT: { label: 'TUT', bg: '#665200', fg: '#fbbf24' },
  'İZLE': { label: 'İZLE', bg: '#3a3a3a', fg: '#cbd5e1' },
};

// Hedef fiyat notu para birimine göre: ABD hisseleri USD, BIST/maden ₺.
const curSym = (s) => (s.currency === 'USD' ? '$' : '₺');

// Madenlerde gösterge YOK: bar geçmişi vadeli kontrata ait, gösterilen fiyat
// ise spot. Yayınlanan veride eski sinyaller kalmış olabileceği için (canlı yol
// artık maden sinyali göndermiyor, dolayısıyla üstüne yazamıyor) okuma burada
// süzülür — böylece bir sonraki veri turu beklenmeden temiz görünür.
const sig = (s, alan) => (s.kind === 'metal' ? null : s[alan]);

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

// Tablo satırı ve mobil kart ayrı, memo'lu bileşenler. 619 kalemin fiyatı
// 18 saniyede bir tazeleniyor ama tek tick'te hepsi birden oynamıyor;
// mergeLivePrices değişmeyen kaleme ESKİ nesneyi geri verdiği için burada
// referans karşılaştırması tutuyor ve o satır hiç yeniden render edilmiyor.
// onSelect olarak setChartItem geçiliyor; useState kurucusunun kimliği sabit
// olduğu için memo bozulmuyor (satır içi ok fonksiyonu geçilseydi bozulurdu).
const StockRow = memo(function StockRow({ s, rank, showBuySell, onSelect }) {
  return (
    <tr>
      <td className="rank">{rank}</td>
      <td>
        {/* Madenlerde grafik yok: bar geçmişi vadeli kontrata ait, gösterilen
            fiyat ise spot. ABD hisselerinde grafik/sanal borsa açık — ₺
            karşılığı (tryPrice) üzerinden alınıp satılır. */}
        {s.kind === 'metal' ? (
          <span className="ticker">{s.ticker}</span>
        ) : (
          <button className="ticker ticker-link" onClick={() => onSelect(s)} title="Grafiği aç">
            {s.ticker} <span className="chart-ico">📈</span>
          </button>
        )}
        <div className="name">{s.name}{s.sector ? ` · ${s.sector}` : ''}</div>
      </td>
      <td className="num">
        {fmtNum(s.price)} <span className="cur">{s.currency || 'TRY'}</span>
        {s.tryPerGram != null && (
          <div className="exp-note" title={GRAM_KAYNAK[s.tryPerGramSource]}>≈ {fmtNum(s.tryPerGram)} ₺/gr</div>
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
      <td className="num">
        <Expected
          value={s.upside12m}
          note={s.upside12m != null
            ? `${s.numAnalysts ?? '?'} analist · hedef ${fmtNum(s.targetMean)}${curSym(s)}`
            : null}
        />
      </td>
      <td><ScoreBar score={s.score} /></td>
      <td><SignalBadge signal={s.signal} /></td>
      <td><IndicatorBadge signal={sig(s, 'wtSignal')} /></td>
      <td><IndicatorBadge signal={sig(s, 'wtCrossSignal')} /></td>
      <td><IndicatorBadge signal={sig(s, 'stSignal')} /></td>
    </tr>
  );
});

const StockCard = memo(function StockCard({ s, rank, onSelect }) {
  return (
    <div className="card">
      <div className="card-top">
        <div className="card-id">
          <span className="rank">{rank}</span>
          <div>
            {s.kind === 'metal' ? (
              <span className="ticker">{s.ticker}</span>
            ) : (
              <button className="ticker ticker-link" onClick={() => onSelect(s)} title="Grafiği aç">
                {s.ticker} <span className="chart-ico">📈</span>
              </button>
            )}
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
        <div className="exp-note" title={GRAM_KAYNAK[s.tryPerGramSource]}>≈ {fmtNum(s.tryPerGram)} ₺/gr</div>
      )}
      {s.tryPrice != null && (
        <div className="exp-note">≈ {fmtNum(s.tryPrice)} ₺</div>
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
              ? `${s.numAnalysts ?? '?'} analist · hedef ${fmtNum(s.targetMean)}${curSym(s)}`
              : null}
          />
        </div>
        <div className="metric">
          <span className="metric-label">Puan</span>
          <ScoreBar score={s.score} />
        </div>
      </div>

      <div className="card-signals">
        <div className="sig"><span className="metric-label">overzone</span><IndicatorBadge signal={sig(s, 'wtSignal')} /></div>
        <div className="sig"><span className="metric-label">WaveTrend</span><IndicatorBadge signal={sig(s, 'wtCrossSignal')} /></div>
        <div className="sig"><span className="metric-label">SuperTrend</span><IndicatorBadge signal={sig(s, 'stSignal')} /></div>
      </div>
    </div>
  );
});

// Kademeli render: 619 kalemin hepsini birden basmak ~17.000 DOM düğümü demek
// ve ilk boyamayı (özellikle telefonda) uzatıyor. Önce bir parti basılır,
// listenin sonundaki nöbetçi öğe görünür olunca bir parti daha eklenir —
// kullanıcı kaydırdıkça büyür. Sabit satır yüksekliği varsaymadığı için
// klasik sanallaştırmanın zıplama/kaydırma sorunları yok.
// Not: arama zaten TÜM kalemler üzerinde çalışıyor (data.items), yani
// basılmamış satırlar arama sonuçlarından düşmez.
const SAYFA = 120;

// Fiyat damgası bu kadar geri kalırsa 'gecikiyor' rozeti çıkar. Anket 18 sn,
// sunucu önbelleği 15 sn: 2 dakika ≈ arka arkaya 8 başarısız tur demek.
const GECIKME_ESIGI_MS = 2 * 60 * 1000;

function useKademeliListe(items, sifirlaAnahtari) {
  const [n, setN] = useState(SAYFA);
  const nobetciRef = useRef(null);
  const hepsi = n >= items.length;

  // Sekme/filtre/sıralama/arama değişince baştan başla.
  useEffect(() => { setN(SAYFA); }, [sifirlaAnahtari]);

  const dahaGoster = () => setN((mevcut) => Math.min(mevcut + SAYFA, items.length));

  useEffect(() => {
    const el = nobetciRef.current;
    if (!el || hepsi) return;
    // rootMargin: ekranın biraz altındakini de önceden bas, kaydırırken
    // boşluk görünmesin.
    const io = new IntersectionObserver((girisler) => {
      if (girisler.some((g) => g.isIntersecting)) {
        setN((mevcut) => Math.min(mevcut + SAYFA, items.length));
      }
    }, { rootMargin: '600px 0px' });
    io.observe(el);
    return () => io.disconnect();
  }, [n, items.length, hepsi]);

  return { gorunen: hepsi ? items : items.slice(0, n), nobetciRef, hepsi, dahaGoster };
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

// BIST TARAMA sekmesi iki grup gösterir (Backend /api/alerts tarar):
//   • ALIM ADAYLARI (yalnızca BIST 100 hisseleri; kıymetli madenler hariç): Göreceli
//     Güç Çekirdekli Momentum/Pullback Sistemi — top %20 RS sıralaması + yön
//     filtresi (reel/relative bazda) + basit geri çekilme girişi, hepsi birden
//     (bkz. backend/src/alerts.js + indicators.js rsYonFiltresi/rsGirisTetigi).
//     Sunucu en taze sinyali başa koyar (barsAgo artan); gösterilen stop güncel
//     bara göre hesaplanır, sinyal barına göre değil.
//     DÜRÜSTLÜK: ~180 günlük BIST 100 testinde medyan R negatif çıktı —
//     kanıtlanmış bir kenarı yok, bilgi amaçlı bir tarayıcıdır.
//   • KENDİ HİSSELERİM: SuperTrend son barda SAT'a dönen hisselerden Sanal
//     Borsa portföyünde olanlar. Portföy tarayıcıda durur, sunucuya gitmez —
//     kesişim burada yapılır.

// UYARI taraması UYGULAMA SEVİYESİNDE tutulur: sekme kapalıyken de sürer ki
// yeni sinyal geldiğinde sekme yanıp sönerek haber verebilsin.
function useAlerts() {
  const [state, setState] = useState({ loading: true, items: [], stSell: [], updatedAt: null, stats: null });
  useEffect(() => {
    let cancelled = false;
    const load = () => fetch(`${API_BASE}/api/alerts`)
      .then((r) => r.json())
      .then((d) => { if (!cancelled) setState({ loading: false, items: d.items || [], stSell: d.stSell || [], updatedAt: d.updatedAt, stats: d.stats, lastBarDate: d.lastBarDate }); })
      .catch(() => { if (!cancelled) setState((s) => ({ ...s, loading: false })); });
    load();
    // Sayfa arka plandayken tarama çekilmez; sayfaya dönülünce hemen tazelenir
    // (yeni sinyal varsa sekme o an yanıp sönmeye başlar).
    const id = setInterval(() => {
      if (document.visibilityState === 'visible') load();
    }, 60 * 1000); // tarama sunucuda ~60 sn önbellekli
    const donunce = () => { if (document.visibilityState === 'visible') load(); };
    document.addEventListener('visibilitychange', donunce);
    return () => {
      cancelled = true;
      clearInterval(id);
      document.removeEventListener('visibilitychange', donunce);
    };
  }, []);
  return state;
}

// Sanal Borsa portföyündeki hisse kodları ("kendi hisselerim"). Tarama her
// tazelendiğinde ve UYARI sekmesine girildiğinde yeniden okunur — arada alım
// satım yapılmış olabilir.
function usePortfolioTickers(dep) {
  return useMemo(() => {
    const pf = vbLoad(vbEmail());
    return new Set(Object.keys(pf?.positions || {}));
  }, [dep]);
}

// Bir uyarı satırının kimliği: grup + hisse + tetiklenen gösterge/yön kümesi.
// Grup da girer, çünkü aynı hisse iki grupta birden çıkabilir.
const alertKey = (a) => `${a.grup || 'al'}/${a.ticker}:${a.signals.map((s) => `${s.ind}${s.dir}`).sort().join('|')}`;

// GÖRÜLDÜ durumu: hangi uyarıları kullanıcı UYARI sekmesinde açıkça gördü.
// Tarayıcıda saklanır, son bar tarihi (lastBarDate) değişince sıfırlanır —
// yeni seansın sinyalleri yeniden haber verilir.
const SEEN_KEY = 'alertsSeen';
function loadSeen() {
  try {
    const s = JSON.parse(localStorage.getItem(SEEN_KEY) || 'null');
    return s && Array.isArray(s.keys) ? { date: s.date, keys: new Set(s.keys) } : null;
  } catch { return null; }
}

// Yeni (henüz görülmemiş) uyarı sayısı + "gördüm" işaretleyicisi.
function useNewAlerts(alerts, active) {
  const [seen, setSeen] = useState(() => loadSeen());
  const { lastBarDate, items, loading } = alerts;

  // Son bar tarihi değiştiyse görüldü listesi geçersiz — yeni seansın sinyalleri haber verilir.
  const valid = seen && lastBarDate && seen.date === lastBarDate ? seen : null;
  const newKeys = useMemo(() => {
    if (loading) return new Set();
    return new Set(items.map(alertKey).filter((k) => !valid || !valid.keys.has(k)));
  }, [items, valid, loading]);
  // "YENİ" rozetli satırlar: sekmeye girildiği ANDA görülmemiş olanlar. Değer
  // render sırasında dondurulur (efekt içinde state güncellemek yerine) — sekme
  // değişimiyle aynı render'da hesaplandığı için görüldü kaydı yazıldıktan
  // sonra da o ziyaret boyunca sabit kalır.
  const wasActive = useRef(false);
  const highlightRef = useRef(new Set());
  if (!active) highlightRef.current = new Set();
  else if (!wasActive.current) highlightRef.current = new Set(newKeys); // memo'yu kirletmemek için kopya
  else newKeys.forEach((k) => highlightRef.current.add(k)); // sekme açıkken gelen yeniler
  wasActive.current = active;

  // GÖRÜLDÜ kaydı yalnızca sayfa gerçekten görünürken yazılır — sekme arka
  // planda açık duruyorsa kullanıcı görmemiştir; sayfaya döndüğünde
  // (visibilitychange) işaretlenir.
  useEffect(() => {
    if (!active || loading || !lastBarDate) return undefined;
    const mark = () => {
      if (document.visibilityState !== 'visible') return;
      const next = { date: lastBarDate, keys: items.map(alertKey) };
      try { localStorage.setItem(SEEN_KEY, JSON.stringify(next)); } catch { /* yoksay */ }
      setSeen({ date: next.date, keys: new Set(next.keys) });
    };
    mark();
    document.addEventListener('visibilitychange', mark);
    return () => document.removeEventListener('visibilitychange', mark);
  }, [active, loading, lastBarDate, items]);

  return { newCount: newKeys.size, highlight: highlightRef.current };
}

function AlertList({ items, onSelect, state, highlight, mine, hasPortfolio }) {
  const byTicker = useMemo(() => new Map(items.map((i) => [i.ticker, i])), [items]);
  const list = state.items;
  const warming = state.stats && state.stats.ready < state.stats.total * 0.9;
  // Tarama artık son tamamlanan seansı da gösterir (seans kapalıyken dahil) —
  // scanned===0 yalnızca bar geçmişi henüz hiç yüklenmediğinde (sunucu yeni
  // başladı) gerçekleşir.
  const noSession = state.stats && state.stats.scanned === 0;
  const trDate = (d) => (d ? new Date(d).toLocaleDateString('tr-TR') : null);

  if (state.loading) return <div className="state">Taranıyor…</div>;

  const satir = (a) => {
    const it = byTicker.get(a.ticker);
    const taze = highlight?.has(alertKey(a));
    return (
      <button
        key={alertKey(a)}
        className={`alert-row ${a.dir === 'AL' ? 'al' : 'sat'} ${taze ? 'fresh' : ''}`}
        onClick={() => it && onSelect(it)}
        title={it ? 'Grafiği aç' : ''}
      >
        <span className="alert-main">
          {taze && <span className="alert-new" title="Bu ziyarette yeni gelen sinyal">YENİ</span>}
          <span className="ticker">{a.ticker}</span>
          <span className="name">{a.name || it?.name || ''}</span>
        </span>
        <span className="alert-meta">
          {a.signals.map((s) => (
            <span
              key={s.ind}
              className={`alert-sig ${s.dir === 'AL' ? 'al' : 'sat'}`}
              title={s.state ? 'Gösterge durumu (dönüş barı değil)' : 'Sinyalin oluştuğu bar'}
            >
              {s.indLabel} <strong>{s.dir}</strong>
              {s.state ? ' (trend)' : ''}
            </span>
          ))}
          {a.stopSeviye != null && (
            <span className="alert-sig sat" title="Leg4: ATR tabanlı başlangıç stopu — GÜNCEL bara göre hesaplanır (sinyal barına göre değil), yani bugün girilseydi geçerli olacak seviye. Bilgi amaçlı, otomatik emir değil.">
              Stop <strong>{fmtNum(a.stopSeviye)}</strong>
            </span>
          )}
          <span className="news-time">{a.barsAgo === 0 ? 'son bar' : `${a.barsAgo} bar önce`}</span>
        </span>
      </button>
    );
  };

  return (
    <>
      <div className="fav-note">
        <strong>BIST Tarama</strong> — günlük grafikte{' '}
        <strong>
          {trDate(state.lastBarDate) ? `son seansın (${trDate(state.lastBarDate)})` : 'son seansın'}
        </strong>{' '}
        barı taranır, iki grup:{' '}
        <strong>Alım adayları</strong> = <strong>Göreceli Güç Çekirdekli Momentum/Pullback Sistemi</strong> —
        üç bacak birden: <strong>1) Göreceli Güç</strong> (son 60 barlık getiride BIST 100 içinde en güçlü
        %20'de olmak) <strong>+</strong> <strong>2) Yön Filtresi</strong> (kapanış/XU100 oranı, yükselen
        50 günlük ortalamasının üstünde — nominal TL fiyat değil, enflasyon ortamında ayırt ediciliğini
        kaybeder) <strong>+</strong> <strong>3) Giriş</strong> (kapanış, yükselen 20 günlük ortalamayı yukarı
        kesmiş — basit geri çekilme). Son <code>1 hafta</code> içinde HERHANGİ bir gün üçü birden sağlanmışsa
        yakalanır; liste <strong>en taze sinyal başta</strong> sıralanır (giriş bir zamanlama tetiğidir,
        değeri günler içinde erir — satırdaki “son bar / N bar önce” etiketine bakın).{' '}
        <strong>Stop</strong> etiketi Leg4'ün (risk/çıkış) ATR tabanlı başlangıç stop seviyesi;
        <strong> güncel bara göre</strong> hesaplanır, yani bugün girilseydi geçerli olacak seviyedir —
        bilgi amaçlı, otomatik emir değil. Yalnızca <strong>BIST 100 hisseleri</strong> taranır
        (kıymetli madenler hariç).{' '}
        <strong>Kendi hisselerim</strong> = <code>SuperTrend</code> <strong>SAT</strong>'a dönenlerden Sanal
        Borsa portföyünde olanlar. Seans açıkken son bar canlı fiyatla güncellenir (kapanış beklenmeden gün
        içinde görünür); seans kapalıyken son tamamlanan seansın sonucu gösterilmeye devam eder.
        {state.stats && ` (${state.stats.scanned} hisse son seansta tarandı.)`}
        <span className="muted-dash"> DÜRÜSTLÜK: bu sistem ~180 günlük BIST 100 tarihsel testinde MEDYAN
        R negatif çıktı (tipik işlem kayıp) — kanıtlanmış bir kenarı yok, pozitif ortalama 1-2 aykırı
        işleme bağımlıydı. Bilgi amaçlıdır, yatırım tavsiyesi değildir.</span>
      </div>

      <div className="filters">
        <span className="updated">{list.length + mine.length} uyarı</span>
        {state.updatedAt && (
          <span className="updated">Tarama: {new Date(state.updatedAt).toLocaleTimeString('tr-TR')}</span>
        )}
      </div>

      {noSession ? (
        <div className="state">
          Veri henüz hazır değil — bar geçmişi sunucuda doldurulmaya devam ediyor, birazdan tekrar bakın.
        </div>
      ) : (
        <>
          <div className="alert-group">Alım adayları — Göreceli Güç Momentum/Pullback (son 1 hafta, BIST 100 · en taze başta)</div>
          {list.length === 0 ? (
            <div className="state">
              Son 1 haftada üç bacağı (Göreceli Güç + Yön Filtresi + Giriş) birden sağlayan hisse yok.
              {warming && ' Bar geçmişi hâlâ hazırlanıyor, birazdan tekrar bakın.'}
            </div>
          ) : (
            <div className="news-list">{list.map(satir)}</div>
          )}

          <div className="alert-group">Kendi hisselerim — SuperTrend SAT'a döndü</div>
          {mine.length === 0 ? (
            <div className="state">
              {hasPortfolio
                ? 'Portföyündeki hisselerde son seansta SuperTrend SAT dönüşü yok.'
                : 'Sanal Borsa portföyün boş — hisse aldığında SAT dönüşleri burada uyarır.'}
            </div>
          ) : (
            <div className="news-list">{mine.map(satir)}</div>
          )}
        </>
      )}
    </>
  );
}

function VirtualTrade({ items, onSelect }) {
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
    // Takip dışı kalan (kripto) pozisyonları maliyetinden tasfiye et ve kalıcı yaz.
    const { pf: cleaned, note } = vbCleanRetired(p || { cash: VB_START, positions: {}, history: [] });
    if (note) {
      try { localStorage.setItem('vb_pf_' + email, JSON.stringify(cleaned)); } catch { /* yoksay */ }
      setMsg({ t: 'ok', m: note });
    }
    setPf(cleaned);
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
    // Bugünkü K/Z: dünkü kapanış = fiyat / (1 + günlük% / 100).
    // Kıymetli maden kapsam dışı — changePct USD/ons değişimi, ₺/gram fiyatı
    // ayrıca kurdan etkileniyor; ikisini çarpmak yanlış sayı üretir
    // (ChartModal'daki ile aynı gerekçe).
    const gunlukVar = it && it.kind === 'stock' && price != null && it.changePct != null;
    const dunkuFiyat = gunlukVar ? price / (1 + it.changePct / 100) : null;
    return {
      t, it, qty: p.qty, avgCost: p.avgCost, price, value,
      pnl: value - cost, pnlPct: cost ? (value - cost) / cost * 100 : 0,
      gunluk: gunlukVar ? p.qty * (price - dunkuFiyat) : null,
      dunkuDeger: gunlukVar ? p.qty * dunkuFiyat : null,
    };
  }).sort((a, b) => b.value - a.value);
  const holdings = posList.reduce((s, p) => s + p.value, 0);
  const total = pf.cash + holdings;
  const totalPnl = total - VB_START;

  // Portföyün bugünkü toplam K/Z'si. Yüzde, kapsanan pozisyonların DÜNKÜ
  // değerine göre — nakit gün içinde hareket etmediği için toplam portföye
  // bölmek günlük hareketi olduğundan küçük gösterirdi.
  const gunlukKapsam = posList.filter((p) => p.gunluk != null);
  const gunlukToplam = gunlukKapsam.length
    ? gunlukKapsam.reduce((s, p) => s + p.gunluk, 0)
    : null;
  const gunlukDunku = gunlukKapsam.reduce((s, p) => s + p.dunkuDeger, 0);
  const gunlukPct = gunlukToplam != null && gunlukDunku ? gunlukToplam / gunlukDunku * 100 : null;
  const gunlukDisi = posList.length - gunlukKapsam.length;

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
        {posList.length > 0 && (
          <div className="vb-stat">
            <span className="metric-label">Bugün</span>
            {gunlukToplam != null ? (
              /* Not AYRI satırda: aynı span içinde akınca yüzdeye yapışıp
                 "%2,651 maden…" gibi okunuyordu. .vb-stat sütun yönlü flex
                 olduğu için kardeş öğeler alt alta dizilir. */
              <>
                <span className="vb-gunluk"><Tutar value={gunlukToplam} /> <Pct value={gunlukPct} /></span>
                {gunlukDisi > 0 && (
                  <span className="exp-note" title="Madende günlük yüzde USD fiyatın değişimidir; ₺ karşılığı ayrıca döviz kurundan etkilendiği için hesaba katılmıyor.">
                    {gunlukDisi} USD fiyatlı pozisyon hariç
                  </span>
                )}
              </>
            ) : (
              <span className="muted-dash" title="Yalnızca USD fiyatlı (maden/ABD hissesi) pozisyon var; günlük K/Z kur etkisi nedeniyle hesaplanmıyor.">—</span>
            )}
          </div>
        )}
      </div>

      <div className="vb-trade">
        <input className="search-input vb-search" placeholder="Al/sat için hisse veya maden ara (ör. GARAN, altın, AAPL)" value={q} onChange={(e) => setQ(e.target.value)} />
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
                <div>
                  {/* Hisse başlığı grafiği açar; satırın kalanı işlem için seçer.
                      Tıklama yukarı da yayılır, yani grafik açılırken pozisyon
                      alım-satım formunda da seçili olur. */}
                  {p.it && p.it.kind !== 'metal' ? (
                    <button
                      className="ticker ticker-link"
                      onClick={() => onSelect?.(p.it)}
                      title="Grafiği aç"
                    >
                      {p.t} <span className="chart-ico">📈</span>
                    </button>
                  ) : (
                    <strong>{p.t}</strong>
                  )}
                  {' '}<span className="name">{p.it?.name}</span>
                </div>
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
  const [tab, setTab] = useState('bist100'); // açılış: BIST 100
  // Sıralama: 'ticker' (alfabetik, varsayılan) | 'score' (puan). Tercih saklanır.
  // Kaldırılan 'fresh' (tazelik) seçeneği bazı
  // tarayıcılarda kayıtlı kalmış olabilir; düğmesi artık yok, o yüzden
  // varsayılana çevriliyor (yoksa hiçbir düğme seçili görünmezdi).
  const [sort, setSort] = useState(() => {
    try {
      const k = localStorage.getItem('sortMode');
      return k === 'ticker' || k === 'score' ? k : 'ticker';
    } catch { return 'ticker'; }
  });
  const [query, setQuery] = useState('');
  const [chartItem, setChartItem] = useState(null); // grafik pop-up'ı için seçili enstrüman
  // Grafik açıkken geri tuşu siteden çıkmasın, sadece pop-up'ı kapatsın.
  // ChartModal'ın İÇİNDE değil burada: pop-up tembel yükleniyor ("Grafik
  // yükleniyor…" ekranı), geçmiş kaydı dokunur dokunmaz eklensin.
  useModalBack(chartItem != null, () => setChartItem(null));
  const [gecikti, setGecikti] = useState(false); // fiyat akışı duraklamış mı
  // Görünüm: 'mobile' (kart, yatay scroll yok) | 'web' (tam tablo).
  const [view, setView] = useState(() => {
    try { return localStorage.getItem('viewMode') || (window.innerWidth <= 640 ? 'mobile' : 'web'); }
    catch { return 'web'; }
  });

  // ABD hisseleri Favori Listesi'nde (aynı 4 koşulla) ve Sanal Borsa'da
  // (alım-satım için arama havuzu) kullanılır. ABD verisi BIST'ten ayrı bir
  // uçtan geldiği için (UsStocksTab ile aynı kaynak) yalnızca bu iki sekmeden
  // biri ilk açıldığında, tembel olarak çekilir.
  const [usFav, setUsFav] = useState({ items: [], loading: false, fetched: false });
  useEffect(() => {
    if ((tab !== 'fav' && tab !== 'trade') || usFav.fetched) return;
    setUsFav((s) => ({ ...s, loading: true }));
    fetch(`${API_BASE}/api/us-recommendations`)
      .then((r) => r.json())
      .then((d) => {
        setUsFav({ items: d.items || [], loading: false, fetched: true });
        // Yayınlanan veri günde bir yenilenir ve bazı ticker'larda gösterge
        // eksik kalabilir (Yahoo'nun tek tük başarısız olduğu barlar). ABD
        // sekmesiyle (UsStocksTab) AYNI canlı uçtan (bar geçmişinden anlık
        // hesaplanan) TEK SEFERLİK üstüne yazılır — bu yüzden Favori Listesi
        // artık sekme açılır açılmaz güncel, ayrıca canlı yenileme gerekmez.
        fetch(`${API_BASE}/api/us-prices`)
          .then((r) => (r.ok ? r.json() : null))
          .then((live) => {
            if (!live?.prices && !live?.signals) return;
            setUsFav((s) => ({
              ...s,
              items: s.items.map((it) => {
                const p = live.prices?.[it.ticker];
                const sig = live.signals?.[it.ticker];
                if (!p && !sig) return it;
                const next = { ...it };
                if (p?.price != null) {
                  next.price = p.price;
                  if (p.changePct != null) next.changePct = p.changePct;
                }
                if (sig) {
                  next.wtSignal = sig.wo ?? null;
                  next.wtCrossSignal = sig.wt ?? null;
                  next.stSignal = sig.st ?? null;
                }
                return next;
              }),
            }));
          })
          .catch(() => { /* yoksay — yayınlanan veriyle devam */ });
      })
      .catch(() => setUsFav({ items: [], loading: false, fetched: true }));
  }, [tab, usFav.fetched]);

  // İlk boyama için statik tohum: build anındaki data/recommendations.json,
  // Vercel'in CDN'inden (~50 ms) gelir. Render uykudaysa /api/recommendations
  // 30-60 sn sürebiliyor; tablo o süre boyunca boş kalmasın diye tohumla
  // basılır. Gerçek yanıt gelir gelmez üstüne yazılır — bu yüzden tohum
  // YALNIZCA elde henüz veri yokken uygulanır (setData içindeki kontrol).
  async function loadSeed() {
    try {
      const r = await fetch(`${import.meta.env.BASE_URL}seed.json`);
      if (!r.ok) return; // tohum üretilmemişse (ör. dev) sessizce geç
      const json = await r.json();
      if (!json?.items?.length) return;
      let used = false;
      setData((prev) => {
        if (prev.items.length) return prev; // gerçek veri önce geldi
        used = true;
        return { ...json, source: 'seed' };
      });
      if (used) setLoading(false);
    } catch { /* yoksay — API yüklemesi zaten sürüyor */ }
  }

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
    loadSeed(); // CDN'den anlık tohum; triggerRefresh() ile yarışır, geç kalan kaybeder
    // Sayfa ilk açıldığında "↻ Yenile" butonuyla AYNI zorla yenilemeyi tetikler
    // (POST /api/refresh -> load()) — böylece kullanıcı Render'ın 30 dk'lık pasif
    // arka plan senkronunu beklemeden en taze yayınlanan veriyi görür. Ucuz: normal
    // durumda yalnızca GitHub'daki yayınlanan JSON'u tekrar okur, Yahoo'ya gitmez
    // (bkz. service.js loadPublished/syncData).
    triggerRefresh();
    // Sayfa arka plandayken (başka sekme/uygulama) çekim yapılmaz: kullanıcı
    // görmüyor, ama sunucu her seferinde ~700 enstrümanın göstergesini
    // hesaplıyor ve telefonda pil yakıyordu. Sayfaya dönülünce hemen tazelenir.
    const gorunur = () => document.visibilityState === 'visible';
    const idFull = setInterval(() => { if (gorunur()) load(); }, 15 * 60 * 1000); // tüm veri 15 dk
    const idPrice = setInterval(() => { if (gorunur()) refreshPrices(); }, 18 * 1000); // fiyat ~18 sn
    const onFocus = () => { if (gorunur()) refreshPrices(); };
    document.addEventListener('visibilitychange', onFocus);
    window.addEventListener('focus', onFocus);
    return () => {
      clearInterval(idFull);
      clearInterval(idPrice);
      document.removeEventListener('visibilitychange', onFocus);
      window.removeEventListener('focus', onFocus);
    };
  }, []);

  // Sekmeler — site kapsamı yalnızca üç grup: BIST 100, kıymetli maden, ABD.
  const TABS = [
    // BIST (tümü), BIST 30 ve BIST 50 sekmeleri kaldırıldı; açılış BIST 100.
    // Endeks dışı BIST hisseleri de kaldırıldı (backend other-stocks.js silindi).
    { key: 'bist100', label: 'BIST 100',       match: (i) => i.bist != null && i.bist <= 100 },
    // Emtia (Brent) ve kripto kaldırıldı — backend'de kind:'emtia'/'crypto'
    // desteğiyle birlikte silindi (stocks.js KAPSAM notu). Bu sekmede artık
    // yalnızca kıymetli madenler var.
    { key: 'metal',   label: 'Kıymetli Maden', match: (i) => i.kind === 'metal' },
    // ABD Büyük Şirketler: BIST'ten ayrı bir veri kaynağı (data.items içinde
    // değil), o yüzden match yok — UsStocksTab kendi verisini kendi çeker.
    { key: 'us',      label: '🇺🇸 ABD Hisseleri' },
  ];
  // Üst şerit: haberler + BIST TARAMA (Göreceli Güç Çekirdekli
  // Momentum/Pullback Sistemi, yalnızca BIST 100; eskiden "Dikkat Çekenler",
  // öncesinde KAP'ın yerini almıştı).
  // Anahtar 'uyari' olarak kaldı: localStorage'daki görülmüş sinyal kaydı
  // (alertsSeen) ve blink mantığı buna bağlı, etiket değişikliği onları
  // etkilemesin.
  const UYARI_TAB = { key: 'uyari', label: '🔍 BIST Tarama' };
  const NEWS_TABS = [
    { key: 'news',  label: '📰 Haberler', news: 'news' },
    UYARI_TAB,
  ];
  // Favori listesi: 4 teknik+analist koşulunu birden sağlayan hisseler
  // (BIST + ABD — aynı koşullar, ayrı veri kaynaklarından gelir).
  const FAV_TAB = {
    key: 'fav',
    label: '⭐ Favori Listesi',
    match: (i) => i.kind === 'stock'
      && i.wtSignal === 'AL' && i.wtCrossSignal === 'AL' && i.stSignal === 'AL'
      && (i.recommendationKey === 'buy' || i.recommendationKey === 'strong_buy'),
  };
  // ABD hisseleri BIST'ten ayrı bir uçtan gelir (usFav). Sanal Borsa'da (ve
  // grafik/alım-satım panelinde) TEK para biriminde kalınsın diye ₺ karşılığı
  // (tryPrice) burada hesaplanır — kıymetli madenlerle AYNI desen. Kur, BIST
  // verisindeki herhangi bir maden kaleminden okunur (service.js maden
  // dalında usdTry ekliyor; emtia/kripto kaldırıldıktan sonra USD'li tek
  // kaynak orası).
  const usdTryRate = useMemo(
    () => data.items.find((i) => i.usdTry != null)?.usdTry ?? null,
    [data.items],
  );
  const usTradableItems = useMemo(
    () => usFav.items.map((i) => ({
      ...i,
      kind: 'us-stock',
      bist: null,
      tryPrice: usdTryRate != null ? roundPrice(i.price * usdTryRate) : null,
    })),
    [usFav.items, usdTryRate],
  );
  // Favori Listesi: AYNI 4 koşulla süzülen alt küme.
  const usFavItems = useMemo(
    () => usTradableItems.filter((i) => i.wtSignal === 'AL' && i.wtCrossSignal === 'AL' && i.stSignal === 'AL'
      && (i.recommendationKey === 'buy' || i.recommendationKey === 'strong_buy')),
    [usTradableItems],
  );
  // Sanal Borsa'nın arama/alım-satım havuzu: BIST + ABD birlikte.
  const tradeItems = useMemo(
    () => [...data.items, ...usTradableItems],
    [data.items, usTradableItems],
  );
  const TRADE_TAB = { key: 'trade', label: '💼 Sanal Borsa' };
  const activeTab = [...TABS, FAV_TAB, TRADE_TAB, ...NEWS_TABS].find((t) => t.key === tab) ?? TABS[0];
  const isNews = !!activeTab.news;

  // UYARI taraması sekme kapalıyken de sürer; görülmemiş yeni sinyal varsa
  // sekme yanıp söner, sekmeye girilince (sayfa görünürken) söner.
  // "Kendi hisselerim" grubu: SuperTrend SAT dönüşlerinden portföyde olanlar.
  const alerts = useAlerts();
  const myTickers = usePortfolioTickers(`${tab}|${alerts.updatedAt}`);
  const mine = useMemo(
    () => (alerts.stSell || []).filter((a) => myTickers.has(a.ticker)),
    [alerts.stSell, myTickers],
  );
  // Yanıp sönme iki grubun toplamına bakar.
  const alertsAll = useMemo(
    () => ({ ...alerts, items: [...alerts.items, ...mine] }),
    [alerts, mine],
  );
  const { newCount, highlight } = useNewAlerts(alertsAll, tab === 'uyari');

  // Önce aktif sekmeye göre, sonra sinyale göre süz. Favori sekmesinde BIST
  // eşleşmelerinin üstüne aynı koşulu sağlayan ABD hisseleri de eklenir.
  const inTab = useMemo(() => {
    const base = activeTab.match ? data.items.filter(activeTab.match) : [];
    return tab === 'fav' ? [...base, ...usFavItems] : base;
  }, [data.items, usFavItems, tab]);

  // Arama varsa TÜM enstrümanlarda (sekmeden bağımsız), yoksa aktif sekmede süz.
  const searching = query.trim().length > 0;
  const items = useMemo(() => {
    const nq = norm(query.trim());
    let list = nq
      ? data.items.filter((i) =>
          norm(i.ticker).includes(nq) || norm(i.name).includes(nq) || norm(i.sector).includes(nq))
      : inTab;
    if (filter !== 'ALL') list = list.filter((i) => i.signal === filter);
    // Sıralama kullanıcının seçimine göre: varsayılan alfabetik (hisse kodu),
    // 'score' seçilirse puana göre. Puan canlı fiyatla değiştiği için sıralama
    // her tazelemede yeniden yapılır (yayınlanan sıra bayatlamasın).
    if (sort === 'score') {
      list = [...list].sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
    } else {
      list = [...list].sort((a, b) => a.ticker.localeCompare(b.ticker, 'tr'));
    }
    return list;
  }, [data.items, inTab, query, filter, tab, sort]);

  // Alış/Satış sütunları: görünen listede kıymetli maden varsa göster.
  const showBuySell = items.some((s) => s.kind === 'metal');

  // Fiyat akışı durursa kullanıcı bilsin. Sunucu, çekim toptan başarısız
  // olduğunda son sağlam veriyi ESKİ zaman damgasıyla döndürüyor (dataSource.js);
  // damga bu eşikten geri kalınca rozet çıkar.
  // Ayrı sayaç gerekiyor: çekim hata verdiğinde setData hiç çağrılmıyor, yani
  // sadece verinin değişmesine bakarsak rozet hiç görünmez.
  useEffect(() => {
    const kontrol = () => {
      const t = data.priceUpdatedAt || data.updatedAt;
      const eski = t ? Date.now() - new Date(t).getTime() > GECIKME_ESIGI_MS : false;
      setGecikti((o) => (o === eski ? o : eski)); // aynıysa React render'ı atlar
    };
    kontrol();
    const id = setInterval(kontrol, 20000);
    return () => clearInterval(id);
  }, [data.priceUpdatedAt, data.updatedAt]);

  // Grafik pop-up'ındaki kalemin canlı karşılığı (fiyat/değişim tazelendikçe
  // pop-up da tazelensin). BIST'te data.items, ABD'de usTradableItems içinde
  // aranır; ikisinde de yoksa açılış kopyası kullanılır.
  const chartLive = useMemo(() => {
    if (!chartItem) return null;
    return data.items.find((i) => i.ticker === chartItem.ticker)
      || usTradableItems.find((i) => i.ticker === chartItem.ticker)
      || chartItem;
  }, [chartItem, data.items, usTradableItems]);

  // Listeyi partiler hâlinde bas; sekme/filtre/sıralama/arama/görünüm
  // değişince baştan başla.
  const { gorunen, nobetciRef, hepsi, dahaGoster } = useKademeliListe(items, `${tab}|${filter}|${sort}|${query}|${view}`);

  useEffect(() => { try { localStorage.setItem('viewMode', view); } catch { /* yoksay */ } }, [view]);
  useEffect(() => { try { localStorage.setItem('sortMode', sort); } catch { /* yoksay */ } }, [sort]);

  return (
    <div className="page">
      <header className="header">
        <div>
          <h1>📈 BIST Hisse Önerileri</h1>
          <p className="subtitle">
            {tab === 'trade'
              ? 'Sanal borsa · e-posta ile giriş, sanal alım-satım (gerçek para değildir)'
              : tab === 'uyari'
              ? 'Bugün yeni sinyal veren hisseler · günlük grafik taraması'
              : tab === 'us'
              ? 'NASDAQ-100 + S&P 100 · temel analiz ağırlıklı puan + seçili hisselerde tam analist raporu'
              : isNews
              ? 'Piyasa, kıymetli maden ve analist önerisi haberleri'
              : <>Analist hedef fiyatı + temel verilere dayalı beklenen getiri · {searching ? `“${query.trim()}” için ${items.length} sonuç` : `${inTab.length} kayıt`}
                {data.source && <> · kaynak: {data.source === 'postgres' ? 'PostgreSQL' : data.source === 'seed' ? 'CDN önbelleği (güncelleniyor…)' : 'bellek'}</>}</>}
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
        {NEWS_TABS.filter((t) => t.news).map((t) => (
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
          className={`news-tab trade-tab ${tab === 'trade' ? 'active' : ''}`}
          onClick={() => setTab('trade')}
        >
          {TRADE_TAB.label}
        </button>
        {/* Tarama, Sanal Borsa'nın yanına alındı. Görülmemiş yeni
            sinyal varsa yanıp söner ve rozette sayısı görünür. */}
        {(() => {
          const blink = newCount > 0 && tab !== 'uyari';
          return (
            <button
              className={`news-tab uyari-tab ${blink ? 'blink' : ''} ${tab === 'uyari' ? 'active' : ''}`}
              onClick={() => setTab('uyari')}
              title={blink ? `${newCount} yeni sinyal — görmek için aç` : undefined}
            >
              {UYARI_TAB.label}
              {blink && <span className="tab-badge">{newCount}</span>}
            </button>
          );
        })()}
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
      ) : tab === 'uyari' ? (
        <AlertList
          items={data.items}
          onSelect={setChartItem}
          state={alerts}
          highlight={highlight}
          mine={mine}
          hasPortfolio={myTickers.size > 0}
        />
      ) : tab === 'trade' ? (
        <VirtualTrade items={tradeItems} onSelect={setChartItem} />
      ) : tab === 'us' ? (
        <Suspense fallback={<div className="state">Yükleniyor…</div>}>
          <UsStocksTab view={view} />
        </Suspense>
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
        <span className="filter-sep" aria-hidden="true" />
        {/* Sıralama: varsayılan alfabetik; puana göre sıralamak isteyene düğme.
*/}
        {[
          { key: 'ticker', label: 'A→Z', title: 'Hisse koduna göre alfabetik' },
          { key: 'score', label: 'Puan', title: 'Puana göre (yüksekten düşüğe)' },
        ].map((s) => (
          <button
            key={s.key}
            className={`filter sort ${sort === s.key ? 'active' : ''}`}
            onClick={() => setSort(s.key)}
            title={s.title}
          >
            {s.label}
          </button>
        ))}
        {(data.priceUpdatedAt || data.updatedAt) && (
          <span className={`updated ${gecikti ? 'gecikti' : ''}`}>
            {gecikti && (
              <span
                className="gecikti-rozet"
                title="Fiyat akışı duraklamış görünüyor: sunucu yeni fiyat alamıyor ve son sağlam veriyi göstermeye devam ediyor. Ekrandaki fiyatlar ve günlük değişim bu saatten kalma."
              >
                ⚠ gecikiyor
              </span>
            )}
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
          <span className="muted-dash"> (Analist verisi BIST 30/50/100 hisselerinde bulunur. Aynı 4 koşul
          NASDAQ-100 + S&P 100 evrenindeki ABD hisselerinde de aranır — grafik ve Sanal Borsa alım-satımı
          bu kalemlerde de açık (₺ karşılığı üzerinden).{usFav.loading ? ' ABD verisi yükleniyor…' : ''})</span>
        </div>
      )}

      {!loading && !error && items.length === 0 && (
        <div className="state">
          {searching
            ? `“${query.trim()}” ile eşleşen kayıt bulunamadı.`
            : tab === 'fav'
              ? 'Şu an üç sinyali (overzone + WaveTrend + SuperTrend) birden AL olan ve analist AL tavsiyesi bulunan BIST veya ABD hissesi yok.'
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
              {gorunen.map((s, i) => (
                <StockRow
                  key={s.ticker}
                  s={s}
                  rank={i + 1}
                  showBuySell={showBuySell}
                  onSelect={setChartItem}
                />
              ))}
            </tbody>
          </table>
          {!hepsi && (
            <button className="liste-nobetci" ref={nobetciRef} onClick={dahaGoster}>
              +{Math.min(SAYFA, items.length - gorunen.length)} kayıt daha göster
              <span className="nobetci-kalan"> · kalan {items.length - gorunen.length}</span>
            </button>
          )}
        </div>
      )}

      {items.length > 0 && view === 'mobile' && (
        <div className="cards">
          {gorunen.map((s, i) => (
            <StockCard
              key={s.ticker}
              s={s}
              rank={i + 1}
              onSelect={setChartItem}
            />
          ))}
          {!hepsi && (
            <button className="liste-nobetci" ref={nobetciRef} onClick={dahaGoster}>
              +{Math.min(SAYFA, items.length - gorunen.length)} kayıt daha göster
              <span className="nobetci-kalan"> · kalan {items.length - gorunen.length}</span>
            </button>
          )}
        </div>
      )}
      </>
      )}

      {tab !== 'us' && (
      <footer className="disclaimer">
        <p>
          <strong>Beklenen getiri</strong> tahminleri, hisseyi izleyen analistlerin <strong>ortalama 12 aylık hedef
          fiyatından</strong> hesaplanır: <code>12 ay potansiyel = (hedef − fiyat) / fiyat</code>; 1 ay ve 3 ay değerleri
          bu potansiyelin zamana bölünmüş (bileşik) karşılığıdır. Analist kapsamı olmayan hisselerde tahmin gösterilmez.
        </p>
        <p>
          <strong>Puan</strong>; analist potansiyeli (%45), analist tavsiyesi (%20), 1 aylık momentum (%20) ve
          ileri F/K (%15) bileşenlerinden hesaplanır; eksik bileşen varsa kalanların ağırlığı normalize edilir.
          <strong>Analist kapsamı olmayan</strong> enstrümanlarda (kıymetli madenler ve analist izlemeyen
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
      )}

      {/* Grafik yığını (lightweight-charts) ilk tıklamada indirilir; inerken
          pop-up boş açılmasın diye aynı kılıkta bir bekleme katmanı gösterilir. */}
      {/* chartItem tıklama anındaki nesnenin kopyası; fiyat tazelendikçe
          bayatlar. Pop-up canlı fiyatı, günlük değişimi ve kâr/zararı
          gösterdiği (ve o fiyattan işlem yaptığı) için güncel kaleme
          çözümlüyoruz. Kalem listeden düşerse (süzme değişti) elimizdeki
          kopyayla devam. */}
      {chartLive && (
        <Suspense fallback={<div className="modal-overlay"><div className="chart-state">Grafik yükleniyor…</div></div>}>
          <ChartModal item={chartLive} onClose={() => setChartItem(null)} />
        </Suspense>
      )}
    </div>
  );
}
