'use client';

import SkeletonTable from './SkeletonTable';

interface SkeletonFormProps {
  rows?: number;
  columns?: number;
  hasItems?: boolean;
}

export default function SkeletonForm({
  rows = 3,
  columns = 4,
  hasItems = true,
}: SkeletonFormProps) {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Grid of Inputs */}
      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-${columns} gap-x-6 gap-y-4`}>
        {Array.from({ length: rows * columns }).map((_, i) => (
          <div key={i} className="space-y-2">
            <div className="h-4 w-20 bg-gray-200 dark:bg-gray-800 rounded"></div>
            <div className="h-10 w-full bg-gray-100 dark:bg-gray-800/50 rounded-lg"></div>
          </div>
        ))}
      </div>

      {/* Items Section */}
      {hasItems && (
        <div className="mt-8 space-y-4">
          <div className="flex justify-between items-center">
            <div className="h-6 w-32 bg-gray-200 dark:bg-gray-800 rounded"></div>
            <div className="h-10 w-24 bg-gray-200 dark:bg-gray-800 rounded-lg"></div>
          </div>
          <div className="border border-gray-100 dark:border-gray-800 rounded-xl overflow-hidden">
            <SkeletonTable rows={3} columns={6} />
          </div>
        </div>
      )}

      {/* Footer Buttons */}
      <div className="flex justify-end gap-3 pt-6 border-t border-gray-100 dark:border-gray-800">
        <div className="h-10 w-24 bg-gray-200 dark:bg-gray-800 rounded-lg"></div>
        <div className="h-10 w-32 bg-gray-200 dark:bg-gray-800 rounded-lg"></div>
      </div>
    </div>
  );
}
