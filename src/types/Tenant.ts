import { Plan } from './Plan';

export interface Tenant {
  id: string;
  name: string;
  email: string;
  phone?: string;
  status: 'active' | 'suspended' | 'trial';
  trial_ends_at?: string;
  grace_period_ends_at?: string;
  domain_name?: Domain;
  current_plan?: Plan;
  // For creating/updating
  plan_id?: number;
  load_sample_data?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Domain {
  id: number;
  tenant_id: number;
  domain: string;
  is_primary: boolean;
  created_at: string;
  updated_at: string;
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
  };
  links?: {
    first: string;
    last: string;
    prev: string | null;
    next: string | null;
  };
}
