'use client';

import { useState } from 'react';
import { RefreshCw } from 'lucide-react';
import ReportShell from '../_components/ReportShell';
import { useReport } from '../_components/useReport';
import { TH, TH_NUM, TD, TD_NUM, TR } from '../_components/reportTable';
import Badge from '@/components/ui/badge/Badge';
import Button from '@/components/ui/button/Button';
import { usePermissions } from '@/hooks/usePermissions';
import { useSettings } from '@/hooks/useSettings';
import ReportService from '@/services/ReportService';

export default function LowStockPage() {
  const { hasPermission } = usePermissions();
  const canView = hasPermission('view-inventory-report');
  const { formatNumber } = useSettings();
  const [nonce, setNonce] = useState(0);

  const { data, loading, error } = useReport(() => ReportService.lowStock(), [nonce], canView);

  if (!canView) {
    return <div className="p-6 text-center">Access Denied</div>;
  }

  return (
    <ReportShell
      title="Low Stock"
      description="Items at or below the reorder threshold"
      loading={loading}
      error={error}
      isEmpty={!data?.rows.length}
      emptyMessage="Nothing is below the threshold."
      filters={
        <Button
          variant="outline"
          onClick={() => setNonce((n) => n + 1)}
          disabled={loading}
          className="gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </Button>
      }
      banner={
        data && !loading ? (
          <p className="mb-4 text-xs text-gray-500 dark:text-gray-400">
            Threshold: {data.threshold} (set in Settings → Inventory).
            {data.excludes_expired_stock &&
              ' Expired stock is excluded, because it cannot be sold.'}
          </p>
        ) : null
      }
    >
      <table className="w-full">
        <thead>
          <tr className={TR}>
            <th className={TH}>SKU</th>
            <th className={TH}>Item</th>
            <th className={TH}>Category</th>
            <th className={TH_NUM}>Available</th>
            <th className={TH_NUM}>Shortfall</th>
            <th className={TH}>Status</th>
          </tr>
        </thead>
        <tbody>
          {data?.rows.map((row) => (
            <tr key={row.item_id} className={TR}>
              <td className={TD}>{row.sku}</td>
              <td className={TD}>{row.item_name}</td>
              <td className={TD}>{row.category ?? '—'}</td>
              <td className={TD_NUM}>
                {formatNumber(Number(row.quantity_available))} {row.unit ?? ''}
              </td>
              <td className={TD_NUM}>{formatNumber(Number(row.shortfall))}</td>
              <td className={TD}>
                <Badge size="sm" color={row.is_out_of_stock ? 'error' : 'warning'}>
                  {row.is_out_of_stock ? 'Out of stock' : 'Low'}
                </Badge>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </ReportShell>
  );
}
