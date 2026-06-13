import {
  collection,
  doc,
  getDoc,
  addDoc,
  updateDoc,
  onSnapshot,
  query,
  where,
  orderBy,
  Timestamp,
  type Unsubscribe,
} from "firebase/firestore";
import { db } from "../lib/firebase";
import type { Order, Stage, StageLog, Product } from "../types";

const COLLECTION = "orders";

export function subscribeOrders(
  callback: (orders: Order[]) => void
): Unsubscribe {
  const q = query(collection(db, COLLECTION), orderBy("createdAt", "desc"));
  return onSnapshot(q, (snapshot) => {
    const orders = snapshot.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    })) as Order[];
    callback(orders);
  });
}

export function subscribeOrdersByCustomer(
  customerId: string,
  callback: (orders: Order[]) => void
): Unsubscribe {
  const q = query(
    collection(db, COLLECTION),
    where("customerId", "==", customerId),
    orderBy("createdAt", "desc")
  );
  return onSnapshot(q, (snapshot) => {
    const orders = snapshot.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    })) as Order[];
    callback(orders);
  });
}

export async function getOrder(id: string): Promise<Order | null> {
  const snap = await getDoc(doc(db, COLLECTION, id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as Order;
}

export async function createOrder(
  orderData: Omit<Order, "id" | "createdAt" | "currentStageIndex" | "status">,
  product: Product
): Promise<string> {
  const orderRef = await addDoc(collection(db, COLLECTION), {
    ...orderData,
    status: "open",
    currentStageIndex: 0,
    createdAt: Timestamp.now(),
  });

  const stagesCol = collection(db, COLLECTION, orderRef.id, "stages");
  for (const tpl of product.stages) {
    await addDoc(stagesCol, {
      index: tpl.order,
      name: tpl.name,
      supplierId: tpl.defaultSupplierId,
      status: tpl.order === 0 ? "active" : "pending",
      inQty: 0,
      outQty: 0,
      scrapQty: 0,
    } satisfies Omit<Stage, "id">);
  }

  return orderRef.id;
}

export async function updateOrder(
  id: string,
  data: Partial<Order>
): Promise<void> {
  await updateDoc(doc(db, COLLECTION, id), data);
}

export function subscribeStages(
  orderId: string,
  callback: (stages: Stage[]) => void
): Unsubscribe {
  const q = query(
    collection(db, COLLECTION, orderId, "stages"),
    orderBy("index", "asc")
  );
  return onSnapshot(q, (snapshot) => {
    const stages = snapshot.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    })) as Stage[];
    callback(stages);
  });
}

export async function updateStage(
  orderId: string,
  stageId: string,
  data: Partial<Stage>
): Promise<void> {
  await updateDoc(doc(db, COLLECTION, orderId, "stages", stageId), data);
}

export async function addStageLog(
  orderId: string,
  log: Omit<StageLog, "id">
): Promise<void> {
  await addDoc(collection(db, COLLECTION, orderId, "logs"), log);
}

export function subscribeStagesForSupplier(
  supplierId: string,
  callback: (items: { orderId: string; stage: Stage; order: Order }[]) => void
): Unsubscribe {
  const q = query(
    collection(db, COLLECTION),
    where("status", "in", ["open", "in_progress"])
  );

  return onSnapshot(q, async (orderSnap) => {
    const results: { orderId: string; stage: Stage; order: Order }[] = [];

    for (const orderDoc of orderSnap.docs) {
      const order = { id: orderDoc.id, ...orderDoc.data() } as Order;
      const stagesQ = query(
        collection(db, COLLECTION, orderDoc.id, "stages"),
        where("supplierId", "==", supplierId),
        where("status", "==", "active")
      );
      const stagesSnap = await import("firebase/firestore").then((m) =>
        m.getDocs(stagesQ)
      );
      for (const stageDoc of stagesSnap.docs) {
        results.push({
          orderId: orderDoc.id,
          stage: { id: stageDoc.id, ...stageDoc.data() } as Stage,
          order,
        });
      }
    }
    callback(results);
  });
}
