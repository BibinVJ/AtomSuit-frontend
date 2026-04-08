'use client';

import { Table, TableBody, TableCell, TableHeader, TableRow } from '@/components/ui/table';
import { ChevronsUpDown, ArrowUpWideNarrow, ArrowDownNarrowWide } from 'lucide-react';
import { AccountType } from '@/types';
import Badge from '@/components/ui/badge/Badge';
import SkeletonTable from '@/components/common/SkeletonTable';

interface Props {
  data: AccountType[];
  onSort: (column: string) => void;
  sortBy: string;
  sortDirection: string;
  loading?: boolean;
}

export default function AccountTypeTable({ data, onSort, sortBy, sortDirection, loading }: Props) {
  const renderSortIcon = (column: string) => {
    if (sortBy !== column) {
      return <ChevronsUpDown className="inline-block w-4 h-4 ml-1 text-gray-400" />;
    }
    return sortDirection === 'asc' ? (
      <ArrowUpWideNarrow className="inline-block w-4 h-4 ml-1" />
    ) : (
      <ArrowDownNarrowWide className="inline-block w-4 h-4 ml-1" />
    );
  };

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 custom-card-bg dark:border-white/[0.05]">
      <div className="max-w-full overflow-x-auto">
        <Table>
          <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
            <TableRow>
              <TableCell
                isHeader
                className="px-5 py-3 font-medium text-gray-500 cursor-pointer text-start text-theme-xs dark:text-gray-400"
                onClick={() => onSort('name')}
              >
                Name {renderSortIcon('name')}
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-3 font-medium text-gray-500 cursor-pointer text-start text-theme-xs dark:text-gray-400"
                onClick={() => onSort('code')}
              >
                Code {renderSortIcon('code')}
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                Class
              </TableCell>
            </TableRow>
          </TableHeader>

          <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
            {loading ? (
              <TableRow>
                <TableCell colSpan={3} className="p-0">
                  <SkeletonTable rows={10} columns={3} />
                </TableCell>
              </TableRow>
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="px-5 py-10 text-center text-gray-500">
                  No account types found.
                </TableCell>
              </TableRow>
            ) : (
              data.map((type) => (
                <TableRow key={type.id}>
                  <TableCell className="px-5 py-4 sm:px-6 text-start">
                    <p className="font-medium text-gray-800 text-theme-sm dark:text-white/90">
                      {type.name}
                    </p>
                  </TableCell>
                  <TableCell className="px-5 py-4 sm:px-6 text-start">
                    <p className="text-gray-500 text-theme-sm dark:text-gray-400">
                      {type.code || '-'}
                    </p>
                  </TableCell>
                  <TableCell className="px-5 py-4 sm:px-6 text-start">
                    <Badge size="sm" color={type.class === 'debit' ? 'info' : 'warning'}>
                      {type.class.toUpperCase()}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
