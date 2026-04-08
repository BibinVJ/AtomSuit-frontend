import React from 'react';
import { Table, TableBody, TableCell, TableHeader, TableRow } from '@/components/ui/table';

interface SkeletonTableProps {
  rows?: number;
  columns?: number;
}

const SkeletonTable: React.FC<SkeletonTableProps> = ({ rows = 5, columns = 6 }) => {
  return (
    <Table>
      <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
        <TableRow>
          {[...Array(columns)].map((_, index) => (
            <TableCell
              key={index}
              isHeader
              className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
            >
              <div className="h-4 bg-gray-200 dark:bg-gray-700 animate-pulse rounded w-24"></div>
            </TableCell>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
        {[...Array(rows)].map((_, rowIndex) => (
          <TableRow key={rowIndex}>
            {[...Array(columns)].map((_, colIndex) => (
              <TableCell key={colIndex} className="px-5 py-4">
                <div
                  className="h-4 bg-gray-100 dark:bg-gray-800 animate-pulse rounded"
                  style={{ width: `${Math.floor(Math.random() * 40) + 40}%` }}
                ></div>
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default SkeletonTable;
