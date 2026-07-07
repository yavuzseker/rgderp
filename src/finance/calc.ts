// Finans hesap merkezi — tüm türetilmiş değerler burada.
// Veri kaynağı tek yerden gelir (şimdi financeMock, Firestore'a geçince
// financeStore olacak — sadece aşağıdaki import satırı değişir).
// Ekranlar bu fonksiyonları computed() içinde çağırır → computed = cache.
import { financeProjects, cash, eurTry } from "@/data/financeMock";
import { loans, checkGroups, fixedGroups } from "@/data/financeStore"; // krediler+çekler+sabit giderler Firestore'da
import type { Currency, FinanceProject } from "./types";

// ---- Kur ----
export const toEur = (n: number, cur: Currency) => (cur === "EUR" ? n : n / eurTry);

// ---- Milestone / proje (tek kayıt) ----
export const milestoneAmount = (contractValue: number, percent: number) =>
  Math.round((contractValue * percent) / 100);

/** Gelir = sözleşme bedeli (milestone'lar bunun ödeme takvimidir). */
export const projectRevenue = (p: FinanceProject) => p.contractValue;

/** Milestone tutarları toplamı (oran toplamı %100 ise bedele eşit olmalı). */
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

// ---- Şirket geneli toplamlar (EUR karşılığı) ----
const sumProjects = (fn: (p: FinanceProject) => number) =>
  financeProjects.reduce((s, p) => s + toEur(fn(p), p.currency), 0);

export const totalContract = () => sumProjects(projectRevenue);
export const totalCollected = () => sumProjects(projectCollected);
export const totalPending = () => totalContract() - totalCollected();
export const totalProjectExpense = () => sumProjects(projectExpense);
export const totalProjectProfit = () => totalContract() - totalProjectExpense();

/** Proje seç kutuları için ortak seçenek listesi. */
export const projectOptions = () =>
  financeProjects.map((p) => ({ label: `${p.orderNo} · ${p.name} (${p.customer})`, value: p.id }));

// ---- Nakit akışı ----
// Kasa + Gelirler − (Proje gideri + Sabit gider + Kredi taksiti + Çek), aya göre.
const MONTHS = ["Oca", "Şub", "Mar", "Nis", "May", "Haz", "Tem", "Ağu", "Eyl", "Eki", "Kas", "Ara"];

export interface CashRow {
  key: string;
  label: string;
  income: number;
  expense: number;
  net: number;
  running: number; // ay sonu kümülatif kasa
}

export function monthlyCashflow(months = 12): CashRow[] {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);

  const buckets = Array.from({ length: months }, (_, i) => {
    const d = new Date(start.getFullYear(), start.getMonth() + i, 1);
    return { y: d.getFullYear(), m: d.getMonth(), income: 0, expense: 0 };
  });
  const idxOf = (iso: string) => {
    const d = new Date(iso);
    return buckets.findIndex((b) => b.y === d.getFullYear() && b.m === d.getMonth());
  };

  for (const p of financeProjects) {
    for (const m of p.milestones) {
      const i = idxOf(m.estimatedDate);
      if (i >= 0) buckets[i].income += toEur(m.amount, m.currency);
    }
    for (const e of p.expenses) {
      const i = idxOf(e.date);
      if (i >= 0) buckets[i].expense += toEur(e.amount, e.currency);
    }
  }
  for (const g of checkGroups) {
    for (const c of g.checks) {
      const i = idxOf(c.date);
      if (i >= 0) buckets[i].expense += toEur(c.amount, g.currency);
    }
  }

  // Sabit giderler — her kalemin o ayki kaydı ilgili aya yazılır
  for (const g of fixedGroups) {
    for (const e of g.entries) {
      const i = idxOf(e.date);
      if (i >= 0) buckets[i].expense += toEur(e.amount, g.currency);
    }
  }

  // Krediler: taksit takvimi varsa her taksit kendi ayına yazılır (doğru);
  // yoksa (elle eklenen kredi) aylık taksit kadar, kalan bitene dek dağıtılır.
  for (const l of loans) {
    if (l.installments?.length) {
      for (const t of l.installments) {
        const i = idxOf(t.date);
        if (i >= 0) buckets[i].expense += toEur(t.amount, l.currency);
      }
    } else {
      const inst = toEur(l.monthlyInstallment, l.currency);
      if (inst <= 0) continue;
      const monthsLeft = Math.min(months, Math.max(1, Math.round(toEur(l.remaining, l.currency) / inst)));
      for (let i = 0; i < monthsLeft; i++) buckets[i].expense += inst;
    }
  }

  let run = cash.eur + cash.tl / eurTry; // bugünkü kasadan başla
  return buckets.map((b) => {
    const net = b.income - b.expense;
    run += net;
    return {
      key: `${b.y}-${b.m}`,
      label: `${MONTHS[b.m]} ${String(b.y).slice(2)}`,
      income: b.income,
      expense: b.expense,
      net,
      running: run,
    };
  });
}
