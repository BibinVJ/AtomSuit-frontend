import { AccountGroup } from './AccountGroup';
import { PaginatedResponse } from './Common';

export interface ChartOfAccount {
  id: number;
  name: string;
  code: string;
  account_group?: AccountGroup;
  description: string | null;
  opening_balance: number;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

export interface ChartOfAccountInput {
  name: string;
  code: string;
  account_group_id: number;
  description?: string;
  opening_balance?: number;
}

export type ChartOfAccountApiResponse = PaginatedResponse<ChartOfAccount>;
