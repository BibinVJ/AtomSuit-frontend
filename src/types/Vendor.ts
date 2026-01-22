import { Currency } from './Currency';
import { PaginatedResponse } from './Common';
import { PriceList } from './PriceList';
import { TaxGroup } from './Tax';
import { ChartOfAccount } from './ChartOfAccount';

export interface Vendor {
  id: number;
  name: string;
  email: string;
  phone: string;
  currency?: Currency;
  price_list?: PriceList;
  tax_group?: TaxGroup;
  payables_account?: ChartOfAccount;
  purchase_account?: ChartOfAccount;
  purchase_discount_account?: ChartOfAccount;
  purchase_return_account?: ChartOfAccount;
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

export interface VendorInput {
  name: string;
  email: string;
  phone: string;
  currency_id?: number;
  price_list_id?: number | null;
  tax_group_id?: number | null;
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
}

export type VendorApiResponse = PaginatedResponse<Vendor>;
