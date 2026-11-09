/** Shared shapes for the tenant reporting endpoints. All money values arrive as decimal strings. */

export interface ReportPeriod {
  from: string | null;
  to: string | null;
}

export interface TrialBalanceRow {
  account_id: number;
  account_code: string;
  account_name: string;
  account_group: string | null;
  account_type: string | null;
  account_class: string | null;
  opening_balance: string;
  debit: string;
  credit: string;
  balance: string;
}

export interface TrialBalanceReport {
  rows: TrialBalanceRow[];
  totals: { debit: string; credit: string; difference: string };
  is_balanced: boolean;
}

export interface StatementAccount {
  account_id: number;
  account_code: string;
  account_name: string;
  amount: string;
}

export interface StatementGroup {
  id: number;
  name: string;
  accounts: StatementAccount[];
  total: string;
}

export interface StatementSection {
  groups: StatementGroup[];
  total: string;
}

export interface ProfitAndLossReport {
  period: ReportPeriod;
  income: StatementSection;
  cost_of_goods_sold: StatementSection;
  gross_profit: string;
  expenses: StatementSection;
  net_profit: string;
  is_profit: boolean;
}

export interface BalanceSheetReport {
  as_at: string;
  assets: StatementSection;
  liabilities: StatementSection;
  equity: StatementSection & { retained_earnings: string };
  totals: {
    assets: string;
    liabilities: string;
    equity: string;
    liabilities_and_equity: string;
    difference: string;
  };
  is_balanced: boolean;
}

export interface AgingInvoice {
  id: number;
  number: string;
  due_date: string | null;
  days_overdue: number;
  total_amount: string;
  paid_amount: string;
  outstanding: string;
  bucket: string;
}

export interface AgingRow {
  id: number;
  name: string;
  total: string;
  invoices: AgingInvoice[];
  [bucket: string]: string | number | AgingInvoice[];
}

export interface AgingReport {
  as_at: string;
  /** bucket key -> human label, in display order */
  buckets: Record<string, string>;
  rows: AgingRow[];
  totals: Record<string, string>;
}

export interface RegisterRow {
  id: number;
  invoice_number: string;
  invoice_date?: string | null;
  posting_date?: string | null;
  due_date: string | null;
  customer?: string | null;
  vendor?: string | null;
  status: string;
  sub_total: string;
  discount_total: string;
  tax_total: string;
  total_amount: string;
  paid_amount: string;
  outstanding: string;
}

export interface RegisterReport {
  period: ReportPeriod;
  rows: RegisterRow[];
  totals: Record<string, string>;
  count: number;
}

export interface TaxRateRow {
  id: number | null;
  name: string;
  rate: number | string;
  type: string | null;
  taxable_amount: string;
  tax_amount: string;
}

export interface TaxSide {
  rates: TaxRateRow[];
  total_taxable: string;
  total_tax: string;
  stored_tax: string;
  variance: string;
  reconciles: boolean;
}

export interface TaxSummaryReport {
  period: ReportPeriod;
  output_tax: TaxSide;
  input_tax: TaxSide;
  net_payable: string;
}

export interface StockValuationBatch {
  batch_id: number;
  batch_number: string;
  expiry_date: string | null;
  is_expired: boolean;
  quantity: string;
  cost_price: string;
  value: string;
}

export interface StockValuationRow {
  item_id: number;
  sku: string;
  item_name: string;
  category: string | null;
  unit: string | null;
  quantity: string;
  value: string;
  unbatched_quantity: string;
  batches: StockValuationBatch[];
}

export interface StockValuationReport {
  warehouse_id: number | null;
  rows: StockValuationRow[];
  totals: { quantity: string; value: string };
  valued_at_cost: boolean;
  expired_stock_sellable: boolean;
}

export interface ExpiryRow {
  batch_id: number;
  batch_number: string;
  item_id: number;
  item_name: string | null;
  sku: string | null;
  unit: string | null;
  expiry_date: string | null;
  quantity: string;
  cost_price: string;
  value: string;
  days_to_expiry: number;
}

export interface ExpiryReport {
  as_at: string;
  within_days: number;
  warehouse_id: number | null;
  expired: ExpiryRow[];
  expiring_soon: ExpiryRow[];
  totals: {
    expired_batches: number;
    expired_value: string;
    expiring_batches: number;
    expiring_value: string;
  };
  expired_stock_sellable: boolean;
}

export interface LowStockRow {
  item_id: number;
  sku: string;
  item_name: string;
  category: string | null;
  unit: string | null;
  quantity_available: string;
  threshold: string;
  shortfall: string;
  is_out_of_stock: boolean;
}

export interface LowStockReport {
  warehouse_id: number | null;
  threshold: number;
  excludes_expired_stock: boolean;
  rows: LowStockRow[];
  count: number;
}

export interface PartyBalanceRow {
  id: number;
  name: string;
  invoice_count: number;
  invoiced: string;
  paid: string;
  outstanding: string;
  /** Payment money not yet matched to a document. */
  unallocated: string;
  net_balance: string;
}

export interface PartyBalanceReport {
  as_at: string;
  rows: PartyBalanceRow[];
  totals: Record<string, string>;
  count: number;
}

export interface OutstandingGrnLine {
  item_id: number;
  item_name: string | null;
  received_quantity: string;
  invoiced_quantity: string;
  pending_quantity: string;
  unit_price: string;
  pending_value: string;
}

export interface OutstandingGrnRow {
  id: number;
  grn_number: string;
  received_date: string | null;
  vendor: string | null;
  purchase_order_id: number | null;
  status: string | null;
  pending_value: string;
  lines: OutstandingGrnLine[];
}

export interface OutstandingGrnReport {
  period: ReportPeriod;
  rows: OutstandingGrnRow[];
  totals: { grn_count: number; pending_quantity: string; pending_value: string };
}
