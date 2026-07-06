// Takip edilen BIST hisseleri (BIST-30 ağırlıklı bir başlangıç listesi).
// Yeni hisse eklemek için buraya bir satır ekleyin; Yahoo sembolü ".IS" ile biter.
export const BIST_STOCKS = [
  { ticker: 'THYAO', name: 'Türk Hava Yolları',        sector: 'Ulaştırma' },
  { ticker: 'ASELS', name: 'Aselsan',                  sector: 'Savunma' },
  { ticker: 'GARAN', name: 'Garanti BBVA',             sector: 'Bankacılık' },
  { ticker: 'AKBNK', name: 'Akbank',                   sector: 'Bankacılık' },
  { ticker: 'ISCTR', name: 'İş Bankası (C)',           sector: 'Bankacılık' },
  { ticker: 'YKBNK', name: 'Yapı Kredi',               sector: 'Bankacılık' },
  { ticker: 'KCHOL', name: 'Koç Holding',              sector: 'Holding' },
  { ticker: 'SAHOL', name: 'Sabancı Holding',          sector: 'Holding' },
  { ticker: 'BIMAS', name: 'BİM Mağazalar',            sector: 'Perakende' },
  { ticker: 'MGROS', name: 'Migros',                   sector: 'Perakende' },
  { ticker: 'EREGL', name: 'Ereğli Demir Çelik',       sector: 'Metal' },
  { ticker: 'TUPRS', name: 'Tüpraş',                   sector: 'Enerji' },
  { ticker: 'PETKM', name: 'Petkim',                   sector: 'Kimya' },
  { ticker: 'SISE',  name: 'Şişecam',                  sector: 'Cam/Sanayi' },
  { ticker: 'FROTO', name: 'Ford Otosan',              sector: 'Otomotiv' },
  { ticker: 'TOASO', name: 'Tofaş',                    sector: 'Otomotiv' },
  { ticker: 'ARCLK', name: 'Arçelik',                  sector: 'Dayanıklı Tüketim' },
  { ticker: 'TCELL', name: 'Turkcell',                 sector: 'Telekom' },
  { ticker: 'TTKOM', name: 'Türk Telekom',             sector: 'Telekom' },
  { ticker: 'KOZAL', name: 'Koza Altın',               sector: 'Madencilik' },
  { ticker: 'PGSUS', name: 'Pegasus',                  sector: 'Ulaştırma' },
  { ticker: 'HEKTS', name: 'Hektaş',                   sector: 'Tarım Kimya' },
  { ticker: 'ENKAI', name: 'Enka İnşaat',              sector: 'İnşaat' },
  { ticker: 'ODAS',  name: 'Odaş Elektrik',            sector: 'Enerji' },
  { ticker: 'GUBRF', name: 'Gübre Fabrikaları',        sector: 'Kimya' },
  { ticker: 'KRDMD', name: 'Kardemir (D)',             sector: 'Metal' },
  { ticker: 'ASTOR', name: 'Astor Enerji',             sector: 'Enerji' },
  { ticker: 'OYAKC', name: 'Oyak Çimento',             sector: 'Çimento' },
  { ticker: 'VESTL', name: 'Vestel',                   sector: 'Elektronik' },
  { ticker: 'SASA',  name: 'Sasa Polyester',           sector: 'Kimya' },
];

export function toSymbol(ticker) {
  return `${ticker}.IS`;
}
