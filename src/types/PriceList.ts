import { PaginatedResponse } from './Common';
import { Currency } from './Currency';

export interface PriceList {
  id: number;
  name: string;
  code: string;
  type: 'sales' | 'purchase';
  currency?: Currency;
  is_tax_inclusive: boolean;
  description?: string;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string;
}

export type PriceListApiResponse = PaginatedResponse<PriceList>;
