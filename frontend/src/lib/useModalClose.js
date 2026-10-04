import { useState } from 'react';
import { MODAL_CLOSE_MS, prefersReducedMotion } from './common.js';

// Pop-up'ın "kapanıyor" animasyon durumunu (styles.css .closing) ve gerçek
// unmount'u bu kadar geciktiren tetikleyiciyi üretir. X/overlay/Escape VE
// mobil GERİ tuşu (useModalBack.js) AYNI requestClose'u çağırmalı — ikisi de
// aynı yoldan (animasyonlu) kapansın, geri tuşu aniden kesmesin.
export function useModalClose(onRealClose) {
  const [closing, setClosing] = useState(false);
  const requestClose = () => {
    setClosing(true);
    setTimeout(onRealClose, prefersReducedMotion() ? 0 : MODAL_CLOSE_MS);
  };
  return { closing, requestClose };
}
