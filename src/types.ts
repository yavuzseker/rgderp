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
}
