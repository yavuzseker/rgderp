# RGD-ERP — Teknik Notlar (Ajanlar İçin)

## Stack (GÜNCEL)
Proje **Vue 3 + Vite + TypeScript + PrimeVue** ile web-only olarak geliştirilir.
Önceki Expo / React Native kurulumu kaldırıldı (mobil hedefi iptal edildi).

- UI kütüphanesi: **PrimeVue 4** (Aura tabanlı özel preset → `src/theme.ts`)
- İkonlar: **PrimeIcons** (`pi pi-*`)
- Yönlendirme: **vue-router** (`src/router.ts`)
- Build: `npm run build` → statik `dist/`
- Hosting: Firebase Hosting (klasik statik). `firebase deploy --only hosting`

## Veri katmanı
Şu an UI **mock/örnek veri** ile çalışıyor: `src/data/store.ts` (reaktif depo + CRUD).
Firestore'a geçişte bu modülün fonksiyon gövdeleri `src/firebase.ts` üzerinden
gerçek sorgularla değiştirilecek; **dışa açılan fonksiyon imzaları korunmalı**.

## Klasör yapısı
```
src/
  main.ts, App.vue, router.ts, theme.ts, style.css, types.ts, utils.ts
  firebase.ts            → Firestore config (henüz pasif)
  data/store.ts          → mock reaktif veri + CRUD
  layouts/AdminLayout.vue→ sidebar + topbar kabuğu
  components/            → PageHeader, StatCard
  views/                → Dashboard, Products, Suppliers, Customers, Orders, OrderDetail
```

## Domain özeti
Sipariş/üretim takip (MRP). Ürünün `stages` şablonundan sipariş aşamaları üretilir.
Bir aşamanın `outQty`'si sonraki aşamanın `inQty`'sine girer. Roller: admin / tedarikçi
(token linki) / müşteri (token linki, salt-okunur). Tedarikçi & müşteri token ekranları
ileride eklenecek.
