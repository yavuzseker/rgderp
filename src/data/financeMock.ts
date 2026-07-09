// Finans modülü — kalan mock veri.
// Gelir/gider gerçek SİPARİŞLER'den (db.orders); krediler/çekler/sabit giderler
// Firestore'dan (financeStore) gelir. Burada yalnızca kasa ve kur tutulur.
import { reactive } from "vue";
import type { CashBalance, OtherIncome } from "@/finance/types";

// Bugün kasada olan bakiye (TL + EUR ayrı) — düzenlenebilir.
export const cash = reactive<CashBalance>({ tl: 18500000, eur: 214000 });

// NOT: EUR/TL kuru (fx) Firestore'da — src/data/financeStore.ts

export const finUid = () => `f${Date.now().toString(36)}${Math.floor(Math.random() * 1e6).toString(36)}`;

// Proje dışı gelirler — nakit akışına gelir olarak eklenir.
export const otherIncome = reactive<OtherIncome[]>([
  { id: finUid(), date: "2026-08-12", description: "Tofaş KDV İadesi", amount: 2800000, currency: "TL" },
  { id: finUid(), date: "2026-09-05", description: "Ortak Geri Ödeme", amount: 1400000, currency: "TL" },
]);
