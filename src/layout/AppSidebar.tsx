'use client';

import { useCallback, useEffect, useRef, useState, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BarChart3,
  Scale,
  FileText,
  Truck,
  LayoutDashboard,
  Package,
  ShoppingCart,
  Receipt,
  Users,
  Shield,
  ChevronDown,
  MoreHorizontal,
  CreditCard,
  Building2,
  Globe,
  Settings,
  Activity,
} from 'lucide-react';
import { useSidebar } from '@/hooks/useSidebar';
import { usePermissions } from '@/hooks/usePermissions';
import { useSettings } from '@/hooks/useSettings';
import { isNavItemActive } from './navActive';

type NavItem = {
  name: string;
  icon: React.ReactNode;
  path?: string;
  subItems?: { name: string; path: string; new?: boolean; permission?: string }[];
  permission?: string;
};

const navItems: NavItem[] = [
  {
    icon: <LayoutDashboard size={20} />,
    name: 'Dashboard',
    path: '/dashboard',
    permission: 'view-dashboard',
  },
  {
    name: 'Accounting',
    icon: <Receipt size={20} />,
    subItems: [
      { name: 'Currencies', path: '/accounting/currencies', permission: 'view-currency' },
      {
        name: 'Chart of Accounts',
        path: '/accounting/chart-of-accounts',
        permission: 'view-chart-of-account',
      },
      {
        name: 'Account Groups',
        path: '/accounting/account-groups',
        permission: 'view-account-group',
      },
      {
        name: 'Account Methods',
        path: '/accounting/account-types',
        permission: 'view-account-type',
      },
      {
        name: 'Taxes',
        path: '/accounting/taxes',
        permission: 'view-tax-rate',
      },
      {
        name: 'Cost Centers',
        path: '/accounting/cost-centers',
        permission: 'view-cost-center',
      },
    ],
  },
  {
    name: 'Inventory',
    icon: <Package size={20} />,
    subItems: [
      { name: 'Categories', path: '/inventory/categories', permission: 'view-category' },
      { name: 'Units', path: '/inventory/units', permission: 'view-unit' },
      { name: 'Items', path: '/inventory/items', permission: 'view-item' },
      { name: 'Price Lists', path: '/inventory/price-lists', permission: 'view-price-list' },
      { name: 'Warehouses', path: '/inventory/warehouses', permission: 'view-warehouse' },
    ],
  },
  {
    name: 'Sales',
    icon: <Receipt size={20} />,
    subItems: [
      { name: 'Customers', path: '/customers', permission: 'view-customer' },
      { name: 'Sales Orders', path: '/sales-orders', permission: 'view-sales-order' },
      { name: 'Delivery Notes', path: '/delivery-notes', permission: 'view-delivery-note' },
      { name: 'Sales Invoices', path: '/sales-invoices', permission: 'view-sales-invoice' },
      { name: 'Credit Notes', path: '/credit-notes', permission: 'view-credit-note' },
      {
        name: 'Customer Payments',
        path: '/customer-payments',
        permission: 'view-customer-payment',
      },
      { name: 'Quick Sale', path: '/sales', permission: 'view-sale' },
    ],
  },
  {
    name: 'Purchases',
    icon: <ShoppingCart size={20} />,
    subItems: [
      { name: 'Vendors', path: '/vendors', permission: 'view-vendor' },
      { name: 'Purchase Orders', path: '/purchase-orders', permission: 'view-purchase-order' },
      { name: 'Goods Received Notes', path: '/goods-received-notes', permission: 'view-grn' },
      {
        name: 'Purchase Invoices',
        path: '/purchase-invoices',
        permission: 'view-purchase-invoice',
      },
      { name: 'Debit Notes', path: '/debit-notes', permission: 'view-debit-note' },
      { name: 'Vendor Payments', path: '/vendor-payments', permission: 'view-vendor-payment' },
    ],
  },
];

/**
 * Reports get their own sidebar section with one collapsible submenu per category, rather than a
 * single long list — an accountant and a store manager go to different places, and each category
 * is separately permissioned.
 */
const reportItems: NavItem[] = [
  {
    name: 'Financial',
    icon: <Scale size={20} />,
    subItems: [
      {
        name: 'Trial Balance',
        path: '/reports/trial-balance',
        permission: 'view-financial-report',
      },
      {
        name: 'Profit & Loss',
        path: '/reports/profit-and-loss',
        permission: 'view-financial-report',
      },
      {
        name: 'Balance Sheet',
        path: '/reports/balance-sheet',
        permission: 'view-financial-report',
      },
      { name: 'Tax Summary', path: '/reports/tax-summary', permission: 'view-financial-report' },
    ],
  },
  {
    name: 'Sales',
    icon: <FileText size={20} />,
    subItems: [
      { name: 'Sales Register', path: '/reports/sales-register', permission: 'view-sales-report' },
      {
        name: 'Receivables Aging',
        path: '/reports/receivables-aging',
        permission: 'view-sales-report',
      },
      {
        name: 'Customer Balances',
        path: '/reports/customer-balances',
        permission: 'view-sales-report',
      },
    ],
  },
  {
    name: 'Purchase',
    icon: <Truck size={20} />,
    subItems: [
      {
        name: 'Purchase Register',
        path: '/reports/purchase-register',
        permission: 'view-purchase-report',
      },
      {
        name: 'Payables Aging',
        path: '/reports/payables-aging',
        permission: 'view-purchase-report',
      },
      {
        name: 'Vendor Balances',
        path: '/reports/vendor-balances',
        permission: 'view-purchase-report',
      },
      {
        name: 'Outstanding GRNs',
        path: '/reports/outstanding-grns',
        permission: 'view-purchase-report',
      },
    ],
  },
  {
    name: 'Inventory',
    icon: <Package size={20} />,
    subItems: [
      {
        name: 'Stock Valuation',
        path: '/reports/stock-valuation',
        permission: 'view-inventory-report',
      },
      { name: 'Expiry Report', path: '/reports/expiry', permission: 'view-inventory-report' },
      { name: 'Low Stock', path: '/reports/low-stock', permission: 'view-inventory-report' },
    ],
  },
  {
    name: 'All Reports',
    icon: <BarChart3 size={20} />,
    path: '/reports',
    permission: 'view-financial-report',
  },
];

const administrationItems: NavItem[] = [
  {
    icon: <CreditCard size={20} />,
    name: 'Billing',
    permission: 'my-subscription',
    subItems: [
      { name: 'Plans', path: '/billing/plans', permission: 'my-subscription' },
      { name: 'My Subscription', path: '/billing/subscription', permission: 'my-subscription' },
    ],
  },
  {
    icon: <CreditCard size={20} />,
    name: 'Plans',
    path: '/plans',
    permission: 'create-plan',
  },
  {
    icon: <Building2 size={20} />,
    name: 'Tenants',
    path: '/tenants',
    permission: 'view-tenant',
  },
  {
    icon: <Package size={20} />,
    name: 'Subscriptions',
    path: '/subscriptions',
    permission: 'view-subscription',
  },
  {
    icon: <Globe size={20} />,
    name: 'Domains',
    path: '/domains',
    permission: 'view-domain',
  },
  {
    icon: <Settings size={20} />,
    name: 'Settings',
    subItems: [
      { name: 'General', path: '/settings/general', permission: 'view-setting' },
      { name: 'Configurations', path: '/settings/configurations', permission: 'view-setting' },
      { name: 'Default Accounts', path: '/settings/default-accounts', permission: 'view-setting' },
    ],
  },
];

const othersItems: NavItem[] = [
  {
    icon: <Users size={20} />,
    name: 'User Management',
    path: '/users',
    permission: 'view-user',
  },
  {
    icon: <Shield size={20} />,
    name: 'Role Management',
    path: '/roles',
    permission: 'view-role',
  },
  {
    icon: <Activity size={20} />,
    name: 'Audit Logs',
    path: '/audits',
    permission: 'view-audit',
  },
];

const AppSidebar: React.FC = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered, toggleSidebar, toggleMobileSidebar } =
    useSidebar();
  const pathname = usePathname();

  const [openSubmenu, setOpenSubmenu] = useState<{
    type: 'main' | 'others' | 'administration' | 'reports';
    index: number;
  } | null>(null);
  const [subMenuHeight, setSubMenuHeight] = useState<Record<string, number>>({});
  const subMenuRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const { settings } = useSettings();
  const dynamicAdministrationItems = useMemo(() => {
    const hasDefaultAccounts =
      settings['default_sales_account'] !== undefined ||
      settings['default_payable_account'] !== undefined;

    return administrationItems.map((item) => {
      if (item.name === 'Settings') {
        return {
          ...item,
          subItems: item.subItems?.filter(
            (sub) => sub.name !== 'Default Accounts' || hasDefaultAccounts
          ),
        };
      }
      return item;
    });
  }, [settings]);

  /** Every path declared anywhere in the sidebar, so the most specific match can win. */
  const allNavPaths = useMemo(() => {
    const paths: string[] = [];

    const collect = (items: NavItem[]) =>
      items.forEach((item) => {
        if (item.path) paths.push(item.path);
        item.subItems?.forEach((subItem) => paths.push(subItem.path));
      });

    [navItems, othersItems, reportItems, dynamicAdministrationItems].forEach(collect);

    return paths;
  }, [dynamicAdministrationItems]);

  const isActive = useCallback(
    (path: string) => isNavItemActive(pathname, path, allNavPaths),
    [pathname, allNavPaths]
  );

  useEffect(() => {
    let submenuMatched = false;
    ['main', 'others', 'administration', 'reports'].forEach((menuType) => {
      const items =
        menuType === 'main'
          ? navItems
          : menuType === 'others'
            ? othersItems
            : menuType === 'reports'
              ? reportItems
              : dynamicAdministrationItems;
      items.forEach((nav, index) => {
        if (nav.subItems) {
          nav.subItems.forEach((subItem) => {
            if (isActive(subItem.path)) {
              setOpenSubmenu({
                type: menuType as 'main' | 'others' | 'administration' | 'reports',
                index,
              });
              submenuMatched = true;
            }
          });
        }
      });
    });

    if (!submenuMatched) {
      setOpenSubmenu(null);
    }
  }, [pathname, isActive, dynamicAdministrationItems]);

  useEffect(() => {
    if (openSubmenu !== null) {
      const key = `${openSubmenu.type}-${openSubmenu.index}`;
      if (subMenuRefs.current[key]) {
        setSubMenuHeight((prevHeights) => ({
          ...prevHeights,
          [key]: subMenuRefs.current[key]?.scrollHeight || 0,
        }));
      }
    }
  }, [openSubmenu]);

  const handleSubmenuToggle = (
    index: number,
    menuType: 'main' | 'others' | 'administration' | 'reports'
  ) => {
    setOpenSubmenu((prevOpenSubmenu) => {
      if (prevOpenSubmenu && prevOpenSubmenu.type === menuType && prevOpenSubmenu.index === index) {
        return null;
      }
      return { type: menuType, index };
    });
  };

  const { hasPermission } = usePermissions();

  const hasAnyPermission = (items: NavItem[]) => {
    return items.some((item) => {
      if (item.subItems) {
        return item.subItems.some(
          (subItem) => !subItem.permission || hasPermission(subItem.permission)
        );
      }
      return !item.permission || hasPermission(item.permission);
    });
  };

  const renderMenuItems = (
    items: NavItem[],
    menuType: 'main' | 'others' | 'administration' | 'reports'
  ) => (
    <ul className="flex flex-col gap-4">
      {items.map((nav, index) => {
        const hasSubItems = nav.subItems && nav.subItems.length > 0;
        const filteredSubItems = nav.subItems
          ? nav.subItems.filter(
              (subItem) => !subItem.permission || hasPermission(subItem.permission)
            )
          : [];

        let isVisible = false;
        if (hasSubItems) {
          if (filteredSubItems.length > 0) {
            isVisible = true;
          }
        } else {
          if (!nav.permission || hasPermission(nav.permission)) {
            isVisible = true;
          }
        }

        if (!isVisible) {
          return null;
        }

        return (
          <li key={nav.name}>
            {hasSubItems ? (
              <button
                onClick={() => handleSubmenuToggle(index, menuType)}
                className={`menu-item group ${
                  openSubmenu?.type === menuType && openSubmenu?.index === index
                    ? 'menu-item-active'
                    : 'menu-item-inactive'
                } cursor-pointer ${
                  !isExpanded && !isHovered ? 'lg:justify-center' : 'lg:justify-start'
                }`}
              >
                <span
                  className={`menu-item-icon-size ${
                    openSubmenu?.type === menuType && openSubmenu?.index === index
                      ? 'menu-item-icon-active'
                      : 'menu-item-icon-inactive'
                  }`}
                >
                  {nav.icon}
                </span>
                {(isExpanded || isHovered || isMobileOpen) && (
                  <span className="menu-item-text">{nav.name}</span>
                )}
                {(isExpanded || isHovered || isMobileOpen) && (
                  <ChevronDown
                    className={`ml-auto w-5 h-5 transition-transform duration-200 ${
                      openSubmenu?.type === menuType && openSubmenu?.index === index
                        ? 'rotate-180 text-brand-500'
                        : ''
                    }`}
                  />
                )}
              </button>
            ) : nav.path ? (
              <Link
                href={nav.path}
                onClick={() => {
                  if (isMobileOpen) toggleMobileSidebar();
                }}
                className={`menu-item group ${
                  isActive(nav.path) ? 'menu-item-active' : 'menu-item-inactive'
                }`}
              >
                <span
                  className={`menu-item-icon-size ${
                    isActive(nav.path) ? 'menu-item-icon-active' : 'menu-item-icon-inactive'
                  }`}
                >
                  {nav.icon}
                </span>
                {(isExpanded || isHovered || isMobileOpen) && (
                  <span className="menu-item-text">{nav.name}</span>
                )}
              </Link>
            ) : (
              // For items without path (only subItems), show as non-clickable
              <div className="menu-item group menu-item-inactive cursor-default">
                <span className="menu-item-icon-size menu-item-icon-inactive">{nav.icon}</span>
                {(isExpanded || isHovered || isMobileOpen) && (
                  <span className="menu-item-text">{nav.name}</span>
                )}
              </div>
            )}
            {hasSubItems && (isExpanded || isHovered || isMobileOpen) && (
              <div
                ref={(el) => {
                  subMenuRefs.current[`${menuType}-${index}`] = el;
                }}
                className="overflow-hidden transition-all duration-300"
                style={{
                  height:
                    openSubmenu?.type === menuType && openSubmenu?.index === index
                      ? `${subMenuHeight[`${menuType}-${index}`]}px`
                      : '0px',
                }}
              >
                <ul className="mt-2 space-y-1 ml-9">
                  {filteredSubItems.map((subItem) => (
                    <li key={subItem.name}>
                      <Link
                        href={subItem.path}
                        onClick={() => {
                          if (isMobileOpen) toggleMobileSidebar();
                          if (subItem.name === 'Add Sale' && isExpanded) {
                            toggleSidebar();
                          }
                        }}
                        className={`menu-dropdown-item ${
                          isActive(subItem.path)
                            ? 'menu-dropdown-item-active'
                            : 'menu-dropdown-item-inactive'
                        }`}
                      >
                        {subItem.name}
                        <span className="flex items-center gap-1 ml-auto">
                          {subItem.new && (
                            <span
                              className={`ml-auto ${
                                isActive(subItem.path)
                                  ? 'menu-dropdown-badge-active'
                                  : 'menu-dropdown-badge-inactive'
                              } menu-dropdown-badge`}
                            >
                              new
                            </span>
                          )}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-50 bg-gray-900/50 backdrop-blur-sm lg:hidden transition-opacity duration-300"
          onClick={() => toggleMobileSidebar()}
        />
      )}

      <aside
        className={`fixed mt-16 lg:mt-0 flex flex-col top-0 px-5 left-0 text-gray-900 h-[calc(100vh-64px)] lg:h-screen transition-all duration-300 ease-in-out z-[9999] border-r border-gray-200 dark:border-gray-800
        custom-sidebar-bg bg-white dark:bg-gray-900
        ${isExpanded || isMobileOpen ? 'w-[290px]' : isHovered ? 'w-[290px]' : 'w-[90px]'}
        ${isMobileOpen ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0 lg:opacity-100'}
        lg:translate-x-0`}
        onMouseEnter={() => !isExpanded && setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div
          className={`py-8 hidden lg:flex ${
            !isExpanded && !isHovered ? 'lg:justify-center' : 'justify-start'
          }`}
        >
          <Link href="/dashboard">
            {isExpanded || isHovered || isMobileOpen ? (
              <>
                <Image
                  className="dark:hidden"
                  src="/images/logo/logo.png"
                  alt="Logo"
                  width={250}
                  height={60}
                />
                <Image
                  className="hidden dark:block"
                  src="/images/logo/logo.png"
                  alt="Logo"
                  width={250}
                  height={60}
                />
              </>
            ) : (
              <Image src="/images/logo/icon.png" alt="Logo" width={32} height={32} />
            )}
          </Link>
        </div>
        <div className="flex flex-col flex-1 overflow-y-auto overscroll-y-contain duration-300 ease-linear no-scrollbar">
          <nav className="mb-6">
            <div className="flex flex-col gap-4">
              {hasAnyPermission(navItems) && (
                <div>
                  <h2
                    className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${
                      !isExpanded && !isHovered ? 'lg:justify-center' : 'justify-start'
                    }`}
                  >
                    {isExpanded || isHovered || isMobileOpen ? (
                      'Menu'
                    ) : (
                      <MoreHorizontal className="size-6" />
                    )}
                  </h2>
                  {renderMenuItems(navItems, 'main')}
                </div>
              )}
              {hasAnyPermission(othersItems) && (
                <div className="">
                  <h2
                    className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${
                      !isExpanded && !isHovered ? 'lg:justify-center' : 'justify-start'
                    }`}
                  >
                    {isExpanded || isHovered || isMobileOpen ? 'Others' : <MoreHorizontal />}
                  </h2>
                  {renderMenuItems(othersItems, 'others')}
                </div>
              )}
              {hasAnyPermission(reportItems) && (
                <div className="">
                  <h2
                    className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${
                      !isExpanded && !isHovered ? 'lg:justify-center' : 'justify-start'
                    }`}
                  >
                    {isExpanded || isHovered || isMobileOpen ? 'Reports' : <MoreHorizontal />}
                  </h2>
                  {renderMenuItems(reportItems, 'reports')}
                </div>
              )}
              {hasAnyPermission(dynamicAdministrationItems) && (
                <div className="">
                  <h2
                    className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${
                      !isExpanded && !isHovered ? 'lg:justify-center' : 'justify-start'
                    }`}
                  >
                    {isExpanded || isHovered || isMobileOpen ? (
                      'Administration'
                    ) : (
                      <MoreHorizontal />
                    )}
                  </h2>
                  {renderMenuItems(dynamicAdministrationItems, 'administration')}
                </div>
              )}
            </div>
          </nav>
        </div>
      </aside>
    </>
  );
};

export default AppSidebar;
