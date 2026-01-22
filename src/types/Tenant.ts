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

import { ApiResponse } from './Common';

export type TenantApiResponse = ApiResponse<Tenant>;

export type TenantInput = Partial<Tenant>;
