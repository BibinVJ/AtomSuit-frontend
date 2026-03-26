import { Item } from './Item';
import { Vendor } from './Vendor';
import { PaginatedResponse, DiscountType } from './Common';

export enum PurchaseInvoiceStatus {
  POSTED = 'POSTED',
  PARTIALLY_PAID = 'PARTIALLY_PAID',
  PAID = 'PAID',
  VOIDED = 'VOIDED',
}

export interface PurchaseInvoiceItem {
  id: number;
  purchase_invoice_id: number;
  item_id: number;
  item: Item;
  item_meta?: Record<string, unknown>;
  description?: string;
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

export interface PurchaseInvoice {
  id: number;
  grn_id?: number;
  purchase_order_id?: number;
  vendor_id: number;
  vendor: Vendor;
  vendor_meta?: Record<string, unknown>;
  invoice_number: string;
  reference_number?: string;
  posting_date: string;
  due_date: string;
  status: PurchaseInvoiceStatus;
  sub_total: number;
  discount_total: number;
  tax_total: number;
  total_amount: number;
  paid_amount: number;
  cost_center_id: number;
  warehouse_id?: number;
  notes?: string;
  created_by?: number;
  updated_by?: number;
  deleted_at?: string;
  created_at: string;
  updated_at: string;
  items: PurchaseInvoiceItem[];
  cost_center?: { id: number; name: string; code: string };
  warehouse?: { id: number; name: string };
}

export type PurchaseInvoiceApiResponse = PaginatedResponse<PurchaseInvoice>;

export interface PurchaseInvoicePayload {
  vendor_id: number;
  grn_id?: number;
  purchase_order_id?: number;
  invoice_number: string;
  reference_number?: string;
  posting_date: string;
  due_date: string;
  cost_center_id: number;
  warehouse_id: number;
  notes?: string;
  items: {
    item_id: number;
    goods_received_note_item_id?: number;
    purchase_order_item_id?: number;
    description?: string;
    quantity: number;
    unit_price?: number;
    discount_type?: DiscountType;
    discount_value?: number;
    tax_group_id?: number;
  }[];
}
