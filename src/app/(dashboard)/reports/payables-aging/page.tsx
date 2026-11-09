'use client';

import { useState } from 'react';
import ReportShell from '../_components/ReportShell';
import { AsAtFilter } from '../_components/ReportFilters';
import { useReport, today } from '../_components/useReport';
import { TH, TH_NUM, TD, TD_NUM, TR, TFOOT } from '../_components/reportTable';
import { usePermissions } from '@/hooks/usePermissions';
import { useSettings } from '@/hooks/useSettings';
import ReportService from '@/services/ReportService';

export default function PayablesAgingPage() {
  const { hasPermission } = usePermissions();
  const canView = hasPermission('view-purchase-report');
  const { formatCurrency } = useSettings();

  const [asAt, setAsAt] = useState(today());
  const [applied, setApplied] = useState(asAt);

  const { data, loading, error } = useReport(
    () => ReportService.payablesAging({ as_at: applied }),
    [applied],
    canView
  );

  if (!canView) {
    return <div className="p-6 text-center">Access Denied</div>;
  }

  // Bucket order comes from the API so the columns always match how the server bucketed.
  const buckets = Object.entries(data?.buckets ?? {});

  return (
    <ReportShell
      title="Payables Aging"
      description="What you owe vendors, by how overdue it is"
      loading={loading}
      error={error}
      isEmpty={!data?.rows.length}
      emptyMessage="Nothing outstanding as at this date."
      filters={
        <AsAtFilter
          asAt={asAt}
          onChange={setAsAt}
          onRefresh={() => setApplied(asAt)}
          disabled={loading}
        />
      }
    >
      <table className="w-full">
        <thead>
          <tr className={TR}>
            <th className={TH}>Vendor</th>
            {buckets.map(([key, label]) => (
              <th key={key} className={TH_NUM}>
                {label}
              </th>
            ))}
            <th className={TH_NUM}>Total</th>
          </tr>
        </thead>
        <tbody>
          {data?.rows.map((row) => (
            <tr key={row.id} className={TR}>
              <td className={TD}>{row.name}</td>
              {buckets.map(([key]) => (
                <td key={key} className={TD_NUM}>
                  {formatCurrency(Number(row[key] ?? 0))}
                </td>
              ))}
              <td className={`${TD_NUM} font-semibold`}>{formatCurrency(Number(row.total))}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className={TFOOT}>
            <td className={TD}>Total</td>
            {buckets.map(([key]) => (
              <td key={key} className={TD_NUM}>
                {formatCurrency(Number(data?.totals[key] ?? 0))}
              </td>
            ))}
            <td className={TD_NUM}>{formatCurrency(Number(data?.totals.total ?? 0))}</td>
          </tr>
        </tfoot>
      </table>
    </ReportShell>
  );
}
