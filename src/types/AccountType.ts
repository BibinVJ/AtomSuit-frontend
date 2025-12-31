export interface AccountType {
  id: number;
  name: string;
  code: string | null;
  class: 'debit' | 'credit';
  created_at: string;
  updated_at: string;
}

export interface AccountTypeApiResponse {
  data: AccountType[];
  meta: {
    total: number;
    current_page: number;
    last_page: number;
    from: number;
    to: number;
  };
}
