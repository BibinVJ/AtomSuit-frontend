'use client';

import DatePicker from '@/components/form/date-picker';
import Label from '@/components/form/Label';
import Button from '@/components/ui/button/Button';
import { RefreshCw } from 'lucide-react';

interface PeriodProps {
  from: string;
  to: string;
  onFromChange: (value: string) => void;
  onToChange: (value: string) => void;
  onRefresh: () => void;
  disabled?: boolean;
}

/** From/To date range shared by the period reports. */
export function PeriodFilter({
  from,
  to,
  onFromChange,
  onToChange,
  onRefresh,
  disabled,
}: PeriodProps) {
  return (
    <>
      <div className="w-44">
        <Label>From</Label>
        <DatePicker id="report_from" defaultDate={from} onChange={(_, d) => onFromChange(d)} />
      </div>
      <div className="w-44">
        <Label>To</Label>
        <DatePicker id="report_to" defaultDate={to} onChange={(_, d) => onToChange(d)} />
      </div>
      <Button variant="outline" onClick={onRefresh} disabled={disabled} className="gap-2">
        <RefreshCw className="w-4 h-4" />
        Run
      </Button>
    </>
  );
}

interface AsAtProps {
  asAt: string;
  onChange: (value: string) => void;
  onRefresh: () => void;
  disabled?: boolean;
}

/** Single as-at date, for snapshot reports. */
export function AsAtFilter({ asAt, onChange, onRefresh, disabled }: AsAtProps) {
  return (
    <>
      <div className="w-44">
        <Label>As at</Label>
        <DatePicker id="report_as_at" defaultDate={asAt} onChange={(_, d) => onChange(d)} />
      </div>
      <Button variant="outline" onClick={onRefresh} disabled={disabled} className="gap-2">
        <RefreshCw className="w-4 h-4" />
        Run
      </Button>
    </>
  );
}
