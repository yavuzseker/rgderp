// Finans modülü — kalan mock veri.
// Gelir/gider gerçek SİPARİŞLER'den (db.orders); krediler/çekler/sabit giderler
// Firestore'dan (financeStore) gelir. Burada yalnızca kasa ve kur tutulur.
import { reactive } from "vue";
import type { CashBalance } from "@/finance/types";

// Bugün kasada olan bakiye (TL + EUR ayrı) — düzenlenebilir.
export const cash = reactive<CashBalance>({ tl: 18500000, eur: 214000 });

// EUR/TL varsayılan kur (haftalık TCMB — dummy)
export const eurTry = 47.5;
