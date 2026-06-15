/**
 * One-time seed script to populate Firestore with initial demo data.
 * Run: npx tsx scripts/seed.ts
 */
import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc } from "firebase/firestore";
import * as dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: resolve(__dirname, "../.env") });

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const uid = () => Math.random().toString(36).slice(2, 10);
const token = () => Math.random().toString(36).slice(2) + Date.now().toString(36);
const daysFromNow = (d: number) => new Date(Date.now() + d * 86400000).toISOString();

// ---- Suppliers ----
const sup = { ham: uid(), cnc: uid(), kaynak: uid(), polisaj: uid(), galvaniz: uid(), kalite: uid() };

const suppliers = [
  { id: sup.ham, name: "Çelik Ham Malzeme Ltd.", contact: "0212 555 1001", accessToken: token() },
  { id: sup.cnc, name: "Demir CNC Talaşlı İmalat", contact: "0216 555 1002", accessToken: token() },
  { id: sup.kaynak, name: "Usta Kaynak Atölyesi", contact: "0224 555 1003", accessToken: token() },
  { id: sup.polisaj, name: "Parlak Polisaj & Tesviye", contact: "0232 555 1004", accessToken: token() },
  { id: sup.galvaniz, name: "Anadolu Galvaniz A.Ş.", contact: "0262 555 1005", accessToken: token() },
  { id: sup.kalite, name: "RGD İç Kalite Kontrol", contact: "0212 555 1000", accessToken: token() },
];

// ---- Customers ----
const cust = { a: uid(), b: uid(), c: uid() };
const customers = [
  { id: cust.a, name: "Akın Makina San.", contact: "satinalma@akinmakina.com", accessToken: token() },
  { id: cust.b, name: "Boran Otomotiv", contact: "0312 555 2002", accessToken: token() },
  { id: cust.c, name: "Ceylan Enerji", contact: "info@ceylanenerji.com", accessToken: token() },
];

// ---- Products ----
const ringStages = [
  { key: uid(), name: "Ham Malzeme", defaultSupplierId: sup.ham },
  { key: uid(), name: "Talaşlı İmalat (CNC Torna)", defaultSupplierId: sup.cnc },
  { key: uid(), name: "Ön Kontrol", defaultSupplierId: sup.kalite },
  { key: uid(), name: "Kaplama (Galvaniz)", defaultSupplierId: sup.galvaniz },
  { key: uid(), name: "Son Kontrol / Paketleme", defaultSupplierId: sup.kalite },
];

const separatorStages = [
  { key: uid(), name: "Ham Malzeme", defaultSupplierId: sup.ham },
  { key: uid(), name: "Talaşlı İmalat", defaultSupplierId: sup.cnc },
  { key: uid(), name: "Kaynak", defaultSupplierId: sup.kaynak },
  { key: uid(), name: "Tesviye (Polisaj)", defaultSupplierId: sup.polisaj },
  { key: uid(), name: "Ön Kontrol", defaultSupplierId: sup.kalite },
  { key: uid(), name: "Kaplama", defaultSupplierId: sup.galvaniz },
  { key: uid(), name: "Son Kontrol / Paketleme", defaultSupplierId: sup.kalite },
];

const prod = { ring: uid(), sep: uid() };
const products = [
  { id: prod.ring, name: "Ring", code: "RG-100", stages: ringStages },
  { id: prod.sep, name: "Ring Separatör (Boru)", code: "RS-220", stages: separatorStages },
];

// ---- Orders ----
function makeStages(template: typeof ringStages, activeIndex: number, totalQty: number) {
  return template.map((s, i) => ({
    key: uid(),
    name: s.name,
    supplierId: s.defaultSupplierId,
    status: i < activeIndex ? "done" : i === activeIndex ? "active" : "pending",
    inQty: i <= activeIndex ? totalQty : 0,
    outQty: i < activeIndex ? totalQty - 10 : 0,
    scrapQty: i < activeIndex ? 10 : 0,
  }));
}

const orders = [
  {
    id: uid(), orderNo: "SP-2026-001", productId: prod.ring, productName: "Ring",
    customerId: cust.a, customerName: "Akın Makina San.", totalQty: 500,
    status: "in_progress", currentStageIndex: 3, createdAt: daysFromNow(-12),
    dueDate: daysFromNow(8), stages: makeStages(ringStages, 3, 500),
  },
  {
    id: uid(), orderNo: "SP-2026-002", productId: prod.sep, productName: "Ring Separatör (Boru)",
    customerId: cust.b, customerName: "Boran Otomotiv", totalQty: 1200,
    status: "in_progress", currentStageIndex: 1, createdAt: daysFromNow(-6),
    dueDate: daysFromNow(20), stages: makeStages(separatorStages, 1, 1200),
  },
  {
    id: uid(), orderNo: "SP-2026-003", productId: prod.ring, productName: "Ring",
    customerId: cust.c, customerName: "Ceylan Enerji", totalQty: 300,
    status: "open", currentStageIndex: 0, createdAt: daysFromNow(-1),
    dueDate: daysFromNow(30), stages: makeStages(ringStages, 0, 300),
  },
  {
    id: uid(), orderNo: "SP-2025-094", productId: prod.sep, productName: "Ring Separatör (Boru)",
    customerId: cust.a, customerName: "Akın Makina San.", totalQty: 800,
    status: "completed", currentStageIndex: 6, createdAt: daysFromNow(-40),
    dueDate: daysFromNow(-5),
    stages: makeStages(separatorStages, 7, 800).map((s) => ({
      ...s, status: "done" as const, outQty: 790, inQty: 800, scrapQty: 10,
    })),
  },
];

async function seed() {
  console.log("Seeding Firestore...");

  for (const s of suppliers) {
    await setDoc(doc(db, "suppliers", s.id), s);
  }
  console.log(`  ✓ ${suppliers.length} suppliers`);

  for (const c of customers) {
    await setDoc(doc(db, "customers", c.id), c);
  }
  console.log(`  ✓ ${customers.length} customers`);

  for (const p of products) {
    await setDoc(doc(db, "products", p.id), p);
  }
  console.log(`  ✓ ${products.length} products`);

  for (const o of orders) {
    await setDoc(doc(db, "orders", o.id), o);
  }
  console.log(`  ✓ ${orders.length} orders`);

  console.log("Done! Firestore seeded successfully.");
  process.exit(0);
}

seed().catch((e) => {
  console.error("Seed failed:", e);
  process.exit(1);
});
