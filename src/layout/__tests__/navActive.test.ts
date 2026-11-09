import { isNavItemActive } from '@/layout/navActive';

const PATHS = [
  '/dashboard',
  '/reports',
  '/reports/trial-balance',
  '/reports/profit-and-loss',
  '/sales',
  '/sales-invoices',
  '/sales-orders',
  '/tenants',
  '/customers',
  '/customer-payments',
];

const activeFor = (pathname: string) => PATHS.filter((p) => isNavItemActive(pathname, p, PATHS));

describe('sidebar active item', () => {
  it('highlights only the report itself, not the All Reports parent', () => {
    // The reported bug: '/reports' lit up alongside every report.
    expect(activeFor('/reports/trial-balance')).toEqual(['/reports/trial-balance']);
  });

  it('highlights All Reports on the reports index itself', () => {
    expect(activeFor('/reports')).toEqual(['/reports']);
  });

  it('does not treat a shared prefix as a parent', () => {
    // '/sales-invoices' starts with '/sales' textually, but is not inside it.
    expect(activeFor('/sales-invoices')).toEqual(['/sales-invoices']);
    expect(activeFor('/sales-orders')).toEqual(['/sales-orders']);
    expect(activeFor('/sales')).toEqual(['/sales']);
  });

  it('still highlights the parent for a detail page with no menu item of its own', () => {
    // Nothing is more specific than '/tenants', so the tenant detail page keeps it lit.
    expect(activeFor('/tenants/acme')).toEqual(['/tenants']);
  });

  it('keeps similarly named siblings apart', () => {
    expect(activeFor('/customer-payments')).toEqual(['/customer-payments']);
    expect(activeFor('/customers')).toEqual(['/customers']);
  });

  it('matches the dashboard exactly only', () => {
    expect(isNavItemActive('/dashboard', '/dashboard', PATHS)).toBe(true);
    expect(isNavItemActive('/dashboard/anything', '/dashboard', PATHS)).toBe(false);
  });

  it('highlights nothing for an unknown route', () => {
    expect(activeFor('/nowhere')).toEqual([]);
  });

  it('highlights exactly one item for every known path', () => {
    PATHS.forEach((pathname) => {
      expect(activeFor(pathname)).toHaveLength(1);
    });
  });
});
