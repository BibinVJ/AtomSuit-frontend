import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import ProfitAndLossPage from '@/app/(dashboard)/reports/profit-and-loss/page';
import ReceivablesAgingPage from '@/app/(dashboard)/reports/receivables-aging/page';
import CustomerBalancesPage from '@/app/(dashboard)/reports/customer-balances/page';
import OutstandingGrnsPage from '@/app/(dashboard)/reports/outstanding-grns/page';
import LowStockPage from '@/app/(dashboard)/reports/low-stock/page';
import ReportService from '@/services/ReportService';
import { usePermissions } from '@/hooks/usePermissions';

jest.mock('@/services/ReportService');
jest.mock('@/hooks/usePermissions');
jest.mock('@/hooks/useSettings', () => ({
  useSettings: () => ({
    formatCurrency: (n: number) => `$${n.toFixed(2)}`,
    formatNumber: (n: number) => String(n),
    formatDate: (d: string) => d,
    getSetting: () => '2',
  }),
}));
jest.mock('@/components/form/date-picker', () => ({
  __esModule: true,
  default: () => <input data-testid="date-picker" />,
}));

const mockService = ReportService as jest.Mocked<typeof ReportService>;
const mockUsePermissions = usePermissions as jest.MockedFunction<typeof usePermissions>;

const allowAll = () =>
  mockUsePermissions.mockReturnValue({ hasPermission: () => true } as unknown as ReturnType<
    typeof usePermissions
  >);

const emptySection = { groups: [], total: '0.0000' };

describe('report pages', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    allowAll();
  });

  describe('Profit & Loss', () => {
    it('shows a net profit in the profit styling', async () => {
      mockService.profitAndLoss.mockResolvedValue({
        period: { from: '2026-01-01', to: '2026-01-31' },
        income: { groups: [], total: '1500.0000' },
        cost_of_goods_sold: { groups: [], total: '900.0000' },
        gross_profit: '600.0000',
        expenses: emptySection,
        net_profit: '400.0000',
        is_profit: true,
      });

      render(<ProfitAndLossPage />);

      expect(await screen.findByText('Net Profit')).toBeInTheDocument();
      expect(screen.getByText('$400.00')).toBeInTheDocument();
    });

    it('labels a negative result as a net loss', async () => {
      mockService.profitAndLoss.mockResolvedValue({
        period: { from: '2026-02-01', to: '2026-02-28' },
        income: emptySection,
        cost_of_goods_sold: emptySection,
        gross_profit: '0.0000',
        expenses: { groups: [], total: '500.0000' },
        net_profit: '-500.0000',
        is_profit: false,
      });

      render(<ProfitAndLossPage />);

      expect(await screen.findByText('Net Loss')).toBeInTheDocument();
    });
  });

  describe('Receivables Aging', () => {
    it('renders one column per bucket returned by the API', async () => {
      mockService.receivablesAging.mockResolvedValue({
        as_at: '2026-06-30',
        buckets: { current: 'Current', days_1_30: '1-30 days', days_91_plus: '90+ days' },
        rows: [
          {
            id: 1,
            name: 'Acme',
            total: '300.0000',
            current: '100.0000',
            days_1_30: '200.0000',
            days_91_plus: '0.0000',
            invoices: [],
          },
        ],
        totals: {
          current: '100.0000',
          days_1_30: '200.0000',
          days_91_plus: '0.0000',
          total: '300.0000',
        },
      });

      render(<ReceivablesAgingPage />);

      expect(await screen.findByText('Acme')).toBeInTheDocument();
      // Columns come from the server's bucket map, so the UI can't drift from the bucketing.
      expect(screen.getByText('1-30 days')).toBeInTheDocument();
      expect(screen.getByText('90+ days')).toBeInTheDocument();
    });
  });

  describe('Customer Balances', () => {
    it('shows the net balance after money on account', async () => {
      mockService.customerBalances.mockResolvedValue({
        as_at: '2026-06-30',
        rows: [
          {
            id: 1,
            name: 'Acme',
            invoice_count: 2,
            invoiced: '1000.0000',
            paid: '0.0000',
            outstanding: '1000.0000',
            unallocated: '250.0000',
            net_balance: '750.0000',
          },
        ],
        totals: {
          invoiced: '1000.0000',
          paid: '0.0000',
          outstanding: '1000.0000',
          unallocated: '250.0000',
          net_balance: '750.0000',
        },
        count: 1,
      });

      render(<CustomerBalancesPage />);

      expect(await screen.findByText('Acme')).toBeInTheDocument();
      expect(screen.getAllByText('$750.00').length).toBeGreaterThan(0);
    });
  });

  describe('Outstanding GRNs', () => {
    it('lists each GRN with its pending lines', async () => {
      mockService.outstandingGrns.mockResolvedValue({
        period: { from: '2026-03-01', to: '2026-03-31' },
        rows: [
          {
            id: 1,
            grn_number: 'GRN-001',
            received_date: '2026-03-01',
            vendor: 'Pharma Distributors',
            purchase_order_id: null,
            status: 'RECEIVED',
            pending_value: '300.0000',
            lines: [
              {
                item_id: 1,
                item_name: 'Paracetamol',
                received_quantity: '10.0000',
                invoiced_quantity: '4.0000',
                pending_quantity: '6.0000',
                unit_price: '50.0000',
                pending_value: '300.0000',
              },
            ],
          },
        ],
        totals: { grn_count: 1, pending_quantity: '6.0000', pending_value: '300.0000' },
      });

      render(<OutstandingGrnsPage />);

      expect(await screen.findByText('GRN-001')).toBeInTheDocument();
      expect(screen.getByText('Paracetamol')).toBeInTheDocument();
      expect(screen.getByText('1 outstanding GRN(s)')).toBeInTheDocument();
    });

    it('says so plainly when nothing is outstanding', async () => {
      mockService.outstandingGrns.mockResolvedValue({
        period: { from: '2026-03-01', to: '2026-03-31' },
        rows: [],
        totals: { grn_count: 0, pending_quantity: '0', pending_value: '0' },
      });

      render(<OutstandingGrnsPage />);

      expect(await screen.findByText(/fully invoiced/i)).toBeInTheDocument();
    });
  });

  describe('Low Stock', () => {
    it('flags out-of-stock separately from low', async () => {
      mockService.lowStock.mockResolvedValue({
        warehouse_id: null,
        threshold: 10,
        excludes_expired_stock: true,
        rows: [
          {
            item_id: 1,
            sku: 'SKU-1',
            item_name: 'Empty Widget',
            category: null,
            unit: 'pcs',
            quantity_available: '0.0000',
            threshold: '10',
            shortfall: '10.0000',
            is_out_of_stock: true,
          },
          {
            item_id: 2,
            sku: 'SKU-2',
            item_name: 'Low Widget',
            category: null,
            unit: 'pcs',
            quantity_available: '3.0000',
            threshold: '10',
            shortfall: '7.0000',
            is_out_of_stock: false,
          },
        ],
        count: 2,
      });

      render(<LowStockPage />);

      expect(await screen.findByText('Out of stock')).toBeInTheDocument();
      expect(screen.getByText('Low')).toBeInTheDocument();
      // The exclusion is stated, so the numbers are never unexplained.
      expect(screen.getByText(/Expired stock is excluded/i)).toBeInTheDocument();
    });

    it('denies access without the inventory report permission', () => {
      mockUsePermissions.mockReturnValue({
        hasPermission: () => false,
      } as unknown as ReturnType<typeof usePermissions>);

      render(<LowStockPage />);

      expect(screen.getByText('Access Denied')).toBeInTheDocument();
      expect(mockService.lowStock).not.toHaveBeenCalled();
    });
  });
});
