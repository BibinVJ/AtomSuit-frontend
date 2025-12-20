import { Category } from "./Category";
import { Unit } from "./Unit";

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
