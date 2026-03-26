export interface PaginationMeta {
  current_page: number;
  from: number | null;
  last_page: number;
  per_page: number;
  to: number | null;
  total: number;
}

export interface PaginationLinks {
  first: string | null;
  last: string | null;
  prev: string | null;
  next: string | null;
}

export interface BaseApiResponse {
  message: string;
  error: boolean;
  code: number;
}

export interface ApiResponse<T> extends BaseApiResponse {
  data: T; // Can be T or T[] depending on what is passed
  meta?: PaginationMeta;
  links?: PaginationLinks;
}

export interface PaginatedResponse<T> extends BaseApiResponse {
  data: T[];
  meta: PaginationMeta;
  links: PaginationLinks;
}

export type DiscountType = 'percentage' | 'fixed';
