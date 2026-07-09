// Finans hesap merkezi — tüm türetilmiş değerler burada.
// GELİR & GİDER kaynağı = gerçek SİPARİŞLER (db.orders). Her siparişin
// bedeli (contractValue), ödeme koşulları (paymentTerms=gelir) ve giderleri
// (expenses) vardır. Krediler/çekler/sabit giderler financeStore/mock'ta.
// Ekranlar bu fonksiyonları computed() içinde çağırır → computed = cache.
import { db } from "@/data/store";
import { cash, otherIncome } from "@/data/financeMock";
import { loans, checkGroups, fixedGroups, fx } from "@/data/financeStore";
import { fmtMoney } from "./types";
import type { Order } from "@/types";

// ---- Kur ----
export const toEur = (n: number, c: "EUR" | "TL") => (c === "EUR" ? n : n / fx.eurTry);
/** Bir EUR tutarını yuvarlayıp biçimlendirir (özet şeritleri için). */
export const moneyEur = (n: number) => fmtMoney(Math.round(n), "EUR");
const cur = (o: Order): "EUR" | "TL" => o.currency ?? "EUR";

// ---- Sipariş (tek kayıt) ----
export const termAmount = (o: Order, percent: number) =>
  Math.round(((o.contractValue ?? 0) * percent) / 100);
export const orderRevenue = (o: Order) => o.contractValue ?? 0;
export const orderTermsTotal = (o: Order) =>
  (o.paymentTerms ?? []).reduce((s, t) => s + termAmount(o, t.percent), 0);
export const orderCollected = (o: Order) =>
  (o.paymentTerms ?? [])
    .filter((t) => t.status === "tahsil")
    .reduce((s, t) => s + termAmount(o, t.percent), 0);
// Gider = siparişin ALTINDAKİ PROJELERİN giderleri (üretim maliyeti projede).
export const orderExpense = (o: Order) =>
  db.projects
    .filter((p) => p.orderId === o.id)
    .reduce((s, p) => s + (p.expenses ?? []).reduce((x, e) => x + e.amount, 0), 0);
export const orderProfit = (o: Order) => orderRevenue(o) - orderExpense(o);
export const orderMargin = (o: Order) => {
  const r = orderRevenue(o);
  return r ? Math.round((orderProfit(o) / r) * 100) : 0;
};

// ---- Şirket geneli toplamlar (EUR karşılığı) ----
const sumOrders = (fn: (o: Order) => number) =>
  db.orders.reduce((s, o) => s + toEur(fn(o), cur(o)), 0);

export const totalContract = () => sumOrders(orderRevenue);
export const totalCollected = () => sumOrders(orderCollected);
export const totalPending = () => totalContract() - totalCollected();
export const totalProjectExpense = () => sumOrders(orderExpense);
export const totalProjectProfit = () => totalContract() - totalProjectExpense();

// ---- Nakit akışı ----
// Kasa + Gelirler (ödeme koşulları) − (Sipariş gideri + Sabit + Kredi + Çek)
const MONTHS = ["Oca", "Şub", "Mar", "Nis", "May", "Haz", "Tem", "Ağu", "Eyl", "Eki", "Kas", "Ara"];

export interface CashRow {
  key: string;
  label: string;
  income: number;
  expense: number;
  net: number;
  running: number;
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

  // Siparişler: gelir (ödeme koşulları)
  for (const o of db.orders) {
    for (const t of o.paymentTerms ?? []) {
      const i = idxOf(t.dueDate);
      if (i >= 0) buckets[i].income += toEur(termAmount(o, t.percent), cur(o));
    }
  }
  // Diğer gelirler (proje dışı)
  for (const g of otherIncome) {
    const i = idxOf(g.date);
    if (i >= 0) buckets[i].income += toEur(g.amount, g.currency);
  }

  // Projeler: gider (para birimi bağlı siparişten)
  for (const p of db.projects) {
    const c = db.orders.find((o) => o.id === p.orderId)?.currency ?? "EUR";
    for (const e of p.expenses ?? []) {
      const i = idxOf(e.date);
      if (i >= 0) buckets[i].expense += toEur(e.amount, c);
    }
  }

  // Çekler
  for (const g of checkGroups)
    for (const c of g.checks) {
      const i = idxOf(c.date);
      if (i >= 0) buckets[i].expense += toEur(c.amount, g.currency);
    }

  // Sabit giderler
  for (const g of fixedGroups)
    for (const e of g.entries) {
      const i = idxOf(e.date);
      if (i >= 0) buckets[i].expense += toEur(e.amount, g.currency);
    }

  // Krediler
  for (const l of loans) {
    if (l.installments?.length) {
      for (const t of l.installments) {
        const i = idxOf(t.date);
        if (i >= 0) buckets[i].expense += toEur(t.amount, l.currency);
      }
    } else {
      const inst = toEur(l.monthlyInstallment, l.currency);
      if (inst <= 0) continue;
      const left = Math.min(months, Math.max(1, Math.round(toEur(l.remaining, l.currency) / inst)));
      for (let i = 0; i < left; i++) buckets[i].expense += inst;
    }
  }

  let run = cash.eur + cash.tl / fx.eurTry;
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
