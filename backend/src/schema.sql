-- BIST hisse tanımları
CREATE TABLE IF NOT EXISTS stocks (
  symbol      TEXT PRIMARY KEY,          -- Yahoo sembolü, örn: THYAO.IS
  ticker      TEXT NOT NULL,             -- BIST kodu, örn: THYAO
  name        TEXT NOT NULL,             -- Şirket adı
  sector      TEXT
);

-- Her yenilemede hesaplanan anlık öneri/metrikler
CREATE TABLE IF NOT EXISTS recommendations (
  symbol          TEXT PRIMARY KEY REFERENCES stocks(symbol) ON DELETE CASCADE,
  price           NUMERIC,               -- güncel fiyat (TL)
  currency        TEXT,
  change_pct      NUMERIC,               -- günlük değişim %
  momentum_1m     NUMERIC,               -- 1 aylık gerçekleşen momentum %
  pos_52w         NUMERIC,               -- 52 hafta bandındaki konum (0..1)
  exp_1m          NUMERIC,               -- beklenen 1 ay getiri % (analiste dayalı)
  exp_3m          NUMERIC,               -- beklenen 3 ay getiri %
  upside_12m      NUMERIC,               -- analist 12 ay yükseliş potansiyeli %
  target_mean     NUMERIC,               -- analist ortalama hedef fiyat
  target_high     NUMERIC,
  target_low      NUMERIC,
  rec_key         TEXT,                  -- analist tavsiyesi (buy/hold/...)
  num_analysts    INTEGER,
  forward_pe      NUMERIC,
  revenue_growth  NUMERIC,               -- ciro büyümesi %
  score           NUMERIC,               -- birleşik puan (0..100)
  signal          TEXT,                  -- AL / TUT / İZLE
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_reco_score ON recommendations(score DESC);
