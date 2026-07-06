// Finans modülü tipleri + milestone kataloğu + yardımcılar.
// Şu an tümü mock veriyle çalışır (src/data/financeMock.ts). Firestore'a
// geçişte tipler korunur, sadece veri kaynağı değişir.

export type Currency = "EUR" | "TL";

/** Ödeme dilimi durumu */
export type MilestoneStatus = "bekliyor" | "faturalandi" | "tahsil";

/** Teknik onaya bağlı standart ödeme dilimleri (Fransızca resmi adlar). */
export interface MilestoneDef {
  code: string;
  label: string;
  defaultPercent: number;
}

export const MILESTONE_CATALOG: MilestoneDef[] = [
  { code: "ORDER", label: "Acompte à la commande", defaultPercent: 15 },
  { code: "ATPL TC", label: "Accord Technique Pour Livraison TC", defaultPercent: 10 },
  { code: "ATFE", label: "Accord Technique de Fin des Études", defaultPercent: 10 },
  { code: "ATPL", label: "Accord Technique Pour Livraison", defaultPercent: 10 },
  { code: "ATFMR", label: "Accord Technique de Fin de Mise en Route", defaultPercent: 30 },
  { code: "ATMP", label: "Accord Technique de Mise en Production", defaultPercent: 0 },
  { code: "ATR", label: "Accord Technique de Réception", defaultPercent: 20 },
  { code: "COP", label: "Constat d'Obtention de Performance", defaultPercent: 5 },
];

export interface Milestone {
  code: string;
  description: string;
  percent: number;
  amount: number;
  currency: Currency;
  estimatedDate: string; // ISO — tahmini teknik onay/ödeme tarihi
  status: MilestoneStatus;
}

export interface ExpenseItem {
  description: string;
  category: string;
  amount: number;
  currency: Currency;
  date: string; // ISO
}

/** Sipariş altındaki bir proje (alt başlık). */
export interface FinanceProject {
  id: string;
  orderNo: string; // bağlı sipariş no
  name: string; // proje adı (alt başlık)
  customer: string; // firma
  currency: Currency;
  contractValue: number; // sözleşme bedeli — milestone tutarları bunun yüzdesidir
  milestones: Milestone[];
  expenses: ExpenseItem[];
}

/** Bugün kasada olan bakiye (TL + EUR ayrı). */
export interface CashBalance {
  tl: number;
  eur: number;
}

/** Sözleşme bedeli + orandan milestone tutarını hesaplar. */
export const milestoneAmount = (contractValue: number, percent: number) =>
  Math.round((contractValue * percent) / 100);

// ---- Şirket geneli yükümlülükler ----
export interface FixedExpense {
  name: string;
  amount: number;
  currency: Currency;
  dayOfMonth: number;
}
export interface Loan {
  name: string;
  bank: string;
  remaining: number;
  currency: Currency;
  monthlyInstallment: number;
}
export interface CheckItem {
  firma: string;
  bank: string;
  amount: number;
  currency: Currency;
  dueDate: string; // ISO
}

export interface MonthlyFlow {
  month: string; // "Oca 26"
  income: number; // EUR karşılığı
  expense: number; // EUR karşılığı
}

// ---- Yardımcılar ----
// Gelir = sözleşme bedeli (milestone'lar bunun ödeme takvimidir).
export const projectRevenue = (p: FinanceProject) => p.contractValue;

// Milestone tutarları toplamı (oran toplamı %100 ise bedele eşit olmalı).
export const milestonesTotal = (p: FinanceProject) =>
  p.milestones.reduce((s, m) => s + m.amount, 0);

export const projectCollected = (p: FinanceProject) =>
  p.milestones.filter((m) => m.status === "tahsil").reduce((s, m) => s + m.amount, 0);

export const projectExpense = (p: FinanceProject) =>
  p.expenses.reduce((s, e) => s + e.amount, 0);

export const projectProfit = (p: FinanceProject) => projectRevenue(p) - projectExpense(p);

export const projectMargin = (p: FinanceProject) => {
  const rev = projectRevenue(p);
  return rev ? Math.round((projectProfit(p) / rev) * 100) : 0;
};

export function fmtMoney(n: number, cur: Currency = "EUR") {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: cur === "EUR" ? "EUR" : "TRY",
    maximumFractionDigits: 0,
  }).format(n);
}

/** Tahmini tarihe kaç hafta kaldığını / geçtiğini döner. */
export function weeksLeft(iso: string): { text: string; overdue: boolean } {
  const diff = new Date(iso).getTime() - Date.now();
  const w = Math.round(diff / (7 * 86400000));
  if (w < 0) return { text: "GEÇTİ", overdue: true };
  if (w === 0) return { text: "BU HAFTA", overdue: false };
  return { text: `${w} HAFTA KALDI`, overdue: false };
}

export const MILESTONE_STATUS: Record<MilestoneStatus, { label: string; severity: string }> = {
  bekliyor: { label: "Tahmini", severity: "secondary" },
  faturalandi: { label: "Faturalandı", severity: "warn" },
  tahsil: { label: "Tahsil edildi", severity: "success" },
};
