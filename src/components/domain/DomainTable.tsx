'use client';

import { Table, TableBody, TableCell, TableHeader, TableRow } from '../ui/table';
import { ChevronsUpDown, ArrowUpWideNarrow, ArrowDownNarrowWide } from 'lucide-react';

import { Domain } from '../../types';

interface Props {
  data: Domain[];
  onSort: (column: string) => void;
  sortBy: string;
  sortDirection: string;
  currentPage: number;
  perPage: number;
}

export default function DomainTable({
  data,
  onSort,
  sortBy,
  sortDirection,
  currentPage,
  perPage,
}: Props) {
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
                className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                #
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-3 font-medium text-gray-500 cursor-pointer text-start text-theme-xs dark:text-gray-400"
                onClick={() => onSort('domain')}
              >
                Domain {renderSortIcon('domain')}
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                Tenant
              </TableCell>
            </TableRow>
          </TableHeader>

          <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
            {data.map((domain, index) => (
              <TableRow key={domain.id}>
                <TableCell className="px-5 py-4 sm:px-6 text-start">
                  <p className="font-medium text-gray-800 text-theme-sm dark:text-white/90">
                    {(currentPage - 1) * perPage + index + 1}
                  </p>
                </TableCell>
                <TableCell className="px-4 py-3 text-start">
                  <p className="font-medium text-gray-800 text-theme-sm dark:text-white/90">
                    {domain.domain}
                  </p>
                </TableCell>
                <TableCell className="px-4 py-3 text-gray-800 text-start text-theme-sm dark:text-gray-400">
                  {domain.tenant?.name || 'N/A'}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
