import { ChartOfAccount } from './ChartOfAccount';
import { TaxGroup } from './Tax';
import { PaginatedResponse } from './Common';

export interface Category {
  id: number;
  name: string;
  description: string;
  tax_group?: TaxGroup;
  sales_account?: ChartOfAccount;
  cogs_account?: ChartOfAccount;
  inventory_account?: ChartOfAccount;
  inventory_adjustment_account?: ChartOfAccount;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string;
}

export type CategoryInput = {
  name: string;
  description: string;
  tax_group_id?: number;
  sales_account_id?: number;
  cogs_account_id?: number;
  inventory_account_id?: number;
  inventory_adjustment_account_id?: number;
};

export type CategoryApiResponse = PaginatedResponse<Category>;
