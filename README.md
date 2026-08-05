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
- **UYARI taraması** (`/api/alerts`): günlük grafikte **iki grup** döner —
  `items` = **alım adayları**: `overzone` **AL** (aşırı satımda, −50/−60,
  kurulan yukarı kesişim, TETİK) son barda oluşanlar (`ALERT_LOOKBACK_BARS`,
  varsayılan 1) **+** `MACD` **AL** **+** `RSI` **0-`ALERT_RSI_MAX`** (varsayılan
  40) arası (o anki durum, SÜZGEÇ) — üçü birden sağlanmayınca liste dışı kalır.
  Eskiden ayrıca **hacim dönüşü** teyidi de aranıyordu; o formasyon tümden
  kaldırıldı, MACD+RSI süzgeçleri onun yerini alıyor.
  `stSell` = `SuperTrend`in **son barda SAT'a döndüğü** hisseler.
  Arayüz `stSell`i kullanıcının **Sanal Borsa portföyüyle kesiştirir** ("kendi
  hisselerim" — satış uyarısı); portföy tarayıcıda durduğu için sunucuya
  gönderilmez, süzme istemcide yapılır. Bar geçmişini kullanır, **ek veri
  çekmez**. Son bar canlı fiyatla güncellendiği için sinyal, günlük kapanış
  beklenmeden gün içinde görünür. **Yalnızca BUGÜN**: son barı bugüne (borsa saati, `EXCHANGE_GMT_OFFSET`
  varsayılan UTC+3) ait olmayan hisse taranmaz; bugün seans yoksa liste boş döner
  (`lastBarDate` son seansın tarihini söyler). Liste tavanı `ALERT_MAX_ITEMS` (600).
  Arayüzde tarama sekme kapalıyken de sürer: görülmemiş yeni sinyal varsa **UYARI
  sekmesi yanıp söner** (rozette sayısı yazar), sekme açılıp sayfa görünür
  olduğunda söner. Görülenler tarayıcıda (`localStorage: alertsSeen`) tutulur ve
  gün değişince sıfırlanır; o ziyarette yeni gelenler satırda **YENİ** rozeti alır.

### 3) Frontend
```bash
cd frontend
npm install
npm run dev               # http://localhost:5173
```
`/api` istekleri otomatik olarak backend'e (4000) proxy'lenir.

**Grafik pop-up'ı.** Hisse koduna tıklayınca 1 yıllık mum grafiği açılır.
Başlıkta canlı fiyat ve **günlük değişim**; Sanal Borsa'ya girilmişse altında
**pozisyon şeridi** (adet/gram, maliyet, bugünkü K/Z, toplam K/Z, güncel değer)
ve doğrudan **AL/SAT** paneli bulunur — Sanal Borsa sekmesine gitmeye gerek yok.
İşlemden sonra şerit anında tazelenir. "Tümü" düğmesi alımda nakde sığan en çok
miktarı, satışta elde olanı doldurur. Kâr/zarar portföyün ₺ birim fiyatı
üzerinden hesaplanır (kıymetli madende ₺/gram). **Bugünkü K/Z yalnızca
hisselerde** gösterilir: kıymetli madende günlük yüzde USD/ons değişimidir,
₺/gram ise ayrıca kurdan etkilendiği için ikisini çarpmak yanlış olurdu.
Pop-up canlı kaleme bağlıdır (fiyat tazelendikçe başlık ve K/Z güncellenir),
ama grafik yalnızca enstrüman değişince yeniden çizilir.

**İlk açılış hızı.** İki önlem var:
- `npm run build` öncesinde `scripts/copy-seed.mjs`, `data/recommendations.json`'u
  `public/seed.json`'a kopyalar. Uygulama açılışta bu **tohumu** CDN'den (~50 ms)
  çekip tabloyu hemen basar; `/api/recommendations` yanıtı gelince üstüne yazılır.
  Backend uykudaysa/erişilemezse bile liste görünür (üstte "kaynak: CDN önbelleği"
  yazar). Tohum yoksa uygulama eskisi gibi doğrudan API'yi bekler.
- `.github/workflows/keep-warm.yml`, seans saatlerinde (hafta içi 06:00–15:59 UTC)
  10 dakikada bir `/api/health`'e ping atarak Render'ın ücretsiz planındaki
  15 dakikalık uyku + 30–60 sn cold start'ı önler. API adresi repo değişkeni
  `API_URL` ile ezilebilir.

**Grafik yığını tembel yükleniyor.** `lightweight-charts` (48 KB gzip) ilk
bundle'ın yarısıydı; `ChartModal.jsx` ayrı bir parça olarak yalnızca bir
enstrümana tıklanınca indiriliyor. Açılıştaki JS: 109 KB → 58 KB gzip.

**Liste kademeli basılıyor.** 619 kaydın hepsi birden ~16.700 DOM düğümü
demekti. `useKademeliListe` önce `SAYFA` (120) kayıt basar; listenin sonundaki
nöbetçi görününce IntersectionObserver bir parti daha ekler. Nöbetçi aynı
zamanda **düğmedir** — gözlemci çalışmazsa kalan kayıtlara erişim kapanmasın
diye. Sekme/filtre/sıralama/arama değişince baştan başlar. İlk boyamada
DOM: 16.727 → 3.255 düğüm. Arama tüm kalemler üzerinde çalıştığı için
basılmamış satırlar arama sonuçlarından düşmez.

**Satırlar `memo`'lu.** `mergeLivePrices`, bir kalemin hiçbir alanı oynamadıysa
**eski nesneyi** geri verir (`volRev` değerce karşılaştırılır — her yanıtta yeni
nesne olarak gelir). Böylece 18 saniyelik fiyat tazelemesinde yalnızca gerçekten
değişen satırlar yeniden render edilir; hiçbir şey değişmediyse liste referansı
da korunur ve React tüm güncellemeyi atlar (yalnızca "Fiyat: …" saati ilerler).

## API

| Metot | Yol                     | Açıklama                                  |
|-------|-------------------------|-------------------------------------------|
| GET   | `/api/health`           | Sağlık kontrolü + bar geçmişi önbelleği   |
| GET   | `/api/recommendations`  | Puana göre sıralı öneri listesi           |
| GET   | `/api/prices`           | Canlı fiyat + aynı andaki gösterge sinyalleri |
| GET   | `/api/chart`            | Grafik için günlük OHLC serisi            |
| GET   | `/api/alerts`           | UYARI: yeni sinyal veren hisseler (1s/4s/günlük) |
| POST  | `/api/refresh`          | Veriyi Yahoo'dan yeniden çeker ve puanlar |
| GET   | `/api/us-recommendations` | ABD (NASDAQ100+S&P100) temel analiz ağırlıklı öneri listesi |
| POST  | `/api/us-refresh`       | ABD verisini canlı yeniden çeker (belleği günceller) |

## Takip edilen hisseler

`backend/src/stocks.js` içinde ~30 BIST hissesi (BIST-30 ağırlıklı) tanımlı.
Yeni hisse eklemek için listeye bir satır eklemek yeterli.

Aynı dosyada iki liste daha var, ikisi de **Maden & Emtia** sekmesinde görünür:

| Liste | `kind` | Birim | ₺ karşılığı |
|-------|--------|-------|-------------|
| `METALS` (altın, gümüş, platin, paladyum) | `metal` | troy ons → **gram** | `tryPerGram` (aşağıdaki zincir) |
| `COMMODITIES` (Brent petrol) | `emtia` | kendi birimi (**varil**) | `tryPrice` = USD × kur |

### Madenlerde ons fiyatı ve grafik

Ons fiyatı **spot**tan gelir (`api.gold-api.com`). Yahoo'daki `GC=F`/`SI=F`/
`PL=F`/`PA=F` **vadeli kontrat**: spottan ~%1,4 yüksek işlem görüyor ve Yahoo
kontratı yuvarladıkça (Aug 26 → Dec 26) gösterilen fiyat sıçrıyor. Her kaynağın
"altın ons fiyatı" diye gösterdiği sayı spot.

Bunun bedeli olarak **madenlerde grafik ve göstergeler yok**: elimizdeki tek
geçmiş bar serisi vadeli kontrata ait, gösterilen fiyat ise spot. İkisini
birleştirmek — son barı spot fiyatla yamalamak — serinin ucunda ~%1,4'lük sahte
bir sıçrama yaratır ve WaveTrend/SuperTrend'de gerçek olmayan AL/SAT sinyalleri
üretirdi. Ücretsiz, geçmiş barlı bir spot kaynağı aranıp bulunamadı (Yahoo'da
spot sembolü yok; gold-api ve Swissquote yalnızca anlık veriyor).

Bu yüzden madenlerde: bar geçmişi tutulmaz (`refreshSeries` atlar), gösterge
hesaplanmaz, tabloda hisse kodu grafik bağlantısı vermez, gösterge sütunları
boştur. **Brent bundan etkilenmez** — onun fiyatı da grafiği de Yahoo'nun aynı
vadeli serisinden geldiği için kendi içinde tutarlı.

Günlük değişim yüzdesi madenlerde vadeli seriden kalır: spot ucu geçmiş
vermiyor, iki serinin günlük yüzdesi ise yakın seyrediyor.

### ₺/gram nereden geliyor

Yahoo'nun ons fiyatı **vadeli kontrat** (`GC=F` = Gold Aug 26 gibi); spottan
~%1,4 yüksek işlem görüyor. Doğrudan çevirince Türkiye'deki gram fiyatından
sapıyordu. `metalTryPerGram()` (dataSource.js) en yakından başlayan bir zincir
uygular — sapmalar altin.in gram altın ortasına göre ölçüldü:

| Öncelik | Kaynak | Sapma |
|---------|--------|-------|
| 1 | **altin.in SATIŞ** — sitelerin "gram altın" diye gösterdiği sayı | %0,00 |
| 2 | **spot ons** (`api.gold-api.com`) × TCMB kuru | −%0,20 |
| 3 | vadeli ons × TCMB kuru (en eski davranış, son çare) | +%1,23 |

Serbest piyasa kuru da denendi, **daha kötü** çıktı (+%0,44): sapmanın neredeyse
tamamı vadeli–spot farkından geliyor, kurdan değil. Paladyum altin.in'de
yayınlanmadığı için 2. basamağa düşer; bu basamağın doğruluğu platinle
çapraz doğrulandı (spot × kur = 2.523,75 ₺ · altin.in satış = 2.524,61 ₺ → %0,03).

**Neden orta değil satış:** alış/satış ortası daha adil görünüyordu ama
Türkiye'de "gram altın fiyatı" diye gösterilen sayı satış tarafı — doviz.com
6.206,88 ile altin.in satış 6.206,94 birebir örtüşürken, orta %0,43 altta
kalıyordu. Alış zaten kendi sütununda duruyor.

Zincir **hem yayınlanan veride hem canlı tazelemede** uygulanır: `/api/prices`
yanıtı `metals` alanıyla ₺/gram, alış ve satışı taşır, yoksa istemci değeri
vadeli USD fiyattan yeniden türetip üstüne yazardı. Kaynaklar önbellekli
(altin.in ve spot 60 sn, TCMB 30 dk). Arayüzde ₺/gram değerinin üstüne
gelince hangi basamaktan geldiği yazar.

Bu değişiklik **gösterge hattına dokunmaz**: grafik, overzone, WaveTrend ve
SuperTrend hâlâ Yahoo'nun USD barlarından hesaplanır. ₺/gram ayrı bir gösterim
alanı olduğu için Brent'teki gibi sinyal bozulması riski yok. Sanal borsada
işlem fiyatı da ₺/gram olduğundan artık gerçek piyasa fiyatından alıp satarsın.

Emtia ayrı bir `kind`: maden mantığı fiyatı troy onsa bölüp ₺/gram üretiyor,
varil başına fiyatlanan Brent'te bu anlamsız olurdu. Sanal borsada işlem birimi
`unit` alanından gelir (Brent'te "varil"). Yeni bir emtia eklemek için
`COMMODITIES`'e Yahoo sembolü ve birimiyle bir satır yazmak yeterli.

Maden ve emtiada **günlük kâr/zarar hesaplanmaz**: günlük yüzde USD fiyatın
değişimidir, ₺ karşılığı ise ayrıca döviz kurundan etkilenir; ikisini çarpmak
yanlış sayı üretirdi. Analist kapsamları olmadığı için puanları 60 ile sınırlıdır.

## ABD Büyük Şirketler (NASDAQ100 + S&P100)

BIST'ten tamamen izole, ayrı bir sekme: **🇺🇸 ABD Hisseleri**. Teknik gösterge
(overzone/WaveTrend/SuperTrend) veya canlı fiyat akışı yok — bu sekme
**temel analiz** odaklı.

- **Ticker evreni**: `backend/src/usStocks.js` — NASDAQ-100 ∪ S&P 100 birleşimi
  (~170 hisse), BIST_STOCKS gibi statik/elle bakımlı bir liste.
- **Veri**: `backend/src/dataSource.js`'teki `fetchUsFundamentals` tek bir
  Yahoo `quoteSummary` isteğinde fiyat + temel veriyi (gelir büyümesi, net
  marj, nakit/borç/EBITDA, FCF, analist hedefi, çok yıllık gelir CAGR'ı)
  çeker. `.github/workflows/refresh-us-data.yml` günde 1 kez (BIST'e göre
  daha seyrek — bu veriler o kadar hızlı değişmiyor) taze bir GitHub runner
  IP'sinde çekip `data/us-recommendations.json`'a yayınlar; backend bunu
  runtime'da okur (BIST'in `refresh-data.yml` deseniyle birebir aynı,
  Render'ın datacenter IP throttle sorunundan kaçınmak için).
- **Puan** (`backend/src/recommendUs.js`): momentum yerine analist 12 aylık
  hedef potansiyeli (%35), yıllık (YoY) gelir büyümesi (%20), net kâr marjı
  (%15), kaldıraç/`Net Debt-EBITDA` (%15) ve FCF marjı (%15). Eşikler BIST
  ile aynı: `≥65 AL`, `45–64 TUT`, `<45 İZLE`.
- **Analist raporu** (`backend/src/usAnalysis.js`): Yahoo'nun API'si
  segment/rakip/moat gibi nitel veri vermediği için ~48 mega-cap'te elle
  yazılmış, yapılandırılmış bir rapor var — gelir modeli/segmentler, bilanço
  sağlığı, rekabet avantajı (moat), 3 güçlü/3 zayıf yön, gerekçeli değerleme
  özeti. **AL/TUT/İZLE rozeti bu metinden gelmez** — her zaman yukarıdaki
  hesaplanan puandan gelir, tutarlılık için tek kaynak budur. Rapor kapsamı
  dışındaki hisselerde yalnızca otomatik sayısal özet gösterilir, uydurma
  anlatı eklenmez.

⚠️ Nitel rapor içeriği en son bilinen yıllık verilere dayalı **yaklaşık**
değerlerdir, gerçek zamanlı değildir ve **yatırım tavsiyesi değildir**.

## Sonraki adımlar (fikirler)
- Daha zengin göstergeler (RSI, hareketli ortalama kesişimleri, hacim)
- Temel veriler (F/K, PD/DD) ile değer + momentum harmanı
- Kullanıcı portföyü / favori listesi
- Grafik (fiyat geçmişi) ve detay sayfası
