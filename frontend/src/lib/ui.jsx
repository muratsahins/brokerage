// Hem tabloda/kartta hem grafik pop-up'ında kullanılan küçük görsel parçalar.
import { fmtNum } from './common.js';

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
