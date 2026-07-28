# brokerage — BIST Hisse Öneri Uygulaması

Türkiye borsasında (BIST) yatırım yapılabilecek hisseleri, otomatik hesaplanan
bir sezgisel puanla listeleyen tek sayfalık uygulama.

> ⚠️ **Uyarı:** Buradaki puanlama ve sinyaller **yatırım tavsiyesi değildir**.
> Sadece momentum ve fiyat konumu üzerine kurulu basit bir MVP heuristiğidir.

## Mimari

| Katman     | Teknoloji                       | Açıklama                                              |
|------------|---------------------------------|------------------------------------------------------|
| Ön yüz     | React + Vite                    | Tek sayfa; öneri listesi tablosu                     |
| Arka uç    | Node.js + Express               | Veri çekme, puanlama, REST API                       |
| Veritabanı | PostgreSQL (`pg`)               | Hisse ve öneri kaydı (yoksa bellek içi çalışır)      |
| Veri       | Yahoo Finance (`chart` API)     | BIST fiyat/geçmiş verisi (`THYAO.IS` gibi)           |

## Öneri puanı nasıl hesaplanıyor?

`backend/src/recommend.js` içinde, her hisse için 0–100 arası puan:
- **1 aylık momentum** (%50 ağırlık) — yükselen trend olumlu
- **Günlük değişim** (%25) — kısa vadeli ivme
- **52 hafta bandındaki konum** (%25) — orta bant tercih edilir (tepe = pahalı, dip = riskli)

Puan → sinyal: `≥65 AL`, `45–64 TUT`, `<45 İZLE`.

## Çalıştırma

### 1) PostgreSQL (opsiyonel ama önerilir)
Docker varsa:
```bash
docker compose up -d
```
Yoksa uygulama yine çalışır; veriyi bellekte tutar (yeniden başlatınca sıfırlanır).

### 2) Backend
```bash
cd backend
cp .env.example .env      # DATABASE_URL / PORT ayarları
npm install
npm start                 # http://localhost:4000
```
- İlk açılışta Yahoo'dan veri çeker ve puanlar.
- `REFRESH_INTERVAL_MINUTES` ile otomatik yenileme (varsayılan 30 dk).
- Elle yenileme: `POST /api/refresh` veya `npm run refresh`.
- Teknik göstergeler `/api/prices` ile fiyatla **aynı anda** tazelenir: 1 yıllık
  bar geçmişi bellekte tutulur (seans içinde değişmez), her fiyat yenilemesinde
  son bar canlı veriyle güncellenip göstergeler yeniden hesaplanır. Son barın
  kapanışı spark ucundan, **hacmi ve gün içi yüksek/düşüğü** toplu `v7/quote`
  ucundan gelir (100'er sembol tek istekte; crumb gerektirir, alınamazsa
  önbellekteki bara düşülür).
  `SERIES_TTL_MINUTES` (varsayılan 30) bar geçmişinin tazelenme sıklığı,
  `SERIES_CHECK_MINUTES` (15) kontrol aralığı, `SERIES_FETCH_GAP_MS` (350)
  Yahoo istekleri arası bekleme. Önbellek durumu: `GET /api/health`.
- **UYARI taraması** (`/api/alerts`): overzone / WaveTrend / SuperTrend sinyalini
  YENİ veren hisseler — günlük grafikte, yalnızca son bar (`ALERT_LOOKBACK_BARS`,
  varsayılan 1). Yukarıdaki bar geçmişini kullanır, **ek veri çekmez**. Son bar
  canlı fiyatla güncellendiği için sinyal, günlük kapanış beklenmeden gün içinde
  görünür. Liste tavanı `ALERT_MAX_ITEMS` (600).

### 3) Frontend
```bash
cd frontend
npm install
npm run dev               # http://localhost:5173
```
`/api` istekleri otomatik olarak backend'e (4000) proxy'lenir.

## API

| Metot | Yol                     | Açıklama                                  |
|-------|-------------------------|-------------------------------------------|
| GET   | `/api/health`           | Sağlık kontrolü + bar geçmişi önbelleği   |
| GET   | `/api/recommendations`  | Puana göre sıralı öneri listesi           |
| GET   | `/api/prices`           | Canlı fiyat + aynı andaki gösterge sinyalleri |
| GET   | `/api/chart`            | Grafik için günlük OHLC serisi            |
| GET   | `/api/alerts`           | UYARI: yeni sinyal veren hisseler (1s/4s/günlük) |
| POST  | `/api/refresh`          | Veriyi Yahoo'dan yeniden çeker ve puanlar |

## Takip edilen hisseler

`backend/src/stocks.js` içinde ~30 BIST hissesi (BIST-30 ağırlıklı) tanımlı.
Yeni hisse eklemek için listeye bir satır eklemek yeterli.

## Sonraki adımlar (fikirler)
- Daha zengin göstergeler (RSI, hareketli ortalama kesişimleri, hacim)
- Temel veriler (F/K, PD/DD) ile değer + momentum harmanı
- Kullanıcı portföyü / favori listesi
- Grafik (fiyat geçmişi) ve detay sayfası
