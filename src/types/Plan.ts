export interface Plan {
  id: number;
  name: string;
  price: number;
  interval: 'day' | 'week' | 'month' | 'year' | 'lifetime';
  interval_count: number;
  is_trial_plan: boolean;
  trial_duration_in_days?: number;
  is_expired_user_plan: boolean;
  features?: PlanFeature[];
  subscribed_tenants?: any[];
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

export interface PlanApiResponse {
  message: string;
  error: boolean;
  code: number;
  data: Plan | Plan[];
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