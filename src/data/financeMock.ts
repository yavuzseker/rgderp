// Finans modülü — kalan mock veri.
// Gelir/gider gerçek SİPARİŞLER'den (db.orders); krediler/çekler/sabit giderler
// Firestore'dan (financeStore) gelir. Burada yalnızca kasa ve kur tutulur.
import { reactive } from "vue";
import type { CashBalance, OtherIncome } from "@/finance/types";

// Bugün kasada olan bakiye (TL + EUR ayrı) — düzenlenebilir.
export const cash = reactive<CashBalance>({ tl: 0, eur: 0 });

// NOT: EUR/TL kuru (fx) Firestore'da — src/data/financeStore.ts

export const finUid = () => `f${Date.now().toString(36)}${Math.floor(Math.random() * 1e6).toString(36)}`;

// Proje dışı gelirler — nakit akışına gelir olarak eklenir. (kullanıcı girer)
export const otherIncome = reactive<OtherIncome[]>([]);
