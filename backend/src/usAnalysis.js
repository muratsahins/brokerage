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
    asOf: 'FY2024 yıllık rapor verilerine dayalı, yaklaşık',
    segments: [
      { name: 'iPhone', sharePct: 51, note: 'Ana gelir kalemi; yenileme döngüsüne duyarlı' },
      { name: 'Hizmetler (App Store, iCloud, reklam, abonelik)', sharePct: 24, note: 'En yüksek marjlı, en hızlı büyüyen segment' },
      { name: 'Mac', sharePct: 8, note: 'Apple Silicon geçişiyle payı toparladı' },
      { name: 'Giyilebilir/Ev/Aksesuar', sharePct: 9, note: 'Watch, AirPods' },
      { name: 'iPad', sharePct: 7, note: 'Döngüsel, yenileme aralığı uzun' },
    ],
    competitors: ['Samsung Electronics', 'Google (Android)', 'Microsoft', 'Xiaomi'],
    moat: [
      { title: 'Ekosistem kilitlenmesi', desc: 'iPhone-Mac-Watch-Hizmetler entegrasyonu geçiş maliyetini yükseltiyor; kullanıcı elde tutma oranı sektörde en yüksekler arasında.' },
      { title: 'Marka gücü + fiyatlama gücü', desc: 'Premium segmentte fiyat esnekliği düşük talep sayesinde rakiplerin ulaşamadığı marjlarla satış yapabiliyor.' },
    ],
    strengths: [
      'Hizmetler gelirinin büyüyen payı marjı ve öngörülebilirliği artırıyor',
      'Devasa, öngörülebilir serbest nakit akışı ve agresif hissedar getirisi programı',
      'Marka sadakati ve ekosistem, iPhone dışı ürünlerde çapraz satışı kolaylaştırıyor',
    ],
    risks: [
      'iPhone\'a gelir yoğunlaşması; yenileme döngüsü uzarsa büyüme yavaşlar',
      'Çin\'de hem talep hem tedarik zinciri riski (jeopolitik + yerel rakipler)',
      'App Store komisyon modeline düzenleyici baskı (AB, ABD) Hizmetler marjını tehdit ediyor',
    ],
    verdict: 'Değerleme, çoğu döngüde F/K primini Hizmetler büyümesi ve nakit getirisiyle gerekçelendiriyor; ancak donanım büyümesi durağanlaşırsa prim savunulması zorlaşır. Kısa vadeli katalizör (yeni ürün döngüsü) olmadan mevcut çarpanlar gerilim taşır.',
  },

  MSFT: {
    asOf: 'FY2024 yıllık rapor verilerine dayalı, yaklaşık',
    segments: [
      { name: 'Intelligent Cloud (Azure, sunucu ürünleri)', sharePct: 43, note: 'En hızlı büyüyen, AI talebiyle ivmeleniyor' },
      { name: 'Productivity & Business Processes (Office 365, LinkedIn, Dynamics)', sharePct: 32, note: 'İstikrarlı abonelik geliri' },
      { name: 'More Personal Computing (Windows, Xbox, arama/reklam)', sharePct: 25, note: 'PC döngüsüne bağlı, görece yavaş büyüyor' },
    ],
    competitors: ['Amazon (AWS)', 'Google Cloud', 'Salesforce', 'Oracle', 'Apple'],
    moat: [
      { title: 'Kurumsal geçiş maliyeti', desc: 'Windows-Office-Azure-Active Directory yığını kurumlarda değiştirilmesi çok maliyetli bir bağımlılık yaratıyor.' },
      { title: 'Ölçek + AI entegrasyonu', desc: 'OpenAI ortaklığı ve Copilot\'un tüm ürün ailesine entegrasyonu, dağıtım ölçeğinde rakiplerin kolayca kopyalayamayacağı bir avantaj sağlıyor.' },
    ],
    strengths: [
      'Azure + AI talebi çok yıllı büyüme görünürlüğü sağlıyor',
      'Abonelik ağırlıklı gelir modeli öngörülebilirlik ve marj istikrarı veriyor',
      'Bilanço gücü, büyük ölçekli satın almaları (Activision gibi) organik büyümeyi bozmadan finanse edebiliyor',
    ],
    risks: [
      'AI capex döngüsü getiri hızını (ROIC) baskılayabilir, yatırımcı sabrı sınanabilir',
      'Bulut pazarında AWS/Google ile fiyat/kapasite rekabeti yoğunlaşıyor',
      'Düzenleyici inceleme (rekabet, AI, bundling) büyük teknoloji genelinde artıyor',
    ],
    verdict: 'Prim değerleme, Azure/AI büyüme görünürlüğü ve marj kalitesiyle büyük ölçüde gerekçeli görünüyor; asıl soru capex\'in ne zaman gelir/marja dönüşeceği — bu netleşene kadar çarpanlarda volatilite beklenmeli.',
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
    asOf: 'FY2024 yıllık rapor verilerine dayalı, yaklaşık',
    segments: [
      { name: 'Kuzey Amerika e-ticaret', sharePct: 42, note: 'Düşük marjlı, hacim odaklı' },
      { name: 'Uluslararası e-ticaret', sharePct: 22, note: 'Marj toparlanma aşamasında' },
      { name: 'AWS (bulut)', sharePct: 17, note: 'Şirket kârının çoğunu tek başına üretiyor' },
      { name: 'Reklam + diğer', sharePct: 19, note: 'En yüksek marjlı, hızlı büyüyen segment' },
    ],
    competitors: ['Walmart', 'Microsoft Azure', 'Google Cloud', 'Shopify', 'Alibaba'],
    moat: [
      { title: 'Lojistik + Prime ağ etkisi', desc: 'Devasa yerine getirme ağı ve Prime aboneliği, teslimat hızında rakiplerin kısa vadede eşleyemeyeceği bir müşteri bağlılığı yaratıyor.' },
      { title: 'AWS ölçek + geçiş maliyeti', desc: 'Kurumsal iş yükleri bir kez AWS\'e taşındığında, mimari bağımlılık ve veri geçiş maliyeti müşteriyi elde tutuyor.' },
    ],
    strengths: [
      'AWS ve reklam segmentleri konsolide marjı yapısal olarak yukarı taşıyor',
      'Prime ekosistemi (teslimat + video + müzik) müşteri elde tutmayı güçlendiriyor',
      'Lojistik altyapısındaki verimlilik kazanımları e-ticaret marjını da destekliyor',
    ],
    risks: [
      'AWS büyüme hızı Azure/Google Cloud\'a kıyasla yavaşlarsa pazar payı algısı zayıflar',
      'AI veri merkezi capex\'i kısa-orta vadede FCF\'yi baskılayabilir',
      'E-ticaret tarafında düzenleyici (antitröst) baskı ve düşük marjlı rekabet (Temu, Shein) devam ediyor',
    ],
    verdict: 'Değerleme büyük ölçüde AWS ve reklamın kâr katkısına dayanıyor; bu iki segment büyümeyi sürdürdükçe çarpanlar gerekçeli kalır, ancak AWS büyümesinde belirgin bir yavaşlama primi hızla erodere edebilir.',
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
    asOf: 'FY2024 yıllık rapor verilerine dayalı, yaklaşık',
    segments: [
      { name: 'Otomotiv (araç satışı)', sharePct: 80, note: 'Model 3/Y hacim ağırlıklı, fiyat rekabeti marjı baskılıyor' },
      { name: 'Enerji üretimi & depolama (Megapack/Powerwall)', sharePct: 10, note: 'En hızlı büyüyen ve marj genişleyen segment' },
      { name: 'Hizmetler + diğer', sharePct: 10, note: 'Süpercharger ağı, sigorta, tamir' },
    ],
    competitors: ['BYD', 'Geleneksel OEM\'lerin EV kolları (GM, Ford, VW)', 'Çinli EV üreticileri (NIO, XPeng)', 'Rivian'],
    moat: [
      { title: 'Şarj altyapısı + yazılım entegrasyonu', desc: 'Süpercharger ağı ve OTA yazılım güncellemeleri, geleneksel OEM\'lerin donanım-odaklı modeline karşı bir kullanıcı deneyimi avantajı yaratıyor.' },
      { title: 'Üretim ölçeği + maliyet öğrenme eğrisi', desc: 'Gigafactory ölçeği ve dikey entegrasyon (batarya, yazılım), birim maliyetlerde çoğu rakibe göre avantaj sağlıyor — fiyat savaşını başlatabilme gücü buradan geliyor.' },
    ],
    strengths: [
      'Enerji depolama segmenti hızla büyüyor ve marjı genişliyor',
      'Marka gücü ve yazılım/otonom sürüş anlatısı yatırımcı ilgisini canlı tutuyor',
      'Güçlü bilanço, döngüsel fiyat savaşlarına dayanma kapasitesi veriyor',
    ],
    risks: [
      'EV fiyat rekabeti (özellikle Çin\'de BYD) marjı yapısal olarak baskılamaya devam edebilir',
      'Değerlemenin büyük kısmı otonom sürüş (robotaxi) ve robotik gibi henüz gelir üretmeyen bahislere dayanıyor',
      'CEO\'nun dikkatinin dağılması ve marka algısına yönelik siyasi/itibar riskleri talebi etkileyebiliyor',
    ],
    verdict: 'Çekirdek otomotiv iş kolunun mevcut nakit akışlarıyla değerleme gerekçelendirilemez — fiyatlama büyük ölçüde otonom sürüş ve robotik gibi henüz kanıtlanmamış opsiyonel bahislere dayanıyor; bu da değerlemeyi olağandışı derecede varsayım-duyarlı kılıyor.',
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
    asOf: 'FY2024 (Mayıs sonu biten mali yıl) verilerine dayalı, yaklaşık',
    segments: [
      { name: 'Bulut hizmetleri & lisans desteği (SaaS+IaaS)', sharePct: 76, note: 'Oracle Cloud Infrastructure (OCI) hızla büyüyor, AI eğitim talebiyle destekleniyor' },
      { name: 'Bulut lisansı & şirket içi lisans', sharePct: 8, note: 'Yapısal olarak küçülen eski iş' },
      { name: 'Donanım + hizmetler', sharePct: 16, note: 'Görece durağan' },
    ],
    competitors: ['Microsoft Azure', 'AWS', 'Google Cloud', 'SAP', 'Salesforce (uygulama katmanında)'],
    moat: [
      { title: 'Kurumsal veritabanı kilitlenmesi', desc: 'Büyük kurumların (bankalar, devlet kurumları) kritik veritabanı iş yükleri Oracle\'a derinden bağımlı; geçiş riski/maliyeti çok yüksek.' },
      { title: 'AI iş yükleri için OCI\'nin fiyat/performans konumu', desc: 'NVIDIA kümeleriyle rekabetçi fiyatlandırma, büyük AI laboratuvarlarını (ör. OpenAI ile duyurulan kapasite anlaşmaları) OCI\'ye çekiyor.' },
    ],
    strengths: [
      'OCI, AI eğitim talebiyle üç büyük bulut sağlayıcısına (AWS/Azure/GCP) karşı pazar payı kazanıyor',
      'Kurumsal veritabanı tabanı çok yüksek elde tutma oranına sahip, öngörülebilir gelir sağlıyor',
      'Büyük ölçekli AI kapasite anlaşmaları (multi-yıl) gelir görünürlüğünü artırıyor',
    ],
    risks: [
      'Yüksek borç yükü, faiz oranı ortamına duyarlılığı artırıyor',
      'OCI büyümesini sürdürmek için gereken capex çok büyük; getiri zamanlaması belirsiz',
      'Büyük bulut sağlayıcılarıyla (özellikle Azure/AWS) fiyat rekabeti marjı baskılayabilir',
    ],
    verdict: 'OCI\'nin AI talebiyle ivmelenmesi büyüme anlatısını güçlü destekliyor, ama yüksek borç ve büyük capex yükü, değerlemenin OCI büyümesinin kesintisiz süreceği varsayımına duyarlılığını artırıyor.',
  },

  ADBE: {
    asOf: 'FY2024 (Kasım sonu biten mali yıl) verilerine dayalı, yaklaşık',
    segments: [
      { name: 'Digital Media (Creative Cloud, Document Cloud)', sharePct: 74, note: 'Abonelik ağırlıklı, ana kâr kaynağı' },
      { name: 'Digital Experience (pazarlama/analitik yazılımı)', sharePct: 25, note: 'Kurumsal odaklı, görece yavaş büyüyen' },
    ],
    competitors: ['Figma', 'Canva', 'Microsoft (Designer, Office)', 'Salesforce (Digital Experience\'da)'],
    moat: [
      { title: 'Yaratıcı profesyonel iş akışı standardı', desc: 'Photoshop/Premiere/Illustrator onlarca yıldır kreatif endüstrinin standardı; eğitim, eklenti ekosistemi ve dosya format bağımlılığı geçişi zorlaştırıyor.' },
      { title: 'Abonelik + bulut senkronizasyon kilitlenmesi', desc: 'Creative Cloud aboneliği, dosya/varlık senkronizasyonu ve ekip iş birliği özellikleriyle kurumsal müşterileri elde tutuyor.' },
    ],
    strengths: [
      'Abonelik modeli tekrarlayan, öngörülebilir gelir sağlıyor',
      'Kreatif yazılımda fiili endüstri standardı konumu güçlü fiyatlama gücü veriyor',
      'AI özelliklerinin (Firefly) mevcut ürünlere entegrasyonu ek gelir/elde tutma potansiyeli taşıyor',
    ],
    risks: [
      'Canva gibi daha ucuz/kolay kullanımlı AI-native araçlar giriş seviyesi kullanıcıları çekiyor',
      'Figma satın almasının düzenleyici engelle iptali, tasarım işbirliği alanında rekabeti dışarıda bıraktı',
      'Genel amaçlı AI görsel/video üretim araçları (Midjourney, Sora vb.) uzun vadede iş akışını değiştirebilir',
    ],
    verdict: 'İstikrarlı abonelik geliri ve yüksek marj değerlemeyi destekliyor, ama AI-native rakiplerin genç/girişimci kullanıcı segmentinde payı aşındırma riski, büyüme çarpanının eskisi kadar rahat savunulmasını zorlaştırıyor.',
  },

  CRM: {
    asOf: 'FY2024 (Ocak sonu biten mali yıl) verilerine dayalı, yaklaşık',
    segments: [
      { name: 'Sales & Service Cloud', sharePct: 46, note: 'Çekirdek CRM iş kolu' },
      { name: 'Platform & diğer (Data Cloud, Slack, MuleSoft)', sharePct: 30, note: 'Entegrasyon ve veri platformu büyümesi' },
      { name: 'Marketing & Commerce Cloud', sharePct: 15, note: 'Görece yavaş büyüyen' },
      { name: 'Diğer', sharePct: 9, note: 'Tableau, Agentforce (AI ajanları) gibi yeni ürünler' },
    ],
    competitors: ['Microsoft Dynamics', 'SAP', 'Oracle', 'HubSpot', 'ServiceNow (bitişik alanlarda)'],
    moat: [
      { title: 'CRM veri + iş akışı kilitlenmesi', desc: 'Satış/müşteri hizmet ekiplerinin günlük iş akışına derinden yerleşmiş CRM verisi, rakibe geçişi operasyonel olarak riskli ve maliyetli kılıyor.' },
      { title: 'AppExchange ekosistemi', desc: 'Binlerce üçüncü parti eklenti ve entegrasyon, platformun değerini artırıyor ve müşteri bağımlılığını derinleştiriyor.' },
    ],
    strengths: [
      'Aktivist yatırımcı baskısı sonrası kârlılık ve FCF disiplini kalıcı görünüyor',
      'Data Cloud + Agentforce (AI ajanları) yeni büyüme vektörleri sunuyor',
      'Kurumsal CRM pazarında lider konum ve yüksek müşteri elde tutma',
    ],
    risks: [
      'Büyüme hızı, geçmiş yılların çift haneli yüksek seviyelerinden belirgin yavaşladı',
      'AI-native CRM/satış araçları (yeni girişimler) niş segmentlerde pay çalabilir',
      'Çoklu ürün (Slack, Tableau, MuleSoft) entegrasyonunun karmaşıklığı satış döngüsünü uzatabilir',
    ],
    verdict: 'Kârlılığa geçiş değerlemeyi somut biçimde destekliyor; büyüme yeniden hızlanmadan (Agentforce/Data Cloud\'un gerçek katkısı netleşmeden) çarpanların önceki döngünün büyüme primini tekrar kazanması zor görünüyor.',
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
    asOf: 'FY2024 yıllık rapor verilerine dayalı, yaklaşık',
    segments: [
      { name: 'İstemci Bilişim (Client Computing — PC işlemci)', sharePct: 51, note: 'Ana nakit kaynağı ama pazar payı AMD\'ye kayıyor' },
      { name: 'Veri Merkezi & AI', sharePct: 27, note: 'AI hızlandırıcı yarışında geride kaldı' },
      { name: 'Intel Foundry (döküm/üretim hizmeti)', sharePct: 15, note: 'Büyük stratejik dönüşüm, henüz zarar üretiyor' },
      { name: 'Diğer (Mobileye, NEX)', sharePct: 7, note: 'Küçük, çeşitlendirilmiş' },
    ],
    competitors: ['AMD', 'NVIDIA (AI\'da)', 'TSMC/Samsung (döküm hizmetinde)', 'Qualcomm/ARM ekosistemi'],
    moat: [
      { title: 'x86 kurulu tabanı + kurumsal uyumluluk', desc: 'On yıllardır süren x86 mimarisi kurumsal yazılım/donanım uyumluluğunda hâlâ geniş bir kurulu taban avantajı sağlıyor, ama bu avantaj aşınıyor.' },
      { title: 'ABD içi ileri düğüm üretim kapasitesi (Foundry)', desc: 'Jeopolitik olarak ABD hükümetinin ve büyük müşterilerin "Tayvan dışı" ileri üretim arayışında Intel Foundry stratejik bir konum hedefliyor — henüz kanıtlanmadı.' },
    ],
    strengths: [
      'CHIPS Act teşvikleri ve ABD hükümeti desteği Foundry yatırımını kısmen finanse ediyor',
      'x86 kurulu tabanı hâlâ kurumsal PC/sunucu pazarında önemli bir gelir tabanı sağlıyor',
      'Mobileye gibi yan varlıklar opsiyonel değer taşıyor',
    ],
    risks: [
      'Foundry stratejisi başarısız olursa (dış müşteri kazanamazsa) devasa capex geri dönüşsüz zarara dönüşebilir',
      'AI hızlandırıcı pazarında NVIDIA/AMD\'ye karşı belirgin geriden geliyor',
      'PC/sunucu CPU pazar payı kaybı sürerse çekirdek nakit üretimi daha da zayıflar',
    ],
    verdict: 'Bu bir dönüşüm hikâyesi — mevcut nakit akışları değerlemeyi değil, Foundry stratejisinin başarı ihtimali gerekçelendiriyor; sonuç netleşene kadar (dış müşteri kazanımları, düğüm geçişlerinin zamanlaması) değerleme yüksek belirsizlik taşır.',
  },

  CSCO: {
    asOf: 'FY2024 (Temmuz sonu biten mali yıl) verilerine dayalı, yaklaşık',
    segments: [
      { name: 'Ağ altyapısı (switch/router)', sharePct: 54, note: 'Olgun, döngüsel; AI veri merkezi ağ talebiyle destekleniyor' },
      { name: 'Güvenlik', sharePct: 12, note: 'Splunk satın alması sonrası büyüyen segment' },
      { name: 'İşbirliği (Webex) + gözlemlenebilirlik + diğer', sharePct: 34, note: 'Yazılım/abonelik ağırlığı artıyor' },
    ],
    competitors: ['Arista Networks', 'Juniper Networks (HPE tarafından satın alınıyor)', 'Palo Alto Networks (güvenlikte)', 'Huawei (küresel pazarda)'],
    moat: [
      { title: 'Kurumsal ağ altyapısında kurulu taban', desc: 'Dünya çapında kurumların/servis sağlayıcıların ağ omurgası Cisco donanımı üzerine kurulu; değiştirme operasyonel olarak yüksek riskli ve maliyetli.' },
      { title: 'Yazılım + abonelik geçişi (Splunk ile veri/güvenlik)', desc: 'Ağ donanımından abonelik yazılımına (güvenlik, gözlemlenebilirlik) geçiş, tekrarlayan gelir ve çapraz satış fırsatı yaratıyor.' },
    ],
    strengths: [
      'AI veri merkezi inşası, yüksek performanslı ağ donanımına talebi artırıyor',
      'Splunk entegrasyonu güvenlik/veri analitiğinde büyüme ve marj katkısı sağlıyor',
      'Güçlü FCF ve düşük kaldıraç hissedar getirisi programını destekliyor',
    ],
    risks: [
      'Ağ donanımı pazarı yapısal olarak yavaş büyüyor, Arista gibi rakipler bulut/AI segmentinde pay kazanıyor',
      'Splunk entegrasyon riski (kültür, satış organizasyonu, ürün) beklenen sinerjinin gecikmesine yol açabilir',
      'Kurumsal BT harcamalarındaki döngüsel yavaşlamalara donanım geliri duyarlı kalıyor',
    ],
    verdict: 'İstikrarlı nakit akışı ve temettü verimi, düşük büyüme beklentisiyle makul biçimde fiyatlanmış görünüyor; yeniden değerleme için Splunk sinerjilerinin ve AI veri merkezi ağ talebinin somut büyüme ivmesine dönüşmesi gerekiyor.',
  },

  QCOM: {
    asOf: 'FY2024 (Eylül sonu biten mali yıl) verilerine dayalı, yaklaşık',
    segments: [
      { name: 'QCT — Yonga (Snapdragon mobil/otomotiv/IoT çipleri)', sharePct: 85, note: 'Android amiral gemisi telefonlara yoğun bağımlı' },
      { name: 'QTL — Lisanslama (patent/telif)', sharePct: 15, note: 'Çok yüksek marjlı, düşük sermaye gerektiren gelir' },
    ],
    competitors: ['MediaTek', 'Apple (kendi modem/çip geliştirmesi)', 'Samsung Exynos', 'Broadcom (bazı IoT/bağlantı alanlarında)'],
    moat: [
      { title: 'Modem/RF patent portföyü + lisanslama', desc: '5G ve öncesi hücresel teknolojilerdeki temel patentler, neredeyse tüm akıllı telefon üreticilerinden lisans geliri (QTL) sağlıyor — yasal olarak korunan, tekrarlayan bir gelir akışı.' },
      { title: 'Amiral gemisi Android çip performans liderliği', desc: 'Snapdragon, üst segment Android telefonlarda performans/güç verimliliğinde referans standart; üreticiler için değiştirme riski yüksek.' },
    ],
    strengths: [
      'QTL lisans geliri yüksek marjlı ve nispeten öngörülebilir',
      'Otomotiv ve IoT çeşitlendirmesi mobil bağımlılığını kademeli azaltıyor',
      'Güçlü bilanço ve FCF hissedar getirisini destekliyor',
    ],
    risks: [
      'Apple\'ın kendi modem çipine geçişi (kademeli) önemli bir müşteri/gelir kaybı riski taşıyor',
      'Çin\'de yerli çip üreticilerinin (özellikle orta segment) büyümesi rekabeti artırıyor',
      'Akıllı telefon pazarı olgunlaştı; büyüme büyük ölçüde otomotiv/IoT\'nin başarısına bağlı',
    ],
    verdict: 'Lisanslama gelirinin öngörülebilirliği ve otomotiv/IoT çeşitlendirmesi değerlemeyi makul kılıyor; Apple modem geçişinin gelir etkisi tam netleşene kadar bu, izlenmesi gereken en somut risk kalemi olmaya devam ediyor.',
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
    asOf: 'FY2024 yıllık rapor verilerine dayalı, yaklaşık',
    segments: [
      { name: 'Yazılım (Red Hat, otomasyon, veri/AI)', sharePct: 45, note: 'En yüksek marjlı, büyümenin ana kaynağı' },
      { name: 'Danışmanlık (Consulting)', sharePct: 30, note: 'Düşük marjlı, işgücü yoğun' },
      { name: 'Altyapı (mainframe — z Systems)', sharePct: 21, note: 'Döngüsel, ürün döngüsüne (z17 vb.) duyarlı' },
      { name: 'Finansman', sharePct: 4, note: 'Küçük, tamamlayıcı' },
    ],
    competitors: ['Microsoft', 'Accenture (danışmanlıkta)', 'SAP', 'Dell/HPE (mainframe alternatifleri)'],
    moat: [
      { title: 'Kritik kurumsal iş yükü kilitlenmesi (mainframe + Red Hat)', desc: 'Bankacılık/sigorta gibi sektörlerin en kritik işlem sistemleri hâlâ IBM mainframe üzerinde; bu iş yüklerini taşımak riskli ve maliyetli.' },
      { title: 'Hibrit bulut + danışmanlık paketlemesi', desc: 'Red Hat OpenShift + IBM Consulting\'in birlikte satışı, kurumların çoklu bulut stratejisini uçtan uca IBM ile kurmasını teşvik ediyor.' },
    ],
    strengths: [
      'Yazılım segmentinin büyüyen payı marj ve gelir kalitesini yapısal olarak iyileştiriyor',
      'Uzun temettü geçmişi (Dividend Aristocrat) gelir odaklı yatırımcı tabanını destekliyor',
      'watsonx (kurumsal AI) mevcut müşteri tabanına çapraz satış fırsatı sunuyor',
    ],
    risks: [
      'Danışmanlık segmenti düşük marjlı ve işgücü maliyeti enflasyonuna duyarlı',
      'Mainframe geliri ürün döngüsüne bağlı, döngüler arası belirgin dalgalanma yaratıyor',
      'Emeklilik yükümlülükleri ve borç yükü bilanço esnekliğini sınırlıyor',
    ],
    verdict: 'Yazılım ağırlıklı dönüşüm somut ilerliyor ve temettü verimiyle birlikte değerleme makul görünüyor; ancak danışmanlık/mainframe\'in düşük büyümesi, çarpanların önemli ölçüde genişlemesini sınırlıyor.',
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
    asOf: 'FY2024 yıllık rapor verilerine dayalı, yaklaşık',
    segments: [
      { name: 'Tüketici Bankacılığı', sharePct: 38, note: 'ABD\'nin en büyük şube ağlarından biri' },
      { name: 'Küresel Servet & Yatırım Yönetimi (Merrill/Private Bank)', sharePct: 21, note: 'Ücret ağırlıklı, istikrarlı' },
      { name: 'Küresel Bankacılık', sharePct: 20, note: 'Kurumsal kredi + yatırım bankacılığı' },
      { name: 'Küresel Piyasalar', sharePct: 21, note: 'Alım-satım/aracılık geliri, volatiliteye duyarlı' },
    ],
    competitors: ['JPMorgan Chase', 'Wells Fargo', 'Citigroup', 'Morgan Stanley (servet yönetiminde)'],
    moat: [
      { title: 'Geniş şube + dijital bankacılık ağı', desc: 'ABD\'nin en geniş şube ağlarından biriyle birlikte güçlü bir mobil/dijital bankacılık platformu, düşük maliyetli mevduat tabanını besliyor.' },
      { title: 'Merrill Lynch servet yönetimi franchise\'ı', desc: 'Merrill\'in danışman ağı ve marka gücü, yüksek net değerli müşteri segmentinde istikrarlı ücret geliri sağlıyor.' },
    ],
    strengths: [
      'Düşük maliyetli, geniş mevduat tabanı net faiz marjını destekliyor',
      'Merrill/servet yönetimi segmenti istikrarlı ücret geliri sağlıyor',
      'Verimlilik programları operasyonel kaldıraç yaratma potansiyeli taşıyor',
    ],
    risks: [
      'Tahvil portföyündeki gerçekleşmemiş zararlar, faiz oranı senaryolarına duyarlılığı artırıyor',
      'ROE\'nin JPM\'e göre görece düşük kalması değerleme priminde sürekli bir baskı unsuru',
      'Tüketici kredisi zarar oranlarında ekonomik yavaşlama riski',
    ],
    verdict: 'Defter değerine göre JPM\'e kıyasla daha ucuz işlem görmesi, ROE farkıyla büyük ölçüde açıklanabilir; verimlilik iyileşmesi ROE farkını kapatırsa değerleme iskontosu daralabilir, aksi hâlde mevcut iskonto gerekçeli kalır.',
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
    asOf: 'FY2024 yıllık rapor verilerine dayalı, yaklaşık',
    segments: [
      { name: 'Kurumsal Bankacılık (Institutional Securities)', sharePct: 42, note: 'Yatırım bankacılığı + alım-satım' },
      { name: 'Servet Yönetimi (Wealth Management)', sharePct: 44, note: 'E*Trade satın alması sonrası en büyük segment, öngörülebilir ücret geliri' },
      { name: 'Yatırım Yönetimi', sharePct: 14, note: 'Yönetilen varlık ücretleri' },
    ],
    competitors: ['Goldman Sachs', 'Merrill (Bank of America)', 'Charles Schwab (servet yönetiminde)', 'UBS'],
    moat: [
      { title: 'Servet yönetiminde ölçek + danışman ağı', desc: 'E*Trade ve geleneksel Morgan Stanley danışman ağının birleşimi, hem kitlesel hem yüksek net değerli müşteri segmentlerinde geniş bir dağıtım ağı yaratıyor.' },
      { title: 'Yatırım bankacılığında üst düzey ilişki franchise\'ı', desc: 'Büyük kurumsal M&A/sermaye piyasası işlemlerinde uzun süredir kurulu danışmanlık ilişkileri, tekrarlayan iş akışı sağlıyor.' },
    ],
    strengths: [
      'Servet Yönetimi\'nin büyüyen payı gelir öngörülebilirliğini ve ROE\'yi yapısal olarak iyileştirdi',
      'E*Trade entegrasyonu kitlesel/perakende yatırımcı segmentine erişim sağladı',
      'Güçlü sermaye pozisyonu döngüsel zayıflıklara karşı tampon oluşturuyor',
    ],
    risks: [
      'Kurumsal segment hâlâ sermaye piyasası döngüsüne (M&A/alım-satım hacmi) duyarlı',
      'Servet Yönetimi geliri piyasa değerlemelerine (yönetilen varlık büyüklüğü üzerinden ücret) bağlı — piyasa düşerse gelir de düşer',
      'E*Trade/Eaton Vance entegrasyon sinerjilerinin tam gerçekleşmesi zaman alabilir',
    ],
    verdict: 'Servet Yönetimi ağırlıklı dönüşüm, geleneksel yatırım bankasına göre daha istikrarlı bir kâr profili ve buna bağlı bir değerleme primi gerekçelendiriyor; asıl risk bu ücret gelirinin piyasa seviyelerine olan dolaylı bağımlılığı.',
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
    asOf: 'FY2024 yıllık rapor verilerine dayalı, yaklaşık',
    segments: [
      { name: 'ABD Tüketici Hizmetleri', sharePct: 40, note: 'Premium kart üyelik + harcama bazlı gelir' },
      { name: 'Ticari Hizmetler (kurumsal kart/harcama yönetimi)', sharePct: 24, note: 'İşletme müşterilerine odaklı' },
      { name: 'Uluslararası Kart Hizmetleri', sharePct: 17, note: 'Küresel genişleme odağı' },
      { name: 'Küresel Ticaret Hizmetleri (işyeri ağı)', sharePct: 19, note: 'İşyeri kabul komisyonları' },
    ],
    competitors: ['Visa/Mastercard (dolaylı — açık ağ modeli)', 'Chase Sapphire (JPMorgan)', 'Capital One'],
    moat: [
      { title: 'Kapalı döngü ağ + premium müşteri tabanı', desc: 'Amex hem kartı ihraç ediyor hem işlemi işliyor; bu da harcama verisine doğrudan erişim ve yüksek gelirli/yüksek harcamalı müşteri segmentinde derin bir konum sağlıyor.' },
      { title: 'Marka prestiji + üyelik ekosistemi', desc: 'Centurion/Platinum kart deneyimi (lounge, seyahat avantajları), yüksek yıllık aidatlara rağmen güçlü müşteri sadakati yaratıyor.' },
    ],
    strengths: [
      'Genç/yüksek gelirli müşteri segmentinde kart kazanımı güçlü seyrediyor',
      'Yüksek yıllık aidatlı premium kartlar hem ücret geliri hem marka konumlandırması sağlıyor',
      'Kapalı döngü model, harcama verisine dayalı hedeflenmiş pazarlama/ortaklık fırsatları sunuyor',
    ],
    risks: [
      'Kredi riskini kendisi taşıdığı için ekonomik yavaşlamada zarar oranları Visa/Mastercard\'a göre daha doğrudan etkileniyor',
      'İşyeri kabul ağı Visa/Mastercard\'a göre daha dar (özellikle küçük işletmelerde ve bazı ülkelerde)',
      'Premium kart pazarında banka rakiplerinin (Chase Sapphire vb.) agresif rekabeti',
    ],
    verdict: 'Premium müşteri tabanı ve marka gücü, Visa/Mastercard\'a göre daha düşük marjı kısmen telafi ediyor; asıl ayrışma noktası Amex\'in kredi riskini taşıması — ekonomik döngüye duyarlılığı bu nedenle yapısal olarak daha yüksek.',
  },

  UNH: {
    asOf: 'FY2024 yıllık rapor verilerine dayalı, yaklaşık',
    segments: [
      { name: 'UnitedHealthcare (sağlık sigortası)', sharePct: 74, note: 'Medicare Advantage, Medicaid, işveren/bireysel planlar' },
      { name: 'Optum (sağlık hizmetleri, eczane yönetimi, veri/analitik)', sharePct: 26, note: 'En hızlı büyüyen, dikey entegrasyon stratejisinin kalbi (gelirin bir kısmı UnitedHealthcare ile çakışır)' },
    ],
    competitors: ['CVS Health (Aetna)', 'Elevance Health', 'Cigna', 'Humana (Medicare Advantage\'da)'],
    moat: [
      { title: 'Ölçek + Optum dikey entegrasyonu', desc: 'Sigorta (ödeyen) ile sağlık hizmeti sunumunu (Optum — hekim grupları, eczane yönetimi) aynı çatı altında birleştirmesi, maliyet kontrolünde ve veri kullanımında saf sigortacılara göre yapısal bir avantaj sağlıyor.' },
      { title: 'Medicare Advantage\'da veri/ölçek liderliği', desc: 'En büyük Medicare Advantage üye tabanı, risk ayarlama ve maliyet yönetiminde biriken deneyim/veri avantajı yaratıyor.' },
    ],
    strengths: [
      'Optum, sigorta dışı gelir ve büyüme kaynağı sağlayarak iş modelini çeşitlendiriyor',
      'Medicare Advantage\'da demografik büyüme (yaşlanan nüfus) çok yıllı bir talep rüzgârı',
      'Devasa ölçek, maliyet/pazarlık gücünde rakiplere göre yapısal avantaj sağlıyor',
    ],
    risks: [
      'Tıbbi maliyet oranı (MLR) enflasyonu — özellikle Medicare Advantage\'da — marjı doğrudan baskılıyor',
      'Düzenleyici/siyasi risk yüksek: Medicare Advantage geri ödeme oranları, ilaç fiyatlandırma politikaları, olası "Medicare for All" tartışmaları',
      'Optum\'un hekim grubu satın almaları antitröst/düzenleyici incelemeye tabi',
    ],
    verdict: 'Ölçek ve Optum\'un dikey entegrasyonu uzun vadeli bir yapısal avantaj sunuyor, ama 2024\'teki maliyet oranı şoku değerlemenin tıbbi maliyet trendine ne kadar duyarlı olduğunu gösterdi — bu trend normalize olana kadar çarpanlar temkinli kalmalı.',
  },

  JNJ: {
    asOf: 'FY2024 yıllık rapor verilerine dayalı, yaklaşık (Kenvue ayrılması sonrası)',
    segments: [
      { name: 'İlaç (Innovative Medicine — onkoloji, immünoloji, nöroloji)', sharePct: 65, note: 'Ana büyüme motoru, patent bitişlerine (Stelara) duyarlı' },
      { name: 'Tıbbi Teknoloji (MedTech — cerrahi, ortopedi, kardiyovasküler)', sharePct: 35, note: 'İstikrarlı, demografik büyümeden faydalanıyor' },
    ],
    competitors: ['Pfizer', 'Merck', 'AbbVie', 'Medtronic/Stryker (MedTech\'te)'],
    moat: [
      { title: 'Geniş, çeşitlendirilmiş Ar-Ge portföyü', desc: 'Onlarca terapötik alanda eş zamanlı ilaç geliştirme, tek bir ilacın patent bitişi veya klinik başarısızlığının şirket genelini etkileme riskini azaltıyor.' },
      { title: 'MedTech dağıtım + cerrah ilişkileri', desc: 'Ortopedi/cerrahi cihazlarda cerrahlarla kurulu uzun vadeli eğitim/ilişki ağı, ürün değiştirme kararını klinik olarak riskli kılıyor.' },
    ],
    strengths: [
      '60+ yıllık kesintisiz temettü artışı, olağanüstü nakit akışı istikrarının kanıtı',
      'Onkoloji/immünoloji ilaç hattı güçlü büyüme kaynağı sağlıyor',
      'Kenvue ayrılması sonrası odaklanmış (ilaç + MedTech) portföy yönetim netliği getirdi',
    ],
    risks: [
      'Talk pudrası davalarına ilişkin büyük ölçekli hukuki yükümlülük belirsizliği devam ediyor',
      'Stelara gibi büyük ilaçların patent bitişi (biosimilar rekabeti) gelir kaybı yaratıyor',
      'ABD ilaç fiyatlandırma reformu (Medicare müzakere yetkisi) uzun vadeli fiyatlama gücünü sınırlayabilir',
    ],
    verdict: 'Defansif nakit akışı profili ve temettü geçmişi düşük volatiliteli bir değerleme primini gerekçelendiriyor; talk davaları belirsizliği çözülene kadar hisse üzerinde asılı bir risk primi olarak kalmaya devam edecek.',
  },

  LLY: {
    asOf: 'FY2024 yıllık rapor verilerine dayalı, yaklaşık',
    segments: [
      { name: 'Diyabet & obezite (Mounjaro/Zepbound — GLP-1 ilaçları)', sharePct: 40, note: 'Şirketin büyüme motoru, talep arzı aşıyor' },
      { name: 'Onkoloji', sharePct: 12, note: 'İstikrarlı büyüme' },
      { name: 'İmmünoloji', sharePct: 10, note: 'Orta ölçekli büyüme' },
      { name: 'Nöroloji + diğer (Alzheimer ilacı Kisunla dahil)', sharePct: 38, note: 'Kisunla gibi yeni onaylar erken aşamada' },
    ],
    competitors: ['Novo Nordisk (Ozempic/Wegovy)', 'Pfizer', 'AstraZeneca (onkoloji/diyabette)'],
    moat: [
      { title: 'GLP-1 pazarında erken/geniş ürün hattı', desc: 'Tirzepatide (Mounjaro/Zepbound) klinik verilerde rakip moleküllere göre üstün kilo kaybı sonuçları gösterdi; bu klinik fark reçeteleme tercihini destekliyor.' },
      { title: 'Üretim kapasitesi yatırım hızı', desc: 'Talep patlamasına rakiplerinden daha hızlı kapasite artırarak yanıt verme kabiliyeti, pazar payını korumada kritik bir operasyonel avantaj.' },
    ],
    strengths: [
      'GLP-1 pazarı (obezite + diyabet) önümüzdeki on yılın en büyük ilaç kategorilerinden biri olarak görülüyor',
      'Güçlü klinik veri + hızlı kapasite genişlemesi pazar payı liderliğini destekliyor',
      'Onkoloji ve Alzheimer (Kisunla) gibi ek büyüme vektörleri portföyü çeşitlendiriyor',
    ],
    risks: [
      'Değerleme, GLP-1 talebinin uzun yıllar yüksek kalacağı varsayımına aşırı duyarlı — rekabet (oral GLP-1, jenerik/biosimilar tehdidi uzun vadede) büyüme hızını yavaşlatabilir',
      'Üretim kapasitesi kısıtı kısa vadede gelir potansiyelini sınırlıyor',
      'Fiyatlandırma/geri ödeme baskısı (ABD sağlık sigortası kapsamı tartışmaları) talep büyümesini etkileyebilir',
    ],
    verdict: 'GLP-1 franchise\'ının büyüklüğü ve klinik üstünlüğü mevcut yüksek çarpanları kısmen destekliyor, ama fiyatlama zaten çok iyimser bir uzun vadeli talep/rekabet senaryosunu varsayıyor — beklenmedik bir rekabet veya fiyatlandırma şoku değerlemeyi hızla düzeltebilir.',
  },

  MRK: {
    asOf: 'FY2024 yıllık rapor verilerine dayalı, yaklaşık',
    segments: [
      { name: 'Keytruda (onkoloji — bağışıklık tedavisi)', sharePct: 45, note: 'Tek bir ilaca aşırı yoğunlaşma, 2028 civarı patent bitişi kritik risk' },
      { name: 'Diğer ilaçlar (kardiyovasküler, aşılar dahil)', sharePct: 40, note: 'Gardasil (HPV aşısı) dahil çeşitlendirilmiş portföy' },
      { name: 'Hayvan Sağlığı', sharePct: 15, note: 'İstikrarlı, döngüsel değil' },
    ],
    competitors: ['Bristol-Myers Squibb (Opdivo)', 'Roche', 'AstraZeneca', 'Pfizer (aşılarda)'],
    moat: [
      { title: 'Keytruda\'nın onkolojide geniş endikasyon yelpazesi', desc: 'Keytruda, düzinelerce kanser türünde onaylı — bu geniş klinik kanıt tabanı, onkologların ilk tercihi olmasını sağlıyor ve rakiplerin dar endikasyonlu ürünlerine karşı avantaj yaratıyor.' },
      { title: 'Aşı üretim/dağıtım ölçeği (Gardasil)', desc: 'Küresel aşı üretim kapasitesi ve düzenleyici onay geçmişi, yeni girenlerin kısa vadede eşleyemeyeceği bir bariyer oluşturuyor.' },
    ],
    strengths: [
      'Keytruda hâlâ güçlü büyüyor ve yeni endikasyonlar eklemeye devam ediyor',
      'Hayvan Sağlığı segmenti istikrarlı, döngüsel olmayan bir gelir tabanı sağlıyor',
      'Güçlü FCF, patent bitişi sonrası büyümeyi finanse edecek satın alma kapasitesi veriyor',
    ],
    risks: [
      'Keytruda\'nın gelirin ~%45\'ini oluşturması ve 2028 civarı ana patentin bitmesi en büyük tekil risk — biosimilar/jenerik rekabeti sert bir gelir düşüşü yaratabilir',
      'Gardasil\'de Çin talebi zayıflığı, uluslararası pazarlardaki kırılganlığı gösterdi',
      'Ar-Ge\'nin Keytruda\'nın yerini dolduracak yeni bir "blockbuster" bulma başarısı belirsiz',
    ],
    verdict: 'Mevcut kârlılık güçlü olsa da, Keytruda\'nın patent bitişine giden süreçte değerleme, şirketin bu geliri ikame edecek yeni ilaç/satın alma başarısına giderek daha fazla bağımlı hale geliyor — bu "patent uçurumu" riski çarpanları yapısal olarak sınırlıyor.',
  },

  ABBV: {
    asOf: 'FY2024 yıllık rapor verilerine dayalı, yaklaşık',
    segments: [
      { name: 'İmmünoloji (Skyrizi, Rinvoq — Humira sonrası yeni nesil)', sharePct: 42, note: 'Humira\'nın yerini başarıyla dolduran ana büyüme motoru' },
      { name: 'Onkoloji', sharePct: 12, note: 'İstikrarlı büyüme' },
      { name: 'Nöroloji (Botox terapötik dahil)', sharePct: 15, note: 'Çeşitlendirilmiş büyüme kaynağı' },
      { name: 'Estetik (Botox Cosmetic, Juvederm)', sharePct: 12, note: 'Tüketici harcamasına duyarlı' },
      { name: 'Diğer (göz sağlığı, viroloji vb.)', sharePct: 19, note: 'Tamamlayıcı' },
    ],
    competitors: ['Johnson & Johnson', 'Pfizer', 'Amgen (immünolojide)', 'Eli Lilly (nörolojide kısmen)'],
    moat: [
      { title: 'İmmünoloji franchise geçiş başarısı', desc: 'Humira\'nın patent bitişi sonrası gelirin Skyrizi/Rinvoq\'a başarıyla taşınması, AbbVie\'nin Ar-Ge ve ticarileştirme yeteneğinin somut kanıtı — sektörde nadir görülen bir "patent uçurumu" atlatma örneği.' },
      { title: 'Botox\'ta hem terapötik hem estetik ikili franchise', desc: 'Botox\'un hem tıbbi (migren, kas spazmı) hem estetik kullanım onayları, tek bir ürün üzerinden iki farklı büyüme kanalı ve yüksek marka bağlılığı sağlıyor.' },
    ],
    strengths: [
      'Skyrizi/Rinvoq, Humira\'nın kaybını başarıyla telafi etti ve büyümeyi sürdürüyor',
      'Yüksek ve istikrarlı temettü verimi gelir odaklı yatırımcı tabanını destekliyor',
      'Çeşitlendirilmiş terapötik alan portföyü (immünoloji, onkoloji, nöroloji, estetik) tek ürün riskini azaltıyor',
    ],
    risks: [
      'Skyrizi/Rinvoq da bir gün patent koruması bitecek — uzun vadede yeni bir "patent uçurumu" döngüsü kaçınılmaz',
      'Allergan satın alması mirası borç yükü faiz oranı ortamına duyarlılık yaratıyor',
      'Estetik segment (Botox Cosmetic) tüketici harcaması döngüsüne duyarlı',
    ],
    verdict: 'Humira sonrası geçişin başarıyla yönetilmesi değerlemeyi somut biçimde destekliyor; yüksek temettü verimi getiri arayan yatırımcılar için cazip, ama uzun vadeli tez Ar-Ge boru hattının Skyrizi/Rinvoq\'un bir sonraki patent bitişini de aynı başarıyla yönetip yönetemeyeceğine bağlı.',
  },

  PFE: {
    asOf: 'FY2024 yıllık rapor verilerine dayalı, yaklaşık',
    segments: [
      { name: 'İç hastalıkları, onkoloji, aşılar, hastane ürünleri (biyofarma çekirdek)', sharePct: 90, note: 'Comirnaty (Covid aşısı) ve Paxlovid geliri normalleşme sonrası küçüldü' },
      { name: 'Seagen (onkoloji — antikor-ilaç konjugatları)', sharePct: 10, note: '2023 satın alması, onkoloji büyüme motoru olması hedefleniyor' },
    ],
    competitors: ['Merck', 'Johnson & Johnson', 'AstraZeneca', 'Moderna (aşılarda)'],
    moat: [
      { title: 'Geniş ticarileştirme + dağıtım altyapısı', desc: 'Covid aşısı sürecinde kanıtlanan küresel üretim/dağıtım kapasitesi, yeni ürünlerin (Seagen onkoloji portföyü dahil) hızla ticarileştirilmesinde kullanılabiliyor.' },
      { title: 'Çeşitlendirilmiş terapötik alan portföyü', desc: 'Onkolojiden aşılara, iç hastalıklarına kadar geniş bir ürün yelpazesi, tek bir terapötik alandaki başarısızlığın etkisini sınırlıyor.' },
    ],
    strengths: [
      'Seagen satın alması onkolojide güçlü, farklılaşmış bir teknoloji platformu (ADC) kazandırdı',
      'Maliyet tasarrufu programı marj toparlanmasını destekliyor',
      'Geniş Ar-Ge boru hattı çok sayıda potansiyel katalizör sunuyor',
    ],
    risks: [
      'Covid ürünleri sonrası gelir/kârlılık normalleşmesi yatırımcı güvenini sarstı, toparlanma hızı belirsiz',
      'Seagen satın alması sonrası yüksek borç yükü faiz oranı riskine duyarlılığı artırıyor',
      'Yaklaşan patent bitişleri (çeşitli ürünlerde) 2025-2030 döneminde ek gelir kaybı riski taşıyor',
    ],
    verdict: 'Düşük değerleme çarpanı ve yüksek temettü verimi, Covid sonrası belirsizliği ve yüksek borcu büyük ölçüde fiyatlıyor; toparlanma tezi Seagen\'in onkoloji katkısının ve maliyet programının somut biçimde kanıtlanmasına bağlı.',
  },

  PG: {
    asOf: 'FY2024 (Haziran sonu biten mali yıl) verilerine dayalı, yaklaşık',
    segments: [
      { name: 'Güzellik + Sağlık Bakımı', sharePct: 30, note: 'Pantene, Olay, Oral-B, Vicks' },
      { name: 'Kumaş & Ev Bakımı', sharePct: 33, note: 'Tide, Ariel, Downy — en büyük segment' },
      { name: 'Bebek, Kadın & Aile Bakımı', sharePct: 24, note: 'Pampers, Always' },
      { name: 'Tıraş Ürünleri (Grooming)', sharePct: 8, note: 'Gillette' },
    ],
    competitors: ['Unilever', 'Colgate-Palmolive', 'Kimberly-Clark', 'Reckitt Benckiser'],
    moat: [
      { title: 'Portföy genelinde güçlü marka liderliği', desc: 'Tide, Pampers, Gillette gibi kategorilerinde onlarca yıldır pazar lideri markalar, market raflarında ve tüketici zihninde zor kırılan bir konum sağlıyor.' },
      { title: 'Ölçek + Ar-Ge/pazarlama yatırım gücü', desc: 'Yıllık milyarlarca dolarlık Ar-Ge ve pazarlama bütçesi, küçük/bölgesel rakiplerin eşleyemeyeceği ürün inovasyonu ve marka bilinirliği yaratıyor.' },
    ],
    strengths: [
      'Fiyatlama gücü, enflasyon dönemlerinde marjı korumada defalarca kanıtlandı',
      '60+ yıllık kesintisiz temettü artışı olağanüstü nakit akışı istikrarının göstergesi',
      'Geniş coğrafi ve kategori çeşitlendirmesi tek pazar/kategori riskini azaltıyor',
    ],
    risks: [
      'Özel marka (private label) rekabeti, özellikle ekonomik yavaşlama dönemlerinde fiyata duyarlı tüketicileri çekebiliyor',
      'Hammadde (petrokimya bazlı) maliyet dalgalanmaları marjı kısa vadede etkileyebilir',
      'Gelişen pazarlarda yerel/düşük maliyetli rakiplerin payı artıyor',
    ],
    verdict: 'İstikrarlı, öngörülebilir nakit akışı ve fiyatlama gücü, düşük büyümeye rağmen savunmacı bir değerleme primini gerekçelendiriyor; bu bir büyüme hikâyesi değil, istikrar/temettü hikâyesi olarak değerlendirilmeli.',
  },

  KO: {
    asOf: 'FY2024 yıllık rapor verilerine dayalı, yaklaşık',
    segments: [
      { name: 'Gazlı içecekler (Coca-Cola, Sprite, Fanta)', sharePct: 65, note: 'Ana gelir kaynağı, küresel dağıtım ağıyla destekleniyor' },
      { name: 'Su, spor içeceği, kahve/çay, meyve suyu vb.', sharePct: 35, note: 'Sağlık trendine yanıt olarak büyüyen çeşitlendirme' },
    ],
    competitors: ['PepsiCo', 'Keurig Dr Pepper', 'Nestlé (su/kahvede)', 'Yerel/bölgesel içecek markaları'],
    moat: [
      { title: 'Küresel marka + dağıtım ağı', desc: 'Dünyanın en değerli markalarından biri olarak neredeyse her ülkede bulunabilirlik ve tüketici zihninde "kategori = marka" düzeyinde bir konum sağlıyor.' },
      { title: 'Şişeleme ortaklığı (asset-light) modeli', desc: 'Sermaye yoğun şişeleme/dağıtım operasyonlarını bağımsız şişeleme ortaklarına devretmesi, düşük sermaye yoğunluğuyla yüksek marj ve ölçeklenebilirlik sağlıyor.' },
    ],
    strengths: [
      'Küresel marka bilinirliği ve dağıtım ağı gelişen pazarlarda büyüme fırsatı sunuyor',
      'Ürün portföyü çeşitlendirmesi (su, kahve, enerji içeceği) sağlık trendine uyum sağlıyor',
      '60+ yıllık kesintisiz temettü artışı olağanüstü nakit istikrarının kanıtı',
    ],
    risks: [
      'Şekerli içeceklere yönelik sağlık bilinci ve düzenleyici baskı (şeker vergisi vb.) uzun vadeli talep riski taşıyor',
      'Güçlü dolar, uluslararası gelirin (gelirin çoğu ABD dışından) raporlanan büyümesini baskılayabilir',
      'Hammadde (şeker, alüminyum, PET) maliyet dalgalanmaları marjı etkileyebilir',
    ],
    verdict: 'İstikrarlı nakit akışı, küresel marka gücü ve temettü geçmişi savunmacı bir değerleme primini gerekçelendiriyor; büyüme beklentisi düşük olduğu için bu öncelikle bir gelir/istikrar yatırımı olarak görülmeli, yüksek büyüme beklentisiyle değil.',
  },

  PEP: {
    asOf: 'FY2024 yıllık rapor verilerine dayalı, yaklaşık',
    segments: [
      { name: 'PepsiCo Beverages (Pepsi, Gatorade, Aquafina)', sharePct: 42, note: 'Coca-Cola\'nın aksine Pepsi\'nin gelirinin azınlığı' },
      { name: 'Frito-Lay (cips/atıştırmalık — ABD ağırlıklı)', sharePct: 27, note: 'En yüksek marjlı, en güçlü segment' },
      { name: 'Quaker Foods + uluslararası gıda/içecek', sharePct: 31, note: 'Çeşitlendirilmiş küresel gıda portföyü' },
    ],
    competitors: ['Coca-Cola', 'Mondelez (atıştırmalıkta)', 'Keurig Dr Pepper', 'Nestlé'],
    moat: [
      { title: 'Frito-Lay atıştırmalık kategorisinde liderlik', desc: 'Lay\'s, Doritos, Cheetos gibi markalar ABD atıştırmalık pazarında ezici bir raf/marka payına sahip; bu kategori içecekten farklı olarak özel markaya karşı daha dirençli.' },
      { title: 'İçecek + atıştırmalık birleşik dağıtım gücü', desc: 'Perakendecilerle içecek ve atıştırmalığı birlikte müzakere edebilme (kategori yönetimi) gücü, raf alanı ve promosyon önceliğinde avantaj sağlıyor.' },
    ],
    strengths: [
      'Frito-Lay, atıştırmalık kategorisinde olağanüstü fiyatlama gücüne ve marka sadakatine sahip',
      'İçecek + gıda çeşitlendirmesi tek kategori riskini Coca-Cola\'ya göre azaltıyor',
      '50+ yıllık kesintisiz temettü artışı nakit istikrarının kanıtı',
    ],
    risks: [
      'GLP-1 ilaçlarının (iştah azaltıcı etki) yüksek kalorili atıştırmalık talebini uzun vadede etkileme riski tartışılıyor',
      'Sağlıklı beslenme trendi ve ultra işlenmiş gıda karşıtı düzenleyici baskı (özellikle ABD\'de) artıyor',
      'Hacim büyümesi son dönemde fiyat artışlarına göre zayıf kaldı — fiyat/hacim dengesi izlenmeli',
    ],
    verdict: 'Frito-Lay\'in kategori liderliği ve temettü istikrarı değerlemeyi destekliyor; GLP-1 ilaçlarının atıştırmalık talebi üzerindeki uzun vadeli etkisi henüz belirsiz olsa da, piyasanın bu riski bir miktar fiyatlamaya başladığı görülüyor.',
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
    asOf: 'FY2024 (Eylül sonu biten mali yıl) verilerine dayalı, yaklaşık',
    segments: [
      { name: 'Mal satışı (merchandise)', sharePct: 97, note: 'Çok düşük marjlı, hacim/üye çekme amaçlı' },
      { name: 'Üyelik ücretleri', sharePct: 3, note: 'Küçük payına rağmen kârın çok büyük kısmını oluşturuyor — iş modelinin özü' },
    ],
    competitors: ['Walmart (Sam\'s Club)', 'BJ\'s Wholesale', 'Target'],
    moat: [
      { title: 'Üyelik ücreti modeli + olağanüstü elde tutma', desc: 'Üyelik yenileme oranı %90\'ın üzerinde seyrediyor; bu tekrarlayan, yüksek marjlı gelir akışı fiziksel perakendede benzersiz bir iş modeli avantajı yaratıyor.' },
      { title: 'Sınırlı SKU + büyük hacim satın alma gücü', desc: 'Mağaza başına çok az sayıda ürün çeşidi (rakiplerin onda biri kadar) ile devasa hacimlerde alım yapması, birim maliyette rakiplerin ulaşamayacağı bir avantaj sağlıyor.' },
    ],
    strengths: [
      'Üyelik yenileme oranı ve üye başına harcama sürekli artıyor',
      'Düşük fiyat + yüksek kalite algısı müşteri sadakatini güçlendiriyor',
      'Uluslararası genişleme (özellikle Asya) uzun vadeli büyüme alanı sunuyor',
    ],
    risks: [
      'İş modeli düşük marj üzerine kurulu; operasyonel verimlilikte küçük bir bozulma kâra orantısız yansır',
      'Üyelik ücreti artışlarına karşı üye tepkisi (churn) riski her zaman mevcut',
      'E-ticaret rekabeti (Amazon) toptan satış modelinin bazı kategorilerde çekiciliğini azaltabilir',
    ],
    verdict: 'Değerleme çarpanı (F/K) perakende sektörüne göre yüksek görünse de, üyelik modelinin öngörülebilirliği ve olağanüstü elde tutma oranı bunu büyük ölçüde gerekçelendiriyor; risk, bu büyüme/elde tutma performansının küçük bir bozulmasının bile primi hızla daraltabilecek olması.',
  },

  HD: {
    asOf: 'FY2024 (Ocak sonu biten mali yıl) verilerine dayalı, yaklaşık',
    segments: [
      { name: 'Yapı market perakendesi (DIY tüketici)', sharePct: 55, note: 'Ev sahibi tadilat/bakım harcamasına bağlı' },
      { name: 'Profesyonel (Pro) müşteri segmenti (SRS Distribution dahil)', sharePct: 45, note: 'Müteahhit/profesyonel odaklı, stratejik büyüme alanı' },
    ],
    competitors: ["Lowe's", 'Menards', 'Ferguson (profesyonel segmentte)', 'Amazon (bazı kategorilerde)'],
    moat: [
      { title: 'Profesyonel (Pro) müşteri ilişkisi + tedarik ağı', desc: 'Müteahhitlere özel kredi, toplu fiyatlandırma ve şantiye teslimat hizmetleri, profesyonel segmentte DIY perakendecilerin kolayca kopyalayamayacağı bir bağımlılık yaratıyor.' },
      { title: 'Mağaza yoğunluğu + hızlı teslimat ağı', desc: 'Geniş mağaza ağı, aynı gün/ertesi gün teslimat için dağıtım merkezi işlevi görüyor — büyük ve hacimli yapı malzemelerinde e-ticarete karşı doğal bir avantaj.' },
    ],
    strengths: [
      'SRS Distribution satın alması profesyonel/çatı-peyzaj segmentinde büyüme ekliyor',
      'Ev sahiplerinin yaşlanan konut stoku uzun vadeli tadilat talebini destekliyor',
      'Güçlü marka ve mağaza yoğunluğu pazar liderliğini koruyor',
    ],
    risks: [
      'Yüksek faiz oranları ve konut piyasası yavaşlaması büyük tadilat projelerini erteletebiliyor',
      'Profesyonel segmente genişleme entegrasyon ve rekabet riski taşıyor (Ferguson gibi uzman dağıtıcılara karşı)',
      'Tüketici harcamasındaki genel bir yavaşlama isteğe bağlı (discretionary) tadilat harcamasını ilk etkileyen kalemlerden',
    ],
    verdict: 'Faiz oranı çevriminin ev tadilat talebini normalleştirmesiyle birlikte büyüme toparlanması bekleniyor; SRS ile profesyonel segmente genişleme tez\'in yeni ayağı — bu segmentin entegrasyon başarısı değerlemenin gerekçesini güçlendirecek asıl kalem.',
  },

  MCD: {
    asOf: 'FY2024 yıllık rapor verilerine dayalı, yaklaşık',
    segments: [
      { name: 'ABD', sharePct: 30, note: 'En yüksek marjlı, franchise ağırlıklı pazar' },
      { name: 'Uluslararası İşletilen Pazarlar (Fransa, Almanya, İngiltere, Kanada, Avustralya)', sharePct: 30, note: 'Olgun, istikrarlı pazarlar' },
      { name: 'Uluslararası Geliştirmeli Lisanslı Pazarlar (Çin, Japonya, gelişen pazarlar)', sharePct: 25, note: 'En hızlı büyüyen segment' },
      { name: 'Kurumsal + diğer', sharePct: 15, note: 'Tamamlayıcı' },
    ],
    competitors: ['Yum! Brands (KFC/Taco Bell/Pizza Hut)', 'Restaurant Brands International (Burger King)', 'Chick-fil-A', 'Yerel hızlı yemek zincirleri'],
    moat: [
      { title: 'Franchise + emlak modeli', desc: 'McDonald\'s çoğu restoranın arazisini/binasını sahiplenip franchise sahiplerine kiralıyor — bu hem istikrarlı kira geliri hem de franchise sahibinin markaya bağımlılığını artıran bir yapı yaratıyor.' },
      { title: 'Küresel marka + tedarik zinciri ölçeği', desc: 'Dünyanın en tanınan marka varlıklarından biri ve devasa tedarik zinciri ölçeği, yeni pazarlara girişte ve maliyet kontrolünde rakiplerin ulaşamayacağı bir avantaj sağlıyor.' },
    ],
    strengths: [
      'Franchise ağırlıklı model düşük sermaye yoğunluğuyla çok yüksek ve istikrarlı marj üretiyor',
      'Küresel marka gücü, yeni pazarlarda hızlı restoran açılışını kolaylaştırıyor',
      'Değer menüsü ve dijital/sadakat programı (uygulama) fiyata duyarlı dönemlerde trafik koruyor',
    ],
    risks: [
      'Düşük gelirli tüketici segmentinde fiyata duyarlılık artışı trafiği baskılayabiliyor (2024\'te gözlemlendi)',
      'Sağlıklı beslenme trendi ve gıda maliyeti enflasyonu marjı uzun vadede etkileyebilir',
      'Bazı uluslararası pazarlarda jeopolitik/boykot riski (Orta Doğu\'daki örnekler gibi) gelire yansıyabiliyor',
    ],
    verdict: 'Franchise modelinin istikrarlı, öngörülebilir nakit akışı savunmacı bir değerleme primini gerekçelendiriyor; 2024\'teki trafik zayıflığı fiyata duyarlı tüketici segmentinde gerçek bir baskı olduğunu gösterdi — değer menüsü stratejisinin bunu ne kadar telafi ettiği izlenmeli.',
  },

  NKE: {
    asOf: 'FY2024 (Mayıs sonu biten mali yıl) verilerine dayalı, yaklaşık',
    segments: [
      { name: 'Ayakkabı', sharePct: 64, note: 'Ana kategori, marka gücünün merkezi' },
      { name: 'Giyim', sharePct: 28, note: 'Ayakkabıyla birlikte çapraz satılıyor' },
      { name: 'Ekipman + diğer', sharePct: 8, note: 'Küçük tamamlayıcı kategori' },
    ],
    competitors: ['Adidas', 'On Running', 'Hoka (Deckers)', 'Lululemon', 'New Balance'],
    moat: [
      { title: 'Marka gücü + sporcu/kültür ortaklıkları', desc: 'Onlarca yıllık üst düzey sporcu (Jordan, LeBron vb.) ve kültürel ortaklıklar, ayakkabı/giyimde rakiplerin kısa vadede eşleyemeyeceği bir marka değeri yaratmış durumda.' },
      { title: 'Ölçek + tasarım/inovasyon Ar-Gesi', desc: 'Yıllık büyük Ar-Ge bütçesi (Air, Zoom, React teknolojileri) ve küresel üretim/tedarik zinciri ölçeği, ürün inovasyon hızında avantaj sağlıyor.' },
    ],
    strengths: [
      'Marka değeri hâlâ sektörün en güçlülerinden, uzun vadeli sadakat tabanı büyük',
      'Yeni CEO yönetiminde toptan kanalına (perakende ortaklarına) yeniden odaklanma stratejisi başladı',
      'Küresel ölçek ve tedarik zinciri esnekliği rakiplere göre maliyet avantajı sağlıyor',
    ],
    risks: [
      'On, Hoka gibi butik/niş markaların hızlı büyümesi genç tüketici segmentinde pay çalıyor',
      'DTC stratejisinin geri alınması (toptan kanalına dönüş) kısa vadede marj/kontrol dengesini karmaşıklaştırabilir',
      'Çin pazarında yerel markaların (Anta, Li-Ning) rekabeti artıyor',
    ],
    verdict: 'Mevcut düşük çarpanlar büyüme/marj sorununu büyük ölçüde fiyatlıyor; yeni yönetimin toparlanma stratejisi (toptan kanalına dönüş, ürün inovasyonu) somut sonuç vermeye başlarsa değerleme yukarı yönlü yeniden fiyatlanabilir, ama bu henüz kanıtlanmadı.',
  },

  DIS: {
    asOf: 'FY2024 (Eylül sonu biten mali yıl) verilerine dayalı, yaklaşık',
    segments: [
      { name: 'Deneyimler (Parklar, Deneyimler & Ürünler)', sharePct: 37, note: 'En yüksek marjlı, en istikrarlı segment' },
      { name: 'Doğrudan Tüketiciye (DTC — Disney+, Hulu, ESPN+)', sharePct: 23, note: 'Zarardan kâra geçti, stratejik odak' },
      { name: 'Linear (geleneksel TV ağları — ABC, ESPN, Kablo)', sharePct: 27, note: 'Yapısal olarak küçülen "cord-cutting" etkisinde' },
      { name: 'İçerik satışı/lisanslama', sharePct: 13, note: 'Stüdyo (film) geliri' },
    ],
    competitors: ['Netflix', 'Warner Bros Discovery (Max)', 'Comcast/NBCUniversal (Peacock)', 'Universal Parks (Comcast)'],
    moat: [
      { title: 'Eşsiz IP portföyü (Marvel, Star Wars, Pixar, Disney klasikleri)', desc: 'Onlarca yıldır biriken, nesiller boyu aktarılan içerik/IP varlığı, parklardan oyuncaklara, film franchise\'larına kadar çapraz para kazanma (monetization) imkânı sağlıyor — rakiplerin yeniden yaratamayacağı bir varlık.' },
      { title: 'Tema parkı ölçeği + deneyim ekonomisi', desc: 'Dünya çapında tema parkı ve gemi turizmi altyapısı, yüksek sermaye bariyeri nedeniyle yeni rakiplerin kolayca giremeyeceği bir iş kolu — aynı zamanda IP\'yi fiziksel deneyime dönüştürerek marka bağlılığını derinleştiriyor.' },
    ],
    strengths: [
      'DTC segmentinin kâra geçmesi büyük bir dönüm noktası, marj toparlanmasını hızlandırıyor',
      'Deneyimler (parklar) segmenti istikrarlı, yüksek marjlı bir nakit çapa görevi görüyor',
      'IP portföyünün genişliği (Marvel, Star Wars, Pixar) çok kanallı içerik hattı sağlıyor',
    ],
    risks: [
      'Linear TV (kablo ağları) yapısal olarak küçülmeye devam ediyor, bu segmentin hızlı çöküşü konsolide sonuçları baskılayabilir',
      'Streaming pazarında içerik maliyeti rekabeti (Netflix, Amazon) marjı sınırlıyor',
      'Parklar segmenti tüketici harcaması/seyahat döngüsüne duyarlı',
    ],
    verdict: 'DTC\'nin kâra dönmesi ve Deneyimler segmentinin istikrarı değerleme toparlanmasını destekliyor; asıl yapısal soru Linear TV\'nin küçülme hızının DTC/Parklar büyümesiyle ne kadar süre dengelenebileceği.',
  },

  XOM: {
    asOf: 'FY2024 yıllık rapor verilerine dayalı, yaklaşık',
    segments: [
      { name: 'Yukarı Akış (Upstream — arama/üretim)', sharePct: 55, note: 'Ham petrol/doğalgaz fiyatlarına doğrudan bağlı, Guyana ve Permian havzası büyüme motoru' },
      { name: 'Ürün Çözümleri (rafinaj + kimyasallar, Pioneer sonrası entegre)', sharePct: 45, note: 'Rafinaj marjına bağlı, upstream\'e göre daha istikrarlı' },
    ],
    competitors: ['Chevron', 'Shell', 'BP', 'ConocoPhillips'],
    moat: [
      { title: 'Düşük maliyetli, ölçekli üretim varlıkları (Permian + Guyana)', desc: 'Pioneer satın alması sonrası Permian havzasındaki devasa ölçek ve Guyana\'daki düşük maliyetli yeni üretim, sektörün en düşük başabaş maliyetli varlık portföylerinden birini yaratıyor.' },
      { title: 'Dikey entegrasyon (upstream + rafinaj + kimyasal)', desc: 'Ham petrolden nihai ürüne uzanan entegre yapı, tek bir segmentteki fiyat şokunun etkisini kısmen içeride dengeleyebiliyor.' },
    ],
    strengths: [
      'Sektörün en güçlü/en düşük kaldıraçlı bilançosu, döngüsel dayanıklılık sağlıyor',
      'Pioneer satın alması Permian\'da ölçek ve maliyet liderliğini pekiştirdi',
      'Guyana\'daki düşük maliyetli yeni üretim çok yıllı büyüme kaynağı sunuyor',
    ],
    risks: [
      'Gelir ve kârlılık büyük ölçüde petrol/gaz fiyatlarının kontrolü dışındaki küresel arz-talep dinamiklerine bağlı',
      'Enerji geçişi (elektrikli araçlar, yenilenebilir enerji) uzun vadede fosil yakıt talebini yapısal olarak azaltma riski taşıyor',
      'Karbon/iklim düzenlemeleri ve ESG baskısı sermaye maliyetini ve yatırımcı tabanını etkileyebiliyor',
    ],
    verdict: 'Güçlü bilanço ve düşük maliyetli üretim varlıkları, mevcut petrol fiyat ortamında değerlemeyi gerekçelendiriyor; bu doğası gereği döngüsel bir iştir — değerleme mevcut emtia fiyat seviyesinin sürdürülebilirliğine duyarlı olarak okunmalı, kalıcı bir büyüme çarpanı olarak değil.',
  },

  CVX: {
    asOf: 'FY2024 yıllık rapor verilerine dayalı, yaklaşık',
    segments: [
      { name: 'Yukarı Akış (Upstream)', sharePct: 60, note: 'Permian havzası ve uluslararası (Kazakistan, Avustralya LNG) üretim ağırlıklı' },
      { name: 'Aşağı Akış (Downstream — rafinaj/pazarlama)', sharePct: 40, note: 'Rafinaj marjına bağlı' },
    ],
    competitors: ['ExxonMobil', 'Shell', 'ConocoPhillips', 'BP'],
    moat: [
      { title: 'Permian havzasında düşük maliyetli, ölçekli üretim', desc: 'Sektörün en düşük başabaş maliyetli üretim havzalarından birinde geniş arazi/üretim varlığı, düşük petrol fiyatı dönemlerinde bile kârlılığı koruyabiliyor.' },
      { title: 'Disiplinli sermaye tahsisi geçmişi', desc: 'Yönetimin döngüsel yukarı dönemlerde aşırı yatırımdan kaçınıp temettü/geri alıma öncelik verme disiplini, sektörde nadir görülen bir tutarlılık sağlıyor.' },
    ],
    strengths: [
      'Permian havzasındaki düşük maliyetli üretim döngüsel dayanıklılık sağlıyor',
      'Hess satın alması tamamlanırsa Guyana\'daki dünyanın en hızlı büyüyen düşük maliyetli üretimine erişim kazanılacak',
      'Uzun temettü artış geçmişi (Dividend Aristocrat) gelir odaklı yatırımcı tabanını destekliyor',
    ],
    risks: [
      'Gelir/kârlılık petrol-gaz fiyatlarındaki küresel dalgalanmalara doğrudan bağlı',
      'Hess satın alması Exxon-Guyana ortaklığından kaynaklanan bir tahkim süreciyle (ön alım hakkı iddiası) hukuki belirsizlik taşıyor',
      'Enerji geçişi uzun vadede fosil yakıt talebini yapısal olarak azaltma riski taşıyor',
    ],
    verdict: 'Düşük maliyetli üretim varlıkları ve disiplinli sermaye yönetimi mevcut fiyat ortamında değerlemeyi destekliyor; Hess satın almasının hukuki belirsizliği ve genel emtia fiyat döngüsü, tezin en büyük iki değişken kalemi olarak izlenmeli.',
  },

  BA: {
    asOf: 'FY2024 yıllık rapor verilerine dayalı, yaklaşık',
    segments: [
      { name: 'Ticari Uçaklar (BCA)', sharePct: 39, note: '737 MAX üretim/teslimat sorunları nedeniyle en sorunlu segment' },
      { name: 'Savunma, Uzay & Güvenlik (BDS)', sharePct: 34, note: 'Sabit fiyatlı savunma sözleşmelerinde zarar üretiyor' },
      { name: 'Küresel Hizmetler (BGS — bakım/yedek parça)', sharePct: 27, note: 'En istikrarlı, en yüksek marjlı segment' },
    ],
    competitors: ['Airbus', 'Lockheed Martin/Northrop Grumman/RTX (savunmada)', 'Embraer (bölgesel uçaklarda)'],
    moat: [
      { title: 'Duopol pazar yapısı (Airbus ile)', desc: 'Geniş gövdeli/dar gövdeli ticari uçak pazarı fiilen sadece Boeing ve Airbus arasında paylaşılıyor — devasa sermaye/düzenleyici bariyerler nedeniyle yeni bir rakibin kısa-orta vadede girmesi neredeyse imkânsız.' },
      { title: 'Kurulu filo + yedek parça/bakım geliri', desc: 'Dünya çapında uçuşta olan binlerce Boeing uçağı, onlarca yıl sürecek yüksek marjlı yedek parça ve bakım geliri (BGS segmenti) yaratıyor — bu, üretim sorunlarından bağımsız bir nakit akışı kaynağı.' },
    ],
    strengths: [
      'Duopol pazar yapısı uzun vadeli talep güvenliği sağlıyor — sipariş defteri (backlog) yıllara yayılı dolu',
      'Küresel Hizmetler segmenti üretim sorunlarından bağımsız istikrarlı nakit akışı sağlıyor',
      'Yeni yönetim kalite/güvenlik kültürünü düzeltmeye odaklanmış durumda',
    ],
    risks: [
      'Tekrarlayan kalite/güvenlik sorunları (737 MAX krizleri, kapı paneli olayı) hem düzenleyici hem itibar riski yaratmaya devam ediyor',
      'Savunma segmentindeki sabit fiyatlı sözleşmeler maliyet aşımlarına karşı korumasız, zarar üretmeye devam edebilir',
      'Yüksek borç yükü, üretim/teslimat normalleşmesi gecikirse finansal esnekliği daha da sınırlayabilir',
    ],
    verdict: 'Bu bir dönüşüm/toparlanma hikâyesi — mevcut finansal tablo değerlemeyi değil, duopol pazar yapısının uzun vadeli değerini ve üretim sorunlarının çözüleceği varsayımını fiyatlıyor; kalite/üretim istikrarında somut, sürdürülebilir iyileşme kanıtlanmadan tez yüksek belirsizlik taşımaya devam eder.',
  },

  CAT: {
    asOf: 'FY2024 yıllık rapor verilerine dayalı, yaklaşık',
    segments: [
      { name: 'İnşaat Sanayileri', sharePct: 40, note: 'İş makinesi — konut/altyapı inşaatına bağlı' },
      { name: 'Kaynak Sanayileri (madencilik ekipmanı)', sharePct: 24, note: 'Emtia fiyat döngüsüne bağlı' },
      { name: 'Enerji & Taşımacılık (jeneratör, motor, demiryolu)', sharePct: 30, note: 'Veri merkezi yedek güç talebiyle güçlü büyüyor' },
      { name: 'Finansal Ürünler', sharePct: 6, note: 'Ekipman finansmanı' },
    ],
    competitors: ['Deere & Company', 'Komatsu', 'Cummins (enerji/motor segmentinde)', 'Volvo Construction Equipment'],
    moat: [
      { title: 'Küresel bayi ağı + hizmet/yedek parça geliri', desc: 'Onlarca yıldır kurulu, dünya çapında bağımsız bayi ağı, hem satış hem de yüksek marjlı yedek parça/bakım geliri için rakiplerin kısa vadede kuramayacağı bir dağıtım avantajı sağlıyor.' },
      { title: 'Enerji & Taşımacılık\'ta veri merkezi güç talebi konumu', desc: 'Büyük yedek jeneratör/motor sistemlerinde kurulu mühendislik uzmanlığı, AI veri merkezi inşası patlamasının yarattığı güç talebinden doğrudan faydalanıyor.' },
    ],
    strengths: [
      'Veri merkezi/AI kaynaklı yedek güç talebi Enerji & Taşımacılık segmentini güçlü büyütüyor',
      'Hizmet/yedek parça gelirinin artan payı marjı ve gelir öngörülebilirliğini iyileştiriyor',
      'ABD altyapı yasaları (IIJA) çok yıllı bir inşaat ekipmanı talep rüzgârı sağlıyor',
    ],
    risks: [
      'İnşaat ve madencilik segmentleri doğası gereği döngüsel — küresel büyüme yavaşlarsa talep hızla geriler',
      'Emtia fiyatlarındaki düşüş madencilik müşterilerinin capex\'ini erteletebilir',
      'Değerleme kısmen veri merkezi güç talebinin süreceği varsayımına dayanıyor — bu talep döngüsü henüz yeni ve test edilmemiş',
    ],
    verdict: 'Hizmet gelirinin büyüyen payı ve veri merkezi güç talebi döngüsel bir işe yapısal bir büyüme katmanı ekliyor; ancak çekirdek inşaat/madencilik ekipmanı hâlâ küresel büyüme döngüsüne bağlı — değerleme bu döngünün neresinde olduğumuza duyarlı okunmalı.',
  },

  T: {
    asOf: 'FY2024 yıllık rapor verilerine dayalı, yaklaşık',
    segments: [
      { name: 'Mobil (Communications — kablosuz)', sharePct: 56, note: 'Ana nakit kaynağı, abone büyümesi istikrarlı' },
      { name: 'Sabit Hat Fiber (Broadband)', sharePct: 20, note: 'En hızlı büyüyen segment, fiber genişlemesi devam ediyor' },
      { name: 'İş Hizmetleri + diğer (Latin Amerika, eski medya varlıkları)', sharePct: 24, note: 'Küçülen/durağan' },
    ],
    competitors: ['Verizon', 'T-Mobile US', 'Comcast/Charter (fiber/kablo rekabetinde)'],
    moat: [
      { title: 'Spektrum + ağ altyapısı bariyeri', desc: 'Kablosuz spektrum lisansları ve fiber/hücresel altyapı kurmanın devasa sermaye ve düzenleyici gereksinimleri, yeni ulusal ölçekli bir rakibin girişini fiilen imkânsız kılıyor.' },
      { title: 'Paket (bundle) müşteri elde tutma', desc: 'Mobil + fiber broadband paketleme, müşteri kaybını (churn) azaltıyor ve müşteri başına gelirini (ARPU) artırıyor.' },
    ],
    strengths: [
      'Fiber genişlemesi hem abone büyümesi hem rekabet konumlandırması sağlıyor',
      'WarnerMedia ayrılığı sonrası odaklanmış strateji borç azaltımını hızlandırdı',
      'Yüksek temettü verimi gelir odaklı yatırımcı tabanını destekliyor',
    ],
    risks: [
      'Yüksek borç yükü faiz oranı ortamına duyarlılığı artırıyor',
      'T-Mobile\'ın agresif fiyatlama/5G konumlandırması mobil segmentte pazar payı baskısı yaratıyor',
      'Fiber genişlemesi büyük capex gerektiriyor, getiri zamanlaması pazar/bölgeye göre değişken',
    ],
    verdict: 'Odaklanmış telekom stratejisi ve fiber büyümesi borç azaltımıyla birlikte değerlemeyi destekliyor; yüksek temettü verimi çoğunlukla borcun kademeli düşürülmesi ve mobil pazarındaki rekabetin yönetilebilir kalmasına bağlı bir "gelir hisse senedi" tezi olarak okunmalı.',
  },

  VZ: {
    asOf: 'FY2024 yıllık rapor verilerine dayalı, yaklaşık',
    segments: [
      { name: 'Tüketici (mobil + Fios fiber/broadband)', sharePct: 75, note: 'Ana gelir kaynağı, ARPU büyümesi odaklı' },
      { name: 'İş (Business — kurumsal/kamu kablosuz ve ağ çözümleri)', sharePct: 25, note: 'Sabit/durağan büyüme' },
    ],
    competitors: ['AT&T', 'T-Mobile US', 'Comcast/Charter (fiber/kablo rekabetinde)'],
    moat: [
      { title: 'Ağ kalitesi algısı + spektrum varlığı', desc: 'ABD\'de tarihsel olarak en güvenilir/geniş kapsamlı ağ algısına sahip; geniş spektrum portföyü yeni rakiplerin girişini büyük ölçüde engelliyor.' },
      { title: 'Kurumsal/kamu sözleşmeleri (İş segmenti)', desc: 'Devlet kurumları ve büyük işletmelerle uzun vadeli, yüksek geçiş maliyetli ağ/güvenlik sözleşmeleri istikrarlı bir gelir tabanı sağlıyor.' },
    ],
    strengths: [
      'Güçlü marka/ağ kalitesi algısı premium fiyatlamayı destekliyor',
      'Fiber (Fios) genişlemesi ve sabit kablosuz erişim (FWA) yeni büyüme kanalları sunuyor',
      'Yüksek ve istikrarlı temettü verimi gelir odaklı yatırımcı tabanını destekliyor',
    ],
    risks: [
      'Yüksek borç yükü faiz oranı ortamına duyarlılığı artırıyor',
      'T-Mobile\'ın 5G/fiber genişlemesindeki agresif rekabeti pazar payı baskısı yaratıyor',
      'Mobil pazarının olgunlaşması organik abone büyümesini sınırlıyor, büyüme büyük ölçüde fiyatlamaya bağımlı hale geliyor',
    ],
    verdict: 'İstikrarlı nakit akışı ve yüksek temettü verimi, düşük büyüme beklentisiyle makul biçimde fiyatlanmış görünüyor; bu bir büyüme değil gelir/istikrar yatırımı — borcun kademeli azaltılması ve rekabetin yönetilebilir kalması tezin sürdürülebilirliği için kilit.',
  },
};
