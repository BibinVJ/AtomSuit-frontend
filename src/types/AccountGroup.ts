import { AccountType } from './AccountType';
import { PaginatedResponse } from './Common';

export interface AccountGroup {
  id: number;
  name: string;
  code: string | null;
  account_type_id: number;
  account_type?: AccountType;
  parent_id: number | null;
  parent?: AccountGroup;
  description: string | null;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

export interface AccountGroupInput {
  name: string;
  code?: string;
  account_type_id: number;
  parent_id?: number | null;
  description?: string;
}

export type AccountGroupApiResponse = PaginatedResponse<AccountGroup>;
