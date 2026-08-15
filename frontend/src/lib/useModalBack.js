import { useEffect, useRef } from 'react';

// Pop-up açıkken telefonun/tarayıcının GERİ tuşu siteden çıkmasın, sadece
// pop-up'ı kapatsın.
//
// Nasıl: pop-up açılırken geçmişe işaretli bir kayıt (`{ modalAcik: true }`)
// eklenir. Geri tuşu önce bu kaydı düşürür — biz de `popstate`i yakalayıp
// pop-up'ı kapatırız, sayfa hiç değişmez.
//
// Pop-up X'ten/overlay'den/Escape ile kapatılırsa eklediğimiz kayıt geçmişte
// asılı kalırdı: kullanıcı bir kez daha geri tuşuna basmak zorunda kalır,
// hiçbir şey olmamış gibi görünürdü. Temizlikte kaydı biz geri alıyoruz.
//
// NEDEN PAYLAŞILAN YIĞIN (her hook kendi `popstate` dinleyicisini kurmak
// yerine): `popstate` window üzerinde tek bir olay ve TÜM dinleyicileri
// tetikler. Aynı anda iki pop-up açıksa (ABD sekmesinde rapor + grafik) tek
// geri basışı ikisini birden kapatırdı; geriye tek geçmiş kaydı kalırken iki
// cleanup birden `back()` çağırır ve ikincisi kullanıcıyı GERÇEKTEN siteden
// atardı. Yığın sayesinde geri tuşu yalnızca EN ÜSTTEKİ pop-up'ı kapatır ve
// her pop-up tam olarak bir geçmiş kaydından sorumlu olur.
//
// Bilinen sınır: geçmişte yalnızca en üstteki kayıt düşürülebilir. Alttaki bir
// pop-up, üstündeki açıkken arayüzden kapatılırsa yanlış kaydı düşürürüz.
// Bugünkü arayüzde erişilemez (pop-up açan butonların hepsi overlay'in
// arkasında kalıyor); iç içe pop-up eklenirse burası gözden geçirilmeli.
const yigin = [];
let dinleyiciKurulu = false;

function geriBasildi() {
  const ust = yigin[yigin.length - 1];
  if (!ust) return;
  // Kaydı tarayıcı zaten düşürdü; cleanup tekrar back() çağırmasın.
  ust.geriIleKapandi = true;
  ust.close();
}

function dinleyiciAyarla() {
  const gerekli = yigin.length > 0;
  if (gerekli && !dinleyiciKurulu) {
    window.addEventListener('popstate', geriBasildi);
    dinleyiciKurulu = true;
  } else if (!gerekli && dinleyiciKurulu) {
    window.removeEventListener('popstate', geriBasildi);
    dinleyiciKurulu = false;
  }
}

// `isAcik` parametresi bilerek var (hook'u pop-up bileşeninin İÇİNE koymak
// yerine): grafik pop-up'ı tembel yükleniyor ve "Grafik yükleniyor…" ekranı
// birkaç saniye sürebiliyor. Geçmiş kaydı, kullanıcı dokunur dokunmaz eklensin
// ki o aralıkta basılan geri tuşu da siteden çıkarmasın.
export function useModalBack(isAcik, onClose) {
  // onClose çağrı yerlerinde satır içi ok fonksiyonu; her render'da kimliği
  // değişiyor. Ref'te tutulmazsa effect her render'da yeniden kurulur ve
  // geçmişe kayıt üstüne kayıt eklenirdi.
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!isAcik) return undefined;
    const giris = { close: () => onCloseRef.current(), geriIleKapandi: false };
    yigin.push(giris);
    dinleyiciAyarla();
    window.history.pushState({ modalAcik: true }, '');

    return () => {
      const i = yigin.indexOf(giris);
      if (i !== -1) yigin.splice(i, 1);
      dinleyiciAyarla();
      // Geri tuşuyla kapandıysa kayıt zaten düştü; tekrar back() çağırmak
      // kullanıcıyı siteden atardı.
      if (giris.geriIleKapandi) return;
      if (window.history.state?.modalAcik) window.history.back();
    };
  }, [isAcik]);
}
