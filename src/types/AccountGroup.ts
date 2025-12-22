import { AccountType } from './AccountType';

export interface AccountGroup {
  id: number;
  name: string;
  code: string | null;
  account_type_id: number;
  account_type?: AccountType;
  parent_id: number | null;
  parent?: AccountGroup;
  description: string | null;
  description: string | null;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

export interface AccountGroupApiResponse {
  data: AccountGroup[];
  meta: {
    total: number;
    current_page: number;
    last_page: number;
    from: number;
    to: number;
  };
}

export interface AccountGroupInput {
  name: string;
  code?: string;
  account_type_id: number;
  parent_id?: number | null;
  description?: string;
}
