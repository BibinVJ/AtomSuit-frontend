export interface PriceList {
  id: number;
  name: string;
  code: string;
  type: 'sales' | 'purchase';
  currency_id: number;
  currency?: {
    id: number;
    code: string;
    name: string;
    symbol: string;
  };
  is_tax_inclusive: boolean;
  description?: string;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string;
}
