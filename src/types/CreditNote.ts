import { Item } from './Item';
import { Customer } from './Customer';
import { SalesInvoice } from './SalesInvoice';
import { PaginatedResponse, DiscountType } from './Common';

export enum CreditNoteStatus {
  POSTED = 'POSTED',
  VOIDED = 'VOIDED',
}

export interface CreditNoteItem {
  id: number;
  credit_note_id: number;
  item_id: number;
  item: Item;
  sales_invoice_item_id?: number;
  description?: string;
  returned_quantity: number;
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

export interface CreditNote {
  id: number;
  customer_id: number;
  customer: Customer;
  sales_invoice_id?: number;
  sales_invoice?: SalesInvoice;
  credit_note_number: string;
  reference_number?: string;
  credit_note_date: string;
  status: CreditNoteStatus;
  is_stock_returned: boolean;
  sub_total: number;
  discount_total: number;
  tax_total: number;
  total_amount: number;
  cost_center_id: number;
  warehouse_id?: number;
  notes?: string;
  created_by?: number;
  updated_by?: number;
  created_at: string;
  updated_at: string;
  items: CreditNoteItem[];
  cost_center?: { id: number; name: string; code: string };
  warehouse?: { id: number; name: string };
}

export type CreditNoteApiResponse = PaginatedResponse<CreditNote>;

export interface CreditNotePayload {
  customer_id: number;
  sales_invoice_id?: number;
  credit_note_number: string;
  reference_number?: string;
  credit_note_date: string;
  cost_center_id: number;
  /** Required by the API once any line returns stock; omitted when nothing is selected. */
  warehouse_id?: number;
  notes?: string;
  items: {
    item_id: number;
    sales_invoice_item_id?: number;
    description?: string;
    returned_quantity: number;
    unit_price?: number;
    discount_type?: DiscountType;
    discount_value?: number;
    tax_group_id?: number;
    is_stock_returned: boolean;
  }[];
}
