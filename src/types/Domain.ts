import { Tenant } from './Tenant';

export interface Domain {
  id: number;
  domain: string;
  tenant?: Tenant;
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