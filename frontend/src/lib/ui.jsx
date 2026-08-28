// Hem tabloda/kartta hem grafik pop-up'ında kullanılan küçük görsel parçalar.
import { useState } from 'react';
import { fmtNum } from './common.js';

// Ticker'dan sabit bir renk üretir (aynı hisse hep aynı renk alır), logo
// bulunamadığında baş harflerle gösterilen yedek rozet için kullanılır.
const AVATAR_RENKLERI = [
  '#60a5fa', '#f87171', '#4ade80', '#fbbf24', '#a78bfa',
  '#f472b6', '#2dd4bf', '#fb923c', '#818cf8', '#34d399',
];
function avatarRengi(key) {
  let h = 0;
  for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) >>> 0;
  return AVATAR_RENKLERI[h % AVATAR_RENKLERI.length];
}

// parqet.com'da logosu olmayan (küçük/yeni halka arz) BIST ve ABD hisseleri
// için TradingView'in sembol logosunu ikinci kaynak olarak kullanıyoruz.
// Slug'lar ticker'dan otomatik türetilemiyor (TradingView'in kendi şirket adı
// kısaltması), bu yüzden elle doğrulanmış bir tabloda tutuluyor.
const TRADINGVIEW_LOGO_SLUGS = {
  ALTNY: 'altinay-savunma', ASTOR: 'astor-enerji', BALSU: 'balsu-gida', BERA: 'bera-holding',
  BRYAT: 'borusan-yat-paz', BSOKE: 'batisoke-cimento', BTCIM: 'bati-cimento', CANTE: 'can2-termik',
  CVKMD: 'cvk-maden', CWENE: 'cw-enerji', DAPGM: 'dap-gayrimenkul', DSTKF: 'destek-finans-faktoring',
  EFOR: 'efor-cay-sanayi', ENERY: 'enerya-enerji', EUPWR: 'europower-enerji', EUREN: 'europen-endustri',
  FENER: 'fenerbahce-futbol', GENIL: 'gen-ilac', GESAN: 'girisim-elektrik', GLRMK: 'gulermak-agir-sanayi',
  GRSEL: 'gur-sel-turizm-tasimacilik', GRTHO: 'grainturk', GSRAY: 'galatasaray-sportif',
  IEYHO: 'isiklar-enerji-yapi-hol', IZENR: 'izdemir-enerji', KLRHO: 'kiler', KTLEV: 'katilimevim-tas-fin',
  KUYAS: 'kuyas-yatirim', MAGEN: 'margun-enerji', MIATK: 'mia-teknoloji', OBAMS: 'oba-makarnacilik',
  ODINE: 'odine-teknoloji', OYAKC: 'oyak-cimento', PAHOL: 'pasifik-as', PASEU: 'pasifik-eurasia-lojistik',
  PATEK: 'pasifik-teknoloji', PSGYO: 'pasifik-gmyo', QUAGR: 'qua-granite', RALYH: 'ral-yatirim-holding',
  REEDR: 'reeder-teknoloji', TRALT: 'koza-altin', TRENJ: 'ipek-dogal-enerji', TRMET: 'koza-madencilik',
  TUKAS: 'tukas-gida', 'BRK.B': 'berkshire-hathaway', MNST: 'monster-beverage',
};

// Kıymetli madenlerin logo servislerinde karşılığı yok; her biri kendi
// metalinin rengiyle (parlaklık hissi veren radial-gradient) ve kimyasal
// simgesiyle gösterilir.
const MADEN_STIL = {
  XAU: { gradient: 'radial-gradient(circle at 35% 30%, #fff6cf, #f5c542 45%, #b8860b 100%)', renk: '#5c3d00', sembol: 'Au' },
  XAG: { gradient: 'radial-gradient(circle at 35% 30%, #ffffff, #d9d9d9 45%, #9a9a9a 100%)', renk: '#3f3f3f', sembol: 'Ag' },
  XPT: { gradient: 'radial-gradient(circle at 35% 30%, #f4f4f2, #d7d7d4 45%, #a8a8a4 100%)', renk: '#3f3f3f', sembol: 'Pt' },
  XPD: { gradient: 'radial-gradient(circle at 35% 30%, #eef0f7, #ccd0dd 45%, #9a9dae 100%)', renk: '#3f3f3f', sembol: 'Pd' },
};

// Şirket logosu: önce parqet.com'un ücretsiz sembol logo servisini (BIST için
// ".IS" ekiyle) dener; 404/yüklenemezse elimizde varsa TradingView'in sembol
// logosuna düşer; o da yoksa ticker'ın baş harfleriyle renkli bir rozet
// gösterir. `market` 'BIST' | 'US' | 'metal'.
export function Logo({ ticker, market, size = 42 }) {
  const [asama, setAsama] = useState(0);
  const stil = { width: size, height: size };

  if (market === 'metal') {
    const maden = MADEN_STIL[ticker];
    if (maden) {
      return (
        <span
          className="logo logo-metal"
          style={{ ...stil, background: maden.gradient, color: maden.renk, fontSize: size * 0.36 }}
        >
          {maden.sembol}
        </span>
      );
    }
  }

  const kaynaklar = market === 'metal' || !ticker ? [] : [
    `https://assets.parqet.com/logos/symbol/${market === 'BIST' ? `${ticker}.IS` : ticker}?format=png`,
    TRADINGVIEW_LOGO_SLUGS[ticker] && `https://s3-symbol-logo.tradingview.com/${TRADINGVIEW_LOGO_SLUGS[ticker]}.svg`,
  ].filter(Boolean);

  if (asama < kaynaklar.length) {
    return (
      <img
        className="logo"
        style={stil}
        src={kaynaklar[asama]}
        alt=""
        loading="lazy"
        onError={() => setAsama((a) => a + 1)}
      />
    );
  }

  const harfler = (ticker || '?').slice(0, 2).toUpperCase();
  return (
    <span
      className="logo logo-fallback"
      style={{ ...stil, background: avatarRengi(ticker || '?'), fontSize: size * 0.4 }}
    >
      {harfler}
    </span>
  );
}

// Yüzde değişim: yeşil/kırmızı, ▲/▼ ile.
export function Pct({ value, strong }) {
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

// Analist beklentisine dayalı ileriye dönük getiri hücresi. Para birimi
// `note` içinde çağıran tarafça verilir (BIST'te ₺, ABD'de $).
export function Expected({ value, note }) {
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

// İşaretli tutar: "+1.240,50 ₺" / "−320,00 ₺"; kâr yeşil, zarar kırmızı.
export function Tutar({ value, birim = '₺' }) {
  if (value == null) return <span className="muted-dash">—</span>;
  const up = value >= 0;
  return (
    <span style={{ color: up ? '#4ade80' : '#f87171', fontVariantNumeric: 'tabular-nums', fontWeight: 700 }}>
      {up ? '+' : '−'}{fmtNum(Math.abs(value))} {birim}
    </span>
  );
}
