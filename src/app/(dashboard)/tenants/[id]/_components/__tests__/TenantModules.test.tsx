import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import TenantModules from '@/app/(dashboard)/tenants/[id]/_components/TenantModules';
import ModuleService from '@/services/ModuleService';
import { usePermissions } from '@/hooks/usePermissions';

jest.mock('@/services/ModuleService');
jest.mock('@/hooks/usePermissions');
jest.mock('sonner', () => ({ toast: { success: jest.fn(), error: jest.fn() } }));

const mockService = ModuleService as jest.Mocked<typeof ModuleService>;
const mockUsePermissions = usePermissions as jest.MockedFunction<typeof usePermissions>;

const MODULES = [
  {
    id: 1,
    slug: 'pharmacy',
    name: 'Pharmacy',
    description: 'Prescriptions and drug inventory',
    type: 'module' as const,
    is_active: true,
    is_enabled: false,
    source: null,
  },
  {
    id: 2,
    slug: 'pos',
    name: 'Point of Sale',
    type: 'module' as const,
    is_active: true,
    is_enabled: true,
    source: 'plan' as const,
  },
  {
    id: 3,
    slug: 'shopify',
    name: 'Shopify',
    type: 'integration' as const,
    is_active: true,
    is_enabled: false,
    source: null,
  },
];

const allowAll = () =>
  mockUsePermissions.mockReturnValue({ hasPermission: () => true } as unknown as ReturnType<
    typeof usePermissions
  >);

describe('TenantModules', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockService.getTenantModules.mockResolvedValue(MODULES);
    mockService.enableTenantModule.mockResolvedValue({});
    mockService.disableTenantModule.mockResolvedValue({});
    allowAll();
  });

  it('lists modules and integrations separately with the enabled count', async () => {
    render(<TenantModules tenantId="acme" />);

    expect(await screen.findByText('Pharmacy')).toBeInTheDocument();
    expect(screen.getByText('Shopify')).toBeInTheDocument();
    expect(screen.getByText('Integrations')).toBeInTheDocument();
    expect(screen.getByText('1 of 3 enabled')).toBeInTheDocument();
  });

  it('enables a module for the tenant when toggled on', async () => {
    const user = userEvent.setup();
    render(<TenantModules tenantId="acme" />);
    await screen.findByText('Pharmacy');

    // Switches render in module order; the first is the disabled Pharmacy module.
    await user.click(screen.getAllByRole('switch')[0]);

    await waitFor(() =>
      expect(mockService.enableTenantModule).toHaveBeenCalledWith('acme', 'pharmacy')
    );
  });

  it('disables a module when toggled off', async () => {
    const user = userEvent.setup();
    render(<TenantModules tenantId="acme" />);
    await screen.findByText('Point of Sale');

    await user.click(screen.getAllByRole('switch')[1]);

    await waitFor(() =>
      expect(mockService.disableTenantModule).toHaveBeenCalledWith('acme', 'pos')
    );
  });

  it('warns that a plan-granted module will come back on the next sync', async () => {
    render(<TenantModules tenantId="acme" />);

    expect(await screen.findByText(/included in the tenant/i)).toBeInTheDocument();
  });

  it('does not allow toggling without the manage-module permission', async () => {
    mockUsePermissions.mockReturnValue({
      hasPermission: (name: string) => name !== 'manage-module',
    } as unknown as ReturnType<typeof usePermissions>);

    render(<TenantModules tenantId="acme" />);
    await screen.findByText('Pharmacy');

    screen
      .getAllByRole('switch')
      .forEach((box) => expect(box).toHaveAttribute('aria-disabled', 'true'));
    expect(screen.getByText(/do not have permission/i)).toBeInTheDocument();
  });
});
