export interface Unit {
  id: number;
  name: string;
  code: string;
  description: string;
  is_active?: boolean;
  short_name?: string; // Add as alias for compatibility if needed, but we'll try to use code
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

export type UnitInput = Partial<Unit>;
