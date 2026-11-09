import api from '@/services/api';
import ReportService from '@/services/ReportService';

jest.mock('@/services/api', () => ({
  __esModule: true,
  default: { get: jest.fn() },
}));

const mockGet = (api as unknown as { get: jest.Mock }).get;

describe('ReportService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGet.mockResolvedValue({ data: { data: { rows: [] } } });
  });

  it('unwraps the ApiResponse envelope and returns only data', async () => {
    mockGet.mockResolvedValue({ data: { message: 'ok', error: false, data: { rows: [1] } } });

    await expect(ReportService.trialBalance()).resolves.toEqual({ rows: [1] });
  });

  it.each([
    ['trialBalance', 'trial-balance'],
    ['profitAndLoss', 'profit-and-loss'],
    ['balanceSheet', 'balance-sheet'],
    ['taxSummary', 'tax-summary'],
    ['salesRegister', 'sales-register'],
    ['receivablesAging', 'receivables-aging'],
    ['customerBalances', 'customer-balances'],
    ['purchaseRegister', 'purchase-register'],
    ['payablesAging', 'payables-aging'],
    ['vendorBalances', 'vendor-balances'],
    ['outstandingGrns', 'outstanding-grns'],
    ['stockValuation', 'stock-valuation'],
    ['expiry', 'expiry'],
    ['lowStock', 'low-stock'],
  ])('%s calls /reports/%s', async (method, path) => {
    const service = ReportService as unknown as Record<string, (p?: unknown) => Promise<unknown>>;

    await service[method]({ from: '2026-01-01', to: '2026-01-31' });

    expect(mockGet).toHaveBeenCalledWith(`/reports/${path}`, {
      params: { from: '2026-01-01', to: '2026-01-31' },
    });
  });

  it('passes filters through as query params', async () => {
    await ReportService.expiry({ within_days: 30, warehouse_id: 2 });

    expect(mockGet).toHaveBeenCalledWith('/reports/expiry', {
      params: { within_days: 30, warehouse_id: 2 },
    });
  });

  it('lets an API failure propagate so the page can show an error', async () => {
    mockGet.mockRejectedValue(new Error('500'));

    await expect(ReportService.trialBalance()).rejects.toThrow('500');
  });
});
