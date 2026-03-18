import { ChartOfAccount } from './ChartOfAccount';
import { PaginatedResponse } from './Common';

export interface TaxRate {
  id: number;
  name: string;
  rate: number; // or string if backed by decimal
  type: 'percentage' | 'fixed';
  sales_account?: ChartOfAccount;
  purchase_account?: ChartOfAccount;
  deleted_at?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface TaxGroup {
  id: number;
  name: string;
  tax_rates?: TaxRate[];
  total_rate?: number; // computed
  deleted_at?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface TaxRateInput {
  name: string;
  rate: number;
  type: 'percentage' | 'fixed';
  sales_account_id?: number | null;
  purchase_account_id?: number | null;
}

export interface TaxGroupInput {
  name: string;
  tax_rates?: number[]; // array of IDs for syncing
}

export type TaxRateApiResponse = PaginatedResponse<TaxRate>;
export type TaxGroupApiResponse = PaginatedResponse<TaxGroup>;
