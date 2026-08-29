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

// Kıymetli madenlerin logo servislerinde karşılığı yok; sadece renk değil,
// her biri kendine özgü bir SİLUETLE de ayrışsın diye dört farklı şekil
// kullanılır: altın külçe, gümüş sikke, platin yüzük, paladyum kristal.
const MADEN_STIL = {
  XAU: { tip: 'bar', acik: '#fff6cf', orta: '#f5c542', koyu: '#a9791a' },
  XAG: { tip: 'coin', acik: '#ffffff', orta: '#d6d6d6', koyu: '#8f8f8f' },
  XPT: { tip: 'ring', acik: '#eef2f5', orta: '#b9c4cb', koyu: '#6f7c85' },
  XPD: { tip: 'gem', acik: '#f3eefc', orta: '#c9b8e8', koyu: '#7c6a9c' },
};

// Şekle göre iç çizim: külçe (3B blok), sikke (kabartma kenarlı), yüzük
// (halka), kristal (çokgen mücevher) — saf SVG, ağa bağımlı değil.
function MadenIcerik({ tip, gradId }) {
  const dolgu = `url(#${gradId})`;
  if (tip === 'bar') {
    return (
      <>
        <polygon points="9,30 13,13 29,13 33,30" fill={dolgu} stroke="rgba(0,0,0,0.3)" strokeWidth="1" />
        <polygon points="13,13 16,9 32,9 29,13" fill="rgba(255,255,255,0.4)" stroke="rgba(0,0,0,0.15)" strokeWidth="0.6" />
        <line x1="12" y1="22" x2="30" y2="22" stroke="rgba(0,0,0,0.2)" strokeWidth="0.8" />
      </>
    );
  }
  if (tip === 'ring') {
    return (
      <>
        <circle cx="20" cy="21" r="12" fill="none" stroke={dolgu} strokeWidth="7" />
        <path d="M 11 15 A 12 12 0 0 1 20 9" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="2.2" strokeLinecap="round" />
      </>
    );
  }
  if (tip === 'gem') {
    return (
      <>
        <polygon points="20,6 32,16 20,34 8,16" fill={dolgu} stroke="rgba(0,0,0,0.3)" strokeWidth="1" />
        <polyline points="8,16 32,16" stroke="rgba(0,0,0,0.2)" strokeWidth="0.8" />
        <polygon points="20,6 25,16 15,16" fill="rgba(255,255,255,0.4)" />
      </>
    );
  }
  // coin
  return (
    <>
      <circle cx="24" cy="24" r="12" fill="currentColor" opacity="0.35" />
      <circle cx="16" cy="16" r="13" fill={dolgu} stroke="rgba(0,0,0,0.3)" strokeWidth="1" />
      <circle cx="16" cy="16" r="9" fill="none" stroke="rgba(0,0,0,0.18)" strokeWidth="1" />
      <ellipse cx="12" cy="12" rx="4.5" ry="3" fill="rgba(255,255,255,0.55)" />
    </>
  );
}

function MadenResmi({ ticker, size }) {
  const renk = MADEN_STIL[ticker];
  if (!renk) return null;
  const id = `maden-${ticker}`;
  return (
    <svg className="logo logo-metal" width={size} height={size} viewBox="0 0 40 40" aria-hidden="true" style={{ color: renk.koyu }}>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={renk.acik} />
          <stop offset="55%" stopColor={renk.orta} />
          <stop offset="100%" stopColor={renk.koyu} />
        </linearGradient>
      </defs>
      <MadenIcerik tip={renk.tip} gradId={id} />
    </svg>
  );
}

// Şirket logosu: önce parqet.com'un ücretsiz sembol logo servisini (BIST için
// ".IS" ekiyle) dener; 404/yüklenemezse elimizde varsa TradingView'in sembol
// logosuna düşer; o da yoksa ticker'ın baş harfleriyle renkli bir rozet
// gösterir. `market` 'BIST' | 'US' | 'metal'.
export function Logo({ ticker, market, size = 42 }) {
  const [asama, setAsama] = useState(0);
  const stil = { width: size, height: size };

  if (market === 'metal' && MADEN_STIL[ticker]) {
    return <MadenResmi ticker={ticker} size={size} />;
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
