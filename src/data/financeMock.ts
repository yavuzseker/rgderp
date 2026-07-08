// Finans modülü için örnek (dummy) veri. Excel "BÜTÇE PLANI" yapısından türetildi.
// Reaktif diziler — ekleme/silme oturum boyunca çalışır. Firestore'a geçince
// bu dosya gerçek sorgularla değişecek.
import { reactive } from "vue";
import type {
  FinanceProject,
  Milestone,
  MilestoneStatus,
  Currency,
  CashBalance,
} from "@/finance/types";

// Bugün kasada olan bakiye (TL + EUR ayrı) — düzenlenebilir.
export const cash = reactive<CashBalance>({ tl: 18500000, eur: 214000 });

let seq = 0;
const pid = () => `pf${(++seq).toString().padStart(3, "0")}`;
export const finUid = () => `f${Date.now().toString(36)}${(++seq).toString(36)}`;

interface MSInput {
  code: string;
  desc: string;
  pct: number;
  date: string;
  status: MilestoneStatus;
}
function build(contract: number, cur: Currency, rows: MSInput[]): Milestone[] {
  return rows.map((r) => ({
    code: r.code,
    description: r.desc,
    percent: r.pct,
    amount: Math.round((contract * r.pct) / 100),
    currency: cur,
    estimatedDate: r.date,
    status: r.status,
  }));
}

export const financeProjects = reactive<FinanceProject[]>([
  {
    id: pid(),
    orderNo: "SP-2026-002",
    name: "Motor Hattı",
    customer: "PSA Kenitra",
    currency: "EUR",
    contractValue: 590000,
    milestones: build(590000, "EUR", [
      { code: "ORDER", desc: "Sipariş avansı", pct: 15, date: "2025-09-19", status: "tahsil" },
      { code: "ATPL TC", desc: "Teknik onay – teslimat TC", pct: 10, date: "2025-12-05", status: "tahsil" },
      { code: "ATFE", desc: "Etüt sonu teknik onay", pct: 10, date: "2026-02-13", status: "faturalandi" },
      { code: "ATFMR", desc: "Devreye alma sonu onay", pct: 30, date: "2026-08-14", status: "bekliyor" },
      { code: "ATR", desc: "Kabul teknik onayı", pct: 20, date: "2026-11-06", status: "bekliyor" },
      { code: "COP", desc: "Performans tespiti", pct: 15, date: "2027-02-05", status: "bekliyor" },
    ]),
    expenses: [
      { description: "Devreye alma – 1. etap", category: "Devreye Alma", amount: 30000, currency: "EUR", date: "2025-11-10" },
      { description: "Devreye alma – 2. etap", category: "Devreye Alma", amount: 25000, currency: "EUR", date: "2026-01-15" },
      { description: "Devreye alma – 3. etap", category: "Devreye Alma", amount: 20000, currency: "EUR", date: "2026-03-20" },
      { description: "Komisyon (Levent)", category: "Komisyon", amount: 18000, currency: "EUR", date: "2026-04-01" },
      { description: "Prim (Ahmet)", category: "Prim", amount: 15000, currency: "EUR", date: "2026-04-01" },
    ],
  },
  {
    id: pid(),
    orderNo: "SP-2026-002",
    name: "PSPA",
    customer: "PSA Kenitra",
    currency: "EUR",
    contractValue: 515000,
    milestones: build(515000, "EUR", [
      { code: "ORDER", desc: "Sipariş avansı", pct: 30, date: "2025-08-01", status: "tahsil" },
      { code: "ATMP", desc: "Üretime geçiş onayı", pct: 10, date: "2025-10-10", status: "tahsil" },
      { code: "ATR", desc: "Kabul teknik onayı", pct: 40, date: "2026-06-05", status: "faturalandi" },
      { code: "COP", desc: "Performans tespiti", pct: 20, date: "2026-09-25", status: "bekliyor" },
    ]),
    expenses: [
      { description: "Devreye alma", category: "Devreye Alma", amount: 5000, currency: "EUR", date: "2025-11-10" },
      { description: "Saha desteği", category: "Saha", amount: 12000, currency: "EUR", date: "2026-02-01" },
    ],
  },
  {
    id: pid(),
    orderNo: "SP-2026-005",
    name: "K9 Decking Line",
    customer: "TOFAŞ",
    currency: "EUR",
    contractValue: 1250000,
    milestones: build(1250000, "EUR", [
      { code: "ORDER", desc: "Sipariş avansı", pct: 15, date: "2026-03-06", status: "tahsil" },
      { code: "ATFE", desc: "FSR 15 – etüt sonu", pct: 15, date: "2026-07-24", status: "faturalandi" },
      { code: "ATFMR", desc: "FSR 20 – mise en route", pct: 30, date: "2026-10-09", status: "bekliyor" },
      { code: "ATR", desc: "FSR 15 – kabul", pct: 25, date: "2027-01-08", status: "bekliyor" },
      { code: "COP", desc: "FSR 15 – performans", pct: 15, date: "2027-04-16", status: "bekliyor" },
    ]),
    expenses: [
      { description: "K9 Decking imalat – 1", category: "İmalat", amount: 75000, currency: "EUR", date: "2026-05-01" },
      { description: "K9 Decking imalat – 2", category: "İmalat", amount: 250000, currency: "EUR", date: "2026-06-15" },
      { description: "K9 Decking imalat – 3", category: "İmalat", amount: 100000, currency: "EUR", date: "2026-08-01" },
      { description: "Montaj & devreye alma", category: "Devreye Alma", amount: 60000, currency: "EUR", date: "2026-10-01" },
    ],
  },
  {
    id: pid(),
    orderNo: "SP-2026-007",
    name: "Somaca FSR",
    customer: "Renault Somaca",
    currency: "EUR",
    contractValue: 29450,
    milestones: build(29450, "EUR", [
      { code: "ATFE", desc: "%60 ATFE + ATMP", pct: 60, date: "2026-05-01", status: "tahsil" },
      { code: "ATFMR", desc: "%40 ATFMR + COP", pct: 40, date: "2026-07-24", status: "faturalandi" },
    ]),
    expenses: [
      { description: "Devreye alma", category: "Devreye Alma", amount: 3000, currency: "EUR", date: "2026-05-13" },
    ],
  },
  {
    id: pid(),
    orderNo: "SP-2026-009",
    name: "Assan Koltuk Hattı",
    customer: "Assan Hanil",
    currency: "EUR",
    contractValue: 835000,
    milestones: build(835000, "EUR", [
      { code: "ORDER", desc: "Sipariş avansı – tek ödeme", pct: 100, date: "2026-08-28", status: "bekliyor" },
    ]),
    expenses: [
      { description: "Malzeme tedarik", category: "Malzeme", amount: 420000, currency: "EUR", date: "2026-06-01" },
      { description: "İşçilik & montaj", category: "İşçilik", amount: 180000, currency: "EUR", date: "2026-07-15" },
    ],
  },
  {
    id: pid(),
    orderNo: "SP-2026-011",
    name: "Karsan Yedek Malzeme",
    customer: "Karsan",
    currency: "TL",
    contractValue: 2800000,
    milestones: build(2800000, "TL", [
      { code: "ORDER", desc: "Peşin – tek ödeme", pct: 100, date: "2026-05-30", status: "tahsil" },
    ]),
    expenses: [
      { description: "Yedek parça tedarik", category: "Malzeme", amount: 1650000, currency: "TL", date: "2026-04-20" },
    ],
  },
  {
    // Aynı müşteri (Karsan) için İKİNCİ sipariş — sipariş bazlı gruplamayı gösterir
    id: pid(),
    orderNo: "SP-2026-013",
    name: "Karsan Fikstür Revizyon",
    customer: "Karsan",
    currency: "TL",
    contractValue: 1200000,
    milestones: build(1200000, "TL", [
      { code: "ORDER", desc: "Sipariş avansı", pct: 40, date: "2026-08-15", status: "bekliyor" },
      { code: "ATR", desc: "Kabul teknik onayı", pct: 60, date: "2026-11-15", status: "bekliyor" },
    ]),
    expenses: [
      { description: "Fikstür malzeme", category: "Malzeme", amount: 380000, currency: "TL", date: "2026-08-01" },
      { description: "İşçilik & montaj", category: "İşçilik", amount: 220000, currency: "TL", date: "2026-09-10" },
    ],
  },
]);

// EUR/TL varsayılan kur (haftalık TCMB — dummy)
export const eurTry = 47.5;

// NOT: Sabit giderler artık Firestore'da (fixedGroups — src/data/financeStore.ts).

// NOT: Krediler artık Firestore'da (src/data/financeStore.ts).

// NOT: Çekler artık Firestore'da (checkGroups — src/data/financeStore.ts).
