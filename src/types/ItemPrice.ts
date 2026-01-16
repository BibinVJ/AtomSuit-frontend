import { PriceList } from './PriceList';

export interface ItemPrice {
  id: number;
  price_list?: PriceList;
  item?: {
    id: number;
    name: string;
    sku?: string;
    // Add other Item fields as needed for display
  };
  min_quantity: number;
  price: number;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string;
}
