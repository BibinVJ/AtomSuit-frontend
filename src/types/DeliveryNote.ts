import { Item } from './Item';
import { Customer } from './Customer';
import { PaginatedResponse, DiscountType } from './Common';

export enum DeliveryNoteStatus {
  DISPATCHED = 'DISPATCHED',
  DELIVERED = 'DELIVERED',
  VOIDED = 'VOIDED',
}

export interface DeliveryNoteItem {
  id: number;
  delivery_note_id: number;
  item_id: number;
  item: Item;
  sales_order_item_id?: number;
  description?: string;
  dispatched_quantity: number;
  unit_price?: number;
  discount_type?: DiscountType;
  discount_value?: number;
  discount_amount?: number;
  sub_total?: number;
  tax_group_id?: number;
  tax_meta?: {
    id: number;
    name: string;
    rates: { id: number; name: string; rate: number; type: string }[];
  };
  tax_amount?: number;
  total_amount?: number;
}

export interface DeliveryNote {
  id: number;
  sales_order_id?: number;
  customer_id: number;
  customer: Customer;
  customer_meta?: Record<string, unknown>;
  dn_number: string;
  reference_number?: string;
  dispatch_date: string;
  status: DeliveryNoteStatus;
  sub_total: number;
  discount_total: number;
  tax_total: number;
  total_amount: number;
  cost_center_id: number;
  warehouse_id: number;
  is_fully_invoiced?: boolean;
  notes?: string;
  created_by?: number;
  updated_by?: number;
  deleted_at?: string;
  created_at: string;
  updated_at: string;
  items: DeliveryNoteItem[];
  cost_center?: { id: number; name: string; code: string };
  warehouse?: { id: number; name: string };
  sales_order?: { id: number; order_number: string };
}

export type DeliveryNoteApiResponse = PaginatedResponse<DeliveryNote>;

export interface DeliveryNotePayload {
  customer_id: number;
  sales_order_id?: number;
  dn_number: string;
  reference_number?: string;
  dispatch_date: string;
  cost_center_id: number;
  warehouse_id: number;
  notes?: string;
  items: {
    item_id: number;
    sales_order_item_id?: number;
    description?: string;
    dispatched_quantity: number;
    unit_price?: number;
    discount_type?: DiscountType;
    discount_value?: number;
    tax_group_id?: number;
  }[];
}
