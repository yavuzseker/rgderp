import {
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
  type Unsubscribe,
} from "firebase/firestore";
import { db } from "../lib/firebase";
import type { Supplier } from "../types";

const COLLECTION = "suppliers";

export function subscribeSuppliers(
  callback: (suppliers: Supplier[]) => void
): Unsubscribe {
  return onSnapshot(collection(db, COLLECTION), (snapshot) => {
    const suppliers = snapshot.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    })) as Supplier[];
    callback(suppliers);
  });
}

export async function addSupplier(
  supplier: Omit<Supplier, "id">
): Promise<string> {
  const ref = await addDoc(collection(db, COLLECTION), supplier);
  return ref.id;
}

export async function updateSupplier(
  id: string,
  data: Partial<Supplier>
): Promise<void> {
  await updateDoc(doc(db, COLLECTION, id), data);
}

export async function deleteSupplier(id: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTION, id));
}

export async function getSupplierByToken(
  token: string
): Promise<Supplier | null> {
  const q = query(
    collection(db, COLLECTION),
    where("accessToken", "==", token)
  );
  const snap = await getDocs(q);
  if (snap.empty) return null;
  const d = snap.docs[0];
  return { id: d.id, ...d.data() } as Supplier;
}
