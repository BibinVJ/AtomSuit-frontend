import api from './api';
import {
  AgingReport,
  BalanceSheetReport,
  ExpiryReport,
  LowStockReport,
  OutstandingGrnReport,
  PartyBalanceReport,
  ProfitAndLossReport,
  RegisterReport,
  StockValuationReport,
  TaxSummaryReport,
  TrialBalanceReport,
} from '@/types';

/**
 * Tenant reporting. Read-only, so there is no createBaseService CRUD contract to extend — each
 * report is a GET with its own filters and its own response shape.
 *
 * Every figure is computed by the backend; nothing here recalculates or re-totals.
 */

export interface ReportParams {
  from?: string;
  to?: string;
  as_at?: string;
  account_id?: number;
  item_id?: number;
  warehouse_id?: number;
  category_id?: number;
  customer_id?: number;
  vendor_id?: number;
  within_days?: number;
  threshold?: number;
  include_voided?: boolean;
}

const get = async <T>(path: string, params: ReportParams = {}): Promise<T> => {
  const response = await api.get(`/reports/${path}`, { params });
  return response.data.data;
};

export const ReportService = {
  trialBalance: (params?: ReportParams) => get<TrialBalanceReport>('trial-balance', params),
  profitAndLoss: (params: ReportParams) => get<ProfitAndLossReport>('profit-and-loss', params),
  balanceSheet: (params?: ReportParams) => get<BalanceSheetReport>('balance-sheet', params),
  accountLedger: (params: ReportParams) => get<Record<string, unknown>>('account-ledger', params),
  taxSummary: (params: ReportParams) => get<TaxSummaryReport>('tax-summary', params),

  salesRegister: (params: ReportParams) => get<RegisterReport>('sales-register', params),
  receivablesAging: (params?: ReportParams) => get<AgingReport>('receivables-aging', params),
  customerBalances: (params?: ReportParams) => get<PartyBalanceReport>('customer-balances', params),

  purchaseRegister: (params: ReportParams) => get<RegisterReport>('purchase-register', params),
  payablesAging: (params?: ReportParams) => get<AgingReport>('payables-aging', params),
  vendorBalances: (params?: ReportParams) => get<PartyBalanceReport>('vendor-balances', params),
  outstandingGrns: (params?: ReportParams) => get<OutstandingGrnReport>('outstanding-grns', params),

  stockValuation: (params?: ReportParams) => get<StockValuationReport>('stock-valuation', params),
  stockLedger: (params: ReportParams) => get<Record<string, unknown>>('stock-ledger', params),
  expiry: (params?: ReportParams) => get<ExpiryReport>('expiry', params),
  lowStock: (params?: ReportParams) => get<LowStockReport>('low-stock', params),
};

export default ReportService;
