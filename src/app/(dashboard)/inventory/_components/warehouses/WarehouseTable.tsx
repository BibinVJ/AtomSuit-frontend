'use client';

import { Warehouse } from '@/types/Warehouse';
import { Table, TableBody, TableCell, TableHeader, TableRow } from '@/components/ui/table';
import { TableActions } from '@/components/common/TableActions';
import { ChevronsUpDown, ArrowUpWideNarrow, ArrowDownNarrowWide } from 'lucide-react';
import SkeletonTable from '@/components/common/SkeletonTable';

interface WarehouseTableProps {
  warehouses: Warehouse[];
  onEdit: (warehouse: Warehouse) => void;
  onDelete: (warehouse: Warehouse) => void;
  onRestore?: (warehouse: Warehouse) => void;
  viewMode?: 'active' | 'trashed';
  onSort: (column: string) => void;
  sortBy: string;
  sortDirection: string;
  loading?: boolean;
  perPage?: number;
}

export default function WarehouseTable({
  warehouses,
  onEdit,
  onDelete,
  onRestore,
  viewMode = 'active',
  onSort,
  sortBy,
  sortDirection,
  loading,
  perPage = 10,
}: WarehouseTableProps) {
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
                Address
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                Contact Info
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-3 font-medium text-gray-500 text-end text-theme-xs dark:text-gray-400"
              >
                Actions
              </TableCell>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="p-0">
                  <SkeletonTable rows={perPage} columns={5} />
                </TableCell>
              </TableRow>
            ) : warehouses.length > 0 ? (
              warehouses.map((warehouse) => (
                <TableRow key={warehouse.id}>
                  <TableCell className="px-5 py-4 sm:px-6 text-start">
                    <p className="font-medium text-gray-800 text-theme-sm dark:text-white/90">
                      {warehouse.name}
                      {warehouse.deleted_at ? ' (Deleted)' : ''}
                    </p>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-800 text-start text-theme-sm dark:text-gray-400">
                    {warehouse.code || 'N/A'}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-800 text-start text-theme-sm dark:text-gray-400">
                    <div className="flex flex-col">
                      <span>
                        {warehouse.city}, {warehouse.state}
                      </span>
                      <span className="text-xs text-gray-500">{warehouse.country}</span>
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-800 text-start text-theme-sm dark:text-gray-400">
                    <div className="flex flex-col">
                      <span>{warehouse.phone}</span>
                      <span className="text-xs text-gray-500">{warehouse.email}</span>
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-end">
                    <TableActions
                      isTrashed={viewMode === 'trashed'}
                      onEdit={() => onEdit(warehouse)}
                      onDelete={() => onDelete(warehouse)}
                      onRestore={onRestore ? () => onRestore(warehouse) : undefined}
                    />
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="px-5 py-10 text-center text-gray-500 font-medium">
                  No warehouses found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
