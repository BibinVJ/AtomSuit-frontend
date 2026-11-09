import { Customer } from './Customer';
import { ChartOfAccount } from './ChartOfAccount';
import { SalesInvoice } from './SalesInvoice';
import { PaginatedResponse } from './Common';

export enum CustomerPaymentStatus {
  POSTED = 'POSTED',
  VOIDED = 'VOIDED',
}

export interface CustomerPaymentAllocation {
  id: number;
  customer_payment_id: number;
  sales_invoice_id: number;
  sales_invoice?: SalesInvoice;
  allocated_amount: number;
}

export interface CustomerPayment {
  id: number;
  payment_number: string;
  customer_id: number;
  customer: Customer;
  account_id: number;
  account?: ChartOfAccount;
  payment_method?: string;
  reference_number?: string;
  amount: number;
  payment_date: string;
  status: CustomerPaymentStatus;
  notes?: string;
  cost_center_id: number;
  cost_center?: { id: number; name: string; code: string };
  created_by?: number;
  updated_by?: number;
  created_at: string;
  updated_at: string;
  allocations: CustomerPaymentAllocation[];
}

export type CustomerPaymentApiResponse = PaginatedResponse<CustomerPayment>;

export interface CustomerPaymentPayload {
  customer_id: number;
  account_id: number;
  cost_center_id: number;
  payment_method?: string;
  reference_number?: string;
  amount: number;
  payment_date: string;
  notes?: string;
  allocations: {
    sales_invoice_id: number;
    allocated_amount: number;
  }[];
}
