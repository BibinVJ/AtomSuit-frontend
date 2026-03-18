import { PaginatedResponse } from './Common';

export interface AccountType {
  id: number;
  name: string;
  code: string | null;
  class: 'debit' | 'credit';
  created_at: string;
  updated_at: string;
}

export type AccountTypeApiResponse = PaginatedResponse<AccountType>;
