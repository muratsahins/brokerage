// ABD rapor panelindeki SAYISAL notlar — canlı temel veriden üretilir.
//
// NEDEN BURADA, usAnalysis.js'te DEĞİL: Bu dört alan (gelir/marj/bilanço/FCF)
// tamamen rakamlardan türetiliyor. Elle yazılıp dosyada saklandıklarında
// kaçınılmaz olarak eskiyorlar — nitekim 46 kayıt FY2024 rakamlarını anlatır
// halde kalmıştı, oysa ekranın üst kısmındaki ızgara canlı veriyi gösteriyordu.
// Kullanıcı güncel sayılarla iki yıllık anlatıyı yan yana görüyordu.
// Artık her veri turunda yeniden üretiliyorlar; usAnalysis.js yalnızca gerçekten
// elle yazılan içeriği (segment, moat, rakip, güçlü/zayıf, verdict) taşıyor.
//
// SEKTÖR DUYARLI: Bankalar ve sigortacılarda Net Borç/EBITDA ile serbest nakit
// akışı anlamlı ölçütler değil — borç orada bir finansman kaynağı, mevduat/kredi
// hareketleri de işletme kalemi. Yahoo bu şirketler için ebitda/freeCashflow
// zaten döndürmüyor (JPM, BAC, GS, MS, AXP'de ölçüldü); o durumda ölçütü
// zorlamak yerine neden uygulanmadığı yazılıyor.

const B = 1e9;
const p1 = (x) => (x * 100).toFixed(1);
const mr = (x) => (x / B).toFixed(1);
const trTarih = (ts) => {
  if (!ts) return null;
  const d = new Date(ts * 1000);
  return `${String(d.getUTCDate()).padStart(2, '0')}.${String(d.getUTCMonth() + 1).padStart(2, '0')}.${d.getUTCFullYear()}`;
};

export function sayisalNotlar(q) {
  if (!q) return null;
  // ebitda VE freeCashflow birlikte yoksa finansal kuruluş kabul edilir.
  const finansal = q.ebitda == null && q.freeCashflow == null;
  const netBorc = (q.totalDebt ?? 0) - (q.totalCash ?? 0);
  const netKar = q.totalRevenue != null && q.profitMargins != null
    ? q.totalRevenue * q.profitMargins : null;

  // --- Gelir ---
  // İKİ FARKLI DÖNEM: gelir/marj/EBITDA/FCF son 12 aylık kayan pencereden
  // (mostRecentQuarter'da biter), 3 yıllık CAGR ise YILLIK tablolardan gelir.
  // Aynı cümlede karşılaştırıldıkları için dönemleri açıkça yazılıyor — yoksa
  // "3 yıllık ortalamanın üstünde" ifadesi hangi dönemlere ait belirsiz kalıyor.
  const ttmSon = trTarih(q.mostRecentQuarter);
  let revenue3yNote = null;
  if (q.totalRevenue != null && q.revenueGrowth != null) {
    revenue3yNote = `Gelir ${mr(q.totalRevenue)} Mr$`;
    revenue3yNote += ttmSon ? ` (son 12 ay, ${ttmSon}'da biten dönem)` : ' (son 12 ay)';
    revenue3yNote += `; yıllık büyüme %${p1(q.revenueGrowth)}`;
    if (q.revenue3yCagr != null) {
      revenue3yNote += `, 3 yıllık bileşik büyüme %${p1(q.revenue3yCagr)}`;
      if (q.cagrDonem?.ilk && q.cagrDonem?.son) {
        revenue3yNote += ` (FY${q.cagrDonem.ilk}→FY${q.cagrDonem.son} yıllık tabloları)`;
      }
      const hiz = q.revenueGrowth - q.revenue3yCagr;
      revenue3yNote += Math.abs(hiz) < 0.02
        ? '. Büyüme temposu 3 yıllık ortalamayla uyumlu.'
        : hiz > 0
          ? `. Son yıl 3 yıllık ortalamanın ${p1(hiz)} puan ÜSTÜNDE — hızlanma.`
          : `. Son yıl 3 yıllık ortalamanın ${p1(-hiz)} puan ALTINDA — yavaşlama.`;
    } else revenue3yNote += ' (3 yıllık seri yok).';
  }

  // --- Marj ---
  let marginNote = null;
  if (q.profitMargins != null) {
    marginNote = `Net kâr marjı %${p1(q.profitMargins)}`;
    if (netKar != null) marginNote += ` (≈ ${mr(netKar)} Mr$ net kâr)`;
    if (q.ebitda != null && q.totalRevenue) marginNote += `; EBITDA marjı %${p1(q.ebitda / q.totalRevenue)}`;
    marginNote += '.';
  }

  // --- Bilanço ---
  let balanceNote = null;
  if (finansal) {
    balanceNote = `Nakit ${mr(q.totalCash)} Mr$, borç ${mr(q.totalDebt)} Mr$. Finansal kuruluş olduğu `
      + 'için Net Borç/EBITDA anlamlı bir kaldıraç ölçütü değil — borç burada bir finansman kaynağı, '
      + 'faaliyet dışı bir yük değil; sermaye yeterliliği oranlarıyla değerlendirilmeli.';
  } else if (q.totalCash != null && q.totalDebt != null) {
    balanceNote = netBorc < 0
      ? `Net NAKİT ${mr(-netBorc)} Mr$ (nakit ${mr(q.totalCash)} Mr$ > borç ${mr(q.totalDebt)} Mr$)`
      : `Net borç ${mr(netBorc)} Mr$ (borç ${mr(q.totalDebt)} Mr$, nakit ${mr(q.totalCash)} Mr$)`;
    if (q.ebitda != null && q.ebitda > 0) {
      const kald = netBorc / q.ebitda;
      balanceNote += `; Net Borç/EBITDA ${kald.toFixed(2)}x`;
      balanceNote += kald < 0 ? ' — bilanço riski minimal.'
        : kald < 1.5 ? ' — rahat seviye.'
          : kald < 3 ? ' — yönetilebilir ama izlenmeli.'
            : ' — YÜKSEK; faiz ortamına ve nakit akışı istikrarına duyarlı.';
    } else balanceNote += '.';
  }

  // --- FCF ---
  let fcfNote = null;
  if (finansal) {
    fcfNote = 'Serbest nakit akışı bu iş modelinde standart biçimde hesaplanmıyor (mevduat/kredi '
      + 'akışları işletme kalemleridir); nakit üretimi net faiz geliri ve komisyonlar üzerinden okunmalı.';
  } else if (q.freeCashflow != null && q.totalRevenue) {
    fcfNote = `FCF ${mr(q.freeCashflow)} Mr$, marj %${p1(q.freeCashflow / q.totalRevenue)}`;
    if (netKar) {
      const donusum = q.freeCashflow / netKar;
      fcfNote += `; net kârın %${p1(donusum)}'i nakde dönüyor`;
      // Bu oran çoğu analizde atlanıyor ama kritik: muhasebe kârı yüksekken
      // nakde dönüşüm düşükse, kâra dayalı çarpanlar gerçeğin önünde koşuyordur.
      fcfNote += donusum < 0.5 ? ' — dönüşüm ZAYIF, muhasebe kârı nakit üretiminin belirgin önünde.'
        : donusum < 0.85 ? ' — dönüşüm makul ama tam değil.'
          : ' — güçlü nakde dönüşüm.';
    }
    if (q.operatingCashflow != null) {
      const capex = q.operatingCashflow - q.freeCashflow;
      if (capex > 0) fcfNote += ` İşletme nakit akışıyla arasındaki ${mr(capex)} Mr$ fark yatırım/capex kalemi.`;
    }
  }

  return { revenue3yNote, marginNote, balanceNote, fcfNote };
}
