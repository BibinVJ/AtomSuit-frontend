import { Item } from './Item';
import { Vendor } from './Vendor';

export interface PurchaseItemDetail {
  id: number;
  item: Item;
  description: string;
  batch: {
    batch_number: string;
    expiry_date: string;
    manufacture_date: string;
  };
  quantity: number;
  unit_cost: number;
  total_cost: number;
}
export interface Purchase {
  id: number;
  invoice_number: string;
  vendor: Vendor;
  purchase_date: string;
  total_amount: number;
  status: string;
  payment_status: string;
  items: PurchaseItemDetail[];
}

import { PaginatedResponse } from './Common';

export type PurchaseApiResponse = PaginatedResponse<Purchase>;

export interface PurchasePayload {
  vendor_id: string;
  invoice_number?: string;
  purchase_date?: string;
  items: {
    item_id: string;
    unit_price: number;
    quantity?: number;
  }[];
}

export type PurchaseInput = PurchasePayload;
