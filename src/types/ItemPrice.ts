import { Item } from './Item';
import { PriceList } from './PriceList';
import { PaginatedResponse } from './Common';

export interface ItemPrice {
  id: number;
  price_list?: PriceList;
  item?: Item;
  min_quantity: number;
  price: number;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string;
}

export type ItemPriceApiResponse = PaginatedResponse<ItemPrice>;
