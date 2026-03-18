import { Currency } from './Currency';
import { PaginatedResponse } from './Common';
import { ChartOfAccount } from './ChartOfAccount';
import { PriceList } from './PriceList';
import { TaxGroup } from './Tax';

export interface Customer {
  id: number;
  name: string;
  email: string;
  phone: string;
  currency?: Currency;
  tax_group?: TaxGroup;
  price_list?: PriceList;
  sales_account?: ChartOfAccount;
  sales_discount_account?: ChartOfAccount;
  receivables_account?: ChartOfAccount;
  sales_return_account?: ChartOfAccount;
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
  profile_image?: string | null;
  total_spent?: number;
}

export interface CustomerInput {
  name: string;
  email: string;
  phone: string;
  currency_id?: number;
  tax_group_id?: number | null;
  price_list_id?: number;
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
}

export type CustomerApiResponse = PaginatedResponse<Customer>;
