'use client';

import { Warehouse } from '@/types/Warehouse';
import { Table, TableBody, TableCell, TableHeader, TableRow } from '@/components/ui/table';
import { TableActions } from '@/components/common/TableActions';
import { ChevronsUpDown, ArrowUpWideNarrow, ArrowDownNarrowWide } from 'lucide-react';

interface WarehouseTableProps {
  warehouses: Warehouse[];
  onEdit: (warehouse: Warehouse) => void;
  onDelete: (warehouse: Warehouse) => void;
  onRestore?: (warehouse: Warehouse) => void;
  viewMode?: 'active' | 'trashed';
  onSort: (column: string) => void;
  sortBy: string;
  sortDirection: string;
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
    <div className="overflow-hidden bg-white border border-gray-200 rounded-xl shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <div className="overflow-x-auto relative">
        <Table>
          <TableHeader>
            <TableRow>
              <TableCell
                isHeader
                className="px-5 py-4 sm:px-6 text-start text-xs font-medium text-gray-500 uppercase dark:text-gray-400 cursor-pointer"
                onClick={() => onSort('name')}
              >
                Name {renderSortIcon('name')}
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-4 sm:px-6 text-start text-xs font-medium text-gray-500 uppercase dark:text-gray-400 cursor-pointer"
                onClick={() => onSort('code')}
              >
                Code {renderSortIcon('code')}
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-4 sm:px-6 text-start text-xs font-medium text-gray-500 uppercase dark:text-gray-400"
              >
                Address
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-4 sm:px-6 text-start text-xs font-medium text-gray-500 uppercase dark:text-gray-400"
              >
                Contact Info
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-4 sm:px-6 text-end text-xs font-medium text-gray-500 uppercase dark:text-gray-400"
              >
                Actions
              </TableCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            {warehouses.length > 0 ? (
              warehouses.map((warehouse) => (
                <TableRow
                  key={warehouse.id}
                  className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                >
                  <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-800 dark:text-white/90 text-sm font-medium">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                        warehouse.deleted_at
                          ? 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-500'
                          : ''
                      }`}
                    >
                      {warehouse.name}
                      {warehouse.deleted_at ? ' (Deleted)' : ''}
                    </span>
                  </TableCell>
                  <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 dark:text-gray-400 text-sm">
                    {warehouse.code || 'N/A'}
                  </TableCell>
                  <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 dark:text-gray-400 text-sm">
                    <div className="flex flex-col">
                      <span>
                        {warehouse.city}, {warehouse.state}
                      </span>
                      <span className="text-xs">{warehouse.country}</span>
                    </div>
                  </TableCell>
                  <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 dark:text-gray-400 text-sm">
                    <div className="flex flex-col">
                      <span>{warehouse.phone}</span>
                      <span className="text-xs">{warehouse.email}</span>
                    </div>
                  </TableCell>
                  <TableCell className="px-5 py-4 sm:px-6 text-end">
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
                <TableCell
                  colSpan={5}
                  className="px-5 py-8 text-center text-gray-500 dark:text-gray-400"
                >
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
