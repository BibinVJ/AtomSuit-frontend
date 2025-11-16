import api from './api';

export interface Subscription {
  id: string;
  name: string;
  stripe_id: string;
  stripe_status: string;
  stripe_price: string;
  quantity: number;
  trial_ends_at: string | null;
  ends_at: string | null;
  created_at: string;
  updated_at: string;
  is_active: boolean;
  is_cancelled: boolean;
  is_on_trial: boolean;
  is_past_due: boolean;
  current_period_start: string | null;
  current_period_end: string | null;
  items: SubscriptionItem[];
}

export interface SubscriptionItem {
  id: string;
  stripe_id: string;
  stripe_product: string;
  stripe_price: string;
  quantity: number;
  price: {
    id: string;
    unit_amount: number;
    currency: string;
    recurring: {
      interval: string;
      interval_count: number;
    };
  };
}

export interface Plan {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  interval: string;
  interval_count: number;
  is_active: boolean;
  features: PlanFeature[];
}

export interface PlanFeature {
  id: string;
  name: string;
  description: string;
  value: string | number | boolean;
  type: string;
}

class TenantSubscriptionService {
  async getCurrentSubscription(): Promise<Subscription> {
    const response = await api.get('/tenant-subscription/current');
    return response.data.data;
  }

  async getAvailablePlans(): Promise<Plan[]> {
    const response = await api.get('/tenant-subscription/plans');
    return response.data.data;
  }

  async upgradePlan(planId: string): Promise<Subscription> {
    const response = await api.post('/tenant-subscription/upgrade', { plan_id: planId });
    return response.data.data;
  }

  async downgradePlan(planId: string): Promise<Subscription> {
    const response = await api.post('/tenant-subscription/downgrade', { plan_id: planId });
    return response.data.data;
  }

  async cancelSubscription(): Promise<Subscription> {
    const response = await api.post('/tenant-subscription/cancel');
    return response.data.data;
  }

  async resumeSubscription(): Promise<Subscription> {
    const response = await api.post('/tenant-subscription/resume');
    return response.data.data;
  }
}

export default new TenantSubscriptionService();