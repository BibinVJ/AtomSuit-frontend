'use client';

import { useState } from 'react';
import ReportShell from '../_components/ReportShell';
import { PeriodFilter } from '../_components/ReportFilters';
import { useReport, currentMonthRange } from '../_components/useReport';
import { TH, TH_NUM, TD, TD_NUM, TR, TFOOT } from '../_components/reportTable';
import { usePermissions } from '@/hooks/usePermissions';
import { useSettings } from '@/hooks/useSettings';
import ReportService from '@/services/ReportService';

export default function SalesRegisterPage() {
  const { hasPermission } = usePermissions();
  const canView = hasPermission('view-sales-report');
  const { formatCurrency, formatDate } = useSettings();
  const initial = currentMonthRange();

  const [from, setFrom] = useState(initial.from);
  const [to, setTo] = useState(initial.to);
  const [applied, setApplied] = useState(initial);

  const { data, loading, error } = useReport(
    () => ReportService.salesRegister({ from: applied.from, to: applied.to }),
    [applied],
    canView
  );

  if (!canView) {
    return <div className="p-6 text-center">Access Denied</div>;
  }

  return (
    <ReportShell
      title="Sales Register"
      description="Every sales invoice in the period"
      loading={loading}
      error={error}
      isEmpty={!data?.rows.length}
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
    >
      <table className="w-full">
        <thead>
          <tr className={TR}>
            <th className={TH}>Invoice #</th>
            <th className={TH}>Date</th>
            <th className={TH}>Customer</th>
            <th className={TH}>Status</th>
            <th className={TH_NUM}>Sub Total</th>
            <th className={TH_NUM}>Tax</th>
            <th className={TH_NUM}>Total</th>
            <th className={TH_NUM}>Outstanding</th>
          </tr>
        </thead>
        <tbody>
          {data?.rows.map((row) => (
            <tr key={row.id} className={TR}>
              <td className={TD}>{row.invoice_number}</td>
              <td className={TD}>{formatDate(row.invoice_date ?? '')}</td>
              <td className={TD}>{row.customer ?? '—'}</td>
              <td className={TD}>{row.status}</td>
              <td className={TD_NUM}>{formatCurrency(Number(row.sub_total))}</td>
              <td className={TD_NUM}>{formatCurrency(Number(row.tax_total))}</td>
              <td className={TD_NUM}>{formatCurrency(Number(row.total_amount))}</td>
              <td className={TD_NUM}>{formatCurrency(Number(row.outstanding))}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className={TFOOT}>
            <td className={TD} colSpan={4}>
              {data?.count ?? 0} invoice(s)
            </td>
            <td className={TD_NUM}>{formatCurrency(Number(data?.totals.sub_total ?? 0))}</td>
            <td className={TD_NUM}>{formatCurrency(Number(data?.totals.tax_total ?? 0))}</td>
            <td className={TD_NUM}>{formatCurrency(Number(data?.totals.total_amount ?? 0))}</td>
            <td className={TD_NUM}>{formatCurrency(Number(data?.totals.outstanding ?? 0))}</td>
          </tr>
        </tfoot>
      </table>
    </ReportShell>
  );
}
