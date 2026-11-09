'use client';

import { useState } from 'react';
import ReportShell from '../_components/ReportShell';
import { useReport } from '../_components/useReport';
import { TH, TH_NUM, TD, TD_NUM, TR, TFOOT } from '../_components/reportTable';
import Button from '@/components/ui/button/Button';
import { RefreshCw } from 'lucide-react';
import { usePermissions } from '@/hooks/usePermissions';
import { useSettings } from '@/hooks/useSettings';
import ReportService from '@/services/ReportService';

export default function StockValuationPage() {
  const { hasPermission } = usePermissions();
  const canView = hasPermission('view-inventory-report');
  const { formatCurrency, formatNumber } = useSettings();
  const [nonce, setNonce] = useState(0);

  const { data, loading, error } = useReport(
    () => ReportService.stockValuation(),
    [nonce],
    canView
  );

  if (!canView) {
    return <div className="p-6 text-center">Access Denied</div>;
  }

  return (
    <ReportShell
      title="Stock Valuation"
      description="Quantity on hand and its value at cost"
      loading={loading}
      error={error}
      isEmpty={!data?.rows.length}
      emptyMessage="No stock on hand."
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
            Valued at batch cost, never the sale price. Quantity that cannot be traced to a batch is
            shown separately and carries no value.
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
            <th className={TH_NUM}>Quantity</th>
            <th className={TH_NUM}>Unbatched</th>
            <th className={TH_NUM}>Value</th>
          </tr>
        </thead>
        <tbody>
          {data?.rows.map((row) => (
            <tr key={row.item_id} className={TR}>
              <td className={TD}>{row.sku}</td>
              <td className={TD}>{row.item_name}</td>
              <td className={TD}>{row.category ?? '—'}</td>
              <td className={TD_NUM}>
                {formatNumber(Number(row.quantity))} {row.unit ?? ''}
              </td>
              <td className={TD_NUM}>
                {Number(row.unbatched_quantity) > 0
                  ? formatNumber(Number(row.unbatched_quantity))
                  : '—'}
              </td>
              <td className={TD_NUM}>{formatCurrency(Number(row.value))}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className={TFOOT}>
            <td className={TD} colSpan={3}>
              Total
            </td>
            <td className={TD_NUM}>{formatNumber(Number(data?.totals.quantity ?? 0))}</td>
            <td className={TD_NUM}>—</td>
            <td className={TD_NUM}>{formatCurrency(Number(data?.totals.value ?? 0))}</td>
          </tr>
        </tfoot>
      </table>
    </ReportShell>
  );
}
