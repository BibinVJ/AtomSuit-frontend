import { Item } from './Item';
import { Vendor } from './Vendor';
import { PaginatedResponse } from './Common';

export enum PurchaseOrderStatus {
  DRAFT = 'DRAFT',
  SENT = 'SENT',
  CONFIRMED = 'CONFIRMED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export interface PurchaseOrderItem {
  id: number;
  item_id: number;
  item: Item;
  description: string;
  quantity: number;
  unit_price: number;
  discount_amount: number;
  total_amount: number; // calculated total
  tax_group_id?: number;
}

export interface PurchaseOrder {
  id: number;
  order_number: string;
  reference_number?: string;
  vendor_id: number;
  vendor: Vendor;
  order_date: string;
  expected_delivery_date?: string;
  status: PurchaseOrderStatus;
  notes?: string;
  cost_center_id?: number;
  warehouse_id?: number;
  cost_center?: { id: number; name: string; code: string };
  warehouse?: { id: number; name: string };
  items: PurchaseOrderItem[];
  total_amount: number;
  created_at: string;
  updated_at: string;
}

export type PurchaseOrderApiResponse = PaginatedResponse<PurchaseOrder>;

export interface PurchaseOrderPayload {
  vendor_id: number;
  order_number: string;
  order_date: string;
  expected_delivery_date?: string;
  reference_number?: string;
  notes?: string;
  cost_center_id: number;
  warehouse_id: number;
  items: {
    item_id: number;
    description?: string;
    quantity: number;
    unit_price: number;
    discount_amount?: number;
    tax_group_id?: number;
  }[];
}

export type PurchaseOrderInput = PurchaseOrderPayload;
