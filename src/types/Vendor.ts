import { Currency } from './Currency';

export interface Vendor {
  id: number;
  name: string;
  email: string;
  phone: string;
  currency?: Currency;
  currency_id?: number;
  payables_account_id?: number;
  purchase_account_id?: number;
  purchase_discount_account_id?: number;
  purchase_return_account_id?: number;
  payables_account?: { id: number; name: string };
  purchase_account?: { id: number; name: string };
  purchase_discount_account?: { id: number; name: string };
  purchase_return_account?: { id: number; name: string };
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

export interface VendorInput {
  name: string;
  email: string;
  phone: string;
  currency_id?: number;
  payables_account_id?: number;
  purchase_account_id?: number;
  purchase_discount_account_id?: number;
  purchase_return_account_id?: number;
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

export interface VendorApiResponse {
  data: Vendor[];
  meta: {
    total: number;
    current_page: number;
    last_page: number;
    from: number;
    to: number;
  };
}
