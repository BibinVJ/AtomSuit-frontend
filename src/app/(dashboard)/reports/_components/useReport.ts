'use client';

import { useCallback, useEffect, useState } from 'react';
import { isApiError } from '@/utils/errors';

/**
 * Runs a report and holds its loading/error/data state.
 *
 * Reports are read-only aggregations rather than paginated lists, so they don't go through
 * `useDataTable`; this is the create/view-screen pattern (useEffect + service) in one place.
 */
export function useReport<T>(run: () => Promise<T>, deps: unknown[] = [], enabled = true) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState<string | null>(null);

  // The caller passes a fresh closure each render; deps decide when to actually re-run.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const runner = useCallback(run, deps);

  const load = useCallback(async () => {
    // Don't call the API at all when the viewer isn't allowed to see the report — the request
    // would only come back 403.
    if (!enabled) {
      setLoading(false);

      return;
    }

    setLoading(true);
    setError(null);
    try {
      setData(await runner());
    } catch (err: unknown) {
      setError(
        isApiError(err)
          ? (err.response?.data?.message ?? 'Failed to generate the report')
          : 'Failed to generate the report'
      );
    } finally {
      setLoading(false);
    }
  }, [runner, enabled]);

  useEffect(() => {
    load();
  }, [load]);

  return { data, loading, error, reload: load };
}

/**
 * Format a Date as YYYY-MM-DD in the *local* timezone.
 *
 * `toISOString()` converts to UTC first, so anywhere behind UTC the first of the month comes back
 * as the last day of the previous month — the default reporting period was silently wrong.
 */
function localDate(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');

  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** First and last day of the current month, as the default reporting period. */
export function currentMonthRange() {
  const now = new Date();

  return {
    from: localDate(new Date(now.getFullYear(), now.getMonth(), 1)),
    // Day 0 of next month is the last day of this one.
    to: localDate(new Date(now.getFullYear(), now.getMonth() + 1, 0)),
  };
}

export const today = () => localDate(new Date());
