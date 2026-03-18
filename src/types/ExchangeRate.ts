import { PaginatedResponse } from './Common';
import { Currency } from './Currency';

export interface ExchangeRate {
  id: number;
  base_currency_id: number;
  target_currency_id: number;
  rate: number;
  effective_date: string;
  base_currency?: Currency;
  target_currency?: Currency;
  deleted_at?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ExchangeRateInput {
  base_currency_id: number;
  target_currency_id: number;
  rate: number;
  effective_date: string;
}

export type ExchangeRateApiResponse = PaginatedResponse<ExchangeRate>;
