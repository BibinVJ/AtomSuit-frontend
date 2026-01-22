import { Category } from './Category';
import { Unit } from './Unit';
import { TaxGroup } from './Tax';
import { ChartOfAccount } from './ChartOfAccount';
import { PaginatedResponse } from './Common';

export interface Item {
  id: number;
  sku: string;
  name: string;
  description: string;
  category: Category;
  unit: Unit;
  type: string;
  tax_group?: TaxGroup;
  stock_on_hand?: number;
  non_expired_stock?: number;
  expired_stock?: number;
  sales_account?: ChartOfAccount;
  cogs_account?: ChartOfAccount;
  inventory_account?: ChartOfAccount;
  inventory_adjustment_account?: ChartOfAccount;
  item_prices?: unknown[];
  deleted_at?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ItemInput {
  sku: string;
  name: string;
  category_id: string | number;
  unit_id: string | number;
  description: string;
  type: string;
  tax_group_id?: string | number | null;
  sales_account_id?: string | number | null;
  cogs_account_id?: string | number | null;
  inventory_account_id?: string | number | null;
  inventory_adjustment_account_id?: string | number | null;
  item_prices?: unknown[];
}

export type ItemApiResponse = PaginatedResponse<Item>;

export interface StockAlert {
  id: number;
  name: string;
  sku: string;
  stock_on_hand: number;
  reorder_level: number;
}
