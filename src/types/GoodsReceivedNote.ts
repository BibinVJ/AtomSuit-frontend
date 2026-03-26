import { Item } from './Item';
import { Vendor } from './Vendor';
import { PaginatedResponse, DiscountType } from './Common';

export enum GoodsReceivedNoteStatus {
  RECEIVED = 'RECEIVED',
  VOIDED = 'VOIDED',
}

export interface GoodsReceivedNoteItem {
  id: number;
  goods_received_note_id: number;
  item_id: number;
  item: Item;
  purchase_order_item_id?: number;
  description?: string;
  quantity_received: number;
  accepted_quantity: number;
  rejected_quantity?: number;
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

export interface GoodsReceivedNote {
  id: number;
  purchase_order_id?: number;
  vendor_id: number;
  vendor: Vendor;
  vendor_meta?: Record<string, any>;
  grn_number: string;
  reference_number?: string;
  received_date: string;
  status: GoodsReceivedNoteStatus;
  sub_total: number;
  discount_total: number;
  tax_total: number;
  total_amount: number;
  cost_center_id: number;
  warehouse_id: number;
  notes?: string;
  created_by?: number;
  updated_by?: number;
  deleted_at?: string;
  created_at: string;
  updated_at: string;
  items: GoodsReceivedNoteItem[];
  cost_center?: { id: number; name: string; code: string };
  warehouse?: { id: number; name: string };
  purchase_order?: { id: number; order_number: string };
}

export type GoodsReceivedNoteApiResponse = PaginatedResponse<GoodsReceivedNote>;

export interface GoodsReceivedNotePayload {
  vendor_id: number;
  purchase_order_id?: number;
  grn_number: string;
  reference_number?: string;
  received_date: string;
  cost_center_id: number;
  warehouse_id: number;
  notes?: string;
  items: {
    item_id: number;
    purchase_order_item_id?: number;
    description?: string;
    quantity_received: number;
    accepted_quantity: number;
    rejected_quantity?: number;
    unit_price?: number;
    discount_type?: DiscountType;
    discount_value?: number;
    tax_group_id?: number;
  }[];
}
