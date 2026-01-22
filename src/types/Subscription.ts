import { Plan } from './Plan';
import { Tenant } from './Tenant';

export interface Subscription {
  id: number;
  tenant_id: number;
  tenant?: Tenant;
  name: string;
  stripe_id: string;
  stripe_status: string;
  stripe_price: string;
  quantity: number;
  trial_ends_at?: string;
  ends_at?: string;
  plan_id: number;
  plan?: Plan;
  is_canceled: boolean;
  is_on_trial: boolean;
  is_on_grace_period: boolean;
  invoices?: SubscriptionInvoice[];
  items?: SubscriptionItem[];
  created_at: string;
  updated_at: string;
}

export interface SubscriptionInvoice {
  id: number;
  subscription_id: number;
  amount: number;
  currency: string;
  payment_status: string;
  transaction_id: string;
  invoice_date: string;
  due_date?: string;
  paid_at?: string;
  metadata?: unknown;
}

export interface SubscriptionItem {
  id: number;
  subscription_id: number;
  stripe_id: string;
  stripe_product: string;
  stripe_price: string;
  quantity: number;
  created_at: string;
  updated_at: string;
}

import { ApiResponse } from './Common';

export type SubscriptionApiResponse = ApiResponse<Subscription>;
