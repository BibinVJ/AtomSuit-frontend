export interface Warehouse {
  id: number;
  name: string;
  code: string;
  description?: string;
  address_line_1?: string;
  address_line_2?: string;
  city?: string;
  state?: string;
  country?: string;
  zip_code?: string;
  phone?: string;
  email?: string;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string;
}

export interface WarehouseInput {
  name: string;
  code?: string;
  description?: string;
  address_line_1?: string;
  address_line_2?: string;
  city?: string;
  state?: string;
  country?: string;
  zip_code?: string;
  phone?: string;
  email?: string;
}
