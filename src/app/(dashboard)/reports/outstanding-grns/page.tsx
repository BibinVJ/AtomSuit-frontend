'use client';

import { Fragment, useState } from 'react';
import ReportShell from '../_components/ReportShell';
import { PeriodFilter } from '../_components/ReportFilters';
import { useReport, currentMonthRange } from '../_components/useReport';
import { TH, TH_NUM, TD, TD_NUM, TR, TFOOT } from '../_components/reportTable';
import { usePermissions } from '@/hooks/usePermissions';
import { useSettings } from '@/hooks/useSettings';
import ReportService from '@/services/ReportService';

export default function OutstandingGrnsPage() {
  const { hasPermission } = usePermissions();
  const canView = hasPermission('view-purchase-report');
  const { formatCurrency, formatNumber, formatDate } = useSettings();
  const initial = currentMonthRange();

  const [from, setFrom] = useState(initial.from);
  const [to, setTo] = useState(initial.to);
  const [applied, setApplied] = useState(initial);

  const { data, loading, error } = useReport(
    () => ReportService.outstandingGrns({ from: applied.from, to: applied.to }),
    [applied],
    canView
  );

  if (!canView) {
    return <div className="p-6 text-center">Access Denied</div>;
  }

  return (
    <ReportShell
      title="Outstanding GRNs"
      description="Goods received but not yet invoiced by the vendor"
      loading={loading}
      error={error}
      isEmpty={!data?.rows.length}
      emptyMessage="Every GRN in this period has been fully invoiced."
      filters={
        <PeriodFilter
          from={from}
          to={to}
          onFromChange={setFrom}
          onToChange={setTo}
          onRefresh={() => setApplied({ from, to })}
          disabled={loading}
        />
      }
      banner={
        data && !loading && data.rows.length > 0 ? (
          <p className="mb-4 text-xs text-gray-500 dark:text-gray-400">
            This is the accrued-liability gap: the stock is on the shelf and the vendor will bill
            for it, but no purchase invoice exists yet — so it shows in inventory without showing in
            payables.
          </p>
        ) : null
      }
    >
      <table className="w-full">
        <thead>
          <tr className={TR}>
            <th className={TH}>GRN #</th>
            <th className={TH}>Received</th>
            <th className={TH}>Vendor</th>
            <th className={TH_NUM}>Received Qty</th>
            <th className={TH_NUM}>Invoiced Qty</th>
            <th className={TH_NUM}>Pending Qty</th>
            <th className={TH_NUM}>Pending Value</th>
          </tr>
        </thead>
        <tbody>
          {data?.rows.map((row) => (
            <Fragment key={row.id}>
              <tr className="bg-gray-50 dark:bg-gray-800/50">
                <td className={`${TD} font-semibold`}>{row.grn_number}</td>
                <td className={TD}>{row.received_date ? formatDate(row.received_date) : '—'}</td>
                <td className={TD}>{row.vendor ?? '—'}</td>
                <td className={TD_NUM} colSpan={3} />
                <td className={`${TD_NUM} font-semibold`}>
                  {formatCurrency(Number(row.pending_value))}
                </td>
              </tr>
              {row.lines.map((line) => (
                <tr key={`${row.id}-${line.item_id}`} className={TR}>
                  <td className={`${TD} pl-8`} colSpan={3}>
                    {line.item_name ?? `Item #${line.item_id}`}
                  </td>
                  <td className={TD_NUM}>{formatNumber(Number(line.received_quantity))}</td>
                  <td className={TD_NUM}>{formatNumber(Number(line.invoiced_quantity))}</td>
                  <td className={TD_NUM}>{formatNumber(Number(line.pending_quantity))}</td>
                  <td className={TD_NUM}>{formatCurrency(Number(line.pending_value))}</td>
                </tr>
              ))}
            </Fragment>
          ))}
        </tbody>
        <tfoot>
          <tr className={TFOOT}>
            <td className={TD} colSpan={5}>
              {data?.totals.grn_count ?? 0} outstanding GRN(s)
            </td>
            <td className={TD_NUM}>{formatNumber(Number(data?.totals.pending_quantity ?? 0))}</td>
            <td className={TD_NUM}>{formatCurrency(Number(data?.totals.pending_value ?? 0))}</td>
          </tr>
        </tfoot>
      </table>
    </ReportShell>
  );
}
