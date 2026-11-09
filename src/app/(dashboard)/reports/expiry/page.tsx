'use client';

import { Fragment, useState } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import ReportShell from '../_components/ReportShell';
import { useReport } from '../_components/useReport';
import { TH, TH_NUM, TD, TD_NUM, TR } from '../_components/reportTable';
import Badge from '@/components/ui/badge/Badge';
import Button from '@/components/ui/button/Button';
import Input from '@/components/form/input/InputField';
import Label from '@/components/form/Label';
import { ExpiryRow } from '@/types';
import { usePermissions } from '@/hooks/usePermissions';
import { useSettings } from '@/hooks/useSettings';
import ReportService from '@/services/ReportService';

export default function ExpiryReportPage() {
  const { hasPermission } = usePermissions();
  const canView = hasPermission('view-inventory-report');
  const { formatCurrency, formatNumber, formatDate } = useSettings();

  const [withinDays, setWithinDays] = useState(90);
  const [applied, setApplied] = useState(90);

  const { data, loading, error } = useReport(
    () => ReportService.expiry({ within_days: applied }),
    [applied],
    canView
  );

  if (!canView) {
    return <div className="p-6 text-center">Access Denied</div>;
  }

  const section = (title: string, rows: ExpiryRow[], expired: boolean) => (
    <Fragment key={title}>
      <tr className="bg-gray-50 dark:bg-gray-800/50">
        <td className={`${TD} font-bold uppercase tracking-wider text-theme-xs`} colSpan={6}>
          {title} ({rows.length})
        </td>
      </tr>
      {rows.length === 0 ? (
        <tr className={TR}>
          <td className={TD} colSpan={6}>
            None.
          </td>
        </tr>
      ) : (
        rows.map((row) => (
          <tr key={row.batch_id} className={TR}>
            <td className={TD}>{row.item_name ?? '—'}</td>
            <td className={TD}>{row.batch_number}</td>
            <td className={TD}>{row.expiry_date ? formatDate(row.expiry_date) : '—'}</td>
            <td className={TD}>
              <Badge size="sm" color={expired ? 'error' : 'warning'}>
                {expired
                  ? `Expired ${Math.abs(row.days_to_expiry)}d ago`
                  : `In ${row.days_to_expiry}d`}
              </Badge>
            </td>
            <td className={TD_NUM}>
              {formatNumber(Number(row.quantity))} {row.unit ?? ''}
            </td>
            <td className={TD_NUM}>{formatCurrency(Number(row.value))}</td>
          </tr>
        ))
      )}
    </Fragment>
  );

  return (
    <ReportShell
      title="Expiry Report"
      description="Batches expired or expiring soon, with stock still on hand"
      loading={loading}
      error={error}
      isEmpty={!data}
      filters={
        <>
          <div className="w-40">
            <Label>Within (days)</Label>
            <Input
              type="number"
              value={withinDays}
              onChange={(e) => setWithinDays(Number(e.target.value))}
            />
          </div>
          <Button
            variant="outline"
            onClick={() => setApplied(withinDays)}
            disabled={loading}
            className="gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Run
          </Button>
        </>
      }
      banner={
        data && !loading && data.expired_stock_sellable ? (
          <div className="mb-6 flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300">
            <AlertTriangle className="h-5 w-5 flex-shrink-0" />
            <span>
              <strong>&ldquo;Allow selling expired items&rdquo; is switched on</strong>, so the
              expired stock below can still be dispatched to customers.
            </span>
          </div>
        ) : null
      }
    >
      {data && (
        <>
          <div className="grid grid-cols-1 gap-4 mb-6 sm:grid-cols-2">
            <div className="p-4 border border-gray-200 rounded-xl dark:border-gray-800">
              <p className="text-theme-xs font-bold uppercase tracking-wider text-gray-500">
                Expired value
              </p>
              <p className="mt-1 text-2xl font-bold text-red-600 dark:text-red-400">
                {formatCurrency(Number(data.totals.expired_value))}
              </p>
              <p className="text-sm text-gray-500">{data.totals.expired_batches} batch(es)</p>
            </div>
            <div className="p-4 border border-gray-200 rounded-xl dark:border-gray-800">
              <p className="text-theme-xs font-bold uppercase tracking-wider text-gray-500">
                Expiring within {data.within_days} days
              </p>
              <p className="mt-1 text-2xl font-bold text-amber-600 dark:text-amber-400">
                {formatCurrency(Number(data.totals.expiring_value))}
              </p>
              <p className="text-sm text-gray-500">{data.totals.expiring_batches} batch(es)</p>
            </div>
          </div>

          <table className="w-full">
            <thead>
              <tr className={TR}>
                <th className={TH}>Item</th>
                <th className={TH}>Batch</th>
                <th className={TH}>Expiry</th>
                <th className={TH}>Status</th>
                <th className={TH_NUM}>Quantity</th>
                <th className={TH_NUM}>Value</th>
              </tr>
            </thead>
            <tbody>
              {section('Expired', data.expired, true)}
              {section('Expiring soon', data.expiring_soon, false)}
            </tbody>
          </table>
        </>
      )}
    </ReportShell>
  );
}
