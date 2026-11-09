/**
 * Decides which sidebar item is highlighted for the current route.
 *
 * Two rules, both needed:
 *  - **Segment boundary**, not bare prefix: '/sales-invoices' is not inside '/sales', but
 *    '/tenants/5' is inside '/tenants'.
 *  - **Most specific wins**: a parent entry like '/reports' must not light up when the page has a
 *    menu item of its own ('/reports/trial-balance'). '/tenants' still lights up on '/tenants/5'
 *    because nothing more specific exists.
 *
 * A bare `startsWith` highlighted '/reports' on every report page, and '/sales' on both
 * '/sales-invoices' and '/sales-orders'.
 */
export function isNavItemActive(
  pathname: string | null,
  path: string,
  allNavPaths: string[]
): boolean {
  if (!pathname) return false;

  // The dashboard is the app root; nothing below it should keep it lit.
  if (path === '/dashboard') return pathname === path;

  const covers = (candidate: string) =>
    pathname === candidate || pathname.startsWith(`${candidate}/`);

  if (!covers(path)) return false;

  const bestMatch = allNavPaths
    .filter(covers)
    .reduce((longest, candidate) => (candidate.length > longest.length ? candidate : longest), '');

  return path === bestMatch;
}
