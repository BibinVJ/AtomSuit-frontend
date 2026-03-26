import { Item } from './Item';
import { Vendor } from './Vendor';
import { PaginatedResponse, DiscountType } from './Common';

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
  item_meta?: Record<string, string>;
  description: string;
  quantity: number;
  unit_price: number;
  discount_type: DiscountType;
  discount_value: number;
  discount_amount: number;
  sub_total: number;
  tax_group_id?: number;
  tax_meta?: {
    id: number;
    name: string;
    rates: { id: number; name: string; rate: number; type: string }[];
  };
  tax_amount: number;
  total_amount: number;
}

export interface PurchaseOrder {
  id: number;
  order_number: string;
  reference_number?: string;
  vendor_id: number;
  vendor: Vendor;
  vendor_meta?: Record<string, string>;
  order_date: string;
  expected_delivery_date?: string;
  status: PurchaseOrderStatus;
  notes?: string;
  sub_total: number;
  discount_total: number;
  tax_total: number;
  total_amount: number;
  cost_center_id?: number;
  warehouse_id?: number;
  cost_center?: { id: number; name: string; code: string };
  warehouse?: { id: number; name: string };
  items: PurchaseOrderItem[];
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
    discount_type?: DiscountType;
    discount_value?: number;
    tax_group_id?: number;
  }[];
}

export type PurchaseOrderInput = PurchaseOrderPayload;
