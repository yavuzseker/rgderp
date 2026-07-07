// Finans verisinin Firestore'a bağlı katmanı. Aşamalı geçiş: şimdilik yalnızca
// KREDİLER Firestore'da; diğer finans verileri hâlâ financeMock'ta.
// Gerçek-zamanlı okuma (onSnapshot) + kalıcı CRUD. Dizi imzası korunur, böylece
// calc.ts ve ekranlar değişmeden çalışır.
import { reactive } from "vue";
import { collection, doc, onSnapshot, setDoc, deleteDoc } from "firebase/firestore";
import { firestore } from "@/firebase";
import type { Loan } from "@/finance/types";

export const finUid = () => Math.random().toString(36).slice(2, 10);

/** Krediler — Firestore ile senkron reaktif dizi. */
export const loans = reactive<Loan[]>([]);

let started = false;
export function startFinanceListeners() {
  if (started) return;
  started = true;
  onSnapshot(collection(firestore, "loans"), (snap) => {
    const rows = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Loan));
    loans.splice(0, loans.length, ...rows);
  });
}

export async function saveLoan(l: Loan) {
  const id = l.id || finUid();
  const data: Loan = { ...l, id };
  // undefined alanları Firestore kabul etmez; installments yoksa boş dizi
  if (!data.installments) data.installments = [];
  await setDoc(doc(firestore, "loans", id), data);
}

export async function deleteLoan(id: string) {
  await deleteDoc(doc(firestore, "loans", id));
}
