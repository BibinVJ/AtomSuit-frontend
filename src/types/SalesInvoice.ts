import { Item } from './Item';
import { Customer } from './Customer';
import { PaginatedResponse, DiscountType } from './Common';

export enum SalesInvoiceStatus {
  POSTED = 'POSTED',
  PARTIALLY_PAID = 'PARTIALLY_PAID',
  PAID = 'PAID',
  VOIDED = 'VOIDED',
}

export interface SalesInvoiceItem {
  id: number;
  sales_invoice_id: number;
  item_id: number;
  item: Item;
  item_meta?: Record<string, unknown>;
  delivery_note_item_id?: number;
  sales_order_item_id?: number;
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

export interface SalesInvoice {
  id: number;
  sales_order_id?: number;
  delivery_note_id?: number;
  customer_id: number;
  customer: Customer;
  customer_meta?: Record<string, unknown>;
  invoice_number: string;
  invoice_date: string;
  due_date?: string;
  status: SalesInvoiceStatus;
  sub_total: number;
  discount_total: number;
  tax_total: number;
  total_amount: number;
  paid_amount: number;
  due_amount: number;
  cost_center_id: number;
  cost_center?: { id: number; name: string; code: string };
  notes?: string;
  items: SalesInvoiceItem[];
  created_by?: number;
  updated_by?: number;
  created_at: string;
  updated_at: string;
}

export type SalesInvoiceApiResponse = PaginatedResponse<SalesInvoice>;

export interface SalesInvoicePayload {
  customer_id: number;
  sales_order_id?: number;
  delivery_note_id?: number;
  invoice_number: string;
  invoice_date: string;
  due_date?: string;
  cost_center_id: number;
  notes?: string;
  items: {
    item_id: number;
    delivery_note_item_id?: number;
    sales_order_item_id?: number;
    description?: string;
    quantity: number;
    unit_price: number;
    discount_type?: DiscountType;
    discount_value?: number;
    tax_group_id?: number;
  }[];
}
