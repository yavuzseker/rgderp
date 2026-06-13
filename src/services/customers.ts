import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
  getDocs,
  type Unsubscribe,
} from "firebase/firestore";
import { db } from "../lib/firebase";
import type { Customer } from "../types";

const COLLECTION = "customers";

export function subscribeCustomers(
  callback: (customers: Customer[]) => void
): Unsubscribe {
  return onSnapshot(collection(db, COLLECTION), (snapshot) => {
    const customers = snapshot.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    })) as Customer[];
    callback(customers);
  });
}

export async function addCustomer(
  customer: Omit<Customer, "id">
): Promise<string> {
  const ref = await addDoc(collection(db, COLLECTION), customer);
  return ref.id;
}

export async function updateCustomer(
  id: string,
  data: Partial<Customer>
): Promise<void> {
  await updateDoc(doc(db, COLLECTION, id), data);
}

export async function deleteCustomer(id: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTION, id));
}

export async function getCustomerByToken(
  token: string
): Promise<Customer | null> {
  const q = query(
    collection(db, COLLECTION),
    where("accessToken", "==", token)
  );
  const snap = await getDocs(q);
  if (snap.empty) return null;
  const d = snap.docs[0];
  return { id: d.id, ...d.data() } as Customer;
}
