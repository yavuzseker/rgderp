// Finans modülü için örnek (dummy) veri. Excel "BÜTÇE PLANI" yapısından türetildi.
// Firestore'a geçince bu dosya gerçek sorgularla değişecek.
import type {
  FinanceProject,
  Milestone,
  MilestoneStatus,
  Currency,
  FixedExpense,
  Loan,
  CheckItem,
  MonthlyFlow,
} from "@/finance/types";

let seq = 0;
const pid = () => `pf${(++seq).toString().padStart(3, "0")}`;

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

export const financeProjects: FinanceProject[] = [
  {
    id: pid(),
    orderNo: "SP-2026-002",
    name: "Motor Hattı",
    customer: "PSA Kenitra",
    currency: "EUR",
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
    milestones: build(2800000, "TL", [
      { code: "ORDER", desc: "Peşin – tek ödeme", pct: 100, date: "2026-05-30", status: "tahsil" },
    ]),
    expenses: [
      { description: "Yedek parça tedarik", category: "Malzeme", amount: 1650000, currency: "TL", date: "2026-04-20" },
    ],
  },
];

// EUR/TL varsayılan kur (haftalık TCMB — dummy)
export const eurTry = 47.5;

/** Aylık nakit akışı (EUR karşılığı, dummy). */
export const monthlyFlow: MonthlyFlow[] = [
  { month: "Şub 26", income: 88000, expense: 132000 },
  { month: "Mar 26", income: 305000, expense: 210000 },
  { month: "Nis 26", income: 142000, expense: 168000 },
  { month: "May 26", income: 118000, expense: 205000 },
  { month: "Haz 26", income: 372000, expense: 240000 },
  { month: "Tem 26", income: 268000, expense: 155000 },
  { month: "Ağu 26", income: 934000, expense: 380000 },
  { month: "Eyl 26", income: 214000, expense: 176000 },
  { month: "Eki 26", income: 468000, expense: 322000 },
  { month: "Kas 26", income: 236000, expense: 148000 },
  { month: "Ara 26", income: 152000, expense: 210000 },
  { month: "Oca 27", income: 340000, expense: 168000 },
];

export const fixedExpenses: FixedExpense[] = [
  { name: "Maaş / Tazminat", amount: 4200000, currency: "TL", dayOfMonth: 5 },
  { name: "SGK", amount: 980000, currency: "TL", dayOfMonth: 20 },
  { name: "Stopaj", amount: 420000, currency: "TL", dayOfMonth: 26 },
  { name: "KDV", amount: 1350000, currency: "TL", dayOfMonth: 26 },
  { name: "Kira", amount: 650000, currency: "TL", dayOfMonth: 1 },
  { name: "Elektrik", amount: 480000, currency: "TL", dayOfMonth: 15 },
  { name: "Su", amount: 42000, currency: "TL", dayOfMonth: 15 },
  { name: "Telefon + İnternet", amount: 38000, currency: "TL", dayOfMonth: 10 },
];

export const loans: Loan[] = [
  { name: "Garanti Kredi 40M", bank: "Garanti", remaining: 35513242, currency: "TL", monthlyInstallment: 2100000 },
  { name: "Kuveyt EUR Kredi", bank: "Kuveyt Türk", remaining: 813458, currency: "EUR", monthlyInstallment: 42000 },
  { name: "TEB 10M Exim", bank: "TEB", remaining: 12230000, currency: "TL", monthlyInstallment: 950000 },
  { name: "TF Leasing", bank: "TF", remaining: 10509994, currency: "TL", monthlyInstallment: 620000 },
  { name: "YPK 5M", bank: "YPK", remaining: 5000000, currency: "TL", monthlyInstallment: 410000 },
];

export const checks: CheckItem[] = [
  { firma: "Küresel Hırdavat", bank: "Halkbank", amount: 193000, currency: "TL", dueDate: "2026-07-10" },
  { firma: "Kalitek", bank: "Halkbank", amount: 49000, currency: "TL", dueDate: "2026-07-10" },
  { firma: "Körüstan Bursa Sac", bank: "Garanti", amount: 320000, currency: "TL", dueDate: "2026-07-18" },
  { firma: "İsse Makina", bank: "Halkbank", amount: 100000, currency: "TL", dueDate: "2026-07-25" },
  { firma: "Entek Global Makina", bank: "ING", amount: 35301, currency: "TL", dueDate: "2026-08-02" },
];
