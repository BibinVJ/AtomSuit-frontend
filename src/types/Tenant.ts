import { Plan } from './Plan';
import { Domain } from './Domain';

export interface Tenant {
  id: string;
  name: string;
  email: string;
  phone?: string;
  status: 'active' | 'suspended' | 'trial';
  trial_ends_at?: string;
  grace_period_ends_at?: string;
  domain_name?: Domain | string;
  current_plan?: Plan;
  // For creating/updating
  password?: string;
  plan_id?: number;
  load_sample_data?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface TenantApiResponse {
  message: string;
  error: boolean;
  code: number;
  data: Tenant | Tenant[];
  meta?: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from?: number;
    to?: number;
  };
  links?: {
    first: string;
    last: string;
    prev: string | null;
    next: string | null;
  };
}

export type TenantInput = Partial<Tenant>;
