'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
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
import { useSidebar } from '../hooks/useSidebar';
import { usePermissions } from '../hooks/usePermissions';

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
      { name: 'Sales', path: '/sales', permission: 'view-sale' },
    ],
  },
  {
    name: 'Purchases',
    icon: <ShoppingCart size={20} />,
    subItems: [
      { name: 'Vendors', path: '/vendors', permission: 'view-vendor' },
      { name: 'Purchases', path: '/purchases', permission: 'view-purchase' },
    ],
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
    type: 'main' | 'others' | 'administration';
    index: number;
  } | null>(null);
  const [subMenuHeight, setSubMenuHeight] = useState<Record<string, number>>({});
  const subMenuRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const isActive = useCallback(
    (path: string) => {
      if (!pathname) return false;
      if (path === '/dashboard') {
        return pathname === path;
      }
      return pathname.startsWith(path);
    },
    [pathname]
  );

  useEffect(() => {
    let submenuMatched = false;
    ['main', 'others', 'administration'].forEach((menuType) => {
      const items =
        menuType === 'main' ? navItems : menuType === 'others' ? othersItems : administrationItems;
      items.forEach((nav, index) => {
        if (nav.subItems) {
          nav.subItems.forEach((subItem) => {
            if (isActive(subItem.path)) {
              setOpenSubmenu({
                type: menuType as 'main' | 'others' | 'administration',
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
  }, [pathname, isActive]);

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

  const handleSubmenuToggle = (index: number, menuType: 'main' | 'others' | 'administration') => {
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

  const renderMenuItems = (items: NavItem[], menuType: 'main' | 'others' | 'administration') => (
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
        className={`fixed mt-16 lg:mt-0 flex flex-col top-0 px-5 left-0 text-gray-900 h-[calc(100vh-64px)] lg:h-screen transition-all duration-300 ease-in-out z-999999 border-r border-gray-200 dark:border-gray-800
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
        <div className="flex flex-col flex-1 overflow-y-auto duration-300 ease-linear no-scrollbar">
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
              {hasAnyPermission(administrationItems) && (
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
                  {renderMenuItems(administrationItems, 'administration')}
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
