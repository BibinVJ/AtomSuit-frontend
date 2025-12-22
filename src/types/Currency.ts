export interface Currency {
  id: number;
  code: string;
  name: string;
  symbol: string;
  is_default: boolean;
  thousand_separator: string | null;
  decimal_separator: string | null;
  precision: number | null;
  symbol_position: 'before' | 'after' | null;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string;
}

export interface CurrencyInput {
  code: string;
  name: string;
  symbol?: string;
  is_default?: boolean;
  thousand_separator?: string;
  decimal_separator?: string;
  precision?: number;
  symbol_position?: 'before' | 'after';
}
