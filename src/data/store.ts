import { reactive } from "vue";
import {
  collection,
  doc,
  query,
  where,
  orderBy,
  onSnapshot,
  setDoc,
  deleteDoc,
  updateDoc,
} from "firebase/firestore";
import {
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { firestore, storage } from "@/firebase";
import type {
  Product,
  Supplier,
  Customer,
  Order,
  OrderStage,
  ShipmentDoc,
} from "@/types";

export const uid = () => Math.random().toString(36).slice(2, 10);
export const token = () =>
  Math.random().toString(36).slice(2) + Date.now().toString(36);

interface DB {
  products: Product[];
  suppliers: Supplier[];
  customers: Customer[];
  orders: Order[];
  ready: boolean;
}

export const db = reactive<DB>({
  products: [],
  suppliers: [],
  customers: [],
  orders: [],
  ready: false,
});

// ---- Real-time listeners ----
let listenersStarted = false;

export function startListeners() {
  if (listenersStarted) return;
  listenersStarted = true;

  let loaded = { products: false, suppliers: false, customers: false, orders: false };
  function checkReady() {
    if (loaded.products && loaded.suppliers && loaded.customers && loaded.orders) {
      db.ready = true;
    }
  }

  onSnapshot(collection(firestore, "products"), (snap) => {
    db.products = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Product));
    loaded.products = true;
    checkReady();
  });

  onSnapshot(collection(firestore, "suppliers"), (snap) => {
    db.suppliers = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Supplier));
    loaded.suppliers = true;
    checkReady();
  });

  onSnapshot(collection(firestore, "customers"), (snap) => {
    db.customers = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Customer));
    loaded.customers = true;
    checkReady();
  });

  onSnapshot(collection(firestore, "orders"), (snap) => {
    db.orders = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Order));
    loaded.orders = true;
    checkReady();
  });
}

// ---- Helpers ----
export const supplierName = (id: string) =>
  db.suppliers.find((s) => s.id === id)?.name ?? "—";

// ---- CRUD: Products ----
export async function saveProduct(p: Omit<Product, "id"> & { id?: string }) {
  const id = p.id || uid();
  const data: Product = { ...p, id } as Product;
  await setDoc(doc(firestore, "products", id), data);
}

export async function deleteProduct(id: string) {
  await deleteDoc(doc(firestore, "products", id));
}

// ---- CRUD: Suppliers ----
export async function saveSupplier(s: Omit<Supplier, "id"> & { id?: string }) {
  const id = s.id || uid();
  const data: Supplier = { ...s, id } as Supplier;
  await setDoc(doc(firestore, "suppliers", id), data);
}

export async function deleteSupplier(id: string) {
  await deleteDoc(doc(firestore, "suppliers", id));
}

// ---- CRUD: Customers ----
export async function saveCustomer(c: Omit<Customer, "id"> & { id?: string }) {
  const id = c.id || uid();
  const data: Customer = { ...c, id } as Customer;
  await setDoc(doc(firestore, "customers", id), data);
}

export async function deleteCustomer(id: string) {
  await deleteDoc(doc(firestore, "customers", id));
}

// ---- Orders ----
export async function createOrder(input: {
  orderNo: string;
  productId: string;
  customerId: string;
  totalQty: number;
  dueDate: string;
}) {
  const product = db.products.find((p) => p.id === input.productId);
  const customer = db.customers.find((c) => c.id === input.customerId);
  if (!product || !customer) return;

  const id = uid();
  const stages: OrderStage[] = product.stages.map((s, i) => ({
    key: uid(),
    name: s.name,
    supplierId: s.defaultSupplierId,
    status: i === 0 ? "active" : "pending",
    inQty: i === 0 ? input.totalQty : 0,
    outQty: 0,
    scrapQty: 0,
  }));

  const order: Order = {
    id,
    orderNo: input.orderNo,
    productId: product.id,
    productName: product.name,
    customerId: customer.id,
    customerName: customer.name,
    totalQty: input.totalQty,
    status: "open",
    currentStageIndex: 0,
    createdAt: new Date().toISOString(),
    dueDate: input.dueDate,
    stages,
  };

  await setDoc(doc(firestore, "orders", id), order);
}

export const getOrder = (id: string) => db.orders.find((o) => o.id === id);

export async function updateOrder(
  id: string,
  input: { orderNo: string; customerId: string; totalQty: number; dueDate: string }
) {
  const o = db.orders.find((x) => x.id === id);
  if (!o) return;
  const customer = db.customers.find((c) => c.id === input.customerId);

  const patch: Partial<Order> = {
    orderNo: input.orderNo,
    customerId: input.customerId,
    customerName: customer?.name ?? o.customerName,
    totalQty: input.totalQty,
    dueDate: input.dueDate,
  };

  // Sipariş henüz ilk aşamada ve çıktı verilmemişse giriş miktarını da güncelle.
  const first = o.stages[0];
  if (o.currentStageIndex === 0 && first?.status === "active" && first.outQty === 0) {
    const stages = o.stages.map((s) => ({ ...s }));
    stages[0].inQty = input.totalQty;
    patch.stages = stages;
  }

  await updateDoc(doc(firestore, "orders", id), patch);
}

export async function deleteOrder(id: string) {
  await deleteDoc(doc(firestore, "orders", id));
}

export async function advanceStage(orderId: string, outQty: number, scrapQty: number) {
  const o = db.orders.find((x) => x.id === orderId);
  if (!o) return;
  const idx = o.stages.findIndex((s) => s.status === "active");
  if (idx < 0) return;

  const stages = [...o.stages.map((s) => ({ ...s }))];
  stages[idx].status = "done";
  stages[idx].outQty = outQty;
  stages[idx].scrapQty = scrapQty;

  let status = o.status;
  let currentStageIndex = o.currentStageIndex;

  const next = stages[idx + 1];
  if (next) {
    next.status = "active";
    next.inQty = outQty;
    currentStageIndex = idx + 1;
    status = "in_progress";
  } else {
    status = "completed";
  }

  await updateDoc(doc(firestore, "orders", orderId), {
    stages,
    status,
    currentStageIndex,
  });
}

// ---- Sevkiyat evrakları (Firebase Storage + Firestore meta) ----

/** Bir siparişin evraklarını gerçek-zamanlı dinler. Unsubscribe döner. */
export function watchOrderDocs(orderId: string, cb: (docs: ShipmentDoc[]) => void) {
  const q = query(
    collection(firestore, "shipmentDocs"),
    where("orderId", "==", orderId),
    orderBy("uploadedAt", "desc")
  );
  return onSnapshot(q, (snap) => {
    cb(snap.docs.map((d) => ({ id: d.id, ...d.data() } as ShipmentDoc)));
  });
}

/** Dosyayı Storage'a yükler ve metadata'yı Firestore'a yazar. */
export async function uploadShipmentDoc(orderId: string, file: File) {
  const id = uid();
  const path = `shipments/${orderId}/${id}-${file.name}`;
  const sRef = storageRef(storage, path);
  await uploadBytes(sRef, file);
  const url = await getDownloadURL(sRef);
  const data: ShipmentDoc = {
    id,
    orderId,
    name: file.name,
    path,
    url,
    size: file.size,
    contentType: file.type || "application/octet-stream",
    uploadedAt: new Date().toISOString(),
  };
  await setDoc(doc(firestore, "shipmentDocs", id), data);
}

/** Evrağı hem Storage'tan hem Firestore'dan siler. */
export async function deleteShipmentDoc(d: ShipmentDoc) {
  await deleteObject(storageRef(storage, d.path)).catch(() => {});
  await deleteDoc(doc(firestore, "shipmentDocs", d.id));
}
