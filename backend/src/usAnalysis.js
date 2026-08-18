// Elle yazılmış, NİTEL analist raporları — YATIRIM TAVSİYESİ DEĞİLDİR.
// Yahoo'nun quoteSummary API'si segment/rakip/moat gibi nitel veri vermediği
// için bu içerik zorunlu olarak statik ve elle bakımlıdır (stocks.js'teki
// BIST_STOCKS listesiyle aynı felsefe).
//
// BU DOSYA YALNIZCA NİTEL İÇERİK TUTAR. Gelir/marj/bilanço/FCF notları
// (revenue3yNote, marginNote, balanceNote, fcfNote) buradan ÇIKARILDI: onlar
// tamamen rakamlardan türetiliyor ve her veri turunda canlı temel veriden
// yeniden üretiliyor (usNotes.js, service.js'te birleştiriliyor). Dosyada
// tutuldukları sürece kaçınılmaz olarak eskiyorlardı — 46 kayıt FY2024
// rakamlarını anlatır haldeyken ekrandaki sayısal ızgara canlı veriyi
// gösteriyordu; kullanıcı iki farklı döneme ait bilgiyi yan yana görüyordu.
//
// Dolayısıyla `asOf` artık TEK ANLAMLI: yalnızca aşağıdaki nitel içeriğin
// (segment payları, moat, rakipler, güçlü/zayıf yönler, verdict) hangi döneme
// ait olduğunu söyler. Arayüz bu tarihi ve yaşını gösterir (UsStocksTab.jsx).
//
// AL/TUT/İZLE rozeti BURADAN gelmez: o her zaman recommendUs.js'in hesapladığı
// puandan gelir (tek kaynak, tutarlılık için). Bu dosya yalnızca gerekçe/anlatı
// sağlar — `verdict` alanı objektif bir değerleme yorumu, sinyal değil.
//
// Kapsam: ~48 mega-cap (Magnificent 7 + sektör lideri diğer büyükler).
// Yeni şirket eklemek için usStocks.js'te olması ve buraya bir kayıt
// eklenmesi yeterli; `report` alanı yalnızca burada eşleşen ticker'larda dolar.
export const US_ANALYSIS = {
  AAPL: {
    asOf: 'FY2025 yıllık rapor verilerine dayalı, yaklaşık',
    segments: [
      { name: 'iPhone', sharePct: 51, note: 'Gelirin yarısı; yenileme döngüsü uzadıkça büyüme fiyata bağımlı hale geliyor' },
      { name: 'Hizmetler (App Store, iCloud, reklam, ödeme)', sharePct: 26, note: 'Marjı donanımın iki katı; kârlılığın asıl motoru' },
      { name: 'Giyilebilir, Ev ve Aksesuar', sharePct: 12, note: 'Watch ve AirPods; ekosisteme bağlama işlevi güçlü' },
      { name: 'Mac + iPad', sharePct: 11, note: 'Apple Silicon geçişi payı korudu; döngüsel' },
    ],
    competitors: ['Samsung Electronics', 'Alphabet (Android)', 'Microsoft', 'Xiaomi', 'Huawei'],
    moat: [
      { title: 'Ekosistem kilitlenmesi', desc: 'Cihazlar, hesap, ödeme ve sağlık verisi tek bir hesapta birikiyor; tek bir ürünü değiştirmek diğerlerinin işlevini bozduğu için kullanıcı pratikte bütünü değiştirmek zorunda kalıyor.' },
      { title: 'Hizmetlerin marj kaldıracı', desc: 'Kurulu cihaz tabanı üzerinden satılan hizmetlerin marjinal maliyeti çok düşük; donanım büyümesi yavaşlasa bile aynı taban üzerinden gelir derinleştirilebiliyor.' },
    ],
    strengths: [
      'Kurulu cihaz tabanı üzerinden hizmet geliri büyümeye devam ediyor ve marjı yukarı çekiyor',
      'Nakde dönüşüm güçlü; nakit akışının büyük kısmı temettü ve geri alımla hissedara dönüyor',
      'Marka gücü fiyat artışlarını hacim kaybı olmadan geçirebilmeyi sağlıyor',
    ],
    risks: [
      'Gelirin yarısı tek üründe; yenileme döngüsü uzadıkça büyüme giderek fiyat artışına bağımlı hale geliyor',
      'Hizmetler gelirinin önemli bir kısmı arama anlaşması ve App Store komisyonlarından; ikisi de rekabet hukuku baskısı altında',
      'Çin hem büyük bir pazar hem üretim üssü — jeopolitik gerilim iki taraflı risk yaratıyor',
    ],
    verdict: 'İş kalitesi ve nakde dönüşüm tartışmasız; hizmetlerin payı arttıkça marj yapısı daha da destekleniyor. Değerlemedeki gerilim, olgun bir donanım işine biçilen yüksek ileri çarpan: analist potansiyeli grubun en düşükleri arasında ve büyüme fiyat artışına bağımlı hale geldikçe çarpanı savunmak zorlaşıyor.',
  },

  MSFT: {
    asOf: 'FY2025 yıllık rapor verilerine dayalı, yaklaşık',
    segments: [
      { name: 'Akıllı Bulut (Azure, sunucu ürünleri)', sharePct: 44, note: 'AI iş yükleriyle en hızlı büyüyen kol; sermaye yoğunluğu da en yüksek olan' },
      { name: 'Üretkenlik ve İş Süreçleri (Microsoft 365, LinkedIn, Dynamics)', sharePct: 33, note: 'Abonelik ağırlıklı, öngörülebilir; Copilot ile birim fiyat artışı deneniyor' },
      { name: 'Daha Fazla Kişisel Bilgisayarlama (Windows, Xbox, arama, cihaz)', sharePct: 23, note: 'Olgun; oyun tarafı Activision ile büyüdü' },
    ],
    competitors: ['Amazon (AWS)', 'Alphabet (Google Cloud)', 'Oracle', 'Salesforce', 'OpenAI (kısmen ortak kısmen rakip)'],
    moat: [
      { title: 'Kurumsal dağıtım ve satın alma ilişkisi', desc: 'Kurumsal müşterilerin çoğu Windows, Office ve Azure\'u tek bir kurumsal sözleşmede topluyor; yeni bir ürünü aynı sözleşmeye eklemek rakipten satın almaktan idari olarak çok daha kolay — bu, Microsoft\'a satış yapmadan önce kazanılmış bir avantaj sağlıyor.' },
      { title: 'Kurumsal veri yerçekimi', desc: 'Kurumun dosyaları, kimlik yönetimi ve iş akışları Microsoft bulutunda biriktikçe taşınma maliyeti teknik bir projeye dönüşüyor; bu yapışkanlık fiyat artışlarını da taşıyabiliyor.' },
    ],
    strengths: [
      'Bulut ve abonelik ağırlıklı gelir yapısı yüksek marjlı ve öngörülebilir',
      'Kurumsal kimlik ve üretkenlik katmanına sahip olmak, AI ürünlerini mevcut sözleşmelere eklemeyi kolaylaştırıyor',
      'Net marj mega-cap grubunun üst bandında ve büyüme çift haneli sürüyor',
    ],
    risks: [
      'AI veri merkezi yatırımı serbest nakit akışını sert biçimde daraltmış durumda — %40\'ı aşan net marja karşılık FCF marjı tek haneye inmiş; kâr ile nakit arasındaki bu makas tezin en somut zayıflığı',
      'Azure büyümesi kapasite kısıtına bağlı; yatırımın gelire dönüşme takvimi kayarsa beklenti hızla bozulur',
      'OpenAI ilişkisi hem stratejik avantaj hem bağımlılık; ortaklığın ekonomisi değişirse AI ürün hattının maliyet yapısı etkilenir',
    ],
    verdict: 'Kurumsal dağıtım gücü ve abonelik yapısı, mega-cap içinde en savunulabilir iş modellerinden birini oluşturuyor; ileri çarpan da bu kalite için aşırı değil. Ancak değerlemenin sınavı kârlılık değil nakit: veri merkezi yatırımı FCF marjını net marjın çok altına indirdiği sürece kâra dayalı çarpanlar gerçeğin önünde koşar. İzlenmesi gereken, capex\'in Azure gelirine dönüşme hızı.',
  },

  GOOGL: {
    asOf: 'FY2025 yıllık rapor verilerine dayalı, yaklaşık',
    segments: [
      { name: 'Google Arama ve diğer', sharePct: 54, note: 'Nakit motoru; AI özetlerinin tıklama davranışına etkisi izlenen ana konu' },
      { name: 'Google Cloud', sharePct: 15, note: 'Kârlılığa geçti ve AI iş yükleriyle en hızlı büyüyen kol' },
      { name: 'YouTube reklam', sharePct: 11, note: 'Kısa video ve bağlantılı TV tarafında pay kazanıyor' },
      { name: 'Abonelikler, platformlar, cihazlar + diğer bahisler', sharePct: 20, note: 'YouTube Premium, Google One; Waymo bu grupta ve zarar merkezi' },
    ],
    competitors: ['Microsoft (Azure, Bing/Copilot)', 'Amazon (AWS, reklam)', 'Meta Platforms', 'OpenAI', 'TikTok (ByteDance)'],
    moat: [
      { title: 'Dağıtım + veri ölçeği', desc: 'Android, Chrome ve varsayılan arama anlaşmaları aramayı kullanıcının önüne koyuyor; oluşan sorgu verisi sonuçları iyileştiriyor ve bu döngü rakibin bütçeyle kapatamayacağı bir kalite farkı yaratıyor.' },
      { title: 'Reklamveren ağ etkisi ve araç bağımlılığı', desc: 'Reklamverenler bütçelerini en çok dönüşüm veren yere koyuyor; kampanya araçları, ölçümleme ve geçmiş performans verisi platforma yerleştikçe bütçenin taşınması teknik bir proje haline geliyor.' },
    ],
    strengths: [
      'Net marj mega-cap grubun en yükseklerinden; çekirdek arama işi hâlâ çift haneli büyüyor',
      'Cloud tarafı kâra geçti ve AI iş yükleriyle büyüme oranı grubun geri kalanının üstünde',
      'Net nakit bilanço; devasa yatırım programını dış finansmana ihtiyaç duymadan sürdürebiliyor',
    ],
    risks: [
      'AI altyapı yatırımı serbest nakit akışını çarpıcı biçimde daraltmış durumda — %50\'yi aşan net marja karşılık FCF marjı tek haneye inmiş; kâr ile nakit arasındaki bu makas tezin en somut zayıflığı',
      'Üretken AI arayüzleri kullanıcıyı bağlantıya tıklamadan yanıta ulaştırıyor; bu, arama reklam modelinin taşıyıcı varsayımını uzun vadede aşındırabilir',
      'Rekabet hukuku davaları varsayılan arama anlaşmalarını ve dağıtım avantajını doğrudan hedef alıyor',
    ],
    verdict: 'Çekirdek iş hâlâ olağanüstü kârlı ve Cloud ikinci bir büyüme kolu olarak olgunlaştı; ileri çarpan bu profil için aşırı değil. Değerlemenin asıl sınavı muhasebe kârı değil nakit: AI yatırımı FCF marjını net marjın çok altına indirdiği sürece kâra dayalı çarpanlar ekonomik gerçekliğin önünde koşar. İkinci ve daha yavaş işleyen risk, AI arayüzlerinin arama reklamcılığının tıklama temelini değiştirmesi.',
  },

  AMZN: {
    asOf: 'FY2025 yıllık rapor verilerine dayalı, yaklaşık',
    segments: [
      { name: 'Kuzey Amerika perakende', sharePct: 60, note: 'Hacim büyük, marj ince; lojistik verimliliği belirleyici' },
      { name: 'AWS (bulut)', sharePct: 17, note: 'Gelirin altıda biri ama faaliyet kârının ezici çoğunluğu' },
      { name: 'Uluslararası perakende', sharePct: 23, note: 'Kârlılığa yeni geçen pazarlar; yatırım evresi sürüyor' },
    ],
    competitors: ['Microsoft (Azure)', 'Alphabet (Google Cloud)', 'Walmart', 'Alibaba', 'Shopify'],
    moat: [
      { title: 'Lojistik ağı ve teslimat hızı', desc: 'Depo, dağıtım ve son kilometre ağını on yıllarca sermaye harcayarak kurdu; bu ölçekte teslimat hızını taklit etmek rakip için yıllar ve devasa sabit yatırım demek.' },
      { title: 'AWS geçiş maliyeti', desc: 'Kurumun altyapısı, veri deposu ve otomasyonu AWS servislerine gömüldükçe taşınma maliyeti mühendislik projesine dönüşüyor; bu yapışkanlık AWS marjını koruyor.' },
    ],
    strengths: [
      'AWS gelirin altıda biri olmasına rağmen kârın ana kaynağı — perakendenin ince marjını taşıyan bir motor',
      'Reklam işi hızla büyüyor ve perakendeden bağımsız, yüksek marjlı bir üçüncü kol oluşturuyor',
      'Perakende tarafında lojistik verimliliği arttıkça faaliyet marjı yapısal olarak iyileşiyor',
    ],
    risks: [
      'Serbest nakit akışı marjı sıfıra yakın — %17\'lik net marja karşılık FCF pratikte yok; AI ve lojistik yatırımı nakdin tamamını yutuyor',
      'Perakende tarafı tüketici harcamasına doğrudan duyarlı ve marj tamponu ince',
      'AWS\'de büyüme rakiplerin agresif fiyatlaması ve müşterilerin maliyet optimizasyonu nedeniyle baskı altında kalabilir',
    ],
    verdict: 'İki güçlü moat (lojistik ölçeği ve bulut yapışkanlığı) ve üçüncü bir yüksek marjlı kol olarak reklam, iş kalitesini yukarı taşıyor. Değerlemedeki asıl soru nakit: net marj makul görünse de serbest nakit akışı sıfıra yakın seyrediyor, yani kâr henüz hissedara dönüşebilir nakde çevrilemiyor. Tez, yatırım evresinin sona ermesi ve FCF\'nin normalleşmesi varsayımına dayanıyor.',
  },

  NVDA: {
    asOf: 'FY2025 (Ocak sonu biten mali yıl) verilerine dayalı, yaklaşık',
    segments: [
      { name: 'Veri Merkezi (AI hızlandırıcılar — H100/H200/Blackwell)', sharePct: 88, note: 'Gelirin ezici çoğunluğu; hiper-ölçekli bulut şirketlerine yoğunlaşmış' },
      { name: 'Oyun (GeForce)', sharePct: 8, note: 'Eski ana iş, artık ikincil' },
      { name: 'Profesyonel görselleştirme + otomotiv', sharePct: 4, note: 'Küçük ama stratejik (robotik/otonom)' },
    ],
    competitors: ['AMD', 'Intel', 'Google (özel TPU çipleri)', 'Amazon (Trainium/Inferentia)', 'Broadcom (özel AI çipleri)'],
    moat: [
      { title: 'CUDA yazılım ekosistemi', desc: 'On yıllardır geliştirilen CUDA yazılım/kütüphane ekosistemi, geliştiricileri ve kurumsal iş yüklerini NVIDIA donanımına kilitliyor; rakiplerin salt donanımla eşleşmesi yetmiyor.' },
      { title: 'Ürün/kapasite liderliği döngüsü', desc: 'Yıllık yenilenen çip mimarisi (Blackwell, Rubin) + TSMC\'nin en gelişmiş üretim kapasitesine öncelikli erişim, rakiplere karşı sürekli bir nesil öndelik sağlıyor.' },
    ],
    strengths: [
      'AI eğitim/çıkarım altyapısında fiili endüstri standardı konumunda',
      'CUDA ekosistemi donanım değiştirme maliyetini müşteriler için çok yüksek tutuyor',
      'Marj ve nakit üretimi sektörde emsalsiz; Ar-Ge\'yi kendi nakit akışıyla finanse ediyor',
    ],
    risks: [
      'Gelirin küçük sayıda hiper-ölçekli müşteriye yoğunlaşması (Microsoft, Meta, Google, Amazon) — kendi çip geliştirme yatırımları talebi aşındırabilir',
      'Değerleme, AI capex döngüsünün süreceği varsayımına son derece duyarlı; döngü yavaşlarsa çarpan daralması sert olur',
      'Jeopolitik risk: Çin\'e ihracat kısıtlamaları gelirin önemli bir dilimini doğrudan etkiliyor',
    ],
    verdict: 'Kâr büyümesi şu ana kadar değerlemeyi haklı çıkardı, ama fiyatlama AI altyapı harcamalarının çok yıllı sürmesini varsayıyor; bu varsayımda bir kırılma (hiper-ölçeklilerin capex\'i yavaşlatması veya kendi çiplerine geçişi) çarpanlarda hızlı bir yeniden fiyatlamaya yol açabilir.',
  },

  META: {
    asOf: 'FY2025 yıllık rapor verilerine dayalı, yaklaşık',
    segments: [
      { name: 'Uygulama Ailesi reklam geliri (Facebook, Instagram, WhatsApp)', sharePct: 97, note: 'Gelirin neredeyse tamamı; Reels ve mesajlaşma reklamları büyümenin motoru' },
      { name: 'Reality Labs (AR/VR) + diğer', sharePct: 3, note: 'Kalıcı zarar merkezi; stratejik bahis olarak sürdürülüyor' },
    ],
    competitors: ['Alphabet (YouTube/Google Ads)', 'TikTok (ByteDance)', 'Amazon (reklam)', 'Snap', 'Apple (gizlilik politikalarıyla dolaylı)'],
    moat: [
      { title: 'Ağ etkisi + kullanıcı ölçeği', desc: 'Milyarlarca kullanıcılı birden çok uygulama, reklamverene başka hiçbir platformda bulunamayacak erişim sunuyor; kullanıcı da ağının bulunduğu yerden kolay ayrılamıyor.' },
      { title: 'Hedefleme veri döngüsü', desc: 'Reklam performans verisi modelleri besliyor, modeller hedeflemeyi iyileştiriyor, iyileşen dönüşüm daha çok reklamvereni çekiyor — rakip için taklidi zor, kendini besleyen bir döngü.' },
    ],
    strengths: [
      'Reklam gelirinde çift haneli büyüme sürüyor ve net marj sektörün üst bandında',
      'AI destekli içerik öneri ve reklam hedefleme, aynı kullanıcı tabanından elde edilen geliri artırıyor',
      'Bilanço net nakde yakın; devasa yatırım programını borçlanmadan finanse edebiliyor',
    ],
    risks: [
      'AI altyapı harcamaları serbest nakit akışını çarpıcı biçimde daraltıyor — net marj yüksek kalırken FCF marjı tek haneye inmiş durumda; kâr ile nakit arasındaki bu makas tezin en somut zayıf noktası',
      'Reality Labs zararı sürüyor ve geri dönüşü belirsiz bir zaman ufkuna yayılmış',
      'Düzenleyici baskı (AB dijital mevzuatı, ABD rekabet davaları) hedefleme yeteneğini veya iş modelini kısıtlayabilir',
    ],
    verdict: 'Reklam işi güçlü büyüyor ve ileri çarpan mega-cap teknoloji içinde ucuz kalan taraflardan; ancak değerlemenin gerçek sınavı kârlılık değil nakit üretimi. AI yatırımı serbest nakit akışını net marjın çok gerisine düşürdüğü sürece, kâra dayalı çarpanların ucuzluğu görünenden az anlam taşır — yatırımın gelire dönüşme takvimi izlenmeli.',
  },

  TSLA: {
    asOf: 'FY2025 yıllık rapor verilerine dayalı, yaklaşık',
    segments: [
      { name: 'Otomotiv (araç satışı + regülasyon kredileri)', sharePct: 77, note: 'Fiyat indirimleri hacmi korudu ama marjı belirgin biçimde aşındırdı' },
      { name: 'Enerji üretimi ve depolama', sharePct: 14, note: 'En hızlı büyüyen ve marjı iyileşen kol; şebeke ölçekli depolama talebi güçlü' },
      { name: 'Hizmetler ve diğer', sharePct: 9, note: 'Servis ağı, şarj, sigorta' },
    ],
    competitors: ['BYD', 'Volkswagen Group', 'General Motors', 'Ford', 'Çinli EV üreticileri (NIO, Li Auto)'],
    moat: [
      { title: 'Dikey entegrasyon ve maliyet yapısı', desc: 'Batarya, yazılım ve üretim hattının büyük kısmını içeride tutması, birim maliyeti geleneksel üreticilerin tedarik zinciriyle ulaşamayacağı seviyeye çekebiliyor.' },
      { title: 'Şarj ağı ve yazılım tabanlı gelir', desc: 'Kendi şarj altyapısı satın alma kararında somut bir avantaj; araca sonradan satılan yazılım özellikleri ise donanım satıldıktan sonra da gelir üretmeyi mümkün kılıyor.' },
    ],
    strengths: [
      'Enerji depolama kolu hızlı büyüyor ve otomotiv döngüsünden bağımsız bir gelir kaynağı oluşturuyor',
      'Net nakit bilanço; yatırım programını borçlanmadan sürdürebiliyor',
      'Üretim maliyetinde dikey entegrasyon kaynaklı yapısal avantaj sürüyor',
    ],
    risks: [
      'Net marj tek haneye inmiş durumda — fiyat rekabeti kârlılığı ciddi biçimde aşındırdı ve toparlanma hacme bağlı',
      'İleri çarpan olağanüstü yüksek; değerleme otomotiv kârından çok otonom sürüş ve robotik gibi henüz gelir üretmeyen vaatleri fiyatlıyor',
      'Çinli üreticilerle rekabet hem Çin hem Avrupa pazarında yoğunlaşıyor ve fiyat baskısını sürdürüyor',
    ],
    verdict: 'Enerji depolama ve dikey entegrasyon gerçek güçler, bilanço da sağlam. Ancak değerleme mevcut kârlılıkla açıklanamıyor: tek haneli net marja karşılık üç haneli ileri çarpan, fiyatın otonom sürüş ve robotik gibi henüz gelire dönüşmemiş vaatlere dayandığını gösteriyor. Bu vaatlerin takviminde bir kayma, çarpanda sert bir yeniden fiyatlama anlamına gelir.',
  },

  AVGO: {
    asOf: 'FY2025 yıllık rapor verilerine dayalı, yaklaşık',
    segments: [
      { name: 'Yarı iletken çözümleri (özel AI ASIC, ağ, kablosuz)', sharePct: 62, note: 'Hiper-ölçekli müşteriler için özel AI çipleri bu segmentin büyüme motoru' },
      { name: 'Altyapı yazılımı (VMware, Symantec, CA)', sharePct: 38, note: 'Abonelik modeline geçişle marjı yüksek, tekrarlayan gelir' },
    ],
    competitors: ['NVIDIA', 'Marvell Technology', 'Cisco Systems', 'Intel', 'Qualcomm'],
    moat: [
      { title: 'Özel ASIC ortaklıkları', desc: 'Hiper-ölçekli müşterilerle çip tasarımı yıllar süren ortak mühendislik gerektiriyor; müşteri bir kez kilitlenince tedarikçi değiştirmesi tek bir satın alma kararı değil, çok yıllı bir yeniden tasarım projesi.' },
      { title: 'Satın alma + marj disiplini', desc: 'Olgun yazılım varlıklarını satın alıp maliyet yapısını sıkılaştırma ve abonelik modeline taşıma konusunda tekrarlanabilir bir oyun kitabı; VMware bunun en büyük ölçekli uygulaması.' },
    ],
    strengths: [
      'Yarı iletken ve altyapı yazılımı ikilisi, çip talebi döngüsel gerilerken yazılım tarafının nakit akışını dengelemesini sağlıyor',
      'Özel AI çipi tarafı NVIDIA\'nın genel amaçlı GPU\'suna alternatif arayan hiper-ölçeklilerin doğal ikinci kaynağı',
      'Nakde dönüşüm çok güçlü — muhasebe kârının neredeyse tamamı serbest nakde çevriliyor',
    ],
    risks: [
      'VMware satın almasından kalan borç yükü hâlâ bilançoda; kaldıraç rahat seviyede olsa da faiz ortamı ve amortisman kâr kalitesini etkiliyor',
      'Özel ASIC geliri az sayıda hiper-ölçekli müşteriye bağlı; bir müşterinin program iptali gelirde ani boşluk yaratabilir',
      'VMware fiyatlama/lisans modeli değişiklikleri kurumsal müşterilerde memnuniyetsizlik ve rakiplere kayış riski taşıyor',
    ],
    verdict: 'Büyümenin 3 yıllık ortalamanın belirgin üstüne çıkması ve nakde dönüşümün güçlü kalması, ileri çarpanı büyük ölçüde gerekçelendiriyor. Tezin kırılma noktası özel ASIC tarafındaki müşteri yoğunlaşması: yazılım segmenti bir tampon sağlıyor ama çip tarafındaki bir program kaybını tamamen karşılayacak ölçekte değil.',
  },

  ORCL: {
    asOf: 'FY2025 yıllık rapor verilerine dayalı, yaklaşık',
    segments: [
      { name: 'Bulut hizmetleri ve lisans desteği (OCI + uygulamalar)', sharePct: 76, note: 'AI altyapı sözleşmeleriyle hızla büyüyen kol; sermaye yoğunluğu çok yüksek' },
      { name: 'Bulut lisansı ve şirket içi lisans', sharePct: 9, note: 'Geleneksel lisans işi; azalıyor' },
      { name: 'Donanım + hizmetler', sharePct: 15, note: 'Olgun, düşük büyümeli kalıntı işler' },
    ],
    competitors: ['Microsoft (Azure)', 'Amazon (AWS)', 'Alphabet (Google Cloud)', 'SAP', 'Salesforce'],
    moat: [
      { title: 'Kurumsal veritabanı yerleşikliği', desc: 'Onlarca yıldır kritik iş sistemlerinin altında çalışan veritabanı, taşınması en riskli bileşen; müşteri bulut sağlayıcısını değiştirse bile veritabanı katmanında kalmayı tercih ediyor.' },
      { title: 'Uygulama + altyapı paketleme', desc: 'ERP ve sektörel uygulamaları kendi bulutuyla birlikte satabilmesi, saf altyapı sağlayıcılarının sunamadığı bir bütünlük sağlıyor.' },
    ],
    strengths: [
      'AI altyapı talebiyle bulut geliri hızlanmış durumda ve sözleşmeli gelecek gelir birikimi büyük',
      'Kurumsal veritabanı yerleşikliği, bulut geçişinde doğal bir avantaj sağlıyor',
      'İleri çarpan akran grubuna göre düşük ve analist potansiyeli bu listenin en yükseği',
    ],
    risks: [
      'Serbest nakit akışı NEGATİF — veri merkezi yatırımı işletme nakdini aşmış durumda; büyüme tamamen borçla ve peşin sermayeyle finanse ediliyor',
      'Net Borç/EBITDA yüksek seviyede; negatif FCF ile birleştiğinde bilanço esnekliği daralıyor ve faiz ortamına duyarlılık artıyor',
      'AI altyapı sözleşmeleri az sayıda büyük müşteriye bağlı; birinin taahhüdünü azaltması hem geliri hem yapılmış yatırımın geri dönüşünü vurur',
    ],
    verdict: 'Yüksek analist potansiyeli ve düşük ileri çarpan cazip görünüyor, ancak bu tablo bilançodaki gerilim okunmadan yanıltıcı: yatırım programı serbest nakit akışını negatife çevirmiş ve kaldıraç zaten yüksek. Tez, AI sözleşmelerinin taahhüt edildiği gibi gelire dönüşmesine bağlı — dönüşürse çarpan gerçekten ucuz, gecikirse borç ve negatif nakit akışı birlikte baskı yaratır. Bu listedeki en yüksek getiri-risk asimetrisi burada.',
  },

  ADBE: {
    asOf: 'FY2025 yıllık rapor verilerine dayalı, yaklaşık',
    segments: [
      { name: 'Dijital Medya (Creative Cloud, Document Cloud)', sharePct: 73, note: 'Çekirdek abonelik işi; yaratıcı profesyonellerde fiili standart' },
      { name: 'Dijital Deneyim (pazarlama/analitik bulutu)', sharePct: 25, note: 'Kurumsal pazarlama yazılımı; büyüme kolu' },
      { name: 'Yayıncılık ve reklam', sharePct: 2, note: 'Kalıntı iş' },
    ],
    competitors: ['Canva', 'Figma', 'Salesforce (pazarlama bulutu)', 'Adobe dışı AI görsel araçları (Midjourney, OpenAI)'],
    moat: [
      { title: 'Profesyonel iş akışı standardı', desc: 'Ajanslar, matbaalar ve yayıncılar arasında dosya formatları ve iş akışı Adobe üzerine kurulu; tek bir kullanıcı değil, tüm zincir aynı anda değişmedikçe geçiş yapılamıyor.' },
      { title: 'Eğitim ve beceri yatırımı', desc: 'Yaratıcı profesyonellerin yıllar süren araç ustalığı kişisel bir yatırım; iş gücü bu araçlara göre eğitildiği için işverenin de alternatife geçme maliyeti yüksek.' },
    ],
    strengths: [
      'Abonelik modeli öngörülebilir ve nakde dönüşüm çok güçlü',
      'İleri çarpan yazılım akran grubunun belirgin altında — beklenti çıtası düşük',
      'Doküman tarafı (PDF/imza) yaratıcı işten bağımsız, istikrarlı bir gelir kolu',
    ],
    risks: [
      'Üretken AI görsel araçları giriş seviyesi işleri metalaştırıyor; fiyatlama gücü uzun vadede aşınabilir',
      'Figma ve Canva gibi işbirliği odaklı rakipler yeni kullanıcı kuşağını Adobe dışında kazanıyor',
      'Analist potansiyeli grubun en düşükleri arasında — düşük çarpan bir iskonto değil, büyüme endişesinin fiyatlanması olabilir',
    ],
    verdict: 'Nakde dönüşüm ve iş akışı yerleşikliği güçlü; ileri çarpan da yazılım akranlarına göre belirgin düşük. Ancak bu ucuzluğun sebebi kalite değil belirsizlik: üretken AI\'ın yaratıcı araç pazarını nasıl yeniden şekillendireceği ve yeni kullanıcı kuşağının nerede toplandığı henüz netleşmedi. Düşük çarpan bir fırsat da olabilir, yapısal bir uyarı da.',
  },

  CRM: {
    asOf: 'FY2025 yıllık rapor verilerine dayalı, yaklaşık',
    segments: [
      { name: 'Satış ve Hizmet bulutu', sharePct: 47, note: 'Çekirdek CRM; kurumsal müşteri tabanının omurgası' },
      { name: 'Platform ve diğer (Slack dahil)', sharePct: 26, note: 'Uygulama geliştirme ve iş birliği katmanı' },
      { name: 'Pazarlama ve Ticaret bulutu', sharePct: 15, note: 'Kampanya ve e-ticaret yönetimi' },
      { name: 'Veri bulutu / analitik (Tableau, MuleSoft)', sharePct: 12, note: 'Entegrasyon ve veri katmanı; AI ürünlerinin dayanağı' },
    ],
    competitors: ['Microsoft (Dynamics)', 'SAP', 'Oracle', 'Adobe', 'HubSpot'],
    moat: [
      { title: 'Müşteri verisi ve süreç yerleşikliği', desc: 'Satış süreçleri, müşteri geçmişi ve raporlama şirketin çalışma biçimine gömülüyor; CRM değiştirmek yazılım değiştirmek değil, satış organizasyonunu yeniden kurmak anlamına geliyor.' },
      { title: 'Uygulama ekosistemi', desc: 'Binlerce üçüncü taraf entegrasyonu ve danışmanlık ekosistemi platformun etrafında oluşmuş durumda; bu ağ rakiplerin kısa sürede kuramayacağı bir tamamlayıcı katman.' },
    ],
    strengths: [
      'Nakde dönüşüm çok güçlü ve abonelik yapısı öngörülebilir',
      'İleri çarpan kurumsal yazılım akranlarına göre düşük',
      'Veri katmanı (MuleSoft/Tableau) AI ürünleri için doğal bir dayanak sağlıyor',
    ],
    risks: [
      'Büyüme olgunlaşma evresinde; kurumsal yazılım bütçelerinde sıkılaşma doğrudan yeni satışa vuruyor',
      'Kaldıraç satın almalar nedeniyle ihmal edilebilir seviyede değil; büyüme yavaşlarsa borç servisi esnekliği azaltır',
      'Microsoft aynı işlevi kurumsal paket içinde sunarak fiyat baskısı yaratıyor — dağıtım avantajı Salesforce aleyhine',
    ],
    verdict: 'Süreç yerleşikliği gerçek bir moat ve nakde dönüşüm güçlü; düşük ileri çarpan bu kalite için cazip görünüyor. Riskin kaynağı ürün değil dağıtım: aynı işlevi kurumsal sözleşmesine ekleyebilen bir rakip karşısında fiyatlama gücü zamanla aşınabilir. Tez, veri ve AI katmanının farklılaşma yaratıp yaratamayacağına bağlı.',
  },

  NFLX: {
    asOf: 'FY2025 yıllık rapor verilerine dayalı, yaklaşık',
    segments: [
      { name: 'Abonelik geliri (standart + premium planlar)', sharePct: 88, note: 'Çekirdek iş; fiyat artışları ve şifre paylaşımı kısıtlaması geliri destekledi' },
      { name: 'Reklam destekli plan', sharePct: 9, note: 'Hızlı büyüyen ve marjı yüksek kol; abone başı geliri yukarı çekiyor' },
      { name: 'Diğer (oyun, canlı içerik, ürün)', sharePct: 3, note: 'Deneysel; elde tutmayı artırma amaçlı' },
    ],
    competitors: ['Disney+ / Hulu', 'Amazon Prime Video', 'YouTube (Alphabet)', 'Warner Bros. Discovery (HBO Max)', 'Apple TV+'],
    moat: [
      { title: 'İçerik ölçeği + veri destekli programlama', desc: 'Küresel abone tabanından gelen izleme verisi hangi içeriğin hangi pazarda tutacağını öngörmede kullanılıyor; aynı içerik bütçesi rakiplerden daha yüksek isabet oranıyla harcanıyor.' },
      { title: 'Küresel dağıtım ve yerel üretim ağı', desc: 'Onlarca ülkede yerel dil üretim altyapısı kurulu; bir pazarda üretilen içerik diğerlerinde marjinal maliyetsiz dağıtılabiliyor — rakiplerin tekrar kurması yıllar alır.' },
    ],
    strengths: [
      'Serbest nakit akışı marjı sektörde emsalsiz seviyede; içerik yatırımı artık nakit üretimini boğmuyor',
      'Reklam destekli plan hem yeni abone hem abone başı gelir artışı sağlıyor — çift yönlü kaldıraç',
      'Fiyatlama gücü kanıtlandı: art arda zamlar anlamlı abone kaybı yaratmadı',
    ],
    risks: [
      'Olgun pazarlarda abone büyümesi doygunluğa yaklaşıyor; büyüme giderek fiyat artışına bağımlı hale geliyor ve bunun bir sınırı var',
      'İçerik maliyetleri sözleşmeye bağlı ve yapışkan; gelir yavaşlarsa maliyet aynı hızda kısılamaz',
      'Rakiplerin toparlanması veya YouTube\'un izlenme payını artırması, reklam tarafındaki büyümeyi baskılayabilir',
    ],
    verdict: 'Nakit üretimi bu değerlemenin en sağlam dayanağı: FCF marjı akran grubunun belirgin üstünde ve içerik yatırımı artık kendini finanse ediyor. Değerleme büyümenin devamını fiyatlıyor, ancak bu büyümenin kaynağı abone sayısından fiyat ve reklama kaydığı için daha kırılgan — abone kaybı olmadan fiyat artırma kapasitesinin sınırı, tezin izlenmesi gereken asıl değişkeni.',
  },

  AMD: {
    asOf: 'FY2025 yıllık rapor verilerine dayalı, yaklaşık',
    segments: [
      { name: 'Veri Merkezi (EPYC sunucu CPU + Instinct AI hızlandırıcı)', sharePct: 52, note: 'Büyümenin ana kaynağı; AI hızlandırıcı tarafı NVIDIA\'ya karşı ikinci kaynak konumunda' },
      { name: 'İstemci (Ryzen masaüstü/dizüstü)', sharePct: 28, note: 'PC döngüsüne bağlı; pazar payı Intel aleyhine artıyor' },
      { name: 'Oyun (konsol yarı özel) + Gömülü (Xilinx)', sharePct: 20, note: 'Konsol döngüsü olgun; gömülü tarafı endüstriyel talebe duyarlı' },
    ],
    competitors: ['NVIDIA', 'Intel', 'Broadcom', 'Marvell Technology', 'Qualcomm'],
    moat: [
      { title: 'x86 lisansı + çiplet mimarisi', desc: 'x86 sunucu pazarında fiilen iki oyuncudan biri olma konumu düzenleyici ve lisans engelleriyle korunuyor; çiplet tasarımı ise aynı üretim düğümünden rakibinden daha iyi verim almasını sağlıyor.' },
      { title: 'İkinci kaynak konumu', desc: 'Hiper-ölçekli müşteriler tek tedarikçiye bağımlılıktan kaçınmak istedikçe, AMD teknik olarak birinci olmasa bile yapısal bir talep payı elde ediyor.' },
    ],
    strengths: [
      'Veri merkezi gelirinde çok hızlı büyüme; 3 yıllık ortalamanın kat kat üstünde bir tempo',
      'Net nakit bilanço — yatırım ve satın almaları borçlanmadan finanse edebiliyor',
      'Sunucu CPU tarafında Intel karşısında pazar payı kazanımı sürüyor ve bu taraf AI\'dan bağımsız bir büyüme kolu',
    ],
    risks: [
      'AI hızlandırıcıda yazılım ekosistemi (ROCm) CUDA\'nın gerisinde; müşteri geçiş maliyeti AMD aleyhine çalışıyor',
      'Net marj sektör liderinin çok altında — büyüme yüksek olsa da fiyatlama gücü sınırlı, değerleme bu marjı savunmakta zorlanabilir',
      'İleri çarpan yüksek; büyümede bir yavaşlama, marjı düşük bir yapıda çarpan daralmasını sert yaşatır',
    ],
    verdict: 'Büyüme hikâyesi gerçek ve veri merkezi tarafı iki koldan (CPU payı + AI hızlandırıcı) besleniyor; net nakit bilanço da riski sınırlıyor. Ancak değerleme, sektör lideriyle kıyaslandığında düşük bir net marj üzerine kurulu yüksek bir çarpan içeriyor: tezin gerçekleşmesi hacim büyümesinin marja dönüşmesine bağlı, bu da yazılım ekosistemindeki açığın kapanmasını gerektiriyor.',
  },

  INTC: {
    asOf: 'FY2025 yıllık rapor verilerine dayalı, yaklaşık',
    segments: [
      { name: 'İstemci Bilgisayarlama (PC işlemcileri)', sharePct: 51, note: 'Hâlâ en büyük kol ama pazar payı AMD ve ARM tabanlı çiplere karşı eriyor' },
      { name: 'Veri Merkezi ve AI', sharePct: 32, note: 'Sunucu CPU\'da pay kaybı sürüyor; AI hızlandırıcıda anlamlı konum yok' },
      { name: 'Foundry (dış müşterilere üretim)', sharePct: 12, note: 'Stratejik dönüşümün merkezi; henüz zarar üretiyor' },
      { name: 'Diğer (ağ, uç birim)', sharePct: 5, note: 'Küçülen portföy' },
    ],
    competitors: ['AMD', 'NVIDIA', 'TSMC', 'Samsung Foundry', 'Qualcomm / ARM tabanlı üreticiler'],
    moat: [
      { title: 'x86 kurulu tabanı', desc: 'Onlarca yıllık yazılım uyumluluğu ve kurumsal doğrulama süreçleri, özellikle sunucu tarafında geçişi yavaşlatıyor — bu bir büyüme motoru değil ama erimeyi geciktiren bir tampon.' },
      { title: 'Ölçekli üretim varlıkları ve devlet desteği', desc: 'ABD ve Avrupa\'da kendi fabrikalarına sahip olması, tedarik güvenliği kaygısıyla gelen kamu teşviklerine ve savunma/kamu siparişlerine erişim sağlıyor.' },
    ],
    strengths: [
      'Gelir 3 yıllık negatif trendden dönmüş görünüyor — dip seviyeden toparlanma işareti',
      'Kendi üretim varlıklarına sahip olması, tedarik zinciri güvenliği isteyen kamu ve savunma müşterileri için yapısal bir avantaj',
      'Foundry stratejisi başarılı olursa TSMC dışında ölçekli bir alternatif olarak konumlanabilir',
    ],
    risks: [
      'Net marj NEGATİF — şirket zarar ediyor ve toparlanma henüz kârlılığa yansımadı',
      'Foundry dönüşümü çok yüksek sermaye gerektiriyor ve geri dönüşü yıllara yayılı; bu süre boyunca nakit yakımı sürüyor',
      'İleri çarpan çok yüksek, çünkü normalleşmiş kâr varsayımı üzerine kurulu — bu varsayım gerçekleşmezse değerlemenin dayanağı kalmıyor',
    ],
    verdict: 'Bu bir değerleme değil, dönüşüm hikâyesi: şirket şu an zarar ediyor ve ileri çarpan bugünkü kârdan değil, gelecekte normalleşeceği varsayılan bir kârdan hesaplanıyor. Foundry stratejisi tutarsa yeniden değerleme büyük olabilir; tutmazsa hem sermaye yakımı hem pazar payı kaybı birlikte sürer. Risk profili bu listedeki diğer kayıtlarla aynı kategoride değil.',
  },

  CSCO: {
    asOf: 'FY2025 yıllık rapor verilerine dayalı, yaklaşık',
    segments: [
      { name: 'Ağ altyapısı (anahtar, yönlendirici, kablosuz)', sharePct: 58, note: 'Çekirdek iş; veri merkezi yenilemesiyle talep canlandı' },
      { name: 'Güvenlik (Splunk dahil)', sharePct: 20, note: 'Stratejik büyüme kolu; Splunk ile gözlemlenebilirlik eklendi' },
      { name: 'İşbirliği + gözlemlenebilirlik + hizmetler', sharePct: 22, note: 'Abonelik payı artıyor, gelir yapısını yumuşatıyor' },
    ],
    competitors: ['Arista Networks', 'Juniper Networks', 'Hewlett Packard Enterprise', 'Huawei', 'Palo Alto Networks (güvenlikte)'],
    moat: [
      { title: 'Kurumsal ağ yerleşikliği ve sertifikasyon ekosistemi', desc: 'Ağ mühendisleri Cisco sertifikaları üzerinden yetişiyor ve kurumun ağ mimarisi bu ürünlere göre tasarlanıyor; marka değiştirmek personelin yeniden eğitilmesini de gerektiriyor.' },
      { title: 'Abonelik ve destek geliri', desc: 'Kurulu cihaz tabanı üzerinden yazılım aboneliği ve destek sözleşmeleri tekrarlayan gelir üretiyor; donanım siparişleri dalgalansa da bu taban nakit akışını taşıyor.' },
    ],
    strengths: [
      'Abonelik gelirinin payı artıyor ve donanım döngüsüne bağımlılığı azaltıyor',
      'AI veri merkezi kurulumları ağ ekipmanı talebini doğrudan besliyor',
      'Güvenlik tarafı Splunk ile büyüdü; ağ ve güvenliği birlikte satabilme avantajı',
    ],
    risks: [
      'Ağ tarafında Arista gibi odaklanmış rakipler yüksek performanslı veri merkezi segmentinde pay alıyor',
      'Splunk satın alması kaldıracı artırdı; entegrasyonun beklenen çapraz satışı üretmesi gerekiyor',
      '3 yıllık büyüme çok zayıf — son yılın canlanması döngüsel mi yapısal mı henüz belirsiz',
    ],
    verdict: 'Kurumsal yerleşiklik ve büyüyen abonelik payı, olgun bir iş için sağlam bir taban oluşturuyor; ileri çarpan da makul seviyede. Asıl soru son yılki canlanmanın kalıcılığı: 3 yıllık büyüme neredeyse yatay olduğu için mevcut ivme veri merkezi yenileme döngüsünün geçici bir dalgası olabilir. Tez, abonelik payının artmaya devam etmesine bağlı.',
  },

  QCOM: {
    asOf: 'FY2025 yıllık rapor verilerine dayalı, yaklaşık',
    segments: [
      { name: 'QCT — El cihazları (akıllı telefon çipleri)', sharePct: 63, note: 'Gelirin ana gövdesi; müşteri yoğunlaşması yüksek' },
      { name: 'QCT — Otomotiv', sharePct: 12, note: 'En hızlı büyüyen kol; dijital kokpit ve ADAS' },
      { name: 'QCT — Nesnelerin İnterneti', sharePct: 12, note: 'Endüstriyel ve tüketici uç birimleri' },
      { name: 'QTL — Lisanslama', sharePct: 13, note: 'Küçük ama çok yüksek marjlı; patent portföyünden gelen telif' },
    ],
    competitors: ['MediaTek', 'Apple (kendi modemi)', 'Samsung (Exynos)', 'NVIDIA (otomotivde)', 'Broadcom'],
    moat: [
      { title: 'Temel patent portföyü', desc: 'Hücresel bağlantı standartlarındaki temel patentler, çipi kimden alırsa alsın üreticiden telif alınmasını sağlıyor; bu gelir donanım rekabetinden bağımsız.' },
      { title: 'Sistem entegrasyonu derinliği', desc: 'Modem, işlemci ve güç yönetimini tek pakette optimize etme yeteneği; telefon üreticisi için doğrulama süresini kısaltıyor ve alternatife geçişi maliyetli kılıyor.' },
    ],
    strengths: [
      'Lisans geliri donanım döngüsünden bağımsız, çok yüksek marjlı bir taban sağlıyor',
      'Otomotiv kolu hızlı büyüyor ve telefon bağımlılığını azaltma stratejisinin somut ayağı',
      'Nakde dönüşüm güçlü ve bilanço rahat',
    ],
    risks: [
      'Gelir son 12 ayda daralmış — telefon pazarındaki durgunluk doğrudan yansıyor',
      'En büyük müşterisinin kendi modemine geçiş süreci gelirde yapısal bir boşluk yaratma riski taşıyor',
      'Lisanslama modeli düzenleyici ve hukuki itirazlara açık; telif oranlarındaki bir gerileme en kârlı kolu doğrudan vurur',
    ],
    verdict: 'Lisans geliri ve otomotiv çeşitlendirmesi gerçek güçler, değerleme de mütevazı. Ancak tezin merkezinde tek bir soru var: en büyük müşterinin kendi çipine geçişi ne kadar hızlı ve tam olacak. Bu geçiş öngörülenden hızlı ilerlerse otomotiv büyümesi boşluğu kapatmaya yetmez; yavaş ilerlerse mevcut çarpan ucuz kalır.',
  },

  TXN: {
    asOf: 'FY2025 yıllık rapor verilerine dayalı, yaklaşık',
    segments: [
      { name: 'Analog', sharePct: 76, note: 'Güç yönetimi ve sinyal zinciri; binlerce ürün, uzun yaşam döngüsü' },
      { name: 'Gömülü İşlemci', sharePct: 17, note: 'Mikrodenetleyiciler; otomotiv ve endüstriyel ağırlıklı' },
      { name: 'Diğer', sharePct: 7, note: 'Hesap makineleri, DLP ve kalan ürün grupları' },
    ],
    competitors: ['Analog Devices', 'Infineon Technologies', 'STMicroelectronics', 'NXP Semiconductors', 'Microchip Technology'],
    moat: [
      { title: 'Kendi üretim tesisleri (300mm analog)', desc: 'Analog üretimini kendi 300mm fabrikalarında yapması, rakiplerin dış döküm maliyetine göre kalıcı bir birim maliyet avantajı sağlıyor; bu avantaj döngünün dip fazında marjı korumada belirleyici.' },
      { title: 'Ürün genişliği ve tasarım yapışkanlığı', desc: 'Bir analog parça müşterinin devre tasarımına girdiğinde ürünün ömrü boyunca orada kalıyor; on yıllara yayılan bu tasarım kazanımları, geniş katalogla birleşince istikrarlı ve tahmin edilebilir bir talep tabanı oluşturuyor.' },
    ],
    strengths: [
      'Analog işin uzun ürün ömrü ve dağınık müşteri tabanı, gelir tabanını tek bir uygulamaya bağımlı olmaktan koruyor',
      'Kendi fabrikaları sayesinde maliyet yapısı rakiplerden avantajlı; döngü dibinde marj daha az eriyor',
      '3 yıllık büyüme negatifken son yılın güçlü toparlanması, endüstriyel/otomotiv talebinin döngü dibinden döndüğüne işaret ediyor',
    ],
    risks: [
      'Kapasite genişletme yatırımları ağır ve peşin; talep beklenenden yavaş toparlanırsa atıl kapasite marjı doğrudan vurur',
      'Otomotiv ve endüstriyel talep makroya duyarlı — bu iki segment gelirin ana gövdesi',
      'İleri çarpan, henüz tam toparlanmamış bir kâr seviyesi üzerinden yüksek görünüyor; toparlanma yavaşlarsa çarpan savunmasız',
    ],
    verdict: 'Kendi üretimi ve geniş analog kataloğu, döngüsel bir sektörde yapısal olarak dayanıklı bir iş modeli oluşturuyor; 3 yıllık negatif büyümeden güçlü bir toparlanmaya geçiş de bunu destekliyor. Ancak değerleme, toparlanmanın kesintisiz süreceğini varsayıyor: kapasite yatırımları peşin yapıldığı için talep beklentinin altında kalırsa marj ve çarpan aynı anda baskılanır.',
  },

  IBM: {
    asOf: 'FY2025 yıllık rapor verilerine dayalı, yaklaşık',
    segments: [
      { name: 'Yazılım (hibrit bulut, Red Hat, otomasyon, veri)', sharePct: 45, note: 'Marjı en yüksek kol; dönüşümün merkezi' },
      { name: 'Danışmanlık', sharePct: 33, note: 'İnsan yoğun, marjı düşük ama yazılım satışını çeken kanal' },
      { name: 'Altyapı (mainframe, sunucu)', sharePct: 20, note: 'Döngüsel; yeni mainframe kuşağıyla dalgalanıyor' },
      { name: 'Finansman + diğer', sharePct: 2, note: 'Kalıntı' },
    ],
    competitors: ['Accenture (danışmanlıkta)', 'Microsoft', 'Amazon (AWS)', 'Oracle', 'VMware/Broadcom'],
    moat: [
      { title: 'Mainframe yerleşikliği', desc: 'Bankaların ve sigortacıların çekirdek işlem sistemleri onlarca yıldır mainframe üzerinde çalışıyor; taşımanın riski ve maliyeti o kadar yüksek ki müşteri pratikte kilitli ve yenileme döngülerini takip etmek zorunda.' },
      { title: 'Danışmanlık + yazılım birlikteliği', desc: 'Kurumun dönüşüm projesini yürüten ekibin aynı zamanda yazılımı satması, rakiplerin ulaşamadığı bir içeriden konum sağlıyor.' },
    ],
    strengths: [
      'Red Hat ve hibrit bulut yazılımı, gelir yapısını daha yüksek marjlı ve tekrarlayan bir tabana kaydırıyor',
      'Mainframe yerleşikliği düzenlenmiş sektörlerde kalıcı ve öngörülebilir bir gelir sağlıyor',
      'Temettü geçmişi ve nakit üretimi istikrarlı',
    ],
    risks: [
      'Gelir büyümesi neredeyse yatay — dönüşüm marjı iyileştiriyor ama üst satırı hareketlendiremiyor',
      'Net Borç/EBITDA yüksek seviyede; satın alma kapasitesini ve esnekliği sınırlıyor',
      'Danışmanlık tarafı kurumsal BT bütçelerine duyarlı ve marjı yapısal olarak düşük',
    ],
    verdict: 'Mainframe yerleşikliği ve Red Hat ekseninde yazılıma kayış, marj yapısını gerçekten iyileştirdi; temettü ve nakit üretimi istikrarlı. Ancak değerlemenin dayanağı büyüme değil istikrar: üst satır neredeyse yatay ve kaldıraç yüksek. Analist potansiyelinin düşüklüğü de bunu doğruluyor — hisse bir büyüme hikâyesi değil, gelir/temettü hikâyesi olarak okunmalı.',
  },

  INTU: {
    asOf: 'FY2025 yıllık rapor verilerine dayalı, yaklaşık',
    segments: [
      { name: 'Küçük İşletme & Serbest Meslek (QuickBooks, Mailchimp)', sharePct: 57, note: 'En büyük ve en yapışkan kol; abonelik + ödeme/finansman çapraz satışı' },
      { name: 'Tüketici (TurboTax)', sharePct: 33, note: 'Mevsimsel, vergi dönemine yoğunlaşmış; ABD pazarında lider' },
      { name: 'Kredi Karnesi + ProTax', sharePct: 10, note: 'Kredi ürünleri ve profesyonel muhasebeci kanalı' },
    ],
    competitors: ['H&R Block', 'Xero', 'Sage Group', 'FreshBooks', 'Block (Square)'],
    moat: [
      { title: 'Muhasebe verisi kilitlenmesi', desc: 'İşletmenin geçmiş defterleri, bordro ve vergi kayıtları platformda birikiyor; yıl ortasında taşınmak sadece yazılım değiştirmek değil, mali sürekliliği riske atmak anlamına geliyor.' },
      { title: 'Muhasebeci kanalı', desc: 'Bağımsız mali müşavirler müşterilerini kullandıkları platforma yönlendiriyor; bu dolaylı satış gücü rakiplerin doğrudan pazarlamayla aşmakta zorlandığı bir dağıtım avantajı.' },
    ],
    strengths: [
      'Abonelik ağırlıklı gelir yapısı öngörülebilir ve yüksek marjlı',
      'Küçük işletme tarafında ödeme ve finansman ürünleriyle aynı müşteriden gelir derinleştirme alanı geniş',
      'İleri çarpan grubun en düşükleri arasında; beklenti çıtası diğer yazılım şirketlerine göre daha ulaşılabilir',
    ],
    risks: [
      'Büyüme 3 yıllık ortalamanın altına inmiş durumda — yavaşlama işareti ve yazılım şirketlerinde bu genellikle çarpan daralmasıyla cezalandırılır',
      'TurboTax tarafı düzenleyici baskı altında; ABD\'de ücretsiz/kamusal vergi beyanı girişimleri bu segmentin doğrudan rakibi',
      'AI destekli muhasebe araçlarının yaygınlaşması, temel defter tutma işini metalaştırıp fiyatlama gücünü aşındırabilir',
    ],
    verdict: 'İş modeli kalitesi (abonelik, veri kilitlenmesi, muhasebeci kanalı) yüksek ve ileri çarpan akran grubuna göre düşük — bu ikisi birlikte değerlemeyi savunulabilir kılıyor. Ancak büyümenin kendi 3 yıllık ortalamasının altına inmesi tezdeki asıl uyarı işareti: düşük çarpan bir iskonto değil, yavaşlamanın fiyatlanması olabilir.',
  },

  AMAT: {
    asOf: 'FY2025 yıllık rapor verilerine dayalı, yaklaşık',
    segments: [
      { name: 'Yarı İletken Sistemleri (üretim ekipmanı)', sharePct: 73, note: 'Çekirdek iş; ileri düğüm ve gelişmiş paketleme yatırımlarına bağlı' },
      { name: 'Uygulanmış Küresel Hizmetler', sharePct: 23, note: 'Kurulu ekipman tabanına bakım/parça; döngüyü yumuşatan tekrarlayan gelir' },
      { name: 'Ekran ve bitişik pazarlar', sharePct: 4, note: 'Panel yatırım döngüsüne bağlı, küçük ve dalgalı' },
    ],
    competitors: ['ASML', 'Lam Research', 'KLA Corporation', 'Tokyo Electron'],
    moat: [
      { title: 'Süreç bilgisi ve entegrasyon derinliği', desc: 'Ekipman müşterinin üretim reçetesine yıllar içinde gömülüyor; çalışan bir süreçte ekipman değiştirmek verim kaybı riski taşıdığı için müşteri pratikte bağlı kalıyor.' },
      { title: 'Kurulu taban üzerinden hizmet geliri', desc: 'Sahadaki her ekipman on yıllar boyunca bakım, parça ve yükseltme geliri üretiyor; bu, yeni sipariş döngüsü zayıfladığında nakit akışını taşıyan bir tampon.' },
    ],
    strengths: [
      'Hizmet segmenti gelirin dörtte birine yakın ve döngüsel dalgalanmayı belirgin biçimde yumuşatıyor',
      'Gelir 3 yıllık ortalamanın çok üstünde büyüyor — AI kaynaklı kapasite yatırımından doğrudan fayda',
      'Net nakit bilanço; yatırım döngüsünün dip fazında da Ar-Ge harcamasını sürdürebilecek güçte',
    ],
    risks: [
      'Talep, müşterilerin sermaye harcama kararlarına bağlı ve bu kararlar çok az sayıda büyük üreticide toplanmış durumda',
      'Çin\'e ihracat kısıtlamaları gelirin anlamlı bir dilimini idari kararla etkileyebiliyor',
      'İleri çarpan yüksek ve bu, döngünün tepe noktasına yakın bir kâr üzerinden hesaplanıyor olabilir — ekipman şirketlerinde klasik değerleme tuzağı',
    ],
    verdict: 'AI kaynaklı kapasite yatırımından en doğrudan faydalanan halkalardan biri ve hizmet geliri döngüselliği gerçekten azaltıyor. Değerlemedeki asıl soru zamanlama: yüksek ileri çarpan, döngünün tepesine yakın bir kâr seviyesi üzerine biniyorsa hem kâr hem çarpan aynı anda daralabilir. Tez, yatırım döngüsünün çok yıllı sürmesi varsayımına bağlı.',
  },

  JPM: {
    asOf: 'FY2025 yıllık rapor verilerine dayalı, yaklaşık',
    segments: [
      { name: 'Tüketici & Toplum Bankacılığı', sharePct: 38, note: 'Mevduat tabanı ve kart işi; net faiz gelirinin ana kaynağı' },
      { name: 'Kurumsal & Yatırım Bankacılığı', sharePct: 33, note: 'Danışmanlık, ihraç ve piyasa yapıcılığı; döngüsel ama yüksek getirili' },
      { name: 'Varlık & Servet Yönetimi', sharePct: 14, note: 'Ücret bazlı, tekrarlayan; sermaye ihtiyacı düşük' },
      { name: 'Ticari Bankacılık + Kurumsal', sharePct: 15, note: 'Orta ölçekli kurumsal krediler ve hazine faaliyeti' },
    ],
    competitors: ['Bank of America', 'Citigroup', 'Wells Fargo', 'Goldman Sachs', 'Morgan Stanley'],
    moat: [
      { title: 'Mevduat tabanı ve ölçek', desc: 'Düşük maliyetli ve yapışkan mevduat, kredi fiyatlamasında kalıcı bir avantaj sağlıyor; bu tabanı yeniden kurmak yeni bir oyuncu için pratikte imkânsız.' },
      { title: 'Çeşitlendirilmiş gelir ve teknoloji bütçesi', desc: 'Perakendeden yatırım bankacılığına yayılan gelir yapısı, bir kolun zayıfladığı dönemde diğerinin taşımasını sağlıyor; ayrıca sektörün en büyük teknoloji bütçelerinden biri küçük rakiplerin kapatamayacağı bir yatırım farkı yaratıyor.' },
    ],
    strengths: [
      'Sektörün en güçlü sermaye pozisyonlarından biri; stres dönemlerinde rakipleri satın alabilecek konumda',
      'Gelir 3 yıllık ortalamanın belirgin üstünde büyüdü ve bu büyüme tek bir kola bağlı değil',
      'Varlık/servet yönetiminin ücret bazlı geliri, faiz döngüsünden bağımsız bir denge unsuru',
    ],
    risks: [
      'Analist hedef ortalamasına göre yukarı potansiyel bu grubun en düşüğü — hisse iyi haberi büyük ölçüde fiyatlamış görünüyor',
      'Faiz indirim döngüsü net faiz gelirini doğrudan daraltır; mevduat maliyeti kredi getirisinden daha yavaş düşer',
      'Kredi kalitesi bir yavaşlamada gecikmeli bozulur; karşılık artışı kârı beklenenden sert vurabilir',
    ],
    verdict: 'Bilanço gücü, gelir çeşitliliği ve ölçek avantajı defter değeri üzerindeki primi gerekçelendiriyor; iş kalitesi tartışmasız. Değerleme tarafındaki sorun kalite değil fiyat: analist potansiyeli grubun en düşüğü ve gelir, 3 yıllık ortalamanın çok üstünde bir dönemin katkısını taşıyor. Faiz indirim döngüsü net faiz gelirini daralttığında bu tabanın normalleşmesi beklenmeli.',
  },

  BAC: {
    asOf: 'FY2025 yıllık rapor verilerine dayalı, yaklaşık',
    segments: [
      { name: 'Tüketici Bankacılığı', sharePct: 40, note: 'Geniş mevduat tabanı; net faiz gelirinin ana kaynağı' },
      { name: 'Global Piyasalar', sharePct: 23, note: 'Alım satım ve piyasa yapıcılığı; oynaklığa duyarlı' },
      { name: 'Global Bankacılık (kurumsal kredi + yatırım bankacılığı)', sharePct: 22, note: 'Kurumsal ilişkiler ve ihraç gelirleri' },
      { name: 'Global Servet ve Yatırım Yönetimi', sharePct: 15, note: 'Merrill kanalı; ücret bazlı ve istikrarlı' },
    ],
    competitors: ['JPMorgan Chase', 'Wells Fargo', 'Citigroup', 'Morgan Stanley', 'Goldman Sachs'],
    moat: [
      { title: 'Düşük maliyetli mevduat tabanı', desc: 'Perakende mevduat hem büyük hem yapışkan; bu, kredi fiyatlamasında kalıcı bir maliyet avantajı sağlıyor ve yeni bir oyuncunun kuramayacağı bir taban.' },
      { title: 'Şube ağı ve dijital ölçek', desc: 'Fiziksel ağ ile dijital platformun birlikte işletilmesi müşteri edinme maliyetini düşürüyor; bu ölçeği kurmanın maliyeti küçük rakipler için engelleyici.' },
    ],
    strengths: [
      'Mevduat tabanı sektörün en büyükleri arasında ve fonlama maliyetini düşük tutuyor',
      'Servet yönetimi kolu ücret bazlı ve faiz döngüsünden kısmen bağımsız',
      'İleri çarpan düşük; defter değerine göre değerleme mütevazı',
    ],
    risks: [
      'Faiz indirim döngüsü net faiz gelirini doğrudan daraltır — mevduat maliyeti kredi getirisinden daha yavaş düşer',
      'Uzun vadeli menkul kıymet portföyündeki değerleme kayıpları özkaynağı baskılamaya devam ediyor',
      'Analist potansiyeli düşük; piyasa mevcut kârlılığı büyük ölçüde fiyatlamış görünüyor',
    ],
    verdict: 'Mevduat tabanı ve ölçek gerçek bir maliyet avantajı sağlıyor, değerleme de mütevazı. Ancak yakın vadede belirleyici olan faiz patikası: net faiz geliri döngünün en hassas kalemi ve indirim ortamında daralması bekleniyor. Tez, servet yönetimi gibi ücret bazlı kolların bu daralmayı ne ölçüde telafi edebileceğine bağlı.',
  },

  GS: {
    asOf: 'FY2025 yıllık rapor verilerine dayalı, yaklaşık',
    segments: [
      { name: 'Global Bankacılık & Piyasalar (yatırım bankacılığı, FICC, hisse)', sharePct: 66, note: 'Gelirin ana kaynağı; işlem hacmi ve piyasa oynaklığına duyarlı' },
      { name: 'Varlık & Servet Yönetimi', sharePct: 30, note: 'Ücret bazlı, tekrarlayan gelir; stratejik olarak büyütülmek istenen kol' },
      { name: 'Platform Çözümleri', sharePct: 4, note: 'Tüketici tarafındaki geri çekilme sonrası küçültülmüş kalıntı iş' },
    ],
    competitors: ['Morgan Stanley', 'JPMorgan Chase', 'Bank of America', 'Citigroup', 'Evercore / Lazard (danışmanlıkta)'],
    moat: [
      { title: 'Danışmanlık markası ve ilişki ağı', desc: 'Büyük birleşme ve halka arzlarda mandanın kime verileceği onlarca yıllık kurumsal ilişkilere ve isim itibarına bağlı; bu, fiyatla satın alınamayan ve yeni girenin kuramayacağı bir konum.' },
      { title: 'Risk alma ve dağıtım altyapısı', desc: 'Büyük blok işlemleri kendi bilançosuyla üstlenip dağıtabilme kapasitesi, sermaye ve altyapı gerektiriyor; küçük rakipler bu ölçekteki işlemlerde masaya oturamıyor.' },
    ],
    strengths: [
      'Gelir 3 yıllık ortalamanın çok üstünde büyüdü — sermaye piyasası faaliyetlerindeki canlanmadan orantısız fayda sağladı',
      'Varlık ve servet yönetiminin payı artıyor; bu, gelir tabanını işlem döngüsünden kısmen bağımsızlaştırıyor',
      'İleri çarpan grubun en düşükleri arasında; beklenti çıtası düşük',
    ],
    risks: [
      'Gelir yapısı doğası gereği döngüsel; sermaye piyasası aktivitesi yavaşladığında gelir hızla geri çekilir ve maliyet yapısı aynı hızda küçülmez',
      'Analist hedef ortalamasına göre yukarı potansiyel grubun en düşüğü — piyasa iyi haberi büyük ölçüde fiyatlamış görünüyor',
      'Sermaye yeterliliği düzenlemelerindeki sıkılaşma, hisse geri alımı ve özkaynak kârlılığı üzerinde doğrudan baskı yaratır',
    ],
    verdict: 'Düşük ileri çarpan ilk bakışta cazip görünüyor, ancak bu bir iskontodan çok döngüsel bir iş modelinin doğal fiyatlaması: gelirin 3 yıllık ortalamanın çok üstüne çıktığı bir dönemin kârı üzerinden hesaplanan ucuzluk yanıltıcı olabilir. Analist potansiyelinin grubun en düşüğü olması da bu okumayı destekliyor; tezin dayanağı ucuzluk değil, varlık/servet yönetiminin payını kalıcı olarak artırabilmesi olmalı.',
  },

  MS: {
    asOf: 'FY2025 yıllık rapor verilerine dayalı, yaklaşık',
    segments: [
      { name: 'Servet Yönetimi', sharePct: 46, note: 'Stratejinin merkezi; ücret bazlı, tekrarlayan ve sermaye ihtiyacı düşük' },
      { name: 'Kurumsal Menkul Kıymetler (yatırım bankacılığı + alım satım)', sharePct: 44, note: 'Döngüsel ama yüksek getirili' },
      { name: 'Yatırım Yönetimi', sharePct: 10, note: 'Kurumsal varlık yönetimi' },
    ],
    competitors: ['Goldman Sachs', 'JPMorgan Chase', 'Bank of America (Merrill)', 'UBS', 'Charles Schwab'],
    moat: [
      { title: 'Servet yönetimi ölçeği ve danışman ağı', desc: 'Büyük danışman kadrosu ve yönetilen varlık tabanı, müşteri ilişkisi kişisel olduğu için çok yapışkan; rakibin bu tabanı devralması danışmanları transfer etmeyi gerektiriyor.' },
      { title: 'Kurumsal marka ve ihraç konumu', desc: 'Halka arz ve birleşme mandalarında isim itibarı belirleyici; bu konum fiyatla değil onlarca yıllık ilişki ve referansla kazanılıyor.' },
    ],
    strengths: [
      'Servet yönetiminin gelirin yaklaşık yarısını oluşturması, gelir tabanını piyasa döngüsünden belirgin biçimde bağımsızlaştırıyor',
      'Ücret bazlı gelirin payı yüksek olduğu için özkaynak kârlılığı daha istikrarlı',
      'Sermaye piyasası canlanmasından yatırım bankacılığı kolu doğrudan faydalandı',
    ],
    risks: [
      'Kurumsal menkul kıymetler kolu hâlâ gelirin yaklaşık yarısı ve doğası gereği döngüsel',
      'Yönetilen varlık geliri piyasa değerine bağlı; sert bir düzeltme ücret tabanını doğrudan küçültür',
      'Analist potansiyeli düşük — mevcut kârlılık büyük ölçüde fiyatlanmış görünüyor',
    ],
    verdict: 'Servet yönetimine yapılan stratejik kayış işe yaramış durumda: gelirin yaklaşık yarısı artık ücret bazlı ve bu, Goldman\'a kıyasla daha istikrarlı bir profil sağlıyor. Değerleme bu kaliteyi büyük ölçüde yansıtıyor; analist potansiyelinin düşüklüğü de bunu gösteriyor. Tez, servet yönetimi payının artmaya devam etmesine bağlı — o durumda çarpan yukarı doğru yeniden değerlenebilir.',
  },

  V: {
    asOf: 'FY2025 yıllık rapor verilerine dayalı, yaklaşık',
    segments: [
      { name: 'Hizmet geliri (işlem hacmine bağlı)', sharePct: 36, note: 'Ağ üzerinden geçen toplam ödeme hacmiyle doğrudan orantılı' },
      { name: 'Veri işleme (yetkilendirme, takas, mutabakat)', sharePct: 35, note: 'İşlem adedine bağlı, ölçek ekonomisi çok yüksek' },
      { name: 'Uluslararası işlem', sharePct: 24, note: 'Sınır ötesi hacim; marjı en yüksek kol, seyahat hacmine duyarlı' },
      { name: 'Diğer (katma değerli hizmetler)', sharePct: 5, note: 'Danışmanlık, dolandırıcılık önleme, tokenizasyon' },
    ],
    competitors: ['Mastercard', 'American Express', 'PayPal', 'Block (Square)', 'yerel ödeme şemaları (UPI, Pix)'],
    moat: [
      { title: 'İki taraflı ağ etkisi', desc: 'Kart sahibi kabul edildiği için kartı taşıyor, üye iş yeri kart sahibi olduğu için kabul ediyor; yeni bir ağın her iki tarafı aynı anda ikna etmesi gerektiğinden giriş engeli neredeyse aşılmaz.' },
      { title: 'Sabit maliyetli altyapı üzerinde ölçek', desc: 'Ağ bir kez kurulduktan sonra ek işlemin marjinal maliyeti ihmal edilebilir; hacim büyüdükçe marj genişliyor ve bu, küçük rakiplerin fiyatla rekabet etmesini imkânsız kılıyor.' },
    ],
    strengths: [
      'Net marj ve FCF marjı birlikte çok yüksek — kârın büyük kısmı gerçekten nakde dönüyor',
      'Nakit bazlı tüketimden karta geçiş eğilimi gelişmekte olan pazarlarda hâlâ sürüyor; yapısal bir büyüme kolu',
      'Kredi riski taşımıyor: ağ operatörü, kredi veren taraf değil — ekonomik yavaşlamada bankalardan daha korunaklı',
    ],
    risks: [
      'Değişim ücretleri (interchange) birçok ülkede düzenleyici baskı altında; ücret tavanları doğrudan gelire vurur',
      'Devlet destekli yerel ödeme şemaları (Hindistan\'da UPI, Brezilya\'da Pix) kart ağlarını atlayan hacmi büyütüyor',
      'Sınır ötesi işlem en kârlı kol ve seyahat hacmine duyarlı; küresel bir daralmada orantısız etkilenir',
    ],
    verdict: 'Ağ etkisi ve nakde dönüşüm kalitesi, bu şirketi değerlemenin en kolay savunulduğu iş modellerinden biri yapıyor; prim büyük ölçüde hak edilmiş. Asıl risk rekabet değil düzenleme ve devlet eliyle kurulan alternatif raylar — bunlar yavaş hareket eder ama moat\'ı doğrudan hedef alır, dolayısıyla tez uzun vadeli ve düzenleyici gündeme bağlıdır.',
  },

  MA: {
    asOf: 'FY2025 yıllık rapor verilerine dayalı, yaklaşık',
    segments: [
      { name: 'Ödeme ağı geliri (yerel + sınır ötesi hacim)', sharePct: 62, note: 'Çekirdek ağ işi; sınır ötesi kısmı marjı yukarı çekiyor' },
      { name: 'Katma değerli hizmetler (siber güvenlik, veri analitiği, danışmanlık)', sharePct: 38, note: 'Ağdan bağımsız büyüyen kol; Visa\'ya kıyasla daha yüksek pay' },
    ],
    competitors: ['Visa', 'American Express', 'PayPal', 'Block (Square)', 'yerel ödeme şemaları'],
    moat: [
      { title: 'İki taraflı ağ etkisi', desc: 'Visa ile aynı yapısal avantaj: kart sahibi ve üye iş yeri tarafını aynı anda kurmak gerektiği için yeni girişin önünde neredeyse aşılmaz bir engel var.' },
      { title: 'Katma değerli hizmet katmanı', desc: 'Dolandırıcılık önleme, veri analitiği ve danışmanlık ürünleri ağın üstüne bindirilmiş durumda; müşteri bu hizmetlere entegre oldukça ağdan ayrılma maliyeti işlem ücretinin ötesine geçiyor.' },
    ],
    strengths: [
      'Katma değerli hizmetlerin gelir içindeki payı yüksek — işlem hacmi döngüsünden kısmen bağımsız bir büyüme kolu',
      'Net marj ve nakde dönüşüm çok güçlü; sermaye ihtiyacı düşük bir iş modeli',
      'Sınır ötesi hacimde güçlü konum; bu kol ortalamanın üzerinde marj taşıyor',
    ],
    risks: [
      'Visa ile aynı düzenleyici cephe: değişim ücreti tavanları ve rekabet soruşturmaları',
      'Yerel ödeme şemalarının yaygınlaşması uzun vadede ağ dışı hacmi büyütüyor',
      'Katma değerli hizmetler tarafında rekabet ağ işine göre çok daha açık — burada moat belirgin biçimde zayıf',
    ],
    verdict: 'Ağ işi Visa ile aynı kaliteye sahip ve katma değerli hizmetlerin daha yüksek payı, hacim döngüsüne karşı ek bir tampon sağlıyor. Değerleme bu iki katmanın birlikte büyümesini varsayıyor; dikkat edilmesi gereken, ikinci katmanın rekabete çok daha açık olması — oradaki büyüme yavaşlarsa geriye saf ağ işi kalır ve çarpan buna göre yeniden fiyatlanır.',
  },

  AXP: {
    asOf: 'FY2025 yıllık rapor verilerine dayalı, yaklaşık',
    segments: [
      { name: 'İskonto geliri (üye iş yeri komisyonu)', sharePct: 55, note: 'Ana gelir; premium kart hacmine bağlı' },
      { name: 'Net kart ücretleri', sharePct: 18, note: 'Yıllık aidatlar; premium konumlandırmanın doğrudan çıktısı' },
      { name: 'Net faiz geliri', sharePct: 22, note: 'Kredi bakiyelerinden; Visa/Mastercard\'dan farklı olarak kredi riski taşıyor' },
      { name: 'Diğer', sharePct: 5, note: 'Ortaklık ve hizmet gelirleri' },
    ],
    competitors: ['Visa', 'Mastercard', 'JPMorgan Chase (Chase kartları)', 'Capital One', 'Discover'],
    moat: [
      { title: 'Kapalı devre ağ ve premium marka', desc: 'Hem kartı çıkaran hem ağı işleten taraf olması, harcama verisinin tamamına sahip olmasını ve üye iş yerinden daha yüksek komisyon alabilmesini sağlıyor; premium algı bu fiyatı savunulabilir kılıyor.' },
      { title: 'Yüksek harcamalı müşteri tabanı', desc: 'Kart sahibi profili ortalamanın üzerinde harcıyor ve kredi kalitesi daha iyi; üye iş yeri bu müşteriye ulaşmak için yüksek komisyonu kabul ediyor.' },
    ],
    strengths: [
      'Kart aidatı geliri, işlem hacminden bağımsız ve öngörülebilir bir taban sağlıyor',
      'Premium müşteri tabanı ekonomik yavaşlamalarda ortalama tüketiciden daha dayanıklı',
      'Kapalı devre model, harcama verisi üzerinden hedefli ortaklık gelirleri yaratmayı mümkün kılıyor',
    ],
    risks: [
      'Visa ve Mastercard\'dan farklı olarak KREDİ RİSKİ taşıyor; bir yavaşlamada karşılık giderleri kârı doğrudan vurur',
      'Premium segmentte rekabet yoğunlaştı; bankaların kendi premium kartları müşteri kazanım maliyetini yükseltiyor',
      'Üye iş yeri komisyonu ağ rakiplerinden yüksek olduğu için kabul yaygınlığında yapısal bir dezavantaj sürüyor',
    ],
    verdict: 'Kapalı devre model ve premium müşteri tabanı, saf ağ operatörlerinden farklı ve savunulabilir bir konum sağlıyor; aidat geliri de istikrarlı bir taban. Değerlemedeki temel ayrım kredi riski: Visa ve Mastercard\'ın taşımadığı bu riski taşıdığı için ekonomik döngüde daha kırılgan ve çarpanının onlardan düşük olması bu yüzden yapısaldır, iskonto değildir.',
  },

  UNH: {
    asOf: 'FY2025 yıllık rapor verilerine dayalı, yaklaşık',
    segments: [
      { name: 'UnitedHealthcare (sigorta)', sharePct: 54, note: 'Prim geliri; tıbbi maliyet oranı kârlılığın belirleyicisi' },
      { name: 'Optum Health (hizmet sunumu)', sharePct: 23, note: 'Doktor ağı ve bakım sunumu; dikey entegrasyonun kalbi' },
      { name: 'Optum Rx (eczane fayda yönetimi)', sharePct: 18, note: 'İlaç fiyatlama zincirinde aracı konum' },
      { name: 'Optum Insight (veri/analitik)', sharePct: 5, note: 'Sağlık verisi ve yazılım hizmetleri' },
    ],
    competitors: ['Elevance Health', 'CVS Health (Aetna)', 'Cigna', 'Humana', 'Centene'],
    moat: [
      { title: 'Dikey entegrasyon', desc: 'Hem sigortacı hem hizmet sunucusu hem eczane yöneticisi olması, maliyeti zincirin farklı halkalarında yönetebilmesini sağlıyor; tek halkada faaliyet gösteren rakipler bu esnekliğe sahip değil.' },
      { title: 'Ölçek ve veri', desc: 'Devasa üye tabanından gelen klinik ve maliyet verisi, risk fiyatlamasını rakiplerden daha isabetli yapmayı mümkün kılıyor — sigortacılıkta doğrudan kâr marjına dönüşen bir avantaj.' },
    ],
    strengths: [
      'Optum kolu sigortacılıktan bağımsız büyüyor ve gelir yapısını çeşitlendiriyor',
      'Dikey entegrasyon, tıbbi maliyet baskısını zincirin başka halkalarında telafi etme imkânı veriyor',
      'Yaşlanan nüfus ve kamu sağlık programları uzun vadeli yapısal talep sağlıyor',
    ],
    risks: [
      'Net marj tarihsel bandın belirgin altına inmiş ve gelir büyümesi durmuş — tıbbi maliyet oranındaki bozulma kârlılığı doğrudan eritiyor',
      'Kamu programlarının geri ödeme oranları politik kararlara bağlı; olumsuz bir ayarlama en büyük segmenti vurur',
      'Eczane fayda yönetimi ve dikey entegrasyon rekabet/düzenleme incelemesi altında; yapısal ayrıştırma baskısı sürüyor',
    ],
    verdict: 'Dikey entegrasyon ve ölçek uzun vadede gerçek avantajlar, ancak mevcut tablo bir kârlılık sıkışması gösteriyor: gelir yatay ve net marj tarihsel bandın altında. Değerleme, tıbbi maliyet oranının normalleşeceği varsayımına dayanıyor. Bu normalleşme gecikirse düzenleyici baskıyla birlikte çarpan üzerinde çift yönlü bir yük oluşur.',
  },

  JNJ: {
    asOf: 'FY2025 yıllık rapor verilerine dayalı, yaklaşık',
    segments: [
      { name: 'İnovatif İlaç (onkoloji, immünoloji, nöroloji)', sharePct: 65, note: 'Kârın ana kaynağı; patent takvimi belirleyici' },
      { name: 'Tıbbi Teknoloji (cerrahi, ortopedi, kardiyovasküler)', sharePct: 35, note: 'İstikrarlı, işlem hacmine bağlı; ilaçtan daha az patent riskli' },
    ],
    competitors: ['Pfizer', 'Merck & Co', 'AbbVie', 'Medtronic', 'Abbott Laboratories'],
    moat: [
      { title: 'Patent korumalı ilaç portföyü ve Ar-Ge ölçeği', desc: 'Geniş terapötik alan portföyü, tek bir ilacın patent kaybını diğerlerinin telafi edebilmesini sağlıyor; bu ölçekte bir boru hattını sürdürmek yalnızca birkaç şirketin gücü dahilinde.' },
      { title: 'Cerrahi ekipmanda hekim bağlılığı', desc: 'Cerrahlar belirli ekipman ve implant sistemleriyle eğitiliyor; hastane bu sistemlere ve yedek parça zincirine bağlandığı için değişim hem klinik risk hem maliyet doğuruyor.' },
    ],
    strengths: [
      'İki ayaklı yapı (ilaç + tıbbi teknoloji) tek bir patent kaybının bilançoyu sarsmasını engelliyor',
      'Nakit üretimi istikrarlı ve temettü geçmişi çok uzun',
      'Bilanço güçlü; Ar-Ge ve satın almaları rahatça finanse edebiliyor',
    ],
    risks: [
      'Anahtar immünoloji ilacında patent/biyobenzer rekabeti gelirde somut bir aşınma yaratıyor',
      'Talk davaları uzun süredir devam eden ve tutarı netleşmemiş bir yükümlülük kaynağı',
      'Analist potansiyeli bu listenin en düşükleri arasında — savunmacı profil büyük ölçüde fiyatlanmış',
    ],
    verdict: 'Çeşitlendirilmiş yapı ve istikrarlı nakit üretimi, savunmacı bir portföy bileşeni olarak kaliteyi tartışmasız kılıyor. Değerlemedeki sınırlayıcı unsur büyüme değil beklenti: analist potansiyeli çok düşük, yani piyasa istikrarı zaten ödüllendirmiş durumda. Patent takvimi ve dava yükümlülüğü, yukarı yönlü hareketin önündeki iki somut engel.',
  },

  LLY: {
    asOf: 'FY2025 yıllık rapor verilerine dayalı, yaklaşık',
    segments: [
      { name: 'Kardiyometabolik (obezite ve diyabet ilaçları)', sharePct: 58, note: 'Büyümenin ezici çoğunluğu buradan; talep arzın önünde' },
      { name: 'Onkoloji', sharePct: 18, note: 'İkinci büyük terapötik alan' },
      { name: 'İmmünoloji + nöroloji + diğer', sharePct: 24, note: 'Alzheimer tedavisi dahil; portföyü çeşitlendiriyor' },
    ],
    competitors: ['Novo Nordisk', 'Pfizer', 'Merck & Co', 'AbbVie', 'Amgen'],
    moat: [
      { title: 'Obezite/diyabet franchise\'ı ve üretim kapasitesi', desc: 'Etkinliği kanıtlanmış ilaç portföyüne ek olarak, peptit üretim kapasitesine yapılan devasa yatırım rakiplerin kısa vadede kapatamayacağı bir arz avantajı yaratıyor — bu pazarda kısıt talep değil kapasite.' },
      { title: 'Ar-Ge boru hattı derinliği', desc: 'Aynı terapötik alanda ardışık kuşak ilaçları geliştirebilmesi, mevcut ürünün patent ömrü dolmadan yerine geçecek adayı hazırlamasını sağlıyor.' },
    ],
    strengths: [
      'Gelir büyümesi bu listenin en yüksekleri arasında ve 3 yıllık bileşik büyüme de olağanüstü seviyede',
      'Obezite pazarı hâlâ erken evrede; penetrasyon arttıkça talep tabanı genişlemeye devam ediyor',
      'Üretim kapasitesi yatırımı arz kısıtını çözdükçe gelir dönüşümü hızlanıyor',
    ],
    risks: [
      'Gelirin çok büyük kısmı tek bir terapötik alanda yoğunlaşmış; bu alanda etkinlik/güvenlik kaynaklı olumsuz bir gelişme orantısız etki yaratır',
      'Novo Nordisk ile doğrudan rekabet ve yeni oral formülasyonlar fiyatlama gücünü aşındırabilir',
      'ABD\'de ilaç fiyatlaması politik baskı altında; kamu programlarında fiyat müzakeresi bu franchise\'ı doğrudan hedefliyor',
    ],
    verdict: 'Büyüme profili bu listede eşi olmayan bir seviyede ve üretim kapasitesi yatırımı arz kısıtını çözdükçe bunun sürmesi muhtemel. Değerleme yüksek ama büyümeyle desteklenmiş durumda. Asıl kırılganlık çeşitlilik eksikliği: gelirin ezici çoğunluğu tek bir terapötik alandan geldiği için fiyatlama baskısı ya da klinik bir sürpriz, çeşitlendirilmiş bir ilaç şirketine göre çok daha sert etki yaratır.',
  },

  MRK: {
    asOf: 'FY2025 yıllık rapor verilerine dayalı, yaklaşık',
    segments: [
      { name: 'Farmasötik — onkoloji (anahtar immünoterapi)', sharePct: 50, note: 'Gelirin yarısına yakını tek bir ilaçtan; patent takvimi kritik' },
      { name: 'Farmasötik — aşı ve diğer', sharePct: 33, note: 'HPV ve pnömokok aşıları; bölgesel talep dalgalı' },
      { name: 'Hayvan Sağlığı', sharePct: 12, note: 'İstikrarlı, döngüden bağımsız kol' },
      { name: 'Diğer', sharePct: 5, note: 'Kalıntı iş kolları' },
    ],
    competitors: ['Bristol Myers Squibb', 'AstraZeneca', 'Roche', 'Pfizer', 'Johnson & Johnson'],
    moat: [
      { title: 'Onkolojide klinik veri birikimi', desc: 'Anahtar immünoterapinin onlarca endikasyonda biriken klinik verisi, hekim tercihini ve tedavi kılavuzlarındaki konumunu belirliyor; rakibin bu veri tabanını oluşturması yıllar süren çalışmalar gerektiriyor.' },
      { title: 'Aşı üretim ve dağıtım altyapısı', desc: 'Küresel ölçekte aşı üretmek ve soğuk zincirle dağıtmak yüksek düzenleyici ve sermaye engeli taşıyor; bu altyapı yeni girenler için pratik bir bariyer.' },
    ],
    strengths: [
      'Onkoloji franchise\'ı tedavi kılavuzlarında yerleşik ve endikasyon genişlemesi sürüyor',
      'Hayvan sağlığı kolu istikrarlı ve ilaç döngüsünden bağımsız',
      'İleri çarpan düşük; beklenti çıtası mütevazı',
    ],
    risks: [
      'Gelirin yaklaşık yarısı tek bir ilaçta ve patent ömrünün sonuna yaklaşılıyor — bu, önümüzdeki dönemin en belirleyici riski',
      'Boru hattının patent kaybını telafi edecek ölçekte bir halef üretip üretemeyeceği henüz kanıtlanmadı',
      'Analist potansiyeli bu listenin en düşüğü; piyasa yaklaşan patent uçurumunu fiyatlamış görünüyor',
    ],
    verdict: 'Düşük ileri çarpan ilk bakışta cazip ama sebebi belli: gelirin yaklaşık yarısını üreten ilacın patent ömrü sona yaklaşıyor ve analist potansiyeli bu listenin en düşüğü. Değerleme bir iskonto değil, öngörülebilir bir gelir kaybının fiyatlanması. Tezin tamamı boru hattının bu boşluğu zamanında doldurup dolduramayacağına bağlı — bu kanıtlanana kadar ucuzluk görünürde kalır.',
  },

  ABBV: {
    asOf: 'FY2025 yıllık rapor verilerine dayalı, yaklaşık',
    segments: [
      { name: 'İmmünoloji (yeni kuşak ilaçlar)', sharePct: 47, note: 'Önceki anahtar ilacın patent kaybını telafi eden halef portföy' },
      { name: 'Onkoloji', sharePct: 14, note: 'Hematolojik kanserlerde güçlü konum' },
      { name: 'Estetik (Botox, dolgu)', sharePct: 15, note: 'Tüketici harcamasına duyarlı, döngüsel kol' },
      { name: 'Nörobilim + diğer', sharePct: 24, note: 'Migren ve psikiyatri; büyüyen alan' },
    ],
    competitors: ['Johnson & Johnson', 'Pfizer', 'Amgen', 'Eli Lilly', 'Bristol Myers Squibb'],
    moat: [
      { title: 'Halef ilaç geçişini yönetme yeteneği', desc: 'Patent kaybı yaklaşan bir ilacın yerine aynı terapötik alanda iki yeni ilaç konumlandırıp hekimleri ve ödeyicileri kademeli olarak geçirebilmesi, sektörde nadir görülen bir yürütme kapasitesi.' },
      { title: 'Estetikte marka gücü', desc: 'Botox tüketici tarafında jenerik adıyla anılan bir marka; hekim ve klinik tercihinde bu tanınırlık fiyat rekabetine karşı koruma sağlıyor.' },
    ],
    strengths: [
      'Yeni kuşak immünoloji ilaçları önceki patent uçurumunu başarıyla telafi etti — yürütme kanıtlanmış durumda',
      'Estetik ve nörobilim kolları ilaç portföyünden farklı talep dinamiklerine sahip, çeşitlendirme sağlıyor',
      'Temettü verimi ve nakit üretimi güçlü',
    ],
    risks: [
      'Kaldıraç sektör ortalamasının üzerinde; büyük satın almalardan kalan borç esnekliği sınırlıyor',
      'Estetik kolu tüketici harcamasına duyarlı ve ekonomik yavaşlamada ilk kısılan harcama kalemlerinden',
      'Yeni immünoloji ilaçlarında ödeyici baskısı ve iskonto talepleri fiyatlama gücünü aşındırabilir',
    ],
    verdict: 'Önceki patent uçurumunu halef portföyle telafi edebilmiş olması, yönetimin yürütme kapasitesine dair somut bir kanıt ve bu değerlemenin en güçlü dayanağı. Çeşitlendirilmiş yapı da riski dağıtıyor. Sınırlayıcı unsur bilanço: kaldıraç sektör ortalamasının üzerinde olduğu için yeni bir büyük satın alma ya da beklenmedik bir gelir kaybı, esnekliği hızla daraltır.',
  },

  PFE: {
    asOf: 'FY2025 yıllık rapor verilerine dayalı, yaklaşık',
    segments: [
      { name: 'Onkoloji', sharePct: 28, note: 'Seagen satın almasıyla büyütülen stratejik odak alanı' },
      { name: 'İç hastalıkları ve kardiyometabolik', sharePct: 26, note: 'Geniş ama olgun portföy' },
      { name: 'Aşılar', sharePct: 22, note: 'Pnömokok ve RSV; COVID sonrası talep normalleşti' },
      { name: 'İltihaplanma/immünoloji + hastane ürünleri', sharePct: 24, note: 'Çeşitlendirme kolları' },
    ],
    competitors: ['Merck & Co', 'Johnson & Johnson', 'AstraZeneca', 'Moderna', 'GSK'],
    moat: [
      { title: 'Ar-Ge ve küresel ticarileştirme ölçeği', desc: 'Bir ilacı onlarca ülkede eşzamanlı ruhsatlandırıp dağıtabilecek altyapıya sahip az sayıda şirketten biri; küçük biyotekler bu yüzden ortaklık için Pfizer\'a geliyor.' },
      { title: 'Aşı üretim kapasitesi', desc: 'Büyük ölçekli aşı üretimi ve soğuk zincir dağıtımı, düzenleyici onayı yıllar süren bir yetkinlik; kriz dönemlerinde bu kapasite doğrudan pazarlık gücüne dönüşüyor.' },
    ],
    strengths: [
      'İleri çarpan çok düşük ve temettü verimi yüksek — beklenti çıtası oldukça mütevazı',
      'Onkoloji portföyü Seagen ile derinleşti; uzun vadeli büyüme buradan bekleniyor',
      'Küresel ticarileştirme ağı, ortaklık ve lisanslama anlaşmalarında yapısal bir avantaj',
    ],
    risks: [
      '3 yıllık gelir bileşik büyümesi belirgin NEGATİF — COVID dönemi gelirlerinin normalleşmesi tabanı kalıcı olarak küçülttü',
      'Kaldıraç Seagen satın alması sonrası yükseldi; borç azaltma önceliği yatırım ve temettü esnekliğini sınırlıyor',
      'Yaklaşan patent kayıpları önümüzdeki dönemde ek gelir baskısı yaratacak',
    ],
    verdict: 'Düşük çarpan ve yüksek temettü verimi bir değer hikâyesi görüntüsü veriyor, ancak 3 yıllık negatif büyüme bunun bir toparlanma değil normalleşme sonrası taban arayışı olduğunu gösteriyor. Tez, onkoloji portföyünün patent kayıplarını aşacak ölçekte büyüyüp büyüyemeyeceğine bağlı; bu kanıtlanana kadar düşük çarpan ucuzluk değil, belirsizliğin fiyatı olarak okunmalı.',
  },

  PG: {
    asOf: 'FY2025 yıllık rapor verilerine dayalı, yaklaşık',
    segments: [
      { name: 'Kumaş ve Ev Bakımı', sharePct: 35, note: 'En büyük kol; Tide, Ariel gibi kategori lideri markalar' },
      { name: 'Bebek, Kadın ve Aile Bakımı', sharePct: 24, note: 'Demografiye bağlı; bazı pazarlarda doğum oranı baskısı' },
      { name: 'Güzellik', sharePct: 18, note: 'Marj yüksek; premium segment' },
      { name: 'Sağlık + Tıraş', sharePct: 23, note: 'Olgun kategoriler, istikrarlı nakit' },
    ],
    competitors: ['Unilever', 'Colgate-Palmolive', 'Kimberly-Clark', 'Henkel', 'perakendeci özel markaları'],
    moat: [
      { title: 'Marka gücü ve raf hakimiyeti', desc: 'Kategori lideri markalar perakendecide raf alanını ve promosyon önceliğini belirliyor; yeni bir markanın aynı görünürlüğü satın alması reklam bütçesiyle bile zor.' },
      { title: 'Ölçek ve dağıtım maliyeti', desc: 'Küresel üretim ve dağıtım ağı birim maliyeti düşürüyor; bu, girdi maliyeti arttığında fiyat artışını rakiplerden daha geç yapabilme esnekliği sağlıyor.' },
    ],
    strengths: [
      'Talep ekonomik döngüden büyük ölçüde bağımsız — temel tüketim kategorileri',
      'Fiyatlama gücü kanıtlanmış: enflasyon dönemlerinde zamları hacim kaybı olmadan geçirebildi',
      'Nakit üretimi istikrarlı ve temettü geçmişi çok uzun',
    ],
    risks: [
      'Gelir büyümesi neredeyse yatay; hacim değil fiyat kaynaklı büyüme sürdürülebilir değil',
      'Perakendeci özel markaları fiyat duyarlılığının arttığı dönemlerde pay alıyor',
      'Gelişmekte olan pazarlarda kur hareketleri gelir ve marjı doğrudan etkiliyor',
    ],
    verdict: 'Savunmacı nitelik, marka gücü ve nakit üretimi bu değerlemenin dayanağı; portföyde istikrar unsuru olarak rolü net. Ancak çarpan, büyümesi neredeyse yatay bir iş için tarihsel bandın üst tarafında: fiyat artışı kaynaklı büyümenin sınırına yaklaşıldıkça hacim büyümesi olmadan bu çarpanı savunmak zorlaşır.',
  },

  KO: {
    asOf: 'FY2025 yıllık rapor verilerine dayalı, yaklaşık',
    segments: [
      { name: 'Gazlı içecekler (ana marka portföyü)', sharePct: 68, note: 'Çekirdek; şekersiz varyantlar büyümeyi taşıyor' },
      { name: 'Su, spor, kahve ve çay', sharePct: 22, note: 'Sağlıklı içecek eğilimine yanıt' },
      { name: 'Meyve suyu, süt ve bitkisel', sharePct: 10, note: 'Çeşitlendirme kolu' },
    ],
    competitors: ['PepsiCo', 'Keurig Dr Pepper', 'Nestlé', 'Monster Beverage', 'yerel şişeleyiciler'],
    moat: [
      { title: 'Marka ve küresel dağıtım ağı', desc: 'Dünyanın hemen her satış noktasına ulaşan şişeleme ve dağıtım ağı, yüz yılı aşkın sürede kuruldu; yeni bir markanın aynı raf erişimini elde etmesi pratik olarak imkânsız.' },
      { title: 'Şişeleyici ortaklık modeli', desc: 'Sermaye yoğun şişeleme ve dağıtımı ortaklara devredip konsantre satışına odaklanması, yüksek marjlı ve düşük sermayeli bir yapı sağlıyor.' },
    ],
    strengths: [
      'Marj yapısı, şişeleme işini ortaklara devretmiş olması sayesinde emsallerinden yüksek',
      'Talep ekonomik döngüye karşı çok dayanıklı',
      'Şekersiz ve düşük kalorili varyantlar, kategori baskısına karşı büyümeyi taşıyor',
    ],
    risks: [
      'Şeker vergileri ve sağlık düzenlemeleri temel kategoriyi doğrudan hedefliyor',
      'Gelir büyümesi büyük ölçüde fiyat kaynaklı; hacim büyümesi olgun pazarlarda sınırlı',
      'Kur hareketleri gelirin büyük kısmı ABD dışından geldiği için sonuçları belirgin etkiliyor',
    ],
    verdict: 'Dağıtım ağı ve marka gücü, tüketim sektöründeki en dayanıklı moat\'lardan biri; şişeleyici modeli de marjı yapısal olarak yüksek tutuyor. Değerlemedeki gerilim büyüme oranıyla çarpan arasındaki uyumsuzluk: tek haneli düşük büyümeye karşılık çarpan tarihsel bandın üstünde, yani istikrar için ödenen prim şu an yüksek.',
  },

  PEP: {
    asOf: 'FY2025 yıllık rapor verilerine dayalı, yaklaşık',
    segments: [
      { name: 'Atıştırmalık (Frito-Lay, Quaker)', sharePct: 55, note: 'Kârın ana kaynağı; içecekten yüksek marjlı' },
      { name: 'İçecek (Kuzey Amerika)', sharePct: 27, note: 'Şişeleme dahil olduğu için sermaye yoğun ve marjı düşük' },
      { name: 'Uluslararası', sharePct: 18, note: 'Büyüme kolu; gelişmekte olan pazarlar' },
    ],
    competitors: ['Coca-Cola', 'Mondelez International', 'Kellanova', 'Keurig Dr Pepper', 'General Mills'],
    moat: [
      { title: 'Atıştırmalık kategorisinde raf hakimiyeti', desc: 'Frito-Lay\'in doğrudan mağaza dağıtım ağı ürünü rafa kendi ekibiyle diziyor; bu, stok ve teşhir kontrolünü elinde tutmasını sağlayan ve rakiplerin taklit edemediği bir dağıtım avantajı.' },
      { title: 'İçecek + atıştırmalık birlikteliği', desc: 'İki kategoriyi aynı perakendeciye birlikte satabilmesi, pazarlık gücünü ve promosyon esnekliğini tek kategorili rakiplerin üzerine çıkarıyor.' },
    ],
    strengths: [
      'Atıştırmalık kolu içecekten daha yüksek marjlı ve kategori büyümesi daha canlı',
      'Doğrudan mağaza dağıtımı, raf kontrolü ve yeni ürün sunumunda belirgin avantaj sağlıyor',
      'Talep döngüye dayanıklı; temettü geçmişi uzun',
    ],
    risks: [
      'Gelir büyümesi zayıf ve büyük ölçüde fiyat kaynaklı; hacim tarafında baskı var',
      'Kaldıraç emsallerine göre yüksek ve nakde dönüşüm zayıf seyrediyor',
      'Sağlıklı beslenme eğilimi hem atıştırmalık hem gazlı içecek kategorisini uzun vadede baskılıyor',
    ],
    verdict: 'Atıştırmalık ve içecek birlikteliği ile doğrudan mağaza dağıtımı gerçek avantajlar ve iş savunmacı niteliğini koruyor. Ancak tablo Coca-Cola\'ya göre daha zayıf: kaldıraç daha yüksek, nakde dönüşüm daha düşük ve büyüme hacim değil fiyat kaynaklı. Değerleme mütevazı ama bu, kalite farkının fiyatlanması olarak okunmalı.',
  },

  WMT: {
    asOf: 'FY2025 (Ocak sonu biten mali yıl) verilerine dayalı, yaklaşık',
    segments: [
      { name: 'Walmart ABD', sharePct: 68, note: 'Mağaza + e-ticaret, gıda ağırlıklı' },
      { name: 'Walmart Uluslararası', sharePct: 17, note: 'Meksika, Kanada, Çin (dahil PDD ortaklığı) vb.' },
      { name: "Sam's Club (toptan üyelik)", sharePct: 12, note: 'Costco benzeri model, büyüyen üyelik geliri' },
      { name: 'Reklam + diğer (Walmart Connect)', sharePct: 3, note: 'Küçük ama çok yüksek marjlı, hızlı büyüyen' },
    ],
    competitors: ['Amazon', 'Costco', 'Target', 'Kroger'],
    moat: [
      { title: 'Ölçek + tedarik zinciri gücü', desc: 'Dünyanın en büyük perakendecisi olarak tedarikçilerle fiyat pazarlığında ve lojistik verimlilikte rakiplerin ulaşamayacağı bir maliyet avantajına sahip.' },
      { title: 'Fiziksel mağaza + e-ticaret entegrasyonu (omni-channel)', desc: 'Binlerce mağazanın aynı zamanda son-kilometre teslimat/tıkla-al noktası olarak kullanılması, saf e-ticaret oyunculuğuna karşı hız/maliyet avantajı sağlıyor.' },
    ],
    strengths: [
      'Walmart Connect (reklam) ve Sam\'s Club üyelik geliri marjı yapısal olarak yukarı çekiyor',
      'Gıda ağırlıklı ürün karması, ekonomik yavaşlamalarda talebi göreli koruyor (defansif nitelik)',
      'E-ticaret + mağaza entegrasyonu (omni-channel) Amazon\'a karşı rekabet gücünü artırdı',
    ],
    risks: [
      'Perakende marjları yapısal olarak düşük, küçük maliyet artışları kâra orantısız yansıyor',
      'Amazon ve indirimli zincirlerin (Aldi, Costco) rekabeti sürekli baskı yaratıyor',
      'Emek/asgari ücret maliyetlerindeki artış marjı sıkıştırabilir',
    ],
    verdict: 'Reklam ve üyelik gelirinin büyüyen payı, geleneksel düşük marjlı perakende modelini kademeli iyileştiriyor ve bu, son dönemki çarpan genişlemesini gerekçelendiriyor; temel tez artık "en büyük perakendeci" değil "büyüyen yüksek marjlı gelir katmanlarına sahip perakendeci" hikâyesi.',
  },

  COST: {
    asOf: 'FY2025 yıllık rapor verilerine dayalı, yaklaşık',
    segments: [
      { name: 'Ürün satışı (gıda + genel ticari mal)', sharePct: 98, note: 'Devasa hacim, kasıtlı olarak ince marj' },
      { name: 'Üyelik aidatı', sharePct: 2, note: 'Gelirin yüzde ikisi ama faaliyet kârının çok büyük kısmı' },
    ],
    competitors: ['Walmart (Sam\'s Club)', 'Target', 'Kroger', 'Amazon', 'BJ\'s Wholesale'],
    moat: [
      { title: 'Üyelik modeli ve yenileme oranı', desc: 'Kâr esasen aidattan geldiği için ürünü neredeyse maliyetine satabiliyor; bu fiyat avantajı üyeliği daha da değerli kılıyor ve çok yüksek yenileme oranıyla kendini besleyen bir döngü kuruyor.' },
      { title: 'Sınırlı ürün çeşidiyle satın alma gücü', desc: 'Her kategoride az sayıda ürün tutması, tedarikçi başına sipariş hacmini olağanüstü büyütüyor; bu, geniş çeşitli rakiplerin elde edemeyeceği alım fiyatları sağlıyor.' },
    ],
    strengths: [
      'Üyelik yenileme oranı çok yüksek ve aidat geliri öngörülebilir, neredeyse saf kâr',
      'Fiyat lideri konumu ekonomik yavaşlamalarda pazar payı kazandırıyor — döngüye ters dayanıklılık',
      'Gelir büyümesi perakende sektörünün belirgin üstünde',
    ],
    risks: [
      'İleri çarpan bu listenin en yükseklerinden ve bu, %3\'lük net marjlı bir perakende işi için olağandışı',
      'Model kasıtlı olarak ince marjlı; maliyet şoklarını fiyata yansıtma alanı dar',
      'Aidat artışları yenileme oranını riske atmadan ancak seyrek yapılabiliyor',
    ],
    verdict: 'İş modeli perakendedeki en zarif yapılardan biri: kâr aidattan geldiği için fiyat rekabetinde kimsenin eşleşemeyeceği bir konumda ve yenileme oranı bunu doğruluyor. Değerlemedeki tek ama önemli sorun fiyat: ince marjlı bir perakende işine biçilen çarpan tarihsel bandın çok üstünde, yani model kalitesi için ödenen prim hatayı affetmeyecek kadar yüksek.',
  },

  HD: {
    asOf: 'FY2025 yıllık rapor verilerine dayalı, yaklaşık',
    segments: [
      { name: 'Yapı malzemeleri, dekorasyon ve bahçe', sharePct: 62, note: 'Ev sahibi tadilat harcamasına bağlı' },
      { name: 'Sert hat ürünler (alet, donanım, elektrik)', sharePct: 38, note: 'Profesyonel müteahhit tarafı bu grupta ağırlıklı' },
    ],
    competitors: ['Lowe\'s', 'Amazon', 'Ace Hardware', 'Menards', 'yapı malzemeleri toptancıları'],
    moat: [
      { title: 'Profesyonel müteahhit ilişkisi ve tedarik ölçeği', desc: 'Müteahhitler için stok bulunurluğu ve teslimat güvenilirliği fiyattan önce geliyor; mağaza yoğunluğu ve tedarik zinciri bu güvenilirliği sağladığı için profesyonel müşteri yapışkan.' },
      { title: 'Konum yoğunluğu', desc: 'Talebin acil olduğu bir kategoride mağazaya yakınlık belirleyici; en iyi konumlar zaten alınmış durumda ve yeni bir rakibin aynı yoğunluğu kurması pratik olarak mümkün değil.' },
    ],
    strengths: [
      'Profesyonel müteahhit segmenti tüketici tarafından daha istikrarlı ve sepet büyüklüğü yüksek',
      'Konum yoğunluğu ve tedarik zinciri, acil ihtiyaç kategorisinde çevrimiçi rekabete karşı yapısal koruma sağlıyor',
      'Nakit üretimi istikrarlı ve hissedar getirisi programı düzenli',
    ],
    risks: [
      'Yüksek faiz ortamı ev satışlarını ve büyük tadilat projelerini erteletiyor — talebin ana tetikleyicisi bu',
      'Kaldıraç emsallerine göre yüksek; agresif geri alım programı borçla finanse edilmiş durumda',
      'Gelir büyümesi çok zayıf ve nakde dönüşüm baskı altında',
    ],
    verdict: 'Konum yoğunluğu ve profesyonel müşteri ilişkisi kalıcı avantaflar, iş kalitesi yüksek. Ancak mevcut tablo konjonktürel bir sıkışma gösteriyor: gelir büyümesi durmuş, kaldıraç yüksek ve talep doğrudan faiz patikasına bağlı. Değerleme, faiz indirimlerinin tadilat döngüsünü yeniden başlatacağı varsayımını taşıyor — bu gecikirse çarpan savunmasız kalır.',
  },

  MCD: {
    asOf: 'FY2025 yıllık rapor verilerine dayalı, yaklaşık',
    segments: [
      { name: 'Franchise restoranlardan kira ve telif', sharePct: 62, note: 'Asıl iş modeli: gayrimenkul ve marka kiralama, restoran işletmek değil' },
      { name: 'Şirket işletmeli restoran satışları', sharePct: 38, note: 'Doğrudan işletilen az sayıda restoran; marjı düşük' },
    ],
    competitors: ['Restaurant Brands (Burger King)', 'Yum! Brands', 'Wendy\'s', 'Chipotle', 'Starbucks'],
    moat: [
      { title: 'Gayrimenkul portföyü', desc: 'Restoranların bulunduğu arsaların büyük kısmına sahip olması, franchise alandan hem telif hem kira almasını sağlıyor; bu, gelirin restoran kârlılığından kısmen bağımsız ve çok istikrarlı olması demek.' },
      { title: 'Küresel marka ve ölçekli tedarik', desc: 'Marka tanınırlığı yeni pazarda müşteri edinme maliyetini düşürüyor; tedarik ölçeği ise franchise alana rakiplerinden daha iyi girdi maliyeti sunmasını sağlıyor.' },
    ],
    strengths: [
      'Franchise ağırlıklı model yüksek marjlı, öngörülebilir ve sermaye ihtiyacı düşük gelir üretiyor',
      'Gayrimenkul sahipliği gelir tabanını restoran kârlılığından kısmen ayırıyor',
      'Ekonomik yavaşlamalarda değer odaklı menü pazar payı kazandırabiliyor',
    ],
    risks: [
      'Net Borç/EBITDA yüksek seviyede — model kasıtlı kaldıraçlı ve faiz ortamına duyarlı',
      'Gelir büyümesi düşük; büyüme fiyat artışı ve seçili pazarlara bağımlı',
      'Tüketici tarafında fiyat direnci arttı; sürekli zam trafiği aşındırma riski taşıyor',
    ],
    verdict: 'Gayrimenkul temelli franchise modeli, gelir istikrarı açısından restoran sektöründe eşi az bulunan bir yapı ve marjı bu sayede çok yüksek. Değerlemedeki iki sınırlayıcı unsur kaldıraç ve büyüme: borç seviyesi kasıtlı ama faiz ortamına duyarlılık yaratıyor, büyüme ise fiyat artışına bağımlı hale gelmiş durumda. İstikrar için ödenen prim makul, ancak büyüme beklentisi düşük tutulmalı.',
  },

  NKE: {
    asOf: 'FY2025 yıllık rapor verilerine dayalı, yaklaşık',
    segments: [
      { name: 'Ayakkabı', sharePct: 68, note: 'Çekirdek kategori; marj ve marka algısının merkezi' },
      { name: 'Giyim', sharePct: 27, note: 'Ayakkabıya göre daha rekabetçi ve daha düşük marjlı' },
      { name: 'Ekipman + Converse', sharePct: 5, note: 'Tamamlayıcı kategoriler' },
    ],
    competitors: ['Adidas', 'On Holding', 'Deckers (Hoka)', 'Lululemon', 'New Balance'],
    moat: [
      { title: 'Marka ve sporcu ortaklıkları', desc: 'Onlarca yıllık sponsorluk ve kültürel konumlandırma, ürünü işlevden çok kimlikle ilişkilendiriyor; bu algıyı yeni bir markanın pazarlama bütçesiyle satın alması mümkün değil.' },
      { title: 'Ölçekli tedarik ve doğrudan satış kanalı', desc: 'Üretim ölçeği birim maliyeti düşürürken, kendi mağaza ve dijital kanalı perakendeciye bağımlılığı azaltıp marjı koruyor.' },
    ],
    strengths: [
      'Marka gücü kategori genelinde hâlâ en güçlüsü ve fiyat primini taşıyor',
      'Analist potansiyeli bu listenin en yükseklerinden — beklenti zaten düşürülmüş durumda',
      'Bilanço rahat; toparlanma stratejisini finansal baskı olmadan yürütebilecek durumda',
    ],
    risks: [
      'Gelir daralıyor ve 3 yıllık bileşik büyüme de negatif — bu bir yavaşlama değil, pay kaybı işareti',
      'On ve Hoka gibi odaklanmış rakipler koşu kategorisinde belirgin pay aldı',
      'Doğrudan satışa yönelirken perakende ortaklarıyla ilişkinin zayıflaması raf erişimini azalttı',
    ],
    verdict: 'Marka gücü hâlâ kategori lideri ve bilanço toparlanma stratejisini finanse edecek durumda; analist potansiyelinin yüksekliği beklentilerin zaten düşürüldüğünü gösteriyor. Ancak veri bir dönüşü henüz doğrulamıyor: gelir daralıyor ve 3 yıllık büyüme negatif. Bu bir toparlanma tezi ve doğrulanması için ürün döngüsünün ve perakende ilişkilerinin yeniden kurulduğunu gösteren somut veri gerekiyor.',
  },

  DIS: {
    asOf: 'FY2025 yıllık rapor verilerine dayalı, yaklaşık',
    segments: [
      { name: 'Deneyimler (parklar, tatil köyleri, gemiler)', sharePct: 39, note: 'Faaliyet kârının ana kaynağı; en değerli varlık grubu' },
      { name: 'Eğlence (yayın + televizyon + stüdyo)', sharePct: 45, note: 'Yayın kârlılığa geçti, geleneksel TV erimeye devam ediyor' },
      { name: 'Spor (ESPN)', sharePct: 16, note: 'Yayın haklarının maliyeti yüksek; doğrudan tüketici geçişi kritik' },
    ],
    competitors: ['Netflix', 'Comcast (Universal)', 'Warner Bros. Discovery', 'Amazon', 'Universal parkları'],
    moat: [
      { title: 'Fikri mülkiyet kütüphanesi', desc: 'Karakter ve hikâye evrenleri film, dizi, park, oyuncak ve kruvaziyerde aynı anda gelire dönüştürülebiliyor; bu çapraz kullanım imkânı rakiplerin sahip olmadığı bir kaldıraç.' },
      { title: 'Park varlıklarının yeri doldurulamazlığı', desc: 'Devasa arazi, altyapı ve on yıllarca birikmiş işletme deneyimi gerektiren park işi, sermayesi olsa bile yeni bir rakibin kısa sürede kuramayacağı bir varlık grubu.' },
    ],
    strengths: [
      'Park ve deneyimler kolu yüksek marjlı ve fiyatlama gücü kanıtlanmış',
      'Yayın işi kârlılığa geçti — uzun süren zarar döneminin sona ermesi tezin en somut iyileşmesi',
      'Fikri mülkiyet kütüphanesi aynı içeriği birden çok kanaldan paraya çevirme imkânı veriyor',
    ],
    risks: [
      'Geleneksel televizyon gelirleri yapısal olarak eriyor ve bu erime yayın büyümesinden daha hızlı olabilir',
      'ESPN\'in doğrudan tüketici modeline geçişi yüksek spor yayın hakkı maliyetleriyle birlikte riskli bir dönüşüm',
      'Park işi tüketici harcamasına ve seyahat talebine duyarlı; bir yavaşlamada kârın ana kaynağı etkilenir',
    ],
    verdict: 'Park varlıkları ve fikri mülkiyet kütüphanesi gerçekten yeri doldurulamaz; yayın işinin kârlılığa geçmesi de uzun süren en büyük sorunun çözüldüğünü gösteriyor. Düşük ileri çarpan bu iyileşmeyi henüz tam yansıtmıyor olabilir. Karşı tarafta ise geleneksel TV erimesi ve ESPN geçişi duruyor — tez, park kârlılığının bu iki yapısal baskıyı taşıyabilmesine bağlı.',
  },

  XOM: {
    asOf: 'FY2025 yıllık rapor verilerine dayalı, yaklaşık',
    segments: [
      { name: 'Upstream (arama ve üretim)', sharePct: 62, note: 'Kârın ezici çoğunluğu; petrol fiyatına doğrudan bağlı' },
      { name: 'Ürün Çözümleri (rafineri + kimya)', sharePct: 30, note: 'Rafineri marjları döngüyü kısmen dengeliyor' },
      { name: 'Düşük karbon + diğer', sharePct: 8, note: 'Karbon yakalama ve hidrojen; henüz küçük' },
    ],
    competitors: ['Chevron', 'Shell', 'TotalEnergies', 'BP', 'ConocoPhillips'],
    moat: [
      { title: 'Düşük maliyetli rezerv portföyü', desc: 'Guyana ve Permian gibi düşük başabaş maliyetli sahalara erişim, petrol fiyatı düştüğünde bile üretimin kârlı kalmasını sağlıyor — döngüsel bir sektörde en belirleyici avantaj.' },
      { title: 'Entegre yapı', desc: 'Upstream ile rafineri/kimyayı birlikte işletmesi, ham petrol fiyatı düşerken rafineri marjının genişlemesi sayesinde sonuçların dalgalanmasını yumuşatıyor.' },
    ],
    strengths: [
      'Düşük maliyetli üretim varlıkları, fiyat düşüşlerinde rakiplerden daha dayanıklı kılıyor',
      'Bilanço güçlü ve kaldıraç düşük; döngü dibinde temettüyü sürdürebilecek kapasitede',
      'Entegre yapı sonuçların oynaklığını azaltıyor',
    ],
    risks: [
      '3 yıllık bileşik büyüme negatif — son yılın güçlü artışı emtia fiyat döngüsünün bir aşaması, yapısal bir büyüme değil',
      'Değerleme tamamen petrol fiyatı varsayımına duyarlı; fiyat gerilerse kâr ve çarpan birlikte daralır',
      'Uzun vadeli enerji geçişi talep tarafında yapısal bir belirsizlik oluşturuyor',
    ],
    verdict: 'Düşük maliyetli rezervler ve entegre yapı, döngüsel bir sektörde gerçek bir dayanıklılık sağlıyor; bilanço da temettüyü koruyacak güçte. Ancak değerleme okuması dikkat gerektiriyor: 3 yıllık büyüme negatifken son yılın sıçraması emtia döngüsünün bir evresi. Bu kârı kalıcı varsayıp çarpan hesaplamak, sektörün klasik değerleme tuzağıdır.',
  },

  CVX: {
    asOf: 'FY2025 yıllık rapor verilerine dayalı, yaklaşık',
    segments: [
      { name: 'Upstream (arama ve üretim)', sharePct: 78, note: 'Permian ve Kazakistan ağırlıklı; kârın ana kaynağı' },
      { name: 'Downstream (rafineri, kimya, pazarlama)', sharePct: 22, note: 'Döngüyü kısmen dengeleyen kol' },
    ],
    competitors: ['ExxonMobil', 'Shell', 'TotalEnergies', 'ConocoPhillips', 'BP'],
    moat: [
      { title: 'Permian havzasındaki konumu', desc: 'Havzadaki geniş ve düşük maliyetli arazi portföyü, kısa döngülü üretimle sermaye harcamasını talebe göre hızlı ayarlayabilmesini sağlıyor — uzun döngülü projelere kıyasla önemli bir esneklik.' },
      { title: 'Sermaye disiplini geçmişi', desc: 'Döngü tepelerinde aşırı yatırımdan kaçınma konusundaki tutarlı davranışı, dip dönemlerde bilançoyu koruyor ve rakipler zayıfken satın alma yapabilmesini mümkün kılıyor.' },
    ],
    strengths: [
      'Kısa döngülü Permian üretimi sermaye harcamasında yüksek esneklik sağlıyor',
      'Bilanço güçlü; düşük fiyat dönemlerinde bile temettüyü sürdürme kapasitesi var',
      'Sermaye disiplini geçmişi, döngüsel bir sektörde yönetim kalitesine dair somut bir gösterge',
    ],
    risks: [
      '3 yıllık bileşik büyüme negatif; son yılın artışı fiyat döngüsünden kaynaklanıyor',
      'Gelirin yoğunlaştığı bazı uluslararası varlıklar jeopolitik riske açık',
      'Enerji geçişi uzun vadede talep tarafında yapısal belirsizlik yaratıyor',
    ],
    verdict: 'Sermaye disiplini ve Permian esnekliği, döngüsel bir işte yönetim kalitesinin somut göstergeleri; bilanço da temettüyü koruyacak güçte. Değerleme mütevazı görünüyor ancak bu görüntü, 3 yıllık negatif büyümenin üstüne binen döngüsel bir kâr sıçramasından geliyor. Tez, emtia fiyat varsayımından ayrı düşünülemez.',
  },

  BA: {
    asOf: 'FY2025 yıllık rapor verilerine dayalı, yaklaşık',
    segments: [
      { name: 'Ticari Uçaklar', sharePct: 42, note: 'Sipariş defteri dolu ama teslimat üretim sorunlarına takılı' },
      { name: 'Savunma, Uzay ve Güvenlik', sharePct: 35, note: 'Sabit fiyatlı sözleşmelerde zarar üreten programlar var' },
      { name: 'Global Hizmetler', sharePct: 23, note: 'Bakım ve yedek parça; en istikrarlı ve kârlı kol' },
    ],
    competitors: ['Airbus', 'Lockheed Martin', 'Northrop Grumman', 'Embraer', 'RTX'],
    moat: [
      { title: 'İkili pazar yapısı', desc: 'Büyük ticari uçak pazarında pratikte iki üretici var; sertifikasyon, sermaye ve mühendislik birikimi engelleri o kadar yüksek ki yeni bir rakibin girmesi onlarca yıllık bir mesele.' },
      { title: 'Kurulu filo üzerinden hizmet geliri', desc: 'Sahadaki binlerce uçak on yıllar boyunca bakım, parça ve destek geliri üretiyor; bu, üretim sorunlarından bağımsız ve yüksek marjlı bir nakit kaynağı.' },
    ],
    strengths: [
      'Sipariş defteri çok uzun vadeli talep görünürlüğü sağlıyor — sorun talep değil üretim',
      'Global Hizmetler kolu istikrarlı, yüksek marjlı ve üretim sorunlarından bağımsız',
      'İkili pazar yapısı, sorunlara rağmen müşterinin gidebileceği alternatifi sınırlıyor',
    ],
    risks: [
      'Net marj neredeyse sıfır ve nakit üretimi zayıf; üretim/kalite sorunları maliyetleri şişirmeye devam ediyor',
      'Düzenleyici gözetim üretim hızını sınırlıyor — teslimat artmadan nakit akışı normalleşemez',
      'İleri çarpan çok yüksek çünkü normalleşmiş kâr varsayımına dayanıyor; toparlanma gecikirse dayanak kalmıyor',
    ],
    verdict: 'Talep ve pazar yapısı bu şirketin lehine; sorun tamamen yürütme tarafında. Değerleme, üretim ve kalite sorunlarının çözülüp teslimatların normalleşeceği varsayımı üzerine kurulu — bugünkü kârdan hesaplanmış bir çarpan değil. Sipariş defteri tezi ayakta tutuyor, ancak nakit akışı normalleşene kadar bu bir toparlanma bahsi olarak kalır.',
  },

  CAT: {
    asOf: 'FY2025 yıllık rapor verilerine dayalı, yaklaşık',
    segments: [
      { name: 'İnşaat Sanayileri', sharePct: 42, note: 'Altyapı harcamalarına bağlı; en büyük kol' },
      { name: 'Kaynak Sanayileri (madencilik ekipmanı)', sharePct: 22, note: 'Emtia fiyat döngüsüne duyarlı' },
      { name: 'Enerji ve Ulaşım', sharePct: 30, note: 'Veri merkezi jeneratörleri bu grupta ve hızlı büyüyor' },
      { name: 'Finansal ürünler', sharePct: 6, note: 'Müşteri finansmanı' },
    ],
    competitors: ['Komatsu', 'Deere & Company', 'Volvo Construction', 'Hitachi Construction', 'CNH Industrial'],
    moat: [
      { title: 'Bayi ağı ve yedek parça erişimi', desc: 'Küresel bayi ağı, sahada duran bir iş makinesinin en kısa sürede çalışır hale gelmesini sağlıyor; müşteri için arıza süresi maliyeti makine fiyatından önemli olduğu için bu ağ satın alma kararını belirliyor.' },
      { title: 'Kurulu makine tabanı üzerinden parça geliri', desc: 'Sahadaki makineler on yıllarca yedek parça ve servis geliri üretiyor; bu, yeni makine siparişleri döngüsel olarak düştüğünde nakit akışını taşıyan yüksek marjlı bir taban.' },
    ],
    strengths: [
      'Bayi ağı ve parça geliri, döngüsel bir işte istikrarlı ve yüksek marjlı bir taban sağlıyor',
      'Veri merkezi güç üretimi talebi Enerji ve Ulaşım kolunu doğrudan besliyor — AI yatırımına dolaylı erişim',
      'Fiyatlama gücü kanıtlanmış; maliyet artışlarını geçirebildi',
    ],
    risks: [
      'Talep altyapı harcamaları ve emtia fiyatlarına bağlı; ikisi de makro ve politik kararlara duyarlı',
      'Kaldıraç orta-yüksek seviyede ve nakde dönüşüm zayıf seyrediyor',
      'İleri çarpan döngüsel bir iş için yüksek; tepe kâr üzerinden hesaplanıyor olma riski taşıyor',
    ],
    verdict: 'Bayi ağı ve parça geliri, döngüsel bir işte gerçek bir istikrar unsuru; veri merkezi jeneratör talebi de beklenmedik bir büyüme kolu açtı. Değerlemedeki risk zamanlama: çarpan, altyapı ve madencilik döngüsünün güçlü olduğu bir dönemin kârı üzerinden hesaplanıyor. Döngü dönerse hem kâr hem çarpan aynı yönde hareket eder.',
  },

  T: {
    asOf: 'FY2025 yıllık rapor verilerine dayalı, yaklaşık',
    segments: [
      { name: 'Mobil (kablosuz hizmet + ekipman)', sharePct: 68, note: 'Çekirdek iş; abone başı gelir ve churn belirleyici' },
      { name: 'İş Bağlantı Çözümleri', sharePct: 17, note: 'Kurumsal hatlar; geleneksel kısmı eriyor' },
      { name: 'Tüketici Kablolu (fiber)', sharePct: 15, note: 'Fiber yatırımı büyümenin ana kaynağı' },
    ],
    competitors: ['Verizon', 'T-Mobile US', 'Comcast', 'Charter Communications'],
    moat: [
      { title: 'Spektrum ve şebeke altyapısı', desc: 'Lisanslı spektrum sınırlı ve pahalı bir kaynak; ülke çapında şebeke kurmanın maliyeti yeni girişi pratik olarak imkânsız kılıyor — pazar üç oyuncuyla sınırlı kalıyor.' },
      { title: 'Fiber ayak izi', desc: 'Fiber döşenmiş her hane uzun vadeli ve düşük churn\'lü bir gelir kaynağı; aynı sokağa ikinci bir fiber şebekesi çekmek ekonomik olarak nadiren mantıklı olduğu için bu konum kalıcı.' },
    ],
    strengths: [
      'Fiber genişlemesi düşük churn\'lü, uzun ömürlü abone geliri üretiyor',
      'Temettü verimi yüksek ve ileri çarpan çok düşük — gelir odaklı bir profil',
      'Üç oyunculu pazar yapısı fiyat rekabetini sınırlıyor',
    ],
    risks: [
      'Net Borç/EBITDA yüksek seviyede; borç azaltma sermaye tahsisini uzun süre kısıtlamaya devam edecek',
      'Gelir büyümesi neredeyse yatay; büyüme fiber abone kazanımına bağımlı ve bu yatırım gerektiriyor',
      'T-Mobile\'ın agresif fiyatlaması abone kazanım maliyetini yükseltiyor',
    ],
    verdict: 'Fiber ayak izi ve spektrum gerçek varlıklar, üç oyunculu yapı da fiyat rekabetini sınırlıyor; düşük çarpan ve yüksek temettü verimi gelir odaklı bir profil sunuyor. Ancak bu bir büyüme tezi değil: kaldıraç yüksek, üst satır yatay ve sermayenin önemli kısmı borç azaltmaya gidiyor. Değerleme, temettünün sürdürülebilirliği üzerinden okunmalı.',
  },

  VZ: {
    asOf: 'FY2025 yıllık rapor verilerine dayalı, yaklaşık',
    segments: [
      { name: 'Tüketici (kablosuz + ev interneti)', sharePct: 76, note: 'Gelirin ana gövdesi; abone kaybı en kritik gösterge' },
      { name: 'İşletme', sharePct: 24, note: 'Kurumsal ve kamu; geleneksel hatlar eriyor' },
    ],
    competitors: ['AT&T', 'T-Mobile US', 'Comcast', 'Charter Communications'],
    moat: [
      { title: 'Spektrum portföyü ve şebeke kapsamı', desc: 'Geniş spektrum varlığı ve ülke çapında şebeke, yeni girişi imkânsız kılan bir sermaye engeli; pazar bu nedenle üç oyuncuyla sınırlı.' },
      { title: 'Sabit kablosuz erişim konumu', desc: 'Mevcut mobil şebekesi üzerinden ev interneti sunabilmesi, kablo döşemeden yeni bir pazara girmesini sağlıyor — marjinal maliyeti düşük bir büyüme kolu.' },
    ],
    strengths: [
      'Temettü verimi bu listenin en yükseklerinden ve ileri çarpan en düşükleri arasında',
      'Sabit kablosuz ev interneti, mevcut şebeke üzerinden ek yatırım gerektirmeden abone kazandırıyor',
      'Üç oyunculu pazar yapısı gelir tabanını koruyor',
    ],
    risks: [
      'Gelir DARALIYOR ve 3 yıllık büyüme de neredeyse sıfır — abone tarafında pay kaybı sürüyor',
      'Net Borç/EBITDA bu listenin en yükseği; temettü ve borç servisi birlikte nakit akışının büyük kısmını tüketiyor',
      'T-Mobile karşısında şebeke algısı ve fiyatlama rekabetinde geride kalma riski',
    ],
    verdict: 'Yüksek temettü verimi ve çok düşük çarpan bir değer hikâyesi görüntüsü veriyor, ancak temel tablo bunu desteklemiyor: gelir daralıyor ve kaldıraç bu listenin en yükseği. Bu kombinasyon, düşük çarpanın bir iskonto değil, temettünün sürdürülebilirliğine dair piyasa şüphesinin fiyatlanması olduğunu gösteriyor. Tez tamamen abone kaybının durup durmayacağına bağlı.',
  },
};
