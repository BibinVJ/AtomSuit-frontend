import { ArrowDown, ArrowUp, Package, Users, DollarSign, FileText } from 'lucide-react';
import Badge from '@/components/ui/badge/Badge';
import { ReactNode } from 'react';

interface MetricCardProps {
  icon: ReactNode;
  title: string;
  value: string | number;
  percentage?: number;
  trend?: 'up' | 'down';
}

const MetricCard = ({ icon, title, value, percentage, trend }: MetricCardProps) => (
  <div className="rounded-2xl border border-gray-200 custom-card-bg p-5 dark:border-gray-800 md:p-6">
    <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
      {icon}
    </div>
    <div className="flex items-end justify-between mt-5">
      <div>
        <span className="text-sm text-gray-500 dark:text-gray-400">{title}</span>
        <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">{value}</h4>
      </div>
      {trend && percentage && (
        <Badge color={trend === 'up' ? 'success' : 'error'}>
          {trend === 'up' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
          {percentage}%
        </Badge>
      )}
    </div>
  </div>
);

import { useSettings } from '@/hooks/useSettings';

export default function EcommerceMetrics({
  data,
}: {
  data: {
    total_sales_amount: number;
    total_purchase_amount: number;
    total_customers: number;
    total_items: number;
  };
}) {
  const { formatCurrency } = useSettings();
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4 md:gap-6">
      <MetricCard
        icon={<DollarSign className="text-gray-800 size-6 dark:text-white/90" />}
        title="Total Sales"
        value={formatCurrency(data?.total_sales_amount ?? 0)}
      />
      <MetricCard
        icon={<Package className="text-gray-800 size-6 dark:text-white/90" />}
        title="Total Purchase"
        value={formatCurrency(data?.total_purchase_amount ?? 0)}
      />
      <MetricCard
        icon={<Users className="text-gray-800 size-6 dark:text-white/90" />}
        title="Total Customers"
        value={data?.total_customers ?? 0}
      />
      <MetricCard
        icon={<FileText className="text-gray-800 size-6 dark:text-white/90" />}
        title="Total Items"
        value={data?.total_items ?? 0}
      />
    </div>
  );
}
