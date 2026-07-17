import { Item } from './Item';
import { Vendor } from './Vendor';
import { PurchaseInvoice } from './PurchaseInvoice';
import { PaginatedResponse, DiscountType } from './Common';

export enum DebitNoteStatus {
  POSTED = 'POSTED',
  VOIDED = 'VOIDED',
}

export interface DebitNoteItem {
  id: number;
  debit_note_id: number;
  item_id: number;
  item: Item;
  purchase_invoice_item_id?: number;
  description?: string;
  quantity: number;
  unit_price: number;
  discount_type: DiscountType;
  discount_value: number;
  discount_amount: number;
  sub_total: number;
  tax_group_id?: number;
  tax_amount: number;
  total_amount: number;
  is_stock_returned: boolean;
}

export interface DebitNote {
  id: number;
  vendor_id: number;
  vendor: Vendor;
  purchase_invoice_id?: number;
  purchase_invoice?: PurchaseInvoice;
  debit_note_number: string;
  reference_number?: string;
  date: string;
  status: DebitNoteStatus;
  sub_total: number;
  discount_total: number;
  tax_total: number;
  total_amount: number;
  cost_center_id: number;
  warehouse_id: number;
  notes?: string;
  created_by?: number;
  updated_by?: number;
  created_at: string;
  updated_at: string;
  items: DebitNoteItem[];
  cost_center?: { id: number; name: string; code: string };
  warehouse?: { id: number; name: string };
}

export type DebitNoteApiResponse = PaginatedResponse<DebitNote>;

export interface DebitNotePayload {
  vendor_id: number;
  purchase_invoice_id?: number;
  debit_note_number: string;
  reference_number?: string;
  date: string;
  cost_center_id: number;
  warehouse_id: number;
  notes?: string;
  items: {
    item_id: number;
    purchase_invoice_item_id?: number;
    description?: string;
    quantity: number;
    unit_price?: number;
    discount_type?: DiscountType;
    discount_value?: number;
    tax_group_id?: number;
    is_stock_returned: boolean;
  }[];
}
