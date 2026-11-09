'use client';

import { Fragment, useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import ReportShell from '../_components/ReportShell';
import { PeriodFilter } from '../_components/ReportFilters';
import { useReport, currentMonthRange } from '../_components/useReport';
import { TH, TH_NUM, TD, TD_NUM, TR, TFOOT } from '../_components/reportTable';
import { TaxSide } from '@/types';
import { usePermissions } from '@/hooks/usePermissions';
import { useSettings } from '@/hooks/useSettings';
import ReportService from '@/services/ReportService';

export default function TaxSummaryPage() {
  const { hasPermission } = usePermissions();
  const canView = hasPermission('view-financial-report');
  const { formatCurrency, formatNumber } = useSettings();
  const initial = currentMonthRange();

  const [from, setFrom] = useState(initial.from);
  const [to, setTo] = useState(initial.to);
  const [applied, setApplied] = useState(initial);

  const { data, loading, error } = useReport(
    () => ReportService.taxSummary({ from: applied.from, to: applied.to }),
    [applied],
    canView
  );

  if (!canView) {
    return <div className="p-6 text-center">Access Denied</div>;
  }

  const side = (title: string, sec: TaxSide) => (
    <Fragment key={title}>
      <tr className="bg-gray-50 dark:bg-gray-800/50">
        <td className={`${TD} font-bold uppercase tracking-wider text-theme-xs`} colSpan={4}>
          {title}
        </td>
      </tr>
      {sec.rates.length === 0 ? (
        <tr className={TR}>
          <td className={TD} colSpan={4}>
            No taxed documents in this period.
          </td>
        </tr>
      ) : (
        sec.rates.map((rate) => (
          <tr key={`${title}-${rate.id ?? rate.name}`} className={TR}>
            <td className={`${TD} pl-8`}>{rate.name}</td>
            <td className={TD}>
              {rate.type === 'fixed' ? 'Fixed' : `${formatNumber(Number(rate.rate))}%`}
            </td>
            <td className={TD_NUM}>{formatCurrency(Number(rate.taxable_amount))}</td>
            <td className={TD_NUM}>{formatCurrency(Number(rate.tax_amount))}</td>
          </tr>
        ))
      )}
      <tr className={TR}>
        <td className={`${TD} font-bold`} colSpan={3}>
          Total {title}
        </td>
        <td className={`${TD_NUM} font-bold`}>{formatCurrency(Number(sec.total_tax))}</td>
      </tr>
    </Fragment>
  );

  const unreconciled = data && (!data.output_tax.reconciles || !data.input_tax.reconciles);

  return (
    <ReportShell
      title="Tax Summary"
      description="Output tax charged against input tax paid, per rate"
      loading={loading}
      error={error}
      isEmpty={!data}
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
        unreconciled && !loading ? (
          <div className="mb-6 flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300">
            <AlertTriangle className="h-5 w-5 flex-shrink-0" />
            <span>
              <strong>
                The per-rate breakdown does not match the tax stored on the documents.
              </strong>{' '}
              Do not file from this report until the difference is investigated.
            </span>
          </div>
        ) : null
      }
    >
      {data && (
        <table className="w-full">
          <thead>
            <tr className={TR}>
              <th className={TH}>Rate</th>
              <th className={TH}>Type</th>
              <th className={TH_NUM}>Taxable Amount</th>
              <th className={TH_NUM}>Tax</th>
            </tr>
          </thead>
          <tbody>
            {side('Output Tax (Sales)', data.output_tax)}
            {side('Input Tax (Purchases)', data.input_tax)}
          </tbody>
          <tfoot>
            <tr className={TFOOT}>
              <td className={TD} colSpan={3}>
                {Number(data.net_payable) >= 0 ? 'Net Tax Payable' : 'Net Tax Credit'}
              </td>
              <td className={TD_NUM}>{formatCurrency(Number(data.net_payable))}</td>
            </tr>
          </tfoot>
        </table>
      )}
    </ReportShell>
  );
}
