import { Category } from './Category';
import { Unit } from './Unit';

export interface Item {
  id: number;
  sku: string;
  name: string;
  description: string;
  category: Category;
  unit: Unit;
  type: string;
  selling_price: number;
  deleted_at?: string;
  stock_on_hand?: number;
  non_expired_stock?: number;
  expired_stock?: number;
  is_expired_sale_enabled?: boolean;
  sales_account_id?: number | null;
  cogs_account_id?: number | null;
  inventory_account_id?: number | null;
  inventory_adjustment_account_id?: number | null;
  purchase_account_id?: number | null;
  tax_group_id?: number | null;
  is_tax_inclusive?: boolean;
}

export interface ItemInput {
  sku: string;
  name: string;
  category_id: string | number;
  unit_id: string | number;
  description: string;
  type: string;
  selling_price: number;
  sales_account_id?: string | number | null;
  cogs_account_id?: string | number | null;
  inventory_account_id?: string | number | null;
  inventory_adjustment_account_id?: string | number | null;
  purchase_account_id?: string | number | null;
  tax_group_id?: string | number | null;
  is_tax_inclusive?: boolean;
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
