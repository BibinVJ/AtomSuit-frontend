export interface Category {
  id: number;
  name: string;
  description: string;
  sales_account_id?: number | null;
  cogs_account_id?: number | null;
  inventory_account_id?: number | null;
  inventory_adjustment_account_id?: number | null;
  tax_group_id?: number | null;
  deleted_at?: string;
}

export interface CategoryApiResponse {
  data: Category[];
  meta: {
    total: number;
    current_page: number;
    last_page: number;
    from: number;
    to: number;
  };
}

export type CategoryInput = Partial<Category>;
