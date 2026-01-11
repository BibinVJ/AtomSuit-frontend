import { ChartOfAccount } from './ChartOfAccount';

export interface TaxRate {
  id: number;
  name: string;
  rate: number; // or string if backed by decimal
  type: 'percentage' | 'fixed';
  sales_account_id?: number | null;
  purchase_account_id?: number | null;
  sales_account?: ChartOfAccount;
  purchase_account?: ChartOfAccount;
  deleted_at?: string | null;
}

export interface TaxGroup {
  id: number;
  name: string;
  tax_rates?: TaxRate[];
  total_rate?: number; // computed
  deleted_at?: string | null;
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
