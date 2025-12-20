export interface Vendor {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  currency_id?: number;
  currency?: {
    id: number;
    code: string;
    symbol: string;
  };
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
