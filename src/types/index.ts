import { Timestamp } from "firebase/firestore";

export interface StageTemplate {
  key: string;
  name: string;
  defaultSupplierId: string;
  order: number;
}

export interface Product {
  id?: string;
  name: string;
  code: string;
  stages: StageTemplate[];
}

export interface Supplier {
  id?: string;
  name: string;
  contact: string;
  accessToken: string;
}

export interface Order {
  id?: string;
  orderNo: string;
  productId: string;
  productName: string;
  customerId: string;
  customerName: string;
  totalQty: number;
  status: "open" | "in_progress" | "completed" | "cancelled";
  currentStageIndex: number;
  createdAt: Timestamp;
  dueDate: Timestamp;
}

export interface Stage {
  id?: string;
  index: number;
  name: string;
  supplierId: string;
  supplierName?: string;
  status: "pending" | "active" | "done";
  inQty: number;
  outQty: number;
  scrapQty: number;
  startedAt?: Timestamp;
  completedAt?: Timestamp;
  updatedBy?: string;
  updatedAt?: Timestamp;
}

export interface StageLog {
  id?: string;
  stageIndex: number;
  stageName: string;
  who: string;
  when: Timestamp;
  inQty: number;
  outQty: number;
  scrapQty: number;
}

export interface User {
  id?: string;
  name: string;
  role: "admin" | "supplier" | "customer";
  supplierId?: string;
  customerId?: string;
  accessToken?: string;
}

export interface Customer {
  id?: string;
  name: string;
  contact: string;
  accessToken: string;
}
