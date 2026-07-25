// Takip edilen BIST hisseleri. `bist` alanı, hissenin ait olduğu EN DAR endeksi
// belirtir (30 ⊂ 50 ⊂ 100). Frontend sekmeleri bunu iç içe filtre olarak kullanır:
//   BIST 30  -> bist === 30
//   BIST 50  -> bist <= 50
//   BIST 100 -> bist <= 100 (tümü)
// Üyelikler çeyreklik gözden geçirilir; değiştikçe `bist` değerini güncelleyin.
export const BIST_STOCKS = [
  // --- BIST 30 ---------------------------------------------------------------
  { ticker: 'AEFES', name: 'Anadolu Efes',           sector: 'İçecek',        bist: 30 },
  { ticker: 'AKBNK', name: 'Akbank',                 sector: 'Bankacılık',    bist: 30 },
  { ticker: 'ASELS', name: 'Aselsan',                sector: 'Savunma',       bist: 30 },
  { ticker: 'ASTOR', name: 'Astor Enerji',           sector: 'Enerji',        bist: 30 },
  { ticker: 'BIMAS', name: 'BİM Mağazalar',          sector: 'Perakende',     bist: 30 },
  { ticker: 'DSTKF', name: 'Destek Finans Faktoring', sector: 'Finans',       bist: 30 },
  { ticker: 'EKGYO', name: 'Emlak Konut GYO',        sector: 'GYO',           bist: 30 },
  { ticker: 'ENKAI', name: 'Enka İnşaat',            sector: 'İnşaat',        bist: 30 },
  { ticker: 'EREGL', name: 'Ereğli Demir Çelik',     sector: 'Metal',         bist: 30 },
  { ticker: 'FROTO', name: 'Ford Otosan',            sector: 'Otomotiv',      bist: 30 },
  { ticker: 'GARAN', name: 'Garanti BBVA',           sector: 'Bankacılık',    bist: 30 },
  { ticker: 'GUBRF', name: 'Gübre Fabrikaları',      sector: 'Kimya',         bist: 30 },
  { ticker: 'ISCTR', name: 'İş Bankası (C)',         sector: 'Bankacılık',    bist: 30 },
  { ticker: 'KCHOL', name: 'Koç Holding',            sector: 'Holding',       bist: 30 },
  { ticker: 'KRDMD', name: 'Kardemir (D)',           sector: 'Metal',         bist: 30 },
  { ticker: 'MGROS', name: 'Migros',                 sector: 'Perakende',     bist: 30 },
  { ticker: 'PETKM', name: 'Petkim',                 sector: 'Kimya',         bist: 30 },
  { ticker: 'PGSUS', name: 'Pegasus',                sector: 'Ulaştırma',     bist: 30 },
  { ticker: 'SAHOL', name: 'Sabancı Holding',        sector: 'Holding',       bist: 30 },
  { ticker: 'SASA',  name: 'Sasa Polyester',         sector: 'Kimya',         bist: 30 },
  { ticker: 'SISE',  name: 'Şişecam',                sector: 'Cam/Sanayi',    bist: 30 },
  { ticker: 'TAVHL', name: 'TAV Havalimanları',      sector: 'Ulaştırma',     bist: 30 },
  { ticker: 'TCELL', name: 'Turkcell',               sector: 'Telekom',       bist: 30 },
  { ticker: 'THYAO', name: 'Türk Hava Yolları',      sector: 'Ulaştırma',     bist: 30 },
  { ticker: 'TOASO', name: 'Tofaş',                  sector: 'Otomotiv',      bist: 30 },
  { ticker: 'TRALT', name: 'Türk Altın İşletmeleri', sector: 'Madencilik',    bist: 30 },
  { ticker: 'TTKOM', name: 'Türk Telekom',           sector: 'Telekom',       bist: 30 },
  { ticker: 'TUPRS', name: 'Tüpraş',                 sector: 'Enerji',        bist: 30 },
  { ticker: 'VAKBN', name: 'Vakıfbank',              sector: 'Bankacılık',    bist: 30 },
  { ticker: 'YKBNK', name: 'Yapı Kredi',             sector: 'Bankacılık',    bist: 30 },

  // --- BIST 50 (30 dışındaki 20) --------------------------------------------
  { ticker: 'AKSEN', name: 'Aksa Enerji',            sector: 'Enerji',        bist: 50 },
  { ticker: 'ALARK', name: 'Alarko Holding',         sector: 'Holding',       bist: 50 },
  { ticker: 'BRSAN', name: 'Borusan Boru',           sector: 'Metal/Sanayi',  bist: 50 },
  { ticker: 'BTCIM', name: 'Batıçim Batı Anadolu',   sector: 'Çimento',       bist: 50 },
  { ticker: 'CANTE', name: 'Çan2 Termik',            sector: 'Enerji',        bist: 50 },
  { ticker: 'CCOLA', name: 'Coca-Cola İçecek',       sector: 'İçecek',        bist: 50 },
  { ticker: 'CIMSA', name: 'Çimsa',                  sector: 'Çimento',       bist: 50 },
  { ticker: 'ECILC', name: 'Eczacıbaşı İlaç',        sector: 'Sağlık',        bist: 50 },
  { ticker: 'EFOR',  name: 'Efor Yatırım',           sector: 'Holding',       bist: 50 },
  { ticker: 'GLRMK', name: 'Gülermak Ağır Sanayi',   sector: 'İnşaat',        bist: 50 },
  { ticker: 'HALKB', name: 'Halkbank',               sector: 'Bankacılık',    bist: 50 },
  { ticker: 'HEKTS', name: 'Hektaş',                 sector: 'Tarım Kimya',   bist: 50 },
  { ticker: 'KTLEV', name: 'Katılımevim Tasarruf',   sector: 'Finans',        bist: 50 },
  { ticker: 'KUYAS', name: 'Kuyaş Yatırım',          sector: 'Holding',       bist: 50 },
  { ticker: 'MIATK', name: 'Mia Teknoloji',          sector: 'Teknoloji',     bist: 50 },
  { ticker: 'OYAKC', name: 'Oyak Çimento',           sector: 'Çimento',       bist: 50 },
  { ticker: 'PASEU', name: 'Pasifik Eurasia Lojistik', sector: 'Lojistik',    bist: 50 },
  { ticker: 'TRMET', name: 'TR Anadolu Metal Madencilik', sector: 'Madencilik', bist: 50 },
  { ticker: 'TURSG', name: 'Türkiye Sigorta',        sector: 'Sigorta',       bist: 50 },
  { ticker: 'ULKER', name: 'Ülker Bisküvi',          sector: 'Gıda',          bist: 50 },

  // --- BIST 100 (50 dışındaki 50) -------------------------------------------
  { ticker: 'AKSA',  name: 'Aksa Akrilik',           sector: 'Kimya',         bist: 100 },
  { ticker: 'ALTNY', name: 'Altınay Savunma',        sector: 'Savunma',       bist: 100 },
  { ticker: 'ANSGR', name: 'Anadolu Sigorta',        sector: 'Sigorta',       bist: 100 },
  { ticker: 'ARCLK', name: 'Arçelik',                sector: 'Dayanıklı Tüketim', bist: 100 },
  { ticker: 'BALSU', name: 'Balsu Gıda',             sector: 'Gıda',          bist: 100 },
  { ticker: 'BERA',  name: 'Bera Holding',           sector: 'Holding',       bist: 100 },
  { ticker: 'BRYAT', name: 'Borusan Yat. Pazarlama', sector: 'Holding',       bist: 100 },
  { ticker: 'BSOKE', name: 'Batısöke Çimento',       sector: 'Çimento',       bist: 100 },
  { ticker: 'CVKMD', name: 'CVK Maden İşletmeleri',  sector: 'Madencilik',    bist: 100 },
  { ticker: 'CWENE', name: 'CW Enerji',              sector: 'Enerji',        bist: 100 },
  { ticker: 'DAPGM', name: 'DAP Gayrimenkul',        sector: 'GYO',           bist: 100 },
  { ticker: 'DOAS',  name: 'Doğuş Otomotiv',         sector: 'Otomotiv',      bist: 100 },
  { ticker: 'DOHOL', name: 'Doğan Holding',          sector: 'Holding',       bist: 100 },
  { ticker: 'ENERY', name: 'Enerya Enerji',          sector: 'Enerji',        bist: 100 },
  { ticker: 'ENJSA', name: 'Enerjisa Enerji',        sector: 'Enerji',        bist: 100 },
  { ticker: 'ESEN',  name: 'Esenboğa Elektrik',      sector: 'Enerji',        bist: 100 },
  { ticker: 'EUPWR', name: 'Europower Enerji',       sector: 'Enerji',        bist: 100 },
  { ticker: 'EUREN', name: 'Europen Endüstri',       sector: 'Sanayi',        bist: 100 },
  { ticker: 'FENER', name: 'Fenerbahçe Futbol',      sector: 'Spor',          bist: 100 },
  { ticker: 'GENIL', name: 'Gen İlaç',               sector: 'Sağlık',        bist: 100 },
  { ticker: 'GESAN', name: 'Girişim Elektrik',       sector: 'Enerji',        bist: 100 },
  { ticker: 'GRSEL', name: 'Gürsel Turizm',          sector: 'Ulaştırma',     bist: 100 },
  { ticker: 'GRTHO', name: 'Grainturk Holding',      sector: 'Holding',       bist: 100 },
  { ticker: 'GSRAY', name: 'Galatasaray Sportif',    sector: 'Spor',          bist: 100 },
  { ticker: 'IEYHO', name: 'Işıklar Enerji Yapı Hold.', sector: 'Holding',    bist: 100 },
  { ticker: 'ISMEN', name: 'İş Yatırım Menkul',      sector: 'Aracı Kurum',   bist: 100 },
  { ticker: 'IZENR', name: 'İzdemir Enerji',         sector: 'Enerji',        bist: 100 },
  { ticker: 'KLRHO', name: 'Kiler Holding',          sector: 'Holding',       bist: 100 },
  { ticker: 'MAGEN', name: 'Margün Enerji',          sector: 'Enerji',        bist: 100 },
  { ticker: 'MAVI',  name: 'Mavi Giyim',             sector: 'Perakende',     bist: 100 },
  { ticker: 'MPARK', name: 'MLP Sağlık (Medical Park)', sector: 'Sağlık',     bist: 100 },
  { ticker: 'OBAMS', name: 'Oba Makarnacılık',       sector: 'Gıda',          bist: 100 },
  { ticker: 'ODAS',  name: 'Odaş Elektrik',          sector: 'Enerji',        bist: 100 },
  { ticker: 'ODINE', name: 'Odine Teknoloji',        sector: 'Teknoloji',     bist: 100 },
  { ticker: 'OTKAR', name: 'Otokar',                 sector: 'Otomotiv',      bist: 100 },
  { ticker: 'PAHOL', name: 'Pasifik Holding',        sector: 'Holding',       bist: 100 },
  { ticker: 'PATEK', name: 'Papilon Savunma',        sector: 'Savunma',       bist: 100 },
  { ticker: 'PSGYO', name: 'Panora GYO',             sector: 'GYO',           bist: 100 },
  { ticker: 'QUAGR', name: 'Qua Granite',            sector: 'Yapı/Seramik',  bist: 100 },
  { ticker: 'RALYH', name: 'Ral Yatırım Holding',    sector: 'Holding',       bist: 100 },
  { ticker: 'REEDR', name: 'Reeder Teknoloji',       sector: 'Teknoloji',     bist: 100 },
  { ticker: 'SARKY', name: 'Sarkuysan',              sector: 'Metal',         bist: 100 },
  { ticker: 'SKBNK', name: 'Şekerbank',              sector: 'Bankacılık',    bist: 100 },
  { ticker: 'SOKM',  name: 'Şok Marketler',          sector: 'Perakende',     bist: 100 },
  { ticker: 'TKFEN', name: 'Tekfen Holding',         sector: 'Holding',       bist: 100 },
  { ticker: 'TRENJ', name: 'TR Doğal Enerji',        sector: 'Enerji',        bist: 100 },
  { ticker: 'TSKB',  name: 'T.S.K.B.',               sector: 'Bankacılık',    bist: 100 },
  { ticker: 'TUKAS', name: 'Tukaş Gıda',             sector: 'Gıda',          bist: 100 },
  { ticker: 'VESTL', name: 'Vestel',                 sector: 'Elektronik',    bist: 100 },
  { ticker: 'ZOREN', name: 'Zorlu Enerji',           sector: 'Enerji',        bist: 100 },
];

// Kıymetli madenler (Yahoo vadeli sembolleri, USD/ons). Analist hedefi yoktur;
// yalnızca fiyat, değişim ve teknik göstergeler (WaveTrend/SuperTrend) gösterilir.
// altinInName: altin.in'deki alış/satış satırının adı (o metal orada yoksa null).
export const METALS = [
  { ticker: 'XAU', name: 'Altın',    symbol: 'GC=F', currency: 'USD', altinInName: 'Gram Altın' },
  { ticker: 'XAG', name: 'Gümüş',    symbol: 'SI=F', currency: 'USD', altinInName: 'Gümüş' },
  { ticker: 'XPT', name: 'Platin',   symbol: 'PL=F', currency: 'USD', altinInName: 'Platin' },
  { ticker: 'XPD', name: 'Paladyum', symbol: 'PA=F', currency: 'USD', altinInName: null },
];

// Fiyat/gösterge çekimi için birleşik enstrüman listesi. Her enstrümanın açık
// Yahoo `symbol`'ü, `currency`'si ve `kind`'i (stock/metal) vardır.
export const INSTRUMENTS = [
  ...BIST_STOCKS.map((s) => ({ ...s, symbol: `${s.ticker}.IS`, currency: 'TRY', kind: 'stock' })),
  ...METALS.map((m) => ({ ...m, sector: 'Kıymetli Maden', bist: null, kind: 'metal' })),
];

export function toSymbol(ticker) {
  return `${ticker}.IS`;
}
