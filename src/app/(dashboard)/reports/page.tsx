'use client';

import Link from 'next/link';
import {
  BookOpen,
  Scale,
  TrendingUp,
  Receipt,
  Users,
  Truck,
  ShoppingCart,
  Package,
  CalendarClock,
  AlertTriangle,
  FileText,
  Wallet,
  PackageCheck,
} from 'lucide-react';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import PageMeta from '@/components/common/PageMeta';
import { usePermissions } from '@/hooks/usePermissions';

interface ReportLink {
  href: string;
  title: string;
  description: string;
  icon: typeof BookOpen;
}

interface ReportGroup {
  title: string;
  permission: string;
  reports: ReportLink[];
}

const GROUPS: ReportGroup[] = [
  {
    title: 'Financial',
    permission: 'view-financial-report',
    reports: [
      {
        href: '/reports/trial-balance',
        title: 'Trial Balance',
        description: 'Every account’s debits, credits and closing balance — and proof they agree.',
        icon: Scale,
      },
      {
        href: '/reports/profit-and-loss',
        title: 'Profit & Loss',
        description: 'Income less cost of sales and expenses for a period.',
        icon: TrendingUp,
      },
      {
        href: '/reports/balance-sheet',
        title: 'Balance Sheet',
        description: 'Assets, liabilities and equity as at a date.',
        icon: BookOpen,
      },
      {
        href: '/reports/tax-summary',
        title: 'Tax Summary',
        description: 'Output tax charged against input tax paid, per rate.',
        icon: Receipt,
      },
    ],
  },
  {
    title: 'Sales',
    permission: 'view-sales-report',
    reports: [
      {
        href: '/reports/sales-register',
        title: 'Sales Register',
        description: 'Every sales invoice in a period, with tax and payment position.',
        icon: FileText,
      },
      {
        href: '/reports/receivables-aging',
        title: 'Receivables Aging',
        description: 'What customers owe, bucketed by how overdue it is.',
        icon: Users,
      },
      {
        href: '/reports/customer-balances',
        title: 'Customer Balances',
        description: 'Overall position per customer, including money on account.',
        icon: Wallet,
      },
    ],
  },
  {
    title: 'Purchase',
    permission: 'view-purchase-report',
    reports: [
      {
        href: '/reports/purchase-register',
        title: 'Purchase Register',
        description: 'Every purchase invoice in a period.',
        icon: ShoppingCart,
      },
      {
        href: '/reports/payables-aging',
        title: 'Payables Aging',
        description: 'What you owe vendors, bucketed by how overdue it is.',
        icon: Truck,
      },
      {
        href: '/reports/vendor-balances',
        title: 'Vendor Balances',
        description: 'Overall position per vendor, including money on account.',
        icon: Wallet,
      },
      {
        href: '/reports/outstanding-grns',
        title: 'Outstanding GRNs',
        description: 'Goods received but not yet invoiced — the accrued-liability gap.',
        icon: PackageCheck,
      },
    ],
  },
  {
    title: 'Inventory',
    permission: 'view-inventory-report',
    reports: [
      {
        href: '/reports/stock-valuation',
        title: 'Stock Valuation',
        description: 'Quantity on hand and its value at cost, by item and batch.',
        icon: Package,
      },
      {
        href: '/reports/expiry',
        title: 'Expiry Report',
        description: 'Batches already expired and those expiring soon, with stock still on hand.',
        icon: CalendarClock,
      },
      {
        href: '/reports/low-stock',
        title: 'Low Stock',
        description: 'Items at or below the reorder threshold.',
        icon: AlertTriangle,
      },
    ],
  },
];

export default function ReportsPage() {
  const { hasPermission } = usePermissions();
  const visible = GROUPS.filter((group) => hasPermission(group.permission));

  return (
    <>
      <PageMeta title="Reports" description="Financial, sales, purchase and inventory reports" />
      <PageBreadcrumb pageTitle="Reports" />

      {visible.length === 0 ? (
        <div className="p-6 text-center text-gray-500 dark:text-gray-400">
          You do not have permission to view any reports.
        </div>
      ) : (
        <div className="space-y-8">
          {visible.map((group) => (
            <div key={group.title}>
              <h3 className="mb-4 text-lg font-bold dark:text-white">{group.title}</h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {group.reports.map((report) => {
                  const Icon = report.icon;

                  return (
                    <Link
                      key={report.href}
                      href={report.href}
                      className="p-5 border border-gray-200 rounded-2xl bg-white dark:bg-gray-900 dark:border-gray-800 shadow-sm transition-all hover:border-brand-300 dark:hover:border-brand-500/40"
                    >
                      <div className="flex items-start gap-3">
                        <span className="p-2 rounded-lg bg-brand-50 text-brand-500 dark:bg-brand-500/15 dark:text-brand-400">
                          <Icon className="w-5 h-5" />
                        </span>
                        <span className="min-w-0">
                          <span className="block font-semibold text-gray-800 dark:text-white/90">
                            {report.title}
                          </span>
                          <span className="block mt-1 text-sm text-gray-500 dark:text-gray-400">
                            {report.description}
                          </span>
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
