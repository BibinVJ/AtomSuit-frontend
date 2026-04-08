'use client';

import SkeletonTable from './SkeletonTable';

interface SkeletonDetailProps {
  columns?: number;
  hasTable?: boolean;
}

export default function SkeletonDetail({ columns = 3, hasTable = true }: SkeletonDetailProps) {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Action Buttons Top Right */}
      <div className="flex justify-end gap-2 mb-4">
        <div className="h-10 w-20 bg-gray-200 dark:bg-gray-800 rounded-lg"></div>
        <div className="h-10 w-20 bg-gray-200 dark:bg-gray-800 rounded-lg"></div>
      </div>

      {/* Header Info Cards */}
      <div className="p-6 border border-gray-100 dark:border-gray-800 rounded-2xl bg-white dark:bg-gray-900 shadow-sm">
        <div className={`grid grid-cols-1 md:grid-cols-${columns} gap-6`}>
          {Array.from({ length: columns }).map((_, i) => (
            <div key={i} className="space-y-3">
              <div className="h-5 w-32 bg-gray-200 dark:bg-gray-800 rounded"></div>
              <div className="space-y-2">
                <div className="h-4 w-full bg-gray-100 dark:bg-gray-800/50 rounded"></div>
                <div className="h-4 w-3/4 bg-gray-100 dark:bg-gray-800/50 rounded"></div>
                <div className="h-4 w-1/2 bg-gray-100 dark:bg-gray-800/50 rounded"></div>
              </div>
            </div>
          ))}
        </div>

        {/* Dynamic Items Table */}
        {hasTable && (
          <div className="mt-8 border border-gray-100 dark:border-gray-800 rounded-xl overflow-hidden">
            <SkeletonTable rows={4} columns={6} />
          </div>
        )}
      </div>
    </div>
  );
}
