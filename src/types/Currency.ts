import { PaginatedResponse } from './Common';

export interface Currency {
  id: number;
  code: string;
  name: string;
  symbol: string;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string;
}

export interface CurrencyInput {
  code: string;
  name: string;
  symbol?: string;
}

export type CurrencyApiResponse = PaginatedResponse<Currency>;
