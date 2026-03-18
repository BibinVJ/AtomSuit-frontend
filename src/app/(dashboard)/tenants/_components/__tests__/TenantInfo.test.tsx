import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import TenantInfo from '@/app/(dashboard)/tenants/_components/TenantInfo';
import { useTenant } from '@/hooks/useTenant';

// Mock the useTenant hook
jest.mock('@/hooks/useTenant');
const mockUseTenant = useTenant as jest.MockedFunction<typeof useTenant>;

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  Building: ({ className }: { className?: string }) => (
    <div data-testid="building-icon" className={className}>
      🏢
    </div>
  ),
  Crown: ({ className }: { className?: string }) => (
    <div data-testid="crown-icon" className={className}>
      👑
    </div>
  ),
}));

describe('TenantInfo', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows loading state', () => {
    mockUseTenant.mockReturnValue({
      tenant: { subdomain: '', isCentral: true },
      isLoading: true,
      error: null,
      validateTenant: jest.fn(),
      refreshTenant: jest.fn(),
    });

    render(<TenantInfo />);

    expect(screen.getByText('Loading...')).toBeInTheDocument();
    const loadingSpinner = document.querySelector('.animate-spin');
    expect(loadingSpinner).toBeInTheDocument();
  });

  it('shows error state', () => {
    const errorMessage = 'Failed to validate tenant';
    mockUseTenant.mockReturnValue({
      tenant: { subdomain: '', isCentral: true },
      isLoading: false,
      error: errorMessage,
      validateTenant: jest.fn(),
      refreshTenant: jest.fn(),
    });

    render(<TenantInfo />);

    expect(screen.getByText(`⚠️ ${errorMessage}`)).toBeInTheDocument();
    expect(screen.getByText(`⚠️ ${errorMessage}`).parentElement).toHaveClass('text-red-500');
  });

  it('shows central tenant (Super Admin)', () => {
    mockUseTenant.mockReturnValue({
      tenant: { subdomain: '', isCentral: true },
      isLoading: false,
      error: null,
      validateTenant: jest.fn(),
      refreshTenant: jest.fn(),
    });

    render(<TenantInfo />);

    expect(screen.getByText('Super Admin')).toBeInTheDocument();
    expect(screen.getByTestId('crown-icon')).toBeInTheDocument();
    expect(screen.getByText('Super Admin').parentElement).toHaveClass('text-amber-600');
  });

  it('shows tenant subdomain', () => {
    mockUseTenant.mockReturnValue({
      tenant: { subdomain: 'company1', isCentral: false },
      isLoading: false,
      error: null,
      validateTenant: jest.fn(),
      refreshTenant: jest.fn(),
    });

    render(<TenantInfo />);

    expect(screen.getByText('company1')).toBeInTheDocument();
    expect(screen.getByTestId('building-icon')).toBeInTheDocument();
    expect(screen.getByText('company1').parentElement).toHaveClass('text-blue-600');
  });
});
