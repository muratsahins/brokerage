// Elle yazılmış, nitel analist raporları — YATIRIM TAVSİYESİ DEĞİLDİR.
// Yahoo'nun quoteSummary API'si segment/rakip/moat gibi nitel veri vermediği
// için bu içerik zorunlu olarak statik ve elle bakımlıdır (stocks.js'teki
// BIST_STOCKS listesiyle aynı felsefe). Rakamlar en son bilinen yıllık
// rapor verilerine dayalı YAKLAŞIK değerlerdir, gerçek zamanlı değildir —
// `asOf` alanı bunu her kayıtta açıkça belirtir.
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
    revenue3yNote: '3 yıllık gelir CAGR ~%4-6 — donanım tarafı olgun/yavaş, Hizmetler segmenti çift haneli büyüyerek toplamı yukarı çekiyor.',
    marginNote: 'Net kâr marjı ~%25-26, sektörün en istikrarlı marjlarından; Hizmetler payı arttıkça marj yapısal olarak destekleniyor.',
    balanceNote: 'Brüt nakit büyük, ama aktif hisse geri alımı nedeniyle net nakit pozisyonu daralıyor; Net Debt/EBITDA düşük/negatife yakın — kaldıraç riski yok.',
    fcfNote: 'FCF çok güçlü ve istikrarlı (yıllık ~90-100 milyar $ bandı); neredeyse tamamı temettü + geri alımla hissedara dönüyor.',
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
    revenue3yNote: '3 yıllık gelir CAGR ~%15-16 — Azure ve AI altyapı talebi ana itici güç.',
    marginNote: 'Net kâr marjı ~%35-36, yazılım/bulut karmasının olgunluğuyla sektörün en yüksekleri arasında.',
    balanceNote: 'Net nakit pozisyonuna yakın; Activision satın alması sonrası borç arttı ama Net Debt/EBITDA hâlâ düşük bandın içinde.',
    fcfNote: 'FCF çok güçlü, ama AI/veri merkezi yatırım harcaması (capex) hızla artıyor ve FCF marjını kısa vadede baskılıyor.',
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
    asOf: 'FY2024 yıllık rapor verilerine dayalı, yaklaşık',
    segments: [
      { name: 'Google Arama & diğer', sharePct: 56, note: 'Ana nakit makinesi, AI yanıt motorlarından pay kaybı riski tartışılıyor' },
      { name: 'YouTube reklam', sharePct: 10, note: 'Video/short-form içerikte güçlü büyüme' },
      { name: 'Google Cloud', sharePct: 12, note: 'Zarardan kâra geçti, en hızlı büyüyen segment' },
      { name: 'Google Network + diğer bahisler', sharePct: 22, note: 'Ağ reklamcılığı + Waymo gibi erken aşama projeler' },
    ],
    revenue3yNote: '3 yıllık gelir CAGR ~%9-10 — Arama olgun ama büyümeye devam ediyor, Cloud çift haneli büyüyor.',
    marginNote: 'Net kâr marjı ~%28-29; Cloud segmentinin kârlılığa dönmesi konsolide marjı yukarı taşıdı.',
    balanceNote: 'Net nakit pozisyonu güçlü, borç yükü düşük; Net Debt/EBITDA negatife yakın.',
    fcfNote: 'FCF yüksek ve pozitif trendde; AI altyapı yatırımları capex\'i artırsa da nakit üretimi güçlü kalmaya devam ediyor.',
    competitors: ['Microsoft (Bing/Copilot)', 'Amazon (arama+reklam)', 'Meta', 'OpenAI/Perplexity (AI arama)', 'AWS/Azure (Cloud)'],
    moat: [
      { title: 'Dağıtım + veri ölçeği', desc: 'Android, Chrome ve varsayılan arama motoru anlaşmaları milyarlarca cihazda erişim sağlıyor; bu veri hacmi reklam hedeflemesinde taklit edilmesi zor bir avantaj yaratıyor.' },
      { title: 'Reklamveren ağ etkisi', desc: 'Search + YouTube + Network\'ün birleşik envanteri, reklamverenler için tek noktadan geniş erişim sunuyor ve değiştirme maliyetini yükseltiyor.' },
    ],
    strengths: [
      'Cloud segmenti kâra döndü ve büyümeyi çeşitlendiriyor',
      'YouTube, video reklamcılıkta güçlü ve büyüyen bir konumda',
      'Güçlü bilanço, AI Ar-Ge\'sini (Gemini, TPU) organik olarak finanse edebiliyor',
    ],
    risks: [
      'Generatif AI tabanlı arama alternatifleri (ChatGPT, Perplexity) çekirdek arama iş modelini uzun vadede tehdit ediyor',
      'ABD ve AB\'de arama tekeli ve reklam teknolojisi davaları yapısal değişiklik riski taşıyor',
      'Arama sonuçlarında AI özetleri, tıklama oranlarını ve reklam envanterini baskılayabilir',
    ],
    verdict: 'Değerleme, Arama\'nın hâlâ büyüyen bir nakit makinesi olduğu ve Cloud\'un kâra geçtiği gerçeğiyle makul; ancak AI arama rekabetinin çekirdek iş modelini nasıl etkileyeceği netleşmeden çarpanlar temkinli kalmaya devam edebilir.',
  },

  AMZN: {
    asOf: 'FY2024 yıllık rapor verilerine dayalı, yaklaşık',
    segments: [
      { name: 'Kuzey Amerika e-ticaret', sharePct: 42, note: 'Düşük marjlı, hacim odaklı' },
      { name: 'Uluslararası e-ticaret', sharePct: 22, note: 'Marj toparlanma aşamasında' },
      { name: 'AWS (bulut)', sharePct: 17, note: 'Şirket kârının çoğunu tek başına üretiyor' },
      { name: 'Reklam + diğer', sharePct: 19, note: 'En yüksek marjlı, hızlı büyüyen segment' },
    ],
    revenue3yNote: '3 yıllık gelir CAGR ~%10-11 — AWS ve reklam segmentleri toplam büyümeyi e-ticaretten daha hızlı çekiyor.',
    marginNote: 'Konsolide net marj ~%8-9\'a yükseldi (pandemi sonrası maliyet disiplini + AWS/reklam payı); AWS segment marjı %35+ civarında.',
    balanceNote: 'Net Debt/EBITDA düşük bandda, bilanço sağlam; büyük capex (lojistik + veri merkezi) borçla değil büyük ölçüde operasyonel nakitle finanse ediliyor.',
    fcfNote: 'FCF, AWS/reklam kârlılığı arttıkça belirgin biçimde iyileşti; ama AI veri merkezi yatırımları önümüzdeki dönemde FCF\'yi baskılayabilir.',
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
    revenue3yNote: 'Gelir son 3 yılda birkaç katına çıktı (AI hızlandırıcı talebi patlaması); büyüme oranı çok yüksek ama karşılaştırma tabanı büyüdükçe normalize olması bekleniyor.',
    marginNote: 'Net kâr marjı %50\'nin üzerinde — yarı iletken sektöründe görülmemiş bir seviye; fiyatlama gücü ve talep/arz dengesizliğinden kaynaklanıyor.',
    balanceNote: 'Net nakit pozisyonu güçlü, pratikte borç yükü yok; bilanço riski minimal.',
    fcfNote: 'FCF çok yüksek ve hızla büyüyor; ana kısıt kapasite (TSMC üretim ayırma) — nakit sorunu değil.',
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
    asOf: 'FY2024 yıllık rapor verilerine dayalı, yaklaşık',
    segments: [
      { name: 'Aile Uygulamaları reklam (Facebook, Instagram, WhatsApp, Messenger)', sharePct: 97, note: 'Gelirin neredeyse tamamı reklamcılıktan' },
      { name: 'Reality Labs (AR/VR, Quest, Ray-Ban Meta)', sharePct: 3, note: 'Büyük zarar üreten ama stratejik uzun vadeli bahis' },
    ],
    revenue3yNote: '3 yıllık gelir CAGR ~%15-20 aralığında (2022\'deki durgunluktan sonra AI destekli reklam hedeflemesiyle güçlü toparlanma).',
    marginNote: 'Net kâr marjı ~%34-35\'e yükseldi — maliyet disiplini ("Year of Efficiency") + reklam verimliliği artışı sayesinde.',
    balanceNote: 'Net nakit pozisyonuna yakın, borç yükü düşük; Reality Labs zararı bilançoyu değil kârlılığı etkiliyor.',
    fcfNote: 'FCF güçlü ama AI/veri merkezi capex\'i hızla artıyor ve FCF marjını sıkıştırıyor.',
    competitors: ['Google/YouTube', 'TikTok (ByteDance)', 'Snap', 'Amazon (reklam)', 'Apple (Vision Pro — Reality Labs\'te)'],
    moat: [
      { title: 'Sosyal ağ etkisi', desc: 'Facebook/Instagram/WhatsApp\'ın milyarlarca kullanıcılı ağı, yeni bir platformun kullanıcı tabanıyla eşleşmesini son derece zorlaştırıyor.' },
      { title: 'Reklam hedefleme + veri ölçeği', desc: 'Kullanıcı davranış verisinin hacmi ve AI destekli reklam optimizasyonu (Advantage+), reklamverenler için ölçülebilir yüksek getiri sağlıyor ve bütçe payını koruyor.' },
    ],
    strengths: [
      'Reklam iş modeli, AI hedeflemesiyle verimliliğini sürekli artırıyor',
      'Instagram Reels, TikTok\'a karşı kullanıcı/zaman payını başarıyla savundu',
      'Güçlü FCF üretimi (Reality Labs zararına rağmen) sermaye getirisi (temettü + geri alım) imkânı veriyor',
    ],
    risks: [
      'Reality Labs yılda milyarlarca dolar zarar üretmeye devam ediyor, getiri belirsiz',
      'Gelirin reklamcılığa aşırı yoğunlaşması makro/reklam bütçesi döngülerine kırılganlık yaratıyor',
      'Düzenleyici baskı (veri gizliliği, AB dijital pazarlar yasası, olası bölünme talepleri) devam ediyor',
    ],
    verdict: 'Çekirdek reklam işinin marjı ve büyümesi mevcut değerlemeyi destekliyor; asıl belirsizlik Reality Labs\'in ne zaman (ve edip etmeyeceği) kârlılığa katkı sağlayacağı — bu yatırım tezi değil çekirdek işin bir yan bahsi olarak görülmeli.',
  },

  TSLA: {
    asOf: 'FY2024 yıllık rapor verilerine dayalı, yaklaşık',
    segments: [
      { name: 'Otomotiv (araç satışı)', sharePct: 80, note: 'Model 3/Y hacim ağırlıklı, fiyat rekabeti marjı baskılıyor' },
      { name: 'Enerji üretimi & depolama (Megapack/Powerwall)', sharePct: 10, note: 'En hızlı büyüyen ve marj genişleyen segment' },
      { name: 'Hizmetler + diğer', sharePct: 10, note: 'Süpercharger ağı, sigorta, tamir' },
    ],
    revenue3yNote: 'Gelir büyümesi son 3 yılda belirgin yavaşladı (2021-22\'deki %50+\'tan tek haneye); fiyat indirimleri hacmi korudu ama geliri baskıladı.',
    marginNote: 'Otomotiv brüt marjı fiyat savaşlarıyla önemli ölçüde daraldı; net marj tek haneye geriledi, enerji segmenti marjı yukarı çekiyor.',
    balanceNote: 'Net nakit pozisyonu güçlü, borç yükü düşük; kaldıraç riski yok.',
    fcfNote: 'FCF pozitif ama dalgalı; capex (Gigafactory\'ler, AI/robotik yatırımları) büyük ve artıyor.',
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
    asOf: 'FY2024 yıllık rapor verilerine dayalı, yaklaşık',
    segments: [
      { name: 'Yarı iletken çözümleri (ağ, özel AI çipleri/ASIC, kablosuz)', sharePct: 58, note: 'Hiper-ölçekli AI özel çip (ASIC) talebiyle hızlanıyor' },
      { name: 'Altyapı yazılımı (VMware dahil)', sharePct: 42, note: 'VMware satın alması sonrası payı büyük ölçüde arttı' },
    ],
    revenue3yNote: '3 yıllık gelir CAGR ~%20+ — organik yarı iletken büyümesi + VMware satın almasının konsolidasyonu birlikte etkili.',
    marginNote: 'Net kâr marjı VMware entegrasyon giderleri nedeniyle dönemsel dalgalandı, ama operasyonel/düzeltilmiş marj sektörün en yükseklerinden (~%40+).',
    balanceNote: 'VMware satın alması sonrası borç belirgin arttı; Net Debt/EBITDA orta-yüksek bandda ama güçlü FCF ile hızla düşürülüyor.',
    fcfNote: 'FCF çok güçlü ve büyüyor; borç azaltımının ana kaynağı.',
    competitors: ['Marvell Technology', 'Cisco', 'Qualcomm', 'NVIDIA (AI hızlandırıcılarda dolaylı)'],
    moat: [
      { title: 'Özel ASIC ortaklıkları', desc: 'Google (TPU) gibi hiper-ölçekli müşterilerle uzun vadeli özel çip tasarım ortaklıkları, yüksek geçiş maliyeti ve tekrarlayan gelir yaratıyor.' },
      { title: 'Satın alma + çapraz satış disiplini', desc: 'CA Technologies, Symantec, VMware gibi olgun yazılım varlıklarını satın alıp marjı disiplinli biçimde artırma konusunda kanıtlanmış bir oyun kitabı var.' },
    ],
    strengths: [
      'Hiper-ölçekli bulut şirketleriyle özel AI çip (ASIC) iş kolu hızlı büyüyor',
      'VMware entegrasyonu marj genişlemesi ve tekrarlayan yazılım geliri sağladı',
      'Güçlü FCF, hem borç azaltımını hem hissedar getirisini finanse ediyor',
    ],
    risks: [
      'VMware satın alması sonrası borç yükü, faiz oranı riskine duyarlılığı artırıyor',
      'Gelirin küçük sayıda büyük müşteriye (Apple, hiper-ölçekliler) yoğunlaşması',
      'Yazılım tarafında agresif fiyatlama/lisans değişiklikleri müşteri memnuniyetsizliği riski taşıyor',
    ],
    verdict: 'AI özel çip talebi ve VMware\'in marj katkısı değerlemeyi büyük ölçüde destekliyor; borcun hızla azaltılması tezin sürdürülebilirliği için kilit — bu devam ettiği sürece prim gerekçeli kalır.',
  },

  ORCL: {
    asOf: 'FY2024 (Mayıs sonu biten mali yıl) verilerine dayalı, yaklaşık',
    segments: [
      { name: 'Bulut hizmetleri & lisans desteği (SaaS+IaaS)', sharePct: 76, note: 'Oracle Cloud Infrastructure (OCI) hızla büyüyor, AI eğitim talebiyle destekleniyor' },
      { name: 'Bulut lisansı & şirket içi lisans', sharePct: 8, note: 'Yapısal olarak küçülen eski iş' },
      { name: 'Donanım + hizmetler', sharePct: 16, note: 'Görece durağan' },
    ],
    revenue3yNote: '3 yıllık gelir CAGR ~%8-10; OCI\'nin AI eğitim iş yükleri için tercih edilmesi son dönemde büyümeyi belirgin hızlandırdı.',
    marginNote: 'Net kâr marjı ~%20 bandında; OCI capex\'i büyürken kısa vadede marjı baskılıyor ama uzun vadede ölçek ekonomisi bekleniyor.',
    balanceNote: 'Borç yükü sektöre göre yüksek (geçmiş büyük satın almalar + geri alımlar); Net Debt/EBITDA orta-yüksek bandda — izlenmesi gereken bir kalem.',
    fcfNote: 'FCF pozitif ama OCI veri merkezi yatırımları arttıkça marj baskısı sürüyor.',
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
    revenue3yNote: '3 yıllık gelir CAGR ~%10-11 — abonelik modelinin olgunluğuyla istikrarlı ama hızlanmıyor.',
    marginNote: 'Net kâr marjı ~%27-30 bandında, yazılım/SaaS modelinin tipik yüksek marjı.',
    balanceNote: 'Net nakit pozisyonuna yakın, borç yükü düşük; Figma satın alma girişiminin düzenleyici engelle iptali bilançoyu rahatlattı.',
    fcfNote: 'FCF çok güçlü ve istikrarlı; büyük ölçüde hisse geri alımına yönlendiriliyor.',
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
    revenue3yNote: '3 yıllık gelir CAGR ~%11-12; büyüme hızı önceki yıllara göre yavaşladı ama kârlılık odağıyla dengelendi.',
    marginNote: 'Net kâr marjı aktivist yatırımcı baskısı sonrası maliyet disipliniyle belirgin iyileşti (~%15-18 bandına yükseldi).',
    balanceNote: 'Net nakit pozisyonuna yakın, borç yükü makul; büyük satın almalar (Slack) sonrası bilanço disiplinli yönetiliyor.',
    fcfNote: 'FCF marjı son yıllarda hızla genişledi — kârlılık odaklı yönetim değişiminin en somut sonucu.',
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
    asOf: 'FY2024 yıllık rapor verilerine dayalı, yaklaşık',
    segments: [
      { name: 'Abonelik (akış hizmeti — küresel)', sharePct: 92, note: 'Ana gelir kaynağı, reklamlı katman hızla büyüyor' },
      { name: 'Reklam gelirleri (reklamlı ucuz katman)', sharePct: 8, note: 'En hızlı büyüyen, henüz küçük ama stratejik' },
    ],
    revenue3yNote: '3 yıllık gelir CAGR ~%10-12 — şifre paylaşımı önleme + reklamlı katman abone/gelir büyümesini yeniden hızlandırdı.',
    marginNote: 'Net kâr marjı hızla genişledi (~%20\'nin üzerine), içerik harcaması disiplini + abone büyümesinin sabit maliyeti yayması sayesinde.',
    balanceNote: 'Borç azaltılıyor, Net Debt/EBITDA düşük bandda; içerik yükümlülükleri bilanço dışı önemli bir kalem olarak izlenmeli.',
    fcfNote: 'FCF, içerik harcamasının gelire göre normalize olmasıyla güçlü pozitife döndü ve büyümeye devam ediyor.',
    competitors: ['Disney+', 'Amazon Prime Video', 'YouTube', 'Max (Warner Bros Discovery)', 'Apple TV+'],
    moat: [
      { title: 'İçerik + veri destekli öneri motoru', desc: 'Devasa izleme verisi, içerik yatırımını ve kişiselleştirilmiş öneriyi optimize ederek elde tutmayı rakiplerden daha verimli kılıyor.' },
      { title: 'Küresel ölçek + yerel içerik üretimi', desc: 'Onlarca ülkede yerel dilde orijinal içerik üretim kapasitesi, tek pazara odaklı rakiplere göre abone tabanını genişletme avantajı sağlıyor.' },
    ],
    strengths: [
      'Reklamlı katman + şifre paylaşımı önleme abone ve gelir büyümesini yeniden hızlandırdı',
      'İçerik harcaması disiplini marjı yapısal olarak genişletti',
      'Canlı spor/etkinlik yayıncılığına giriş (WWE, NFL) yeni izleyici/reklam geliri kapısı açıyor',
    ],
    risks: [
      'Akış pazarı olgunlaştıkça abone büyümesi gelişmiş pazarlarda doğal olarak yavaşlıyor',
      'İçerik maliyeti enflasyonu (yıldız oyuncu/yapımcı anlaşmaları) marjı tekrar baskılayabilir',
      'Rakiplerin (Disney, Amazon) agresif içerik/reklam paketleme stratejisi rekabeti kızıştırıyor',
    ],
    verdict: 'Marj genişlemesi ve reklamlı katmanın büyümesi mevcut değerlemeyi destekliyor; ancak abone büyümesinin gelişmiş pazarlarda doğal olarak yavaşlayacağı göz önüne alındığında, tez giderek "büyüme"den "marj + reklam parasallaştırma" hikâyesine kaymalı.',
  },

  AMD: {
    asOf: 'FY2024 yıllık rapor verilerine dayalı, yaklaşık',
    segments: [
      { name: 'Veri Merkezi (EPYC CPU + Instinct AI GPU)', sharePct: 50, note: 'En hızlı büyüyen segment, NVIDIA\'ya karşı AI GPU iddiası burada' },
      { name: 'İstemci (Ryzen — PC işlemci)', sharePct: 24, note: 'PC döngüsüne bağlı, pazar payı Intel\'e karşı artıyor' },
      { name: 'Oyun (konsol + GPU)', sharePct: 12, note: 'Konsol döngüsü sonu nedeniyle zayıflıyor' },
      { name: 'Gömülü (Xilinx sonrası)', sharePct: 14, note: 'Sanayi/savunma odaklı, döngüsel zayıflık yaşıyor' },
    ],
    revenue3yNote: '3 yıllık gelir CAGR ~%10-15 — Veri Merkezi segmentinin AI GPU talebiyle hızlanması diğer segmentlerin zayıflığını dengeliyor.',
    marginNote: 'Net kâr marjı tek haneden çift haneye toparlanıyor; Veri Merkezi payı arttıkça marj yapısal olarak iyileşiyor.',
    balanceNote: 'Net nakit pozisyonuna yakın, borç yükü düşük; Xilinx satın alması sonrası bilanço disiplinli yönetiliyor.',
    fcfNote: 'FCF pozitif ve büyüyor, ama NVIDIA\'ya göre büyüklük farkı hâlâ çok büyük.',
    competitors: ['NVIDIA (AI GPU\'da)', 'Intel (CPU\'da)', 'Qualcomm/ARM tasarımcıları (mobil/gömülüde dolaylı)'],
    moat: [
      { title: 'x86 CPU\'da iki oyunculu pazarda güçlenen konum', desc: 'Intel\'e karşı hem sunucu hem PC\'de pazar payı kazanımı sürüyor; büyük bulut sağlayıcılarının çoklu-tedarikçi isteği AMD\'yi kalıcı bir ikinci kaynak yapıyor.' },
      { title: 'Chiplet tasarım/üretim esnekliği', desc: 'TSMC ile chiplet tabanlı modüler tasarım, ürün geliştirme hızını ve maliyet verimliliğini artırıyor.' },
    ],
    strengths: [
      'Sunucu CPU pazarında Intel\'e karşı payı istikrarlı biçimde artırıyor',
      'AI GPU (Instinct/MI serisi) NVIDIA\'ya karşı gerçek (ikincil) bir alternatif olarak konumlanıyor',
      'Xilinx entegrasyonu gömülü/FPGA pazarına çeşitlendirme sağladı',
    ],
    risks: [
      'AI GPU\'da NVIDIA\'nın CUDA yazılım avantajını kapatmak uzun ve maliyetli bir süreç',
      'Oyun/konsol segmenti döngü sonu nedeniyle belirgin zayıflıyor',
      'Değerleme büyük ölçüde AI GPU pazar payı kazanımı varsayımına dayanıyor — gerçekleşme hızı belirsiz',
    ],
    verdict: 'CPU tarafındaki payı artırma hikâyesi somut ve gerekçeli; AI GPU tarafında ise değerleme, henüz kanıtlanmamış bir pazar payı kazanım hızını fiyatlıyor — bu ikisi arasındaki ayrım yatırım tezinin netliği için önemli.',
  },

  INTC: {
    asOf: 'FY2024 yıllık rapor verilerine dayalı, yaklaşık',
    segments: [
      { name: 'İstemci Bilişim (Client Computing — PC işlemci)', sharePct: 51, note: 'Ana nakit kaynağı ama pazar payı AMD\'ye kayıyor' },
      { name: 'Veri Merkezi & AI', sharePct: 27, note: 'AI hızlandırıcı yarışında geride kaldı' },
      { name: 'Intel Foundry (döküm/üretim hizmeti)', sharePct: 15, note: 'Büyük stratejik dönüşüm, henüz zarar üretiyor' },
      { name: 'Diğer (Mobileye, NEX)', sharePct: 7, note: 'Küçük, çeşitlendirilmiş' },
    ],
    revenue3yNote: 'Gelir son 3 yılda gerçek anlamda küçüldü/durgunlaştı — PC pazarı zayıflığı + sunucu/AI pazar payı kaybı.',
    marginNote: 'Net marj ağır baskı altında (bazı dönemlerde zarar); Foundry yatırımları ve pazar payı kaybı kârlılığı büyük ölçüde aşındırdı.',
    balanceNote: 'Foundry\'ye dev capex nedeniyle borç belirgin arttı; Net Debt/EBITDA yüksek bandda — devlet teşvikleri (CHIPS Act) kısmen dengeliyor.',
    fcfNote: 'FCF negatif/zayıf — Foundry inşaat/ekipman yatırımı devam ettiği sürece bu böyle kalması bekleniyor.',
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
    revenue3yNote: '3 yıllık gelir CAGR düşük tek hane — donanım pazarı olgun; Splunk konsolidasyonu son yıl büyümeyi yukarı çekti.',
    marginNote: 'Net kâr marjı ~%20 bandında istikrarlı; yazılım/abonelik payının artması marjı destekliyor.',
    balanceNote: 'Splunk satın alması (~28 milyar $) sonrası borç arttı ama Net Debt/EBITDA hâlâ makul bandda; güçlü nakit üretimiyle hızla azaltılıyor.',
    fcfNote: 'FCF istikrarlı ve güçlü; temettü + geri alım programını rahatça finanse ediyor.',
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
    revenue3yNote: '3 yıllık gelir CAGR düşük-orta tek hane — akıllı telefon pazarı olgunlaştı, otomotiv/IoT çeşitlendirmesi büyümeyi destekliyor.',
    marginNote: 'Net kâr marjı ~%25-28 bandında; QTL lisans gelirinin yüksek marjı konsolide kârlılığı destekliyor.',
    balanceNote: 'Net nakit pozisyonuna yakın, borç yükü düşük; bilanço sağlam.',
    fcfNote: 'FCF güçlü ve istikrarlı; büyük ölçüde temettü + geri alıma yönlendiriliyor.',
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
    asOf: 'FY2024 yıllık rapor verilerine dayalı, yaklaşık',
    segments: [
      { name: 'Analog yarı iletken', sharePct: 74, note: 'Ana iş kolu, geniş sanayi/otomotiv müşteri tabanı' },
      { name: 'Gömülü işlem (Embedded Processing)', sharePct: 18, note: 'Sanayi/otomotiv odaklı' },
      { name: 'Diğer', sharePct: 8, note: 'Hesap makinesi vb. eski ürünler' },
    ],
    revenue3yNote: '3 yıllık gelir CAGR negatif/durgun — sanayi ve otomotiv çip döngüsünde stok düzeltmesi (2023-24) belirgin baskı yarattı, toparlanma erken aşamada.',
    marginNote: 'Net kâr marjı döngüsel zayıflıkla geriledi ama hâlâ sektör ortalamasının belirgin üzerinde (~%30 bandı); yapısal olarak yüksek marj hedefleniyor.',
    balanceNote: 'Net Debt/EBITDA düşük-orta bandda; büyük ölçekli 300mm fabrika yatırımı (ABD) devam ediyor.',
    fcfNote: 'FCF, ağır capex döngüsü nedeniyle baskı altında; yatırım tamamlandıkça normalize olması bekleniyor.',
    competitors: ['Analog Devices', 'ON Semiconductor', 'Infineon', 'STMicroelectronics'],
    moat: [
      { title: 'Geniş ürün portföyü + "yapışkan" tasarım-içi (design-in) ilişkileri', desc: 'On binlerce analog/gömülü ürün, mühendislerin tasarım aşamasında TI parçalarını seçmesiyle uzun ömürlü (yıllarca süren) gelir ilişkileri yaratıyor.' },
      { title: 'Dahili (in-house) 300mm üretim ölçeği', desc: 'Kendi fabrikalarında büyük ölçekli 300mm analog üretim, maliyet yapısında outsource\'a bağımlı rakiplere göre yapısal avantaj sağlıyor.' },
    ],
    strengths: [
      'Sanayi/otomotiv talebindeki döngüsel toparlanma erken sinyaller veriyor',
      'Geniş, çeşitlendirilmiş müşteri/uygulama tabanı tek pazara bağımlılığı azaltıyor',
      'Dahili üretim stratejisi uzun vadede maliyet/marj avantajı hedefliyor',
    ],
    risks: [
      'Büyük capex döngüsü tamamlanana kadar FCF ve sermaye getirisi baskı altında kalabilir',
      'Çin\'de yerli analog çip üreticilerinin büyümesi orta-düşük segmentte rekabeti artırıyor',
      'Sanayi/otomotiv talep toparlanmasının hızı ve zamanlaması belirsiz',
    ],
    verdict: 'Döngüsel dip sonrası toparlanma beklentisi değerlemede fiyatlanıyor; capex yükünün FCF\'ye dönüşü gecikirse veya toparlanma yavaş kalırsa mevcut çarpanlar zorlanabilir.',
  },

  IBM: {
    asOf: 'FY2024 yıllık rapor verilerine dayalı, yaklaşık',
    segments: [
      { name: 'Yazılım (Red Hat, otomasyon, veri/AI)', sharePct: 45, note: 'En yüksek marjlı, büyümenin ana kaynağı' },
      { name: 'Danışmanlık (Consulting)', sharePct: 30, note: 'Düşük marjlı, işgücü yoğun' },
      { name: 'Altyapı (mainframe — z Systems)', sharePct: 21, note: 'Döngüsel, ürün döngüsüne (z17 vb.) duyarlı' },
      { name: 'Finansman', sharePct: 4, note: 'Küçük, tamamlayıcı' },
    ],
    revenue3yNote: '3 yıllık gelir CAGR düşük tek hane — Red Hat/hibrit bulut ve AI (watsonx) yazılımı büyürken mainframe/danışmanlık büyümeyi sınırlıyor.',
    marginNote: 'Net kâr marjı yazılım payının artmasıyla kademeli iyileşiyor (~%12-15 bandı); yazılım segmenti marjı çok daha yüksek.',
    balanceNote: 'Net Debt/EBITDA orta-yüksek bandda (Red Hat satın alması + emeklilik yükümlülükleri); bilanço izlenmesi gereken bir kalem.',
    fcfNote: 'FCF istikrarlı ve güçlü, temettüyü (Aristocrat statüsü) rahatça karşılıyor.',
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
    asOf: 'FY2024 (Temmuz sonu biten mali yıl) verilerine dayalı, yaklaşık',
    segments: [
      { name: 'Global Business Solutions (QuickBooks)', sharePct: 44, note: 'KOBİ muhasebe/ödeme yazılımı, istikrarlı büyüme' },
      { name: 'Consumer (TurboTax)', sharePct: 27, note: 'Mevsimsel (vergi sezonu), yüksek marjlı' },
      { name: 'Credit Karma', sharePct: 12, note: 'Kişisel finans/kredi pazaryeri' },
      { name: 'ProTax + diğer', sharePct: 17, note: 'Muhasebeci/vergi profesyoneli yazılımları' },
    ],
    revenue3yNote: '3 yıllık gelir CAGR ~%12-13 — QuickBooks Online ve Credit Karma büyümesi ana itici güç.',
    marginNote: 'Net kâr marjı ~%18-20 bandında; abonelik/bulut geçişi marjı yapısal olarak destekliyor.',
    balanceNote: 'Net Debt/EBITDA düşük-orta bandda (Credit Karma ve Mailchimp satın almaları sonrası); bilanço sağlıklı.',
    fcfNote: 'FCF güçlü ve büyüyor; hissedar getirisi ve tamamlayıcı satın almaları finanse ediyor.',
    competitors: ['Xero', 'Sage', 'H&R Block (TurboTax\'a karşı)', 'NerdWallet/Credit Sesame (Credit Karma\'ya karşı)'],
    moat: [
      { title: 'KOBİ muhasebe iş akışı kilitlenmesi', desc: 'QuickBooks, küçük işletmelerin muhasebe/bordro/ödeme iş akışına derinden yerleşmiş; muhasebeci ekosistemiyle birlikte değiştirme maliyeti yüksek.' },
      { title: 'Vergi mevzuatı karmaşıklığı + marka güveni', desc: 'TurboTax\'ın ABD vergi kodundaki derin uzmanlığı ve marka güveni, düşük fiyatlı alternatiflere karşı yüksek elde tutma sağlıyor.' },
    ],
    strengths: [
      'QuickBooks Online\'ın bulut geçişi büyümeyi ve marjı birlikte destekliyor',
      'Credit Karma, çapraz satış (kredi kartı, kişisel kredi) için geniş bir kullanıcı tabanı sağlıyor',
      'AI destekli ürünler (Intuit Assist) hem TurboTax hem QuickBooks\'ta verimlilik/elde tutma artırıyor',
    ],
    risks: [
      'TurboTax\'a yönelik düzenleyici baskı (ücretsiz dosyalama seçenekleri, FTC incelemeleri) gelir modelini tehdit ediyor',
      'Gelirin mevsimselliği (vergi sezonu) çeyrekler arası büyük dalgalanma yaratıyor',
      'KOBİ segmentinde küçük/bölgesel rakiplerin fiyat rekabeti mevcut',
    ],
    verdict: 'QuickBooks ve Credit Karma\'nın büyüme+marj katkısı değerlemeyi destekliyor; TurboTax\'a yönelik düzenleyici risk gerçekleşirse (ücretsiz dosyalama zorunluluğu gibi) tez üzerinde belirgin bir baskı unsuru olur.',
  },

  AMAT: {
    asOf: 'FY2024 (Ekim sonu biten mali yıl) verilerine dayalı, yaklaşık',
    segments: [
      { name: 'Yarı iletken sistemleri (üretim ekipmanı)', sharePct: 73, note: 'Ana iş kolu — çip fabrikalarına makine satışı' },
      { name: 'Uygulama & hizmetler (bakım/parça)', sharePct: 22, note: 'Kurulu tabana bağlı, daha istikrarlı gelir' },
      { name: 'Ekran & diğer', sharePct: 5, note: 'Küçük, ekran üretim ekipmanı' },
    ],
    revenue3yNote: '3 yıllık gelir CAGR düşük-orta tek hane — yarı iletken ekipman pazarı döngüsel; AI çip talebi ileri düğüm yatırımlarını destekliyor.',
    marginNote: 'Net kâr marjı ~%25-27 bandında, döngü tepesine yakın seviyelerde güçlü.',
    balanceNote: 'Net nakit pozisyonuna yakın, borç yükü düşük; bilanço döngüsel iniş çıkışlara dayanacak kadar sağlam.',
    fcfNote: 'FCF güçlü, döngüsel talep dalgalanmasına rağmen istikrarlı kalmayı başarıyor.',
    competitors: ['ASML', 'Lam Research', 'KLA Corp', 'Tokyo Electron'],
    moat: [
      { title: 'Geniş süreç kapsamı + kurulu taban hizmet geliri', desc: 'Çip üretiminin birçok farklı adımında (biriktirme, aşındırma, ölçüm) lider ekipman sağlayıcısı olması, tek bir ürüne bağımlı rakiplere göre daha geniş ve istikrarlı bir hizmet/parça geliri yaratıyor.' },
      { title: 'İleri düğüm Ar-Ge ortaklıkları', desc: 'TSMC, Samsung, Intel gibi lider döküm/üreticilerle birlikte yeni nesil süreç teknolojilerini birlikte geliştirmesi, teknoloji öncüsü konumunu koruyor.' },
    ],
    strengths: [
      'AI çip talebi, ileri düğüm fabrika yatırımlarını (ve dolayısıyla ekipman siparişlerini) destekliyor',
      'Geniş ürün/hizmet portföyü tek bir müşteri veya süreç adımına bağımlılığı azaltıyor',
      'Kurulu taban hizmet geliri döngüsel ekipman satışına göre daha istikrarlı bir taban oluşturuyor',
    ],
    risks: [
      'Yarı iletken ekipman pazarı doğası gereği son derece döngüsel — talep tepe yaptıktan sonra sert düzeltmeler olağan',
      'Çin\'e ihracat kısıtlamaları önemli bir müşteri/gelir segmentini doğrudan etkiliyor',
      'Büyük müşterilerin (TSMC, Samsung, Intel) capex kararlarındaki gecikme/erteleme siparişleri hızla etkiler',
    ],
    verdict: 'AI destekli ileri düğüm yatırım döngüsü değerlemeyi güncel olarak destekliyor; ekipman talebinin doğası gereği döngüsel olduğu unutulmamalı — mevcut çarpanlar döngünün tepesine değil ortasına işaret ediyorsa daha savunulabilir.',
  },

  JPM: {
    asOf: 'FY2024 yıllık rapor verilerine dayalı, yaklaşık',
    segments: [
      { name: 'Tüketici & Toplum Bankacılığı', sharePct: 40, note: 'Mevduat, kredi kartı, ipotek — ABD\'nin en büyük tüketici bankası' },
      { name: 'Kurumsal & Yatırım Bankacılığı', sharePct: 30, note: 'Sermaye piyasaları, danışmanlık, işlem bankacılığı' },
      { name: 'Ticari Bankacılık', sharePct: 12, note: 'Orta ölçekli işletmelere kredi/bankacılık' },
      { name: 'Varlık & Servet Yönetimi', sharePct: 12, note: 'Yönetilen varlık büyüklüğü ile ücret geliri' },
      { name: 'Kurumsal (hazine/diğer)', sharePct: 6, note: 'Faiz oranı pozisyonlaması' },
    ],
    revenue3yNote: 'Net faiz geliri, yüksek faiz ortamıyla son 3 yılda güçlü büyüdü; faiz oranları normalleştikçe büyüme hızının yavaşlaması bekleniyor.',
    marginNote: 'Özkaynak kârlılığı (ROE) ~%17-20 bandında, sektörün en yükseklerinden — ölçek ve çeşitlendirilmiş gelir modeli sayesinde.',
    balanceNote: 'Sermaye oranları (CET1) düzenleyici gereksinimlerin belirgin üzerinde; bankacılık sektöründe en güçlü bilançolardan biri olarak kabul ediliyor.',
    fcfNote: 'Banka olduğu için klasik FCF yerine sermaye yeterliliği ve temettü/geri alım kapasitesi izlenir — her ikisi de güçlü.',
    competitors: ['Bank of America', 'Citigroup', 'Wells Fargo', 'Goldman Sachs (yatırım bankacılığında)'],
    moat: [
      { title: 'Ölçek + çeşitlendirilmiş gelir modeli', desc: 'Tüketici bankacılığından yatırım bankacılığına uzanan geniş iş yelpazesi, tek bir segmentteki zayıflığı diğerleriyle dengeleyebiliyor — "too big to fail" ölçeği aynı zamanda rekabet avantajı.' },
      { title: 'Teknoloji yatırım gücü', desc: 'Yıllık on milyarlarca dolarlık BT/teknoloji bütçesi, dijital bankacılık deneyiminde küçük/orta ölçekli rakiplerin eşleyemeyeceği bir yatırım kapasitesi sağlıyor.' },
    ],
    strengths: [
      'Sektörün en güçlü sermaye pozisyonu ve risk yönetimi geçmişi',
      'Çeşitlendirilmiş gelir modeli (tüketici + kurumsal + yatırım bankacılığı) döngüsel dayanıklılık sağlıyor',
      'Yatırım bankacılığı/sermaye piyasaları franchise\'ı pazar payını sürekli artırıyor',
    ],
    risks: [
      'Net faiz geliri, faiz oranları düşerse baskı altına girebilir',
      'Kredi kartı/tüketici kredisi zarar oranlarında makroekonomik yavaşlama riski',
      'Artan düzenleyici sermaye gereksinimleri (Basel III sonu) kârlılığı sınırlayabilir',
    ],
    verdict: 'Sektör lideri sermaye gücü ve ROE, defter değeri üzerindeki primi büyük ölçüde gerekçelendiriyor; faiz oranı çevriminin aşağı yönlü etkisi net faiz gelirini normalleştirdiğinde büyüme hikâyesinin gücü test edilecek.',
  },

  BAC: {
    asOf: 'FY2024 yıllık rapor verilerine dayalı, yaklaşık',
    segments: [
      { name: 'Tüketici Bankacılığı', sharePct: 38, note: 'ABD\'nin en büyük şube ağlarından biri' },
      { name: 'Küresel Servet & Yatırım Yönetimi (Merrill/Private Bank)', sharePct: 21, note: 'Ücret ağırlıklı, istikrarlı' },
      { name: 'Küresel Bankacılık', sharePct: 20, note: 'Kurumsal kredi + yatırım bankacılığı' },
      { name: 'Küresel Piyasalar', sharePct: 21, note: 'Alım-satım/aracılık geliri, volatiliteye duyarlı' },
    ],
    revenue3yNote: 'Net faiz geliri yüksek faiz ortamıyla büyüdü; mevduat maliyeti artışı bir miktar dengeledi. Büyüme hızı JPM\'e göre daha mütevazı.',
    marginNote: 'Özkaynak kârlılığı (ROE) ~%11-13 bandında — büyük rakiplerine göre görece daha düşük, verimlilik iyileştirme odaklı yönetim gündeminde.',
    balanceNote: 'Sermaye oranları düzenleyici eşiklerin üzerinde; tahvil portföyündeki değer kaybı (yüksek faiz döneminden) izlenmesi gereken bir kalem.',
    fcfNote: 'Banka için klasik FCF yerine sermaye/temettü kapasitesi izlenir; temettü + geri alım programı istikrarlı.',
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
    asOf: 'FY2024 yıllık rapor verilerine dayalı, yaklaşık',
    segments: [
      { name: 'Global Bankacılık & Piyasalar (yatırım bankacılığı + alım-satım)', sharePct: 68, note: 'Ana kâr kaynağı, işlem hacmine duyarlı' },
      { name: 'Varlık & Servet Yönetimi', sharePct: 32, note: 'Stratejik büyüme odağı, daha öngörülebilir ücret geliri' },
    ],
    revenue3yNote: 'Gelir, sermaye piyasası döngüsüne (IPO/M&A hacmi, alım-satım volatilitesi) bağlı olarak dalgalı; perakende bankacılıktan (Marcus) çekilme sonrası çekirdek işe odaklanma net.',
    marginNote: 'Özkaynak kârlılığı (ROE) toparlanma trendinde (~%12-14 bandı); Varlık Yönetimi payının artması gelir kalitesini iyileştiriyor.',
    balanceNote: 'Sermaye oranları güçlü, düzenleyici gereksinimlerin üzerinde; yatırım bankası olarak alım-satım pozisyonlarından kaynaklı piyasa riski diğer bankalara göre daha yüksek.',
    fcfNote: 'Klasik FCF yerine sermaye/temettü kapasitesi izlenir; geri alım programı aktif.',
    competitors: ['Morgan Stanley', 'JPMorgan (yatırım bankacılığında)', 'Bank of America (Merrill)', 'Evercore/Lazard (butik danışmanlıkta)'],
    moat: [
      { title: 'Yatırım bankacılığı marka gücü + ilişki ağı', desc: 'Büyük M&A/IPO işlemlerinde danışmanlık franchise\'ı, on yıllardır süren üst düzey kurumsal ilişkilere dayanıyor — yeni girenlerin kısa vadede eşleyemeyeceği bir itibar sermayesi.' },
      { title: 'Alım-satım (trading) ölçeği ve risk yönetimi uzmanlığı', desc: 'Sermaye piyasalarında derinlik ve karmaşık ürünlerdeki risk yönetimi yeteneği, kurumsal müşterileri elde tutuyor.' },
    ],
    strengths: [
      'M&A/IPO pazarı toparlandıkça yatırım bankacılığı geliri güçlü kaldıraç yaratıyor',
      'Varlık Yönetimi\'ne stratejik odaklanma gelir kalitesini/öngörülebilirliğini artırıyor',
      'Marcus (tüketici bankacılığı) çekilmesi sermaye ve yönetim odağını çekirdek güçlü yanlara yoğunlaştırdı',
    ],
    risks: [
      'Gelir, sermaye piyasası döngüsüne (M&A/IPO hacmi) doğrudan bağlı — durgun piyasa dönemlerinde belirgin geriliyor',
      'Alım-satım geliri volatiliteye duyarlı, çeyrekler arası büyük dalgalanma yaratabiliyor',
      'Düzenleyici sermaye gereksinimleri (özellikle büyük alım-satım pozisyonları için) artabilir',
    ],
    verdict: 'Sermaye piyasası döngüsünün dip noktasından toparlanması değerlemeyi destekliyor; bu bir "döngü bankası" olduğu için mevcut çarpanların döngünün neresinde olduğumuza (tepe/orta/dip) göre değerlendirilmesi gerekir.',
  },

  MS: {
    asOf: 'FY2024 yıllık rapor verilerine dayalı, yaklaşık',
    segments: [
      { name: 'Kurumsal Bankacılık (Institutional Securities)', sharePct: 42, note: 'Yatırım bankacılığı + alım-satım' },
      { name: 'Servet Yönetimi (Wealth Management)', sharePct: 44, note: 'E*Trade satın alması sonrası en büyük segment, öngörülebilir ücret geliri' },
      { name: 'Yatırım Yönetimi', sharePct: 14, note: 'Yönetilen varlık ücretleri' },
    ],
    revenue3yNote: 'Servet Yönetimi\'nin payının artması (E*Trade + Eaton Vance entegrasyonu) toplam gelir kalitesini ve öngörülebilirliğini yükseltti; kurumsal segment piyasa döngüsüne bağlı kalmaya devam ediyor.',
    marginNote: 'Özkaynak kârlılığı (ROE) ~%15-17 bandına yükseldi — Servet Yönetimi\'nin ücret ağırlıklı, düşük sermaye yoğunluklu modeli marjı destekliyor.',
    balanceNote: 'Sermaye oranları güçlü; Servet Yönetimi\'nin büyümesi bilanço riskini (piyasa/alım-satım riskine göre) yapısal olarak azaltıyor.',
    fcfNote: 'Klasik FCF yerine sermaye/temettü kapasitesi izlenir; temettü + geri alım istikrarlı.',
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
    asOf: 'FY2024 (Eylül sonu biten mali yıl) verilerine dayalı, yaklaşık',
    segments: [
      { name: 'Hizmet gelirleri (işlem hacmi bazlı)', sharePct: 47, note: 'Kart harcama hacmine doğrudan bağlı' },
      { name: 'Veri işleme (yetkilendirme/takas)', sharePct: 42, note: 'İşlem sayısına bağlı, en istikrarlı kalem' },
      { name: 'Uluslararası işlem + diğer', sharePct: 11, note: 'Sınır ötesi harcama/döviz dönüşümü' },
    ],
    revenue3yNote: '3 yıllık gelir CAGR ~%10-11 — küresel tüketici harcaması ve nakitten karta geçiş trendiyle istikrarlı büyüme.',
    marginNote: 'Net kâr marjı ~%50-52 — ödeme ağı iş modelinin (asgari sermaye yoğunluğu, değişken maliyet düşük) doğal sonucu; sektörün en yüksek marjlarından.',
    balanceNote: 'Net Debt/EBITDA düşük bandda, bilanço çok sağlam; büyük capex gerektirmeyen bir iş modeli.',
    fcfNote: 'FCF çok güçlü ve öngörülebilir; büyük ölçüde geri alım + temettüye yönlendiriliyor.',
    competitors: ['Mastercard', 'American Express', 'PayPal/Venmo', 'Yerel/bölgesel ödeme ağları (UnionPay vb.)'],
    moat: [
      { title: 'İki taraflı ağ etkisi', desc: 'Daha çok kartlı işlem, daha çok işyeri kabulünü çekiyor; daha çok işyeri kabulü de daha çok kart kullanımını teşvik ediyor — bu döngüyü yeni bir ağın kırması son derece zor.' },
      { title: 'Küresel işlem altyapısı ölçeği', desc: 'Onlarca yıldır kurulu, yüzlerce ülkede güvenli/uyumlu işlem işleme altyapısı, yeni girenlerin kısa vadede kopyalayamayacağı bir teknik/düzenleyici bariyer oluşturuyor.' },
    ],
    strengths: [
      'Asgari sermaye yoğunluğuyla çok yüksek ve istikrarlı marj üretiyor',
      'Nakitten dijital/karta geçiş trendi (özellikle gelişen pazarlarda) çok yıllı büyüme sağlıyor',
      'Neredeyse hiç kredi riski taşımıyor (kartı ihraç eden bankalar taşıyor) — döngüsel dayanıklılık yüksek',
    ],
    risks: [
      'Düzenleyici baskı (işlem ücreti/interchange sınırlamaları) marjı aşındırma potansiyeli taşıyor',
      'Alternatif ödeme yöntemleri (gerçek zamanlı banka transferi, dijital cüzdanlar, kripto) uzun vadede ağı atlayabilir',
      'Küresel tüketici harcamasındaki bir resesyon işlem hacmini doğrudan etkiler',
    ],
    verdict: 'Ağ etkisi ve marj yapısı, tüketici harcamasına dayalı sürekli büyümeyi ve buna bağlı çarpan primini büyük ölçüde gerekçelendiriyor; asıl uzun vadeli risk düzenleyici baskı ve ödeme ağını atlayan alternatiflerin yavaş ama kalıcı payı.',
  },

  MA: {
    asOf: 'FY2024 yıllık rapor verilerine dayalı, yaklaşık',
    segments: [
      { name: 'Ödeme ağı (işlem/hizmet ücretleri)', sharePct: 62, note: 'Visa ile aynı iş modeli, işlem hacmine bağlı' },
      { name: 'Değer katan hizmetler & çözümler (siber güvenlik, veri analitiği, danışmanlık)', sharePct: 38, note: 'En hızlı büyüyen segment' },
    ],
    revenue3yNote: '3 yıllık gelir CAGR ~%12-13 — Visa\'ya benzer temel büyüme + Değer Katan Hizmetler segmentinin görece daha hızlı büyümesi.',
    marginNote: 'Net kâr marjı ~%44-46 — Visa\'ya yakın, aynı yüksek marjlı ağ iş modeli.',
    balanceNote: 'Net Debt/EBITDA düşük-orta bandda (Visa\'ya göre biraz daha fazla satın alma iştahı — siber güvenlik/veri şirketleri); bilanço sağlam.',
    fcfNote: 'FCF çok güçlü; hem tamamlayıcı satın almaları hem hissedar getirisini finanse ediyor.',
    competitors: ['Visa', 'American Express', 'Discover (Capital One tarafından satın alınıyor)', 'PayPal'],
    moat: [
      { title: 'İki taraflı ağ etkisi', desc: 'Visa ile aynı temel dinamik — kart sahibi ve işyeri kabul ağı birbirini büyütüyor, yeni bir ağın ölçeğe ulaşması son derece zor.' },
      { title: 'Değer Katan Hizmetler çapraz satışı', desc: 'Siber güvenlik (RiskRecon), veri analitiği ve danışmanlık hizmetlerinin ağ üzerine eklenmesi, bankalar/işyerleri için değiştirme maliyetini daha da artırıyor.' },
    ],
    strengths: [
      'Değer Katan Hizmetler segmenti çekirdek ödeme işine göre daha hızlı büyüyerek gelir çeşitlendirmesi sağlıyor',
      'Aynı Visa gibi düşük sermaye yoğunluğu ve yüksek marj üretiyor',
      'Nakitten dijitale geçiş trendinden Visa ile birlikte kazançlı çıkıyor',
    ],
    risks: [
      'Düzenleyici baskı (interchange ücret sınırlamaları) küresel çapta bir risk kalemi',
      'Alternatif ödeme raylarının (gerçek zamanlı ödemeler, dijital cüzdanlar) uzun vadeli payı',
      'Değer Katan Hizmetler\'deki satın almaların entegrasyon riski',
    ],
    verdict: 'Visa ile neredeyse aynı ağ ekonomisi ve büyüyen Değer Katan Hizmetler segmenti değerlemeyi destekliyor; iki hisse arasındaki fark büyük ölçüde büyüme hızı/çeşitlendirme tercihine dayanıyor, temel tez ikisinde de benzer.',
  },

  AXP: {
    asOf: 'FY2024 yıllık rapor verilerine dayalı, yaklaşık',
    segments: [
      { name: 'ABD Tüketici Hizmetleri', sharePct: 40, note: 'Premium kart üyelik + harcama bazlı gelir' },
      { name: 'Ticari Hizmetler (kurumsal kart/harcama yönetimi)', sharePct: 24, note: 'İşletme müşterilerine odaklı' },
      { name: 'Uluslararası Kart Hizmetleri', sharePct: 17, note: 'Küresel genişleme odağı' },
      { name: 'Küresel Ticaret Hizmetleri (işyeri ağı)', sharePct: 19, note: 'İşyeri kabul komisyonları' },
    ],
    revenue3yNote: '3 yıllık gelir CAGR ~%10-12 — premium kart üyelik ücretleri ve milenyum/Z kuşağı müşteri kazanımı büyümeyi destekliyor.',
    marginNote: 'Net kâr marjı ~%15-17 bandında; Visa/Mastercard\'dan düşük çünkü Amex hem kart ihraç eden hem ağ işleten (kapalı döngü) bir model — kredi riskini kendisi taşıyor.',
    balanceNote: 'Bir banka holding şirketi olarak sermaye yeterliliği düzenlemelerine tabi; sermaye oranları sağlıklı.',
    fcfNote: 'Klasik FCF yerine sermaye/temettü kapasitesi izlenir; geri alım + temettü programı istikrarlı.',
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
    revenue3yNote: '3 yıllık gelir CAGR ~%8-10 — Medicare Advantage üyeliği ve Optum\'un dikey entegrasyonu (hekim grupları satın alımı) büyümeyi destekliyor.',
    marginNote: 'Net kâr marjı tarihsel olarak ~%5-6 bandında (sağlık sigortasında düzenleyici tıbbi harcama oranı zorunlulukları marjı sınırlıyor); 2024\'te tıbbi maliyet enflasyonu marjı baskıladı.',
    balanceNote: 'Net Debt/EBITDA düşük-orta bandda; büyük ölçekli hekim grubu/Optum satın almaları bilançoyu genişletiyor ama sağlıklı seviyede.',
    fcfNote: 'FCF tarihsel olarak çok güçlü; 2024\'teki tıbbi maliyet artışı ve operasyonel aksaklıklar (siber saldırı dahil) kısa vadede baskı yarattı.',
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
    revenue3yNote: '3 yıllık gelir CAGR düşük-orta tek hane (Kenvue tüketici sağlığı ayrılığı sonrası karşılaştırma tabanı değişti); onkoloji/immünoloji portföyü büyümeyi destekliyor.',
    marginNote: 'Net kâr marjı ilaç segmentinin ağırlığıyla yüksek (~%18-22 bandı, dönemsel dava karşılıkları nedeniyle dalgalı raporlanabilir).',
    balanceNote: 'Net Debt/EBITDA düşük bandda; AAA/AA seviyesinde kredi notuna sahip, sektörün en güçlü bilançolarından.',
    fcfNote: 'FCF çok güçlü ve istikrarlı; 60+ yıllık kesintisiz temettü artışı (Dividend King) bunun somut kanıtı.',
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
    revenue3yNote: '3 yıllık gelir CAGR çok yüksek (%30+) — GLP-1 obezite/diyabet ilaçlarının patlayan talebi sektörde emsalsiz bir büyüme yarattı.',
    marginNote: 'Net kâr marjı GLP-1 üretim kapasitesi genişledikçe yükseliyor (~%25-30 bandına doğru); kapasite kısıtı kısa vadede marjı bir miktar sınırlıyor.',
    balanceNote: 'Net Debt/EBITDA düşük-orta bandda; devasa üretim kapasitesi yatırımları (fabrika inşaatları) borçla ve nakitle birlikte finanse ediliyor.',
    fcfNote: 'FCF, GLP-1 kapasite yatırımları nedeniyle kısa vadede baskı altında ama gelir büyümesiyle hızla iyileşiyor.',
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
    revenue3yNote: '3 yıllık gelir CAGR orta tek hane — Keytruda\'nın büyümesi ana itici güç, Gardasil Çin\'de talep zayıflığı yaşadı.',
    marginNote: 'Net kâr marjı ~%25-28 bandında güçlü; Keytruda\'nın yüksek marjı konsolide kârlılığı destekliyor.',
    balanceNote: 'Net Debt/EBITDA düşük-orta bandda; Keytruda sonrası büyüme için satın alma stratejisi (business development) aktif.',
    fcfNote: 'FCF güçlü, Keytruda\'nın nakit üretimi büyük satın almaları ve temettüyü rahatça finanse ediyor.',
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
    revenue3yNote: '3 yıllık gelir CAGR düşük-orta tek hane — Humira\'nın 2023\'te biosimilar rekabetiyle sert gelir kaybına rağmen, Skyrizi/Rinvoq bu boşluğu hızla dolduruyor.',
    marginNote: 'Net kâr marjı Humira geçişi sırasında dalgalandı ama Skyrizi/Rinvoq\'un yüksek marjıyla toparlanma trendinde.',
    balanceNote: 'Net Debt/EBITDA orta bandda (Allergan satın alması mirası); güçlü nakit akışıyla kademeli azaltılıyor.',
    fcfNote: 'FCF çok güçlü; yüksek temettü verimini ve borç azaltımını birlikte finanse ediyor.',
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
    revenue3yNote: 'Covid ürünleri (aşı + Paxlovid) sonrası gelir sert düştü; Covid-dışı çekirdek iş düşük-orta tek hane büyüyor, Seagen entegrasyonu onkolojiyi güçlendiriyor.',
    marginNote: 'Net kâr marjı Covid geliri kaybı ve maliyet yeniden yapılandırması nedeniyle belirgin daraldı; maliyet tasarrufu programlarıyla toparlanma hedefleniyor.',
    balanceNote: 'Seagen satın alması (~43 milyar $) sonrası borç belirgin arttı; Net Debt/EBITDA yüksek bandda — izlenmesi gereken bir kalem.',
    fcfNote: 'FCF, Covid geliri kaybı sonrası normalleşti; maliyet tasarrufu programı ve borç azaltımı önümüzdeki dönemin odağı.',
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
    revenue3yNote: '3 yıllık gelir CAGR düşük-orta tek hane — fiyat artışlarıyla (enflasyona karşı) hacim zayıflığı büyük ölçüde dengelendi.',
    marginNote: 'Net kâr marjı ~%18-19 bandında istikrarlı; fiyatlama gücü ve maliyet verimliliği programları marjı korudu.',
    balanceNote: 'Net Debt/EBITDA düşük-orta bandda, bilanço çok sağlam; 60+ yıllık kesintisiz temettü artışı geçmişi (Dividend King).',
    fcfNote: 'FCF çok güçlü ve istikrarlı; temettü + geri alım programının ana kaynağı.',
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
    revenue3yNote: '3 yıllık gelir CAGR orta tek hane — fiyat/karma artışları hacim büyümesinden daha fazla katkı sağladı.',
    marginNote: 'Net kâr marjı ~%22-23 bandında yüksek ve istikrarlı; "asset-light" şişeleme modeli (şişeleme ortaklarına devredilmiş) marjı destekliyor.',
    balanceNote: 'Net Debt/EBITDA düşük-orta bandda; 60+ yıllık kesintisiz temettü artışı (Dividend King).',
    fcfNote: 'FCF çok güçlü ve istikrarlı; konsantre üretim + lisanslama modeli düşük sermaye yoğunluğu sağlıyor.',
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
    revenue3yNote: '3 yıllık gelir CAGR orta tek hane — Frito-Lay\'in güçlü fiyatlama gücü ve hacim direnci büyümenin ana kaynağı.',
    marginNote: 'Net kâr marjı ~%10-11 bandında Coca-Cola\'dan düşük çünkü gıda (Frito-Lay, Quaker) segmenti içecek kadar yüksek marjlı değil, ama daha çeşitlendirilmiş bir gelir tabanı sağlıyor.',
    balanceNote: 'Net Debt/EBITDA düşük-orta bandda; sağlıklı, Dividend King statüsü (50+ yıl kesintisiz temettü artışı).',
    fcfNote: 'FCF güçlü ve istikrarlı; hem içecek hem atıştırmalık işinin birleşik nakit üretimi.',
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
    revenue3yNote: '3 yıllık gelir CAGR orta tek hane — e-ticaret ve reklam (Walmart Connect) toplam büyümeyi mağaza satışlarından daha hızlı çekiyor.',
    marginNote: 'Net kâr marjı düşük (~%2-3, geleneksel perakende yapısı) ama reklam/üyelik gelirinin payı arttıkça marj kademeli iyileşiyor.',
    balanceNote: 'Net Debt/EBITDA düşük-orta bandda, bilanço sağlam; devasa ölçek nakit döngüsünü destekliyor.',
    fcfNote: 'FCF güçlü ve istikrarlı; e-ticaret lojistik yatırımları büyük ama gelir büyümesiyle karşılanıyor.',
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
    revenue3yNote: '3 yıllık gelir CAGR yüksek tek hane — üye sayısı ve üye başına harcama istikrarlı biçimde artıyor.',
    marginNote: 'Net kâr marjı düşük görünür (~%2-3) ama bu bilinçli bir strateji: ürünleri minimum kâr marjıyla satıp gerçek kârı üyelik ücretinden (yaklaşık %100\'e yakın işletme kârı katkısı) elde ediyor.',
    balanceNote: 'Net nakit pozisyonuna yakın, borç yükü çok düşük; bilanço son derece sağlam.',
    fcfNote: 'FCF güçlü ve istikrarlı; üyelik geliri öngörülebilirliği nakit akışı planlamasını kolaylaştırıyor.',
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
    revenue3yNote: '3 yıllık gelir CAGR düşük tek hane/durgun — yüksek faiz oranları ev tadilat harcamasını (özellikle büyük projeleri) baskıladı; SRS Distribution satın alması büyümeyi destekledi.',
    marginNote: 'Net kâr marjı ~%9-10 bandında istikrarlı; operasyonel verimlilik programlarıyla korunuyor.',
    balanceNote: 'SRS Distribution satın alması (~18 milyar $) sonrası borç arttı; Net Debt/EBITDA orta bandda.',
    fcfNote: 'FCF güçlü, temettü + geri alım programını rahatça finanse ediyor.',
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
    revenue3yNote: '3 yıllık gelir CAGR düşük-orta tek hane — fiyat artışları hacmi büyük ölçüde dengeledi; 2024\'te değer odaklı menü (fiyata duyarlı tüketici) baskısı arttı.',
    marginNote: 'Net kâr marjı ~%30-33 — franchise ağırlıklı model (gelirin çoğu franchise\'lardan sabit kira/royalti) sektörde en yüksek marjlardan.',
    balanceNote: 'Net Debt/EBITDA orta bandda (bilinçli olarak kaldıraçlı bir bilanço — agresif geri alım stratejisinin parçası); nakit akışı borcu rahatça karşılıyor.',
    fcfNote: 'FCF çok güçlü ve istikrarlı; franchise modelinin düşük sermaye yoğunluğu sayesinde.',
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
    revenue3yNote: 'Gelir son 2 yılda durgunlaştı/geriledi — doğrudan tüketiciye (DTC) satış stratejisinin toptan (wholesale) kanalını ihmal etmesi ve rakip markaların (On, Hoka) pazar payı kazanması büyümeyi baskıladı.',
    marginNote: 'Net kâr marjı fazla indirim/stok fazlası nedeniyle daraldı (~%9-11 bandına geriledi); yeni yönetim marj toparlanmasını hedefliyor.',
    balanceNote: 'Net nakit pozisyonuna yakın, borç yükü düşük; bilanço sorunu yok, sorun büyüme/marj tarafında.',
    fcfNote: 'FCF pozitif ama daralan kârlılıkla birlikte zayıfladı; stok yönetimi iyileştikçe toparlanması bekleniyor.',
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
    revenue3yNote: '3 yıllık gelir CAGR düşük-orta tek hane — Deneyimler segmenti büyürken Linear TV yapısal olarak küçülüyor, DTC zarar/kâr geçişindeydi.',
    marginNote: 'Konsolide net marj tek haneden toparlanıyor; DTC segmentinin kâra geçmesi (2024) marj toparlanmasının ana katalizörü oldu.',
    balanceNote: 'Net Debt/EBITDA orta bandda (21st Century Fox satın alması mirası); Hulu\'nun tamamını satın alma taahhüdü ek nakit çıkışı gerektiriyor.',
    fcfNote: 'FCF, DTC zararlarının azalmasıyla belirgin toparlandı; parklara devam eden büyük capex yatırımları var.',
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
    revenue3yNote: 'Gelir emtia fiyatlarına (petrol/gaz) bağlı olarak dalgalı; Pioneer Natural Resources satın alması (2024) üretim hacmini ve Permian havzası varlığını belirgin artırdı.',
    marginNote: 'Net kâr marjı emtia fiyat döngüsüne göre büyük dalgalanma gösteriyor; entegre yapı (upstream+downstream) saf upstream oyunculara göre marjı bir miktar dengeliyor.',
    balanceNote: 'Net Debt/EBITDA çok düşük bandda — sektörün en güçlü bilançolarından, önceki döngülerde disiplinli borç yönetiminin sonucu.',
    fcfNote: 'FCF emtia fiyatına bağlı dalgalı ama yapısal olarak güçlü; düşük kaldıraç sayesinde düşük fiyat dönemlerinde bile temettüyü sürdürebiliyor.',
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
    revenue3yNote: 'Gelir emtia fiyatlarına bağlı dalgalı; Hess Corporation satın alması (2024-2025, düzenleyici onay sürecinde) Guyana\'daki düşük maliyetli üretime erişim sağlamayı hedefliyor.',
    marginNote: 'Net kâr marjı emtia fiyat döngüsüne göre dalgalı; entegre yapı marjı bir miktar dengeliyor.',
    balanceNote: 'Net Debt/EBITDA düşük bandda, disiplinli bilanço yönetimi; Hess satın alması tamamlanırsa borç bir miktar artabilir.',
    fcfNote: 'FCF emtia fiyatına bağlı dalgalı ama yapısal olarak güçlü; temettü + geri alım programını düşük fiyat dönemlerinde bile sürdürebiliyor.',
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
    revenue3yNote: 'Gelir 737 MAX krizi, pandemi ve 2024\'teki kapı paneli olayı sonrası üretim yavaşlatmalarıyla dalgalı/durgun kaldı — henüz kriz öncesi seviyelere tam dönemedi.',
    marginNote: 'Net marj negatif (zarar) — hem ticari uçak üretim sorunları hem savunma segmentindeki sabit fiyatlı sözleşme zararları kârlılığı ağır bastırıyor.',
    balanceNote: 'Borç yükü yüksek (zarar yılları + üretim sorunları nedeniyle); Net Debt/EBITDA anlamlı hesaplanamayacak kadar zayıf, kredi notu baskı altında.',
    fcfNote: 'FCF negatif/zayıf; üretim istikrarı ve teslimat hızının normalleşmesi FCF toparlanmasının anahtarı.',
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
    revenue3yNote: '3 yıllık gelir CAGR orta tek hane — altyapı harcaması (ABD\'de CHIPS/IIJA yasaları) ve veri merkezi/AI kaynaklı yedek güç jeneratör talebi büyümeyi destekledi.',
    marginNote: 'Net kâr marjı ~%15-17 bandına yükseldi — fiyatlama disiplini ve hizmet/yedek parça gelirinin payının artması marjı yapısal olarak iyileştirdi.',
    balanceNote: 'Net Debt/EBITDA orta bandda (Finansal Ürünler segmentinin borcu dahil — bu segment doğası gereği kaldıraçlı çalışır); operasyonel iş kolu bilançosu sağlam.',
    fcfNote: 'FCF güçlü; hissedar getirisi (temettü + agresif geri alım) programını rahatça finanse ediyor.',
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
    revenue3yNote: 'WarnerMedia ayrılması (2022) sonrası odaklanmış telekom işi düşük tek hane büyüyor; fiber genişlemesi büyümenin ana kaynağı.',
    marginNote: 'Net kâr marjı ~%10-13 bandında; ağır sermaye yoğunluğu (spektrum, fiber altyapı) ve amortisman marjı sınırlıyor.',
    balanceNote: 'Net Debt/EBITDA yüksek bandda (telekomünikasyonun doğası gereği sermaye yoğun) ama WarnerMedia ayrılığı sonrası kademeli düşürülüyor — yönetimin öncelikli hedefi.',
    fcfNote: 'FCF güçlü ve istikrarlı; yüksek temettü ödemesini ve borç azaltımını birlikte finanse ediyor.',
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
    revenue3yNote: '3 yıllık gelir CAGR düşük tek hane/durgun — mobil pazarı olgunlaştı, büyüme büyük ölçüde fiyat/ARPU artışından ve fiber genişlemesinden geliyor.',
    marginNote: 'Net kâr marjı ~%12-15 bandında; ağır sermaye yoğunluğu (5G/fiber altyapı yatırımı) marjı sınırlıyor ama nispeten istikrarlı.',
    balanceNote: 'Net Debt/EBITDA yüksek bandda (telekomünikasyonun doğası + geçmiş spektrum ihaleleri); kademeli azaltım önceliği devam ediyor.',
    fcfNote: 'FCF güçlü ve istikrarlı; yüksek temettü ödemesinin ana kaynağı.',
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
