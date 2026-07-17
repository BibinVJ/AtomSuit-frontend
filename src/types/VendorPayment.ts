import { Vendor } from './Vendor';
import { ChartOfAccount } from './ChartOfAccount';
import { PurchaseInvoice } from './PurchaseInvoice';
import { PaginatedResponse } from './Common';

export enum VendorPaymentStatus {
  POSTED = 'POSTED',
  VOIDED = 'VOIDED',
}

export interface VendorPaymentAllocation {
  id: number;
  vendor_payment_id: number;
  purchase_invoice_id: number;
  purchase_invoice?: PurchaseInvoice;
  allocated_amount: number;
}

export interface VendorPayment {
  id: number;
  payment_number: string;
  vendor_id: number;
  vendor: Vendor;
  account_id: number;
  account?: ChartOfAccount;
  payment_method?: string;
  reference_number?: string;
  amount: number;
  payment_date: string;
  status: VendorPaymentStatus;
  notes?: string;
  cost_center_id: number;
  cost_center?: { id: number; name: string; code: string };
  created_by?: number;
  updated_by?: number;
  created_at: string;
  updated_at: string;
  allocations: VendorPaymentAllocation[];
}

export type VendorPaymentApiResponse = PaginatedResponse<VendorPayment>;

export interface VendorPaymentPayload {
  vendor_id: number;
  account_id: number;
  cost_center_id: number;
  payment_method?: string;
  reference_number?: string;
  amount: number;
  payment_date: string;
  notes?: string;
  allocations: {
    purchase_invoice_id: number;
    allocated_amount: number;
  }[];
}
