import { Currency } from './Currency';

export interface Customer {
  id: number;
  name: string;
  email: string;
  phone: string;
  currency?: Currency;
  sales_account?: { id: number; name: string };
  sales_discount_account?: { id: number; name: string };
  receivables_account?: { id: number; name: string };
  sales_return_account?: { id: number; name: string };
  billing_address_line_1?: string;
  billing_address_line_2?: string;
  billing_city?: string;
  billing_state?: string;
  billing_country?: string;
  billing_zip_code?: string;
  shipping_address_line_1?: string;
  shipping_address_line_2?: string;
  shipping_city?: string;
  shipping_state?: string;
  shipping_country?: string;
  shipping_zip_code?: string;
  tax_group_id?: number | null;
}

export interface CustomerInput {
  name: string;
  email: string;
  phone: string;
  currency_id?: number;
  sales_account_id?: number;
  sales_discount_account_id?: number;
  receivables_account_id?: number;
  sales_return_account_id?: number;
  billing_address_line_1?: string;
  billing_address_line_2?: string;
  billing_city?: string;
  billing_state?: string;
  billing_country?: string;
  billing_zip_code?: string;
  shipping_address_line_1?: string;
  shipping_address_line_2?: string;
  shipping_city?: string;
  shipping_state?: string;
  shipping_country?: string;
  shipping_zip_code?: string;
  tax_group_id?: number | null;
}

export interface CustomerApiResponse {
  data: Customer[];
  meta: {
    total: number;
    current_page: number;
    last_page: number;
    from: number;
    to: number;
  };
}
