'use client';

import { useState } from 'react';
import ReportShell from '../_components/ReportShell';
import { AsAtFilter } from '../_components/ReportFilters';
import { useReport, today } from '../_components/useReport';
import { TH, TH_NUM, TD, TD_NUM, TR, TFOOT } from '../_components/reportTable';
import { usePermissions } from '@/hooks/usePermissions';
import { useSettings } from '@/hooks/useSettings';
import ReportService from '@/services/ReportService';

export default function VendorBalancesPage() {
  const { hasPermission } = usePermissions();
  const canView = hasPermission('view-purchase-report');
  const { formatCurrency } = useSettings();

  const [asAt, setAsAt] = useState(today());
  const [applied, setApplied] = useState(asAt);

  const { data, loading, error } = useReport(
    () => ReportService.vendorBalances({ as_at: applied }),
    [applied],
    canView
  );

  if (!canView) {
    return <div className="p-6 text-center">Access Denied</div>;
  }

  return (
    <ReportShell
      title="Vendor Balances"
      description="Overall position per vendor"
      loading={loading}
      error={error}
      isEmpty={!data?.rows.length}
      emptyMessage="No balances to show."
      filters={
        <AsAtFilter
          asAt={asAt}
          onChange={setAsAt}
          onRefresh={() => setApplied(asAt)}
          disabled={loading}
        />
      }
      banner={
        data && !loading ? (
          <p className="mb-4 text-xs text-gray-500 dark:text-gray-400">
            Net balance = outstanding invoices less any payment money not yet allocated to a
            document. For how overdue the outstanding amount is, see Payables Aging.
          </p>
        ) : null
      }
    >
      <table className="w-full">
        <thead>
          <tr className={TR}>
            <th className={TH}>Vendor</th>
            <th className={TH_NUM}>Invoices</th>
            <th className={TH_NUM}>Invoiced</th>
            <th className={TH_NUM}>Paid</th>
            <th className={TH_NUM}>Outstanding</th>
            <th className={TH_NUM}>On account</th>
            <th className={TH_NUM}>Net Balance</th>
          </tr>
        </thead>
        <tbody>
          {data?.rows.map((row) => (
            <tr key={row.id} className={TR}>
              <td className={TD}>{row.name}</td>
              <td className={TD_NUM}>{row.invoice_count}</td>
              <td className={TD_NUM}>{formatCurrency(Number(row.invoiced))}</td>
              <td className={TD_NUM}>{formatCurrency(Number(row.paid))}</td>
              <td className={TD_NUM}>{formatCurrency(Number(row.outstanding))}</td>
              <td className={TD_NUM}>
                {Number(row.unallocated) > 0 ? formatCurrency(Number(row.unallocated)) : '—'}
              </td>
              <td className={`${TD_NUM} font-semibold`}>
                {formatCurrency(Number(row.net_balance))}
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className={TFOOT}>
            <td className={TD} colSpan={2}>
              {data?.count ?? 0} vendor(s)
            </td>
            <td className={TD_NUM}>{formatCurrency(Number(data?.totals.invoiced ?? 0))}</td>
            <td className={TD_NUM}>{formatCurrency(Number(data?.totals.paid ?? 0))}</td>
            <td className={TD_NUM}>{formatCurrency(Number(data?.totals.outstanding ?? 0))}</td>
            <td className={TD_NUM}>{formatCurrency(Number(data?.totals.unallocated ?? 0))}</td>
            <td className={TD_NUM}>{formatCurrency(Number(data?.totals.net_balance ?? 0))}</td>
          </tr>
        </tfoot>
      </table>
    </ReportShell>
  );
}
