export interface Unit {
  id: number;
  name: string;
  code: string;
  description: string;
  is_active: boolean;
}

export interface UnitApiResponse {
  data: Unit[];
  meta: {
    total: number;
    current_page: number;
    last_page: number;
    from: number;
    to: number;
  };
}
