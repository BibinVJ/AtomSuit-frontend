export interface Plan {
  id: number;
  name: string;
  description?: string;
  price: number;
  interval: 'day' | 'week' | 'month' | 'year' | 'lifetime';
  interval_count: number;
  is_trial_plan: boolean;
  trial_duration_in_days?: number;
  is_expired_user_plan: boolean;
  currency?: string;
  features?: PlanFeature[];
  subscribed_tenants?: unknown[];
}

export interface PlanFeature {
  id?: number;
  key: string;
  value: string | number | boolean;
  type: 'boolean' | 'integer' | 'string';
  display_name: string;
  description?: string;
  display_order: number;
}

import { ApiResponse } from './Common';

export type PlanApiResponse = ApiResponse<Plan>;

export type PlanInput = Partial<Plan>;
