import { AccountGroup } from './AccountGroup';

export interface ChartOfAccount {
  id: number;
  name: string;
  code: string;
  account_group_id: number;
  account_group?: AccountGroup;
  description: string | null;
  opening_balance: number;
  opening_balance: number;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

export interface ChartOfAccountApiResponse {
  data: ChartOfAccount[];
  meta: {
    total: number;
    current_page: number;
    last_page: number;
    from: number;
    to: number;
  };
}

export interface ChartOfAccountInput {
  name: string;
  code: string;
  account_group_id: number;
  description?: string;
  opening_balance?: number;
  opening_balance?: number;
}
