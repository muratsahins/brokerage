// Sitenin "hafif" e-posta girişi — gerçek kimlik doğrulama DEĞİL, Sanal
// Borsa'nın kullandığı desenin aynısı: e-posta yalnızca bu tarayıcıda saklanır,
// sahipliği doğrulanmaz. Sanal Borsa VE Sohbet AYNI anahtarı kullanır, yani
// birine giriş yapan otomatik olarak diğerinde de "giriş yapmış" sayılır.
//
// App.jsx (sekme çubuğu) de bu durumu bilmesi gerektiği için (Sohbet sekmesi
// yalnızca giriş yapılınca görünür), localStorage değişikliği bir custom event
// ile yayınlanıyor — `storage` event'i yalnızca FARKLI sekme/pencerede
// tetiklendiğinden aynı sekme içindeki App <-> VirtualTrade/ChatTab senkronu
// için yeterli değil.
const EMAIL_KEY = 'vb_email';
const EVENT = 'site-email-changed';

export function getStoredEmail() {
  try { return localStorage.getItem(EMAIL_KEY) || ''; } catch { return ''; }
}

export function setStoredEmail(email) {
  try {
    if (email) localStorage.setItem(EMAIL_KEY, email);
    else localStorage.removeItem(EMAIL_KEY);
  } catch { /* yoksay */ }
  window.dispatchEvent(new CustomEvent(EVENT, { detail: email || '' }));
}

// cb(email) çağrılır; unsubscribe fonksiyonu döner (useEffect temizliği için).
export function onEmailChange(cb) {
  const handler = (e) => cb(e?.detail ?? getStoredEmail());
  window.addEventListener(EVENT, handler);
  window.addEventListener('storage', handler); // başka sekme/pencerede değişirse
  return () => {
    window.removeEventListener(EVENT, handler);
    window.removeEventListener('storage', handler);
  };
}

export function isValidEmail(s) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}
