// Nakit akışı hesabı — tüm gelir/gider kaynaklarını aya göre toplar ve
// kasadan başlayarak yürüyen bakiyeyi çıkarır. Tümü EUR karşılığı.
//   Kasa + Gelirler − (Proje gideri + Sabit gider + Kredi taksiti + Çek)
import { financeProjects, fixedExpenses, loans, checks, cash, eurTry } from "@/data/financeMock";
import type { Currency } from "./types";

const toEur = (n: number, cur: Currency) => (cur === "EUR" ? n : n / eurTry);
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

  // Proje gelirleri (milestone) ve proje giderleri
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

  // Çekler (vade ayında gider)
  for (const c of checks) {
    const i = idxOf(c.dueDate);
    if (i >= 0) buckets[i].expense += toEur(c.amount, c.currency);
  }

  // Aylık tekrar edenler: sabit giderler + kredi taksitleri
  const fixedMonthly = fixedExpenses.reduce((s, f) => s + toEur(f.amount, f.currency), 0);
  const loanMonthly = loans.reduce((s, l) => s + toEur(l.monthlyInstallment, l.currency), 0);
  for (const b of buckets) b.expense += fixedMonthly + loanMonthly;

  // Yürüyen bakiye — bugünkü kasadan (EUR karşılığı) başlar
  let run = cash.eur + cash.tl / eurTry;
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
