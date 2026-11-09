'use client';

import { ReactNode } from 'react';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import PageMeta from '@/components/common/PageMeta';
import SkeletonTable from '@/components/common/SkeletonTable';

interface Props {
  title: string;
  description: string;
  /** Date pickers / selects for this report. */
  filters?: ReactNode;
  /** Shown above the body — e.g. a balanced/not-balanced banner. */
  banner?: ReactNode;
  loading?: boolean;
  error?: string | null;
  isEmpty?: boolean;
  emptyMessage?: string;
  children: ReactNode;
}

/**
 * Common frame for every report page: heading, filter bar, and the loading / error / empty /
 * content states, so thirteen reports don't each invent their own.
 */
export default function ReportShell({
  title,
  description,
  filters,
  banner,
  loading,
  error,
  isEmpty,
  emptyMessage = 'No data for the selected period.',
  children,
}: Props) {
  return (
    <>
      <PageMeta title={title} description={description} />
      <PageBreadcrumb pageTitle={title} />

      {filters && (
        <div className="p-4 mb-6 border border-gray-200 rounded-2xl bg-white dark:bg-gray-900 dark:border-gray-800 shadow-sm">
          <div className="flex flex-wrap items-end gap-4">{filters}</div>
        </div>
      )}

      {banner}

      <div className="p-6 border border-gray-200 rounded-2xl bg-white dark:bg-gray-900 dark:border-gray-800 shadow-sm">
        {loading ? (
          <SkeletonTable rows={8} columns={5} />
        ) : error ? (
          <p className="py-10 text-center text-red-500">{error}</p>
        ) : isEmpty ? (
          <p className="py-10 text-center text-gray-500 dark:text-gray-400">{emptyMessage}</p>
        ) : (
          <div className="overflow-x-auto">{children}</div>
        )}
      </div>
    </>
  );
}
