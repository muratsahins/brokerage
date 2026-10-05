import { useEffect, useRef, useState } from 'react';
import { MODAL_CLOSE_MS, prefersReducedMotion } from './common.js';

// Pop-up'ın "kapanıyor" animasyon durumunu (styles.css .closing) ve gerçek
// unmount'u bu kadar geciktiren tetikleyiciyi üretir. X/overlay/Escape VE
// mobil GERİ tuşu (useModalBack.js) AYNI requestClose'u çağırmalı — ikisi de
// aynı yoldan (animasyonlu) kapansın, geri tuşu aniden kesmesin.
//
// `resetKey`: açık öğenin kimliği (ör. ticker). Bir pop-up X/overlay/geri ile
// kapatılırken 160ms'lik kapanma zamanlayıcısı beklerken kullanıcı HEMEN
// başka bir öğeye tıklarsa (Tarama listesinde satırlar üst üste olduğu için
// kolay oluyor), `closing` bayrağı true'da takılı kalırdı: yeni pop-up
// DOĞRUDAN görünmez (opacity:0) açılır, sonra eski zamanlayıcı dolunca onu da
// kapatırdı — "grafik açılmıyor" diye görünen asıl sebep buydu. `resetKey`
// değiştiğinde bekleyen zamanlayıcıyı iptal edip `closing`i sıfırlıyoruz.
export function useModalClose(onRealClose, resetKey) {
  const [closing, setClosing] = useState(false);
  const timeoutRef = useRef(null);
  const requestClose = () => {
    setClosing(true);
    timeoutRef.current = setTimeout(() => {
      timeoutRef.current = null;
      onRealClose();
    }, prefersReducedMotion() ? 0 : MODAL_CLOSE_MS);
  };

  useEffect(() => {
    if (resetKey == null) return;
    if (timeoutRef.current) { clearTimeout(timeoutRef.current); timeoutRef.current = null; }
    setClosing(false);
  }, [resetKey]);

  return { closing, requestClose };
}
