'use client';

import { Fragment, useState } from 'react';
import ReportShell from '../_components/ReportShell';
import { PeriodFilter } from '../_components/ReportFilters';
import { useReport, currentMonthRange } from '../_components/useReport';
import { TH, TH_NUM, TD, TD_NUM, TR } from '../_components/reportTable';
import { StatementSection } from '@/types';
import { usePermissions } from '@/hooks/usePermissions';
import { useSettings } from '@/hooks/useSettings';
import ReportService from '@/services/ReportService';

export default function ProfitAndLossPage() {
  const { hasPermission } = usePermissions();
  const canView = hasPermission('view-financial-report');
  const { formatCurrency } = useSettings();
  const initial = currentMonthRange();

  const [from, setFrom] = useState(initial.from);
  const [to, setTo] = useState(initial.to);
  const [applied, setApplied] = useState(initial);

  const { data, loading, error } = useReport(
    () => ReportService.profitAndLoss({ from: applied.from, to: applied.to }),
    [applied],
    canView
  );

  if (!canView) {
    return <div className="p-6 text-center">Access Denied</div>;
  }

  const section = (title: string, sec: StatementSection) => (
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
          <tr className={TR}>
            <td className={`${TD} pl-4 font-semibold`}>{group.name}</td>
            <td className={`${TD_NUM} font-semibold`}>{formatCurrency(Number(group.total))}</td>
          </tr>
        </Fragment>
      ))}
      <tr className={TR}>
        <td className={`${TD} font-bold`}>Total {title}</td>
        <td className={`${TD_NUM} font-bold`}>{formatCurrency(Number(sec.total))}</td>
      </tr>
    </Fragment>
  );

  return (
    <ReportShell
      title="Profit & Loss"
      description="Income less cost of sales and expenses"
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
            {section('Income', data.income)}
            {section('Cost of Goods Sold', data.cost_of_goods_sold)}
            <tr className="border-t-2 border-gray-200 dark:border-gray-700">
              <td className={`${TD} font-bold`}>Gross Profit</td>
              <td className={`${TD_NUM} font-bold`}>{formatCurrency(Number(data.gross_profit))}</td>
            </tr>
            {section('Expenses', data.expenses)}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-gray-200 dark:border-gray-700">
              <td className={`${TD} text-lg font-bold`}>
                {data.is_profit ? 'Net Profit' : 'Net Loss'}
              </td>
              <td
                className={`${TD_NUM} text-lg font-bold ${
                  data.is_profit
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-red-600 dark:text-red-400'
                }`}
              >
                {formatCurrency(Number(data.net_profit))}
              </td>
            </tr>
          </tfoot>
        </table>
      )}
    </ReportShell>
  );
}
