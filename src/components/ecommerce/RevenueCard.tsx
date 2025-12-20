'use client';

import { DollarSign, TrendingUp } from 'lucide-react';
import { useSettings } from '../../hooks/useSettings';

interface RevenueCardProps {
  data: {
    total: string;
    this_month: string;
    currency: string;
  };
}

export default function RevenueCard({ data }: RevenueCardProps) {
  const { formatCurrency } = useSettings();
  return (
    <div className="p-4 bg-white rounded-lg shadow dark:bg-gray-800">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Revenue Overview</h3>
        <DollarSign className="w-6 h-6 text-green-600" />
      </div>

      <div className="space-y-4">
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Total Revenue</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {formatCurrency(data.total)}
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <TrendingUp className="w-4 h-4 text-green-600" />
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">This Month</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">
              {formatCurrency(data.this_month)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
