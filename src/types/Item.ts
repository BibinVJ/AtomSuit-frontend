import { Category } from './Category';
import { Unit } from './Unit';
import { TaxGroup } from './Tax';
import { ChartOfAccount } from './ChartOfAccount';

export interface Item {
  id: number;
  sku: string;
  name: string;
  description: string;
  category: Category;
  unit: Unit;
  type: string;
  deleted_at?: string;
  stock_on_hand?: number;
  non_expired_stock?: number;
  expired_stock?: number;
  sales_account_id?: number | null;
  cogs_account_id?: number | null;
  inventory_account_id?: number | null;
  inventory_adjustment_account_id?: number | null;
  sales_account?: ChartOfAccount;
  cogs_account?: ChartOfAccount;
  inventory_account?: ChartOfAccount;
  inventory_adjustment_account?: ChartOfAccount;
  tax_group_id?: number | null;
  tax_group?: TaxGroup;
  item_prices?: any[]; // Using any[] to avoid circular dep or heavy imports for now, or ItemPrice[]
}

export interface ItemInput {
  sku: string;
  name: string;
  category_id: string | number;
  unit_id: string | number;
  description: string;
  type: string;
  sales_account_id?: string | number | null;
  cogs_account_id?: string | number | null;
  inventory_account_id?: string | number | null;
  inventory_adjustment_account_id?: string | number | null;
  tax_group_id?: string | number | null;
  prices?: any[];
}

export interface ItemApiResponse {
  data: Item[];
  meta: {
    total: number;
    current_page: number;
    last_page: number;
    from: number;
    to: number;
  };
}

export interface StockAlert {
  id: number;
  name: string;
  sku: string;
  stock_on_hand: number;
  reorder_level: number;
}
