'use client';

import { Fragment, useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import ReportShell from '../_components/ReportShell';
import { AsAtFilter } from '../_components/ReportFilters';
import { useReport, today } from '../_components/useReport';
import { TH, TH_NUM, TD, TD_NUM, TR } from '../_components/reportTable';
import { StatementSection } from '@/types';
import { usePermissions } from '@/hooks/usePermissions';
import { useSettings } from '@/hooks/useSettings';
import ReportService from '@/services/ReportService';

export default function BalanceSheetPage() {
  const { hasPermission } = usePermissions();
  const canView = hasPermission('view-financial-report');
  const { formatCurrency } = useSettings();

  const [asAt, setAsAt] = useState(today());
  const [applied, setApplied] = useState(asAt);

  const { data, loading, error } = useReport(
    () => ReportService.balanceSheet({ as_at: applied }),
    [applied],
    canView
  );

  if (!canView) {
    return <div className="p-6 text-center">Access Denied</div>;
  }

  const section = (
    title: string,
    sec: StatementSection,
    extra?: { label: string; amount: string }
  ) => (
    <Fragment key={title}>
      <tr className="bg-gray-50 dark:bg-gray-800/50">
        <td className={`${TD} font-bold uppercase tracking-wider text-theme-xs`} colSpan={2}>
          {title}
        </td>
      </tr>
      {sec.groups.map((group) => (
        <Fragment key={group.id}>
          {group.accounts.map((account) => (
            <tr key={account.account_id} className={TR}>
              <td className={`${TD} pl-8`}>
                {account.account_code} — {account.account_name}
              </td>
              <td className={TD_NUM}>{formatCurrency(Number(account.amount))}</td>
            </tr>
          ))}
        </Fragment>
      ))}
      {extra && (
        <tr className={TR}>
          <td className={`${TD} pl-8 italic`}>{extra.label}</td>
          <td className={TD_NUM}>{formatCurrency(Number(extra.amount))}</td>
        </tr>
      )}
    </Fragment>
  );

  return (
    <ReportShell
      title="Balance Sheet"
      description="Assets, liabilities and equity as at a date"
      loading={loading}
      error={error}
      isEmpty={!data}
      filters={
        <AsAtFilter
          asAt={asAt}
          onChange={setAsAt}
          onRefresh={() => setApplied(asAt)}
          disabled={loading}
        />
      }
      banner={
        data && !loading && !data.is_balanced ? (
          <div className="mb-6 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
            <AlertTriangle className="h-5 w-5 flex-shrink-0" />
            <span>
              <strong>
                Assets do not equal liabilities plus equity — out by{' '}
                {formatCurrency(Number(data.totals.difference))}.
              </strong>{' '}
              This means the underlying ledger is unbalanced, not that the report is wrong.
            </span>
          </div>
        ) : null
      }
    >
      {data && (
        <table className="w-full">
          <thead>
            <tr className={TR}>
              <th className={TH}>Account</th>
              <th className={TH_NUM}>Amount</th>
            </tr>
          </thead>
          <tbody>
            {section('Assets', data.assets)}
            <tr className={TR}>
              <td className={`${TD} font-bold`}>Total Assets</td>
              <td className={`${TD_NUM} font-bold`}>
                {formatCurrency(Number(data.totals.assets))}
              </td>
            </tr>

            {section('Liabilities', data.liabilities)}
            <tr className={TR}>
              <td className={`${TD} font-bold`}>Total Liabilities</td>
              <td className={`${TD_NUM} font-bold`}>
                {formatCurrency(Number(data.totals.liabilities))}
              </td>
            </tr>

            {section('Equity', data.equity, {
              label: 'Current period earnings',
              amount: data.equity.retained_earnings,
            })}
            <tr className={TR}>
              <td className={`${TD} font-bold`}>Total Equity</td>
              <td className={`${TD_NUM} font-bold`}>
                {formatCurrency(Number(data.totals.equity))}
              </td>
            </tr>
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-gray-200 dark:border-gray-700">
              <td className={`${TD} text-lg font-bold`}>Liabilities + Equity</td>
              <td className={`${TD_NUM} text-lg font-bold`}>
                {formatCurrency(Number(data.totals.liabilities_and_equity))}
              </td>
            </tr>
          </tfoot>
        </table>
      )}
    </ReportShell>
  );
}
