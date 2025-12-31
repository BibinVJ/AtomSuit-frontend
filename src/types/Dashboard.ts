import { Customer, Item, StockAlert } from '.';

export interface DashboardData {
  // Tenant context data
  metrics?: {
    total_sales_amount: number;
    total_purchase_amount: number;
    total_customers: number;
    total_items: number;
  };
  charts?: {
    sales: { date: string; total: number }[];
    purchases: { date: string; total: number }[];
  };
  customers?: {
    best_customers: Customer[];
  };
  stock_alerts?: {
    out_of_stock_items: StockAlert[];
    low_stock_items: StockAlert[];
    expiring_items: StockAlert[];
    dead_stock_items: StockAlert[];
  };
  top_items?: {
    sold: Item[];
    purchased: Item[];
  };
  // Central context data
  tenant_overview?: {
    total: number;
    active: number;
    suspended: number;
    on_trial: number;
    in_grace_period: number;
    expired: number;
    paid_subscribers: number;
    recent_registrations: number;
    archived: number;
  };
  plan_distribution?: Record<string, number>;
  revenue?: {
    total: string;
    this_month: string;
    currency: string;
  };
  growth?: {
    last_30_days: number;
    conversion_rate: string;
  };
}
