import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import TenantLoading from '../TenantLoading';
import { useTenant } from '../../../hooks/useTenant';

// Mock the useTenant hook
jest.mock('../../../hooks/useTenant');
const mockUseTenant = useTenant as jest.MockedFunction<typeof useTenant>;

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  AlertCircle: ({ className }: { className?: string }) => (
    <div data-testid="alert-icon" className={className}>
      ⚠️
    </div>
  ),
}));

describe('TenantLoading', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders children when not loading and no error', () => {
    mockUseTenant.mockReturnValue({
      tenant: { subdomain: 'company1', isCentral: false },
      isLoading: false,
      error: null,
      validateTenant: jest.fn(),
      refreshTenant: jest.fn(),
    });

    render(
      <TenantLoading>
        <div data-testid="child-content">Child content</div>
      </TenantLoading>
    );

    expect(screen.getByTestId('child-content')).toBeInTheDocument();
    expect(screen.getByText('Child content')).toBeInTheDocument();
  });

  it('shows loading state', () => {
    mockUseTenant.mockReturnValue({
      tenant: { subdomain: '', isCentral: true },
      isLoading: true,
      error: null,
      validateTenant: jest.fn(),
      refreshTenant: jest.fn(),
    });

    render(
      <TenantLoading>
        <div data-testid="child-content">Child content</div>
      </TenantLoading>
    );

    expect(screen.getByText('Loading Tenant')).toBeInTheDocument();
    expect(screen.getByText('Validating tenant configuration...')).toBeInTheDocument();
    expect(screen.queryByTestId('child-content')).not.toBeInTheDocument();

    // Check for loading spinner
    expect(document.querySelector('.animate-spin')).toBeInTheDocument();
  });

  it('shows error state', () => {
    const errorMessage = 'Tenant validation failed';
    mockUseTenant.mockReturnValue({
      tenant: { subdomain: '', isCentral: true },
      isLoading: false,
      error: errorMessage,
      validateTenant: jest.fn(),
      refreshTenant: jest.fn(),
    });

    render(
      <TenantLoading>
        <div data-testid="child-content">Child content</div>
      </TenantLoading>
    );

    expect(screen.getByText('Tenant Validation Failed')).toBeInTheDocument();
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
    expect(
      screen.getByText('You will be redirected to the main site shortly...')
    ).toBeInTheDocument();
    expect(screen.getByTestId('alert-icon')).toBeInTheDocument();
    expect(screen.queryByTestId('child-content')).not.toBeInTheDocument();
  });

  it('applies correct CSS classes for loading state', () => {
    mockUseTenant.mockReturnValue({
      tenant: { subdomain: '', isCentral: true },
      isLoading: true,
      error: null,
      validateTenant: jest.fn(),
      refreshTenant: jest.fn(),
    });

    render(
      <TenantLoading>
        <div data-testid="child-content">Child content</div>
      </TenantLoading>
    );

    const loadingContainer = screen.getByText('Loading Tenant').closest('div');
    expect(loadingContainer?.parentElement).toHaveClass(
      'min-h-screen',
      'flex',
      'items-center',
      'justify-center'
    );
  });

  it('applies correct CSS classes for error state', () => {
    mockUseTenant.mockReturnValue({
      tenant: { subdomain: '', isCentral: true },
      isLoading: false,
      error: 'Some error',
      validateTenant: jest.fn(),
      refreshTenant: jest.fn(),
    });

    render(
      <TenantLoading>
        <div data-testid="child-content">Child content</div>
      </TenantLoading>
    );

    const errorContainer = screen.getByText('Tenant Validation Failed').closest('div');
    expect(errorContainer?.parentElement).toHaveClass(
      'min-h-screen',
      'flex',
      'items-center',
      'justify-center'
    );
  });
});
