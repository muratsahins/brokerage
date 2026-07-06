# Ücretsiz Yayına Alma (Deploy) — Vercel (frontend) + Render (backend)

Uygulama iki parçalı: **backend** (Node/Express, Render'da) ve **frontend**
(React/Vite, Vercel'de). Önce backend'i yayınla, adresini al, sonra frontend'e ver.

> İkisi de ücretsiz. Not: Render ücretsiz planı ~15 dk hareketsizlikte uyur;
> ilk ziyaretçi ~30-50 sn cold-start bekleyebilir (uyanınca veri otomatik gelir).

---

## 1) Backend → Render

1. https://render.com → GitHub ile giriş yap.
2. **New +** → **Blueprint** → bu repo'yu (`muratsahins/brokerage`) seç.
   - Repo kökündeki [`render.yaml`](render.yaml) her şeyi otomatik ayarlar
     (rootDir: `backend`, build: `npm install`, start: `npm start`, plan: free).
   - Alternatif (Blueprint yerine elle): **New +** → **Web Service** →
     Root Directory `backend`, Build `npm install`, Start `npm start`.
3. **Branch**: yayınlamak istediğin dalı seç (örn. `main`).
4. Deploy bitince servis adresini kopyala, örn:
   `https://brokerage-api.onrender.com`
5. Doğrula: tarayıcıda `https://brokerage-api.onrender.com/api/health`
   → `{"ok":true,...}` görmelisin.

İstersen PostgreSQL: Render'da **New +** → **PostgreSQL** (free) oluştur,
"Internal Database URL"i kopyala, web servisine `DATABASE_URL` env değişkeni
olarak ekle. Eklemezsen uygulama bellek içi çalışır (sorun değil).

---

## 2) Frontend → Vercel

1. https://vercel.com → GitHub ile giriş yap → **Add New… → Project** →
   bu repo'yu içe aktar.
2. **Root Directory**: `frontend` seç (önemli — monorepo).
   - Framework otomatik "Vite" algılanır ([`frontend/vercel.json`](frontend/vercel.json) hazır).
3. **Environment Variables** kısmına ekle:
   - Key: `VITE_API_URL`
   - Value: Render backend adresin (örn. `https://brokerage-api.onrender.com`)
     — **sonunda `/` olmasın.**
4. **Deploy**. Bitince `https://<proje>.vercel.app` adresini paylaşabilirsin.

> `VITE_API_URL` derleme anında gömülür. Adresi sonradan değiştirirsen
> Vercel'de **Redeploy** gerekir.

---

## 3) Nasıl bağlanıyorlar?

```
[Vercel]  React (statik)          [Render]  Node/Express
   fetch(`${VITE_API_URL}/api/...`)  ───▶   /api/recommendations  ──▶ Yahoo Finance
```

- Backend CORS tüm origin'lere açık ([server.js](backend/src/server.js) `cors()`),
  yani Vercel alan adından çağrı sorunsuz çalışır.
- Yerelde `VITE_API_URL` boş kalır → `/api` Vite proxy'siyle `localhost:4000`'e gider.

---

## Özet kontrol listesi
- [ ] Render'da backend deploy edildi, `/api/health` çalışıyor.
- [ ] Backend adresi kopyalandı.
- [ ] Vercel'de Root Directory = `frontend`, `VITE_API_URL` = backend adresi.
- [ ] Vercel URL'i açıldı, hisse listesi geliyor (ilk açılış yavaş olabilir).
