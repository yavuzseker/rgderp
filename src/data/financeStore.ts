// Finans verisinin Firestore'a bağlı katmanı. Aşamalı geçiş: KREDİLER + ÇEKLER
// Firestore'da; diğer finans verileri (projeler, giderler, sabit, kasa) hâlâ
// financeMock'ta. Gerçek-zamanlı okuma (onSnapshot) + kalıcı CRUD.
import { reactive } from "vue";
import { collection, doc, onSnapshot, setDoc, deleteDoc } from "firebase/firestore";
import { firestore } from "@/firebase";
import type { Loan, CheckGroup } from "@/finance/types";

export const finUid = () => Math.random().toString(36).slice(2, 10);

/** Krediler — Firestore ile senkron. */
export const loans = reactive<Loan[]>([]);
/** Çek grupları (firma bazında) — Firestore ile senkron. */
export const checkGroups = reactive<CheckGroup[]>([]);

function bind<T>(name: string, target: T[]) {
  onSnapshot(collection(firestore, name), (snap) => {
    target.splice(0, target.length, ...snap.docs.map((d) => ({ id: d.id, ...d.data() } as T)));
  });
}

let started = false;
export function startFinanceListeners() {
  if (started) return;
  started = true;
  bind("loans", loans);
  bind("checkGroups", checkGroups);
}

export async function saveLoan(l: Loan) {
  const id = l.id || finUid();
  const data: Loan = { ...l, id };
  if (!data.installments) data.installments = [];
  await setDoc(doc(firestore, "loans", id), data);
}
export async function deleteLoan(id: string) {
  await deleteDoc(doc(firestore, "loans", id));
}

export async function saveCheckGroup(g: CheckGroup) {
  const id = g.id || finUid();
  const data: CheckGroup = { ...g, id };
  if (!data.checks) data.checks = [];
  if (data.bank === undefined) delete data.bank; // Firestore undefined kabul etmez
  await setDoc(doc(firestore, "checkGroups", id), data);
}
export async function deleteCheckGroup(id: string) {
  await deleteDoc(doc(firestore, "checkGroups", id));
}
