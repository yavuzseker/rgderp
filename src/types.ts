export type StageStatus = "pending" | "active" | "done";
export type OrderStatus = "open" | "in_progress" | "completed" | "cancelled";

export interface StageTemplate {
  key: string;
  name: string;
  defaultSupplierId: string;
}

export interface Product {
  id: string;
  name: string;
  code: string;
  stages: StageTemplate[];
}

export interface Supplier {
  id: string;
  name: string;
  contact: string;
  accessToken: string;
}

export interface Customer {
  id: string;
  name: string;
  contact: string;
  accessToken: string;
}

export interface OrderStage {
  key: string;
  name: string;
  supplierId: string;
  status: StageStatus;
  inQty: number;
  outQty: number;
  scrapQty: number;
}

export interface ShipmentDoc {
  id: string;
  orderId: string;
  name: string; // orijinal dosya adı
  path: string; // Storage yolu (silmek için)
  url: string; // indirme linki
  size: number; // bayt
  contentType: string;
  uploadedAt: string; // ISO
}

/** Siparişin ödeme koşulu (milestone) — bedelin bir yüzdesi, tahmini tarihli. */
export interface PaymentTerm {
  code: string; // ORDER / ATFE / ATFMR / COP ...
  percent: number;
  dueDate: string; // ISO — tahmini
  status: "bekliyor" | "faturalandi" | "tahsil";
}

/** Siparişin proje gideri (tahmini). */
export interface OrderExpense {
  description: string;
  category: string;
  amount: number;
  date: string; // ISO
}

export interface Order {
  id: string;
  orderNo: string;
  productId: string;
  productName: string;
  customerId: string;
  customerName: string;
  totalQty: number;
  status: OrderStatus;
  currentStageIndex: number;
  createdAt: string; // ISO
  dueDate: string; // ISO
  stages: OrderStage[];
  // ---- Finans ----
  orderDate?: string; // alınma tarihi (ISO)
  contractValue?: number; // bedel
  currency?: "EUR" | "TL";
  paymentTerms?: PaymentTerm[]; // ödeme koşulları (gelir)
  expenses?: OrderExpense[]; // proje giderleri
}
