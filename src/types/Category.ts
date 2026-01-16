import { ChartOfAccount } from './ChartOfAccount';
import { TaxGroup } from './Tax';

export interface Category {
  id: number;
  name: string;
  description: string;
  sales_account?: ChartOfAccount;
  cogs_account?: ChartOfAccount;
  inventory_account?: ChartOfAccount;
  inventory_adjustment_account?: ChartOfAccount;
  tax_group?: TaxGroup;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string;
}

export interface CategoryApiResponse {
  data: Category[];
  meta: {
    total: number;
    current_page: number;
    last_page: number;
    from: number;
    to: number;
  };
}

export type CategoryInput = Partial<Category>;
