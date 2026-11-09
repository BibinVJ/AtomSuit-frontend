import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import TrialBalancePage from '@/app/(dashboard)/reports/trial-balance/page';
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

const BALANCED = {
  rows: [
    {
      account_id: 1,
      account_code: '1000',
      account_name: 'Cash',
      account_group: 'Assets',
      account_type: 'Asset',
      account_class: 'debit',
      opening_balance: '0.0000',
      debit: '10000.0000',
      credit: '200.0000',
      balance: '9800.0000',
    },
  ],
  totals: { debit: '10000.0000', credit: '10000.0000', difference: '0.0000' },
  is_balanced: true,
};

describe('TrialBalancePage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUsePermissions.mockReturnValue({ hasPermission: () => true } as unknown as ReturnType<
      typeof usePermissions
    >);
  });

  it('renders the account rows and totals returned by the backend', async () => {
    mockService.trialBalance.mockResolvedValue(BALANCED);

    render(<TrialBalancePage />);

    expect(await screen.findByText('Cash')).toBeInTheDocument();
    expect(screen.getByText('1000')).toBeInTheDocument();
    // The balance is rendered as sent — the client never recomputes it.
    expect(screen.getByText('$9800.00')).toBeInTheDocument();
  });

  it('confirms the ledger is balanced', async () => {
    mockService.trialBalance.mockResolvedValue(BALANCED);

    render(<TrialBalancePage />);

    expect(await screen.findByText(/ledger is balanced/i)).toBeInTheDocument();
  });

  it('warns loudly when the ledger does not balance', async () => {
    mockService.trialBalance.mockResolvedValue({
      ...BALANCED,
      totals: { debit: '10000.0000', credit: '9900.0000', difference: '100.0000' },
      is_balanced: false,
    });

    render(<TrialBalancePage />);

    expect(await screen.findByText(/out of balance by/i)).toBeInTheDocument();
  });

  it('denies access without the financial report permission', () => {
    mockUsePermissions.mockReturnValue({
      hasPermission: () => false,
    } as unknown as ReturnType<typeof usePermissions>);

    render(<TrialBalancePage />);

    expect(screen.getByText('Access Denied')).toBeInTheDocument();
    expect(mockService.trialBalance).not.toHaveBeenCalled();
  });

  it('surfaces a failed report instead of rendering an empty table', async () => {
    mockService.trialBalance.mockRejectedValue(new Error('boom'));

    render(<TrialBalancePage />);

    expect(await screen.findByText(/failed to generate the report/i)).toBeInTheDocument();
  });
});
