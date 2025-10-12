import { Customer, Item, StockAlert } from ".";

export interface DashboardData {
  metrics: {
    total_sales_amount: number;
    total_purchase_amount: number;
    total_customers: number;
    total_items: number;
  };
  charts: {
    sales: { date: string; total: number }[];
    purchases: { date: string; total: number }[];
  };
  customers: {
    best_customers: Customer[];
  };
  stock_alerts: {
    out_of_stock_items: StockAlert[];
    low_stock_items: StockAlert[];
    expiring_items: StockAlert[];
    dead_stock_items: StockAlert[];
  };
  top_items: {
    sold: Item[];
    purchased: Item[];
  };
}
