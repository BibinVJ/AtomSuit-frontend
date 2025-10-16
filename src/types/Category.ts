export interface Category {
  id: number;
  name: string;
  description: string;
  is_active: boolean;
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
