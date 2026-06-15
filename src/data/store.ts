import { reactive } from "vue";
import type {
  Product,
  Supplier,
  Customer,
  Order,
  OrderStage,
  StageTemplate,
} from "@/types";

/**
 * Geçici MOCK veri deposu (reaktif). UI tamamen bunun üzerinden çalışır.
 * İleride bu modülün iç gerçekleştirimi Firebase Firestore'a taşınacak;
 * dışa açılan fonksiyon imzaları aynı kalacak şekilde tasarlandı.
 */

export const uid = () => Math.random().toString(36).slice(2, 10);
export const token = () =>
  Math.random().toString(36).slice(2) + Date.now().toString(36);

interface DB {
  products: Product[];
  suppliers: Supplier[];
  customers: Customer[];
  orders: Order[];
}

// ---- Seed (örnek) veriler ----
const sup = {
  ham: uid(),
  cnc: uid(),
  kaynak: uid(),
  polisaj: uid(),
  galvaniz: uid(),
  kalite: uid(),
};

const suppliers: Supplier[] = [
  { id: sup.ham, name: "Çelik Ham Malzeme Ltd.", contact: "0212 555 1001", accessToken: token() },
  { id: sup.cnc, name: "Demir CNC Talaşlı İmalat", contact: "0216 555 1002", accessToken: token() },
  { id: sup.kaynak, name: "Usta Kaynak Atölyesi", contact: "0224 555 1003", accessToken: token() },
  { id: sup.polisaj, name: "Parlak Polisaj & Tesviye", contact: "0232 555 1004", accessToken: token() },
  { id: sup.galvaniz, name: "Anadolu Galvaniz A.Ş.", contact: "0262 555 1005", accessToken: token() },
  { id: sup.kalite, name: "RGD İç Kalite Kontrol", contact: "0212 555 1000", accessToken: token() },
];

const cust = { a: uid(), b: uid(), c: uid() };
const customers: Customer[] = [
  { id: cust.a, name: "Akın Makina San.", contact: "satinalma@akinmakina.com", accessToken: token() },
  { id: cust.b, name: "Boran Otomotiv", contact: "0312 555 2002", accessToken: token() },
  { id: cust.c, name: "Ceylan Enerji", contact: "info@ceylanenerji.com", accessToken: token() },
];

const ringStages: StageTemplate[] = [
  { key: uid(), name: "Ham Malzeme", defaultSupplierId: sup.ham },
  { key: uid(), name: "Talaşlı İmalat (CNC Torna)", defaultSupplierId: sup.cnc },
  { key: uid(), name: "Ön Kontrol", defaultSupplierId: sup.kalite },
  { key: uid(), name: "Kaplama (Galvaniz)", defaultSupplierId: sup.galvaniz },
  { key: uid(), name: "Son Kontrol / Paketleme", defaultSupplierId: sup.kalite },
];

const separatorStages: StageTemplate[] = [
  { key: uid(), name: "Ham Malzeme", defaultSupplierId: sup.ham },
  { key: uid(), name: "Talaşlı İmalat", defaultSupplierId: sup.cnc },
  { key: uid(), name: "Kaynak", defaultSupplierId: sup.kaynak },
  { key: uid(), name: "Tesviye (Polisaj)", defaultSupplierId: sup.polisaj },
  { key: uid(), name: "Ön Kontrol", defaultSupplierId: sup.kalite },
  { key: uid(), name: "Kaplama", defaultSupplierId: sup.galvaniz },
  { key: uid(), name: "Son Kontrol / Paketleme", defaultSupplierId: sup.kalite },
];

const prod = { ring: uid(), sep: uid() };
const products: Product[] = [
  { id: prod.ring, name: "Ring", code: "RG-100", stages: ringStages },
  { id: prod.sep, name: "Ring Separatör (Boru)", code: "RS-220", stages: separatorStages },
];

function stagesFromProduct(p: Product, activeIndex: number): OrderStage[] {
  return p.stages.map((s, i) => ({
    key: uid(),
    name: s.name,
    supplierId: s.defaultSupplierId,
    status: i < activeIndex ? "done" : i === activeIndex ? "active" : "pending",
    inQty: i <= activeIndex ? 500 : 0,
    outQty: i < activeIndex ? 490 : 0,
    scrapQty: i < activeIndex ? 10 : 0,
  }));
}

const daysFromNow = (d: number) =>
  new Date(Date.now() + d * 86400000).toISOString();

const orders: Order[] = [
  {
    id: uid(), orderNo: "SP-2026-001", productId: prod.ring, productName: "Ring",
    customerId: cust.a, customerName: "Akın Makina San.", totalQty: 500,
    status: "in_progress", currentStageIndex: 3, createdAt: daysFromNow(-12),
    dueDate: daysFromNow(8), stages: stagesFromProduct(products[0], 3),
  },
  {
    id: uid(), orderNo: "SP-2026-002", productId: prod.sep, productName: "Ring Separatör (Boru)",
    customerId: cust.b, customerName: "Boran Otomotiv", totalQty: 1200,
    status: "in_progress", currentStageIndex: 1, createdAt: daysFromNow(-6),
    dueDate: daysFromNow(20), stages: stagesFromProduct(products[1], 1),
  },
  {
    id: uid(), orderNo: "SP-2026-003", productId: prod.ring, productName: "Ring",
    customerId: cust.c, customerName: "Ceylan Enerji", totalQty: 300,
    status: "open", currentStageIndex: 0, createdAt: daysFromNow(-1),
    dueDate: daysFromNow(30), stages: stagesFromProduct(products[0], 0),
  },
  {
    id: uid(), orderNo: "SP-2025-094", productId: prod.sep, productName: "Ring Separatör (Boru)",
    customerId: cust.a, customerName: "Akın Makina San.", totalQty: 800,
    status: "completed", currentStageIndex: 6, createdAt: daysFromNow(-40),
    dueDate: daysFromNow(-5),
    stages: stagesFromProduct(products[1], 7).map((s) => ({ ...s, status: "done", outQty: 790, inQty: 800, scrapQty: 10 })),
  },
];

export const db = reactive<DB>({ products, suppliers, customers, orders });

// ---- Yardımcılar ----
export const supplierName = (id: string) =>
  db.suppliers.find((s) => s.id === id)?.name ?? "—";

// ---- CRUD: Ürünler ----
export function saveProduct(p: Omit<Product, "id"> & { id?: string }) {
  if (p.id) {
    const i = db.products.findIndex((x) => x.id === p.id);
    if (i >= 0) db.products[i] = { ...(p as Product) };
  } else {
    db.products.push({ ...p, id: uid() });
  }
}
export const deleteProduct = (id: string) => {
  db.products = db.products.filter((p) => p.id !== id);
};

// ---- CRUD: Tedarikçiler ----
export function saveSupplier(s: Omit<Supplier, "id"> & { id?: string }) {
  if (s.id) {
    const i = db.suppliers.findIndex((x) => x.id === s.id);
    if (i >= 0) db.suppliers[i] = { ...(s as Supplier) };
  } else {
    db.suppliers.push({ ...s, id: uid() });
  }
}
export const deleteSupplier = (id: string) => {
  db.suppliers = db.suppliers.filter((s) => s.id !== id);
};

// ---- CRUD: Müşteriler ----
export function saveCustomer(c: Omit<Customer, "id"> & { id?: string }) {
  if (c.id) {
    const i = db.customers.findIndex((x) => x.id === c.id);
    if (i >= 0) db.customers[i] = { ...(c as Customer) };
  } else {
    db.customers.push({ ...c, id: uid() });
  }
}
export const deleteCustomer = (id: string) => {
  db.customers = db.customers.filter((c) => c.id !== id);
};

// ---- Siparişler ----
export function createOrder(input: {
  orderNo: string;
  productId: string;
  customerId: string;
  totalQty: number;
  dueDate: string;
}) {
  const product = db.products.find((p) => p.id === input.productId);
  const customer = db.customers.find((c) => c.id === input.customerId);
  if (!product || !customer) return;
  db.orders.unshift({
    id: uid(),
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
    stages: stagesFromProduct(product, 0),
  });
}

export const getOrder = (id: string) => db.orders.find((o) => o.id === id);

export const deleteOrder = (id: string) => {
  db.orders = db.orders.filter((o) => o.id !== id);
};

/** Aktif aşamayı tamamla, sonraki aşamayı aktif et; bittiyse siparişi tamamla. */
export function advanceStage(orderId: string, outQty: number, scrapQty: number) {
  const o = db.orders.find((x) => x.id === orderId);
  if (!o) return;
  const idx = o.stages.findIndex((s) => s.status === "active");
  if (idx < 0) return;
  o.stages[idx].status = "done";
  o.stages[idx].outQty = outQty;
  o.stages[idx].scrapQty = scrapQty;

  const next = o.stages[idx + 1];
  if (next) {
    next.status = "active";
    next.inQty = outQty;
    o.currentStageIndex = idx + 1;
    o.status = "in_progress";
  } else {
    o.status = "completed";
  }
}
