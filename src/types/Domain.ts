import { Tenant } from './Tenant';

export interface Domain {
  id: number;
  tenant_id?: number | string;
  domain: string;
  is_primary?: boolean;
  tenant?: Tenant;
  created_at?: string;
  updated_at?: string;
}

export interface DomainApiResponse {
  message: string;
  error: boolean;
  code: number;
  data: Domain | Domain[];
  meta?: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
  };
  links?: {
    first: string;
    last: string;
    prev: string | null;
    next: string | null;
  };
}