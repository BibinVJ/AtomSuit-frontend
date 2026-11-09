'use client';

import { useState } from 'react';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';
import ReportShell from '../_components/ReportShell';
import { PeriodFilter } from '../_components/ReportFilters';
import { useReport, currentMonthRange } from '../_components/useReport';
import { TH, TH_NUM, TD, TD_NUM, TR, TFOOT } from '../_components/reportTable';
import { usePermissions } from '@/hooks/usePermissions';
import { useSettings } from '@/hooks/useSettings';
import ReportService from '@/services/ReportService';

export default function TrialBalancePage() {
  const { hasPermission } = usePermissions();
  const canView = hasPermission('view-financial-report');
  const { formatCurrency } = useSettings();
  const initial = currentMonthRange();

  const [from, setFrom] = useState(initial.from);
  const [to, setTo] = useState(initial.to);
  const [applied, setApplied] = useState(initial);

  const { data, loading, error } = useReport(
    () => ReportService.trialBalance({ from: applied.from, to: applied.to }),
    [applied],
    canView
  );

  if (!canView) {
    return <div className="p-6 text-center">Access Denied</div>;
  }

  return (
    <ReportShell
      title="Trial Balance"
      description="Debits and credits per account, with proof they agree"
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
      banner={
        data && !loading ? (
          <div
            className={`mb-6 flex items-center gap-3 rounded-xl border px-4 py-3 text-sm ${
              data.is_balanced
                ? 'border-green-200 bg-green-50 text-green-700 dark:border-green-500/30 dark:bg-green-500/10 dark:text-green-300'
                : 'border-red-200 bg-red-50 text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300'
            }`}
          >
            {data.is_balanced ? (
              <>
                <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
                <span>Debits equal credits — the ledger is balanced.</span>
              </>
            ) : (
              <>
                <AlertTriangle className="h-5 w-5 flex-shrink-0" />
                <span>
                  <strong>
                    Out of balance by {formatCurrency(Number(data.totals.difference))}.
                  </strong>{' '}
                  A transaction has been posted unbalanced — every report built on the ledger is
                  affected until it is corrected.
                </span>
              </>
            )}
          </div>
        ) : null
      }
    >
      <table className="w-full">
        <thead>
          <tr className={TR}>
            <th className={TH}>Code</th>
            <th className={TH}>Account</th>
            <th className={TH}>Group</th>
            <th className={TH_NUM}>Debit</th>
            <th className={TH_NUM}>Credit</th>
            <th className={TH_NUM}>Balance</th>
          </tr>
        </thead>
        <tbody>
          {data?.rows.map((row) => (
            <tr key={row.account_id} className={TR}>
              <td className={TD}>{row.account_code}</td>
              <td className={TD}>{row.account_name}</td>
              <td className={TD}>{row.account_group ?? '—'}</td>
              <td className={TD_NUM}>{formatCurrency(Number(row.debit))}</td>
              <td className={TD_NUM}>{formatCurrency(Number(row.credit))}</td>
              <td className={TD_NUM}>{formatCurrency(Number(row.balance))}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className={TFOOT}>
            <td className={TD} colSpan={3}>
              Total
            </td>
            <td className={TD_NUM}>{formatCurrency(Number(data?.totals.debit ?? 0))}</td>
            <td className={TD_NUM}>{formatCurrency(Number(data?.totals.credit ?? 0))}</td>
            <td className={TD_NUM}>—</td>
          </tr>
        </tfoot>
      </table>
    </ReportShell>
  );
}
