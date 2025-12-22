'use client';

import { Warehouse } from '../../../types/Warehouse';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../ui/table';
import { PencilIcon, TrashIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import Badge from '../../ui/badge/Badge';

interface WarehouseTableProps {
  warehouses: Warehouse[];
  onEdit: (warehouse: Warehouse) => void;
  onDelete: (warehouse: Warehouse) => void;
  onRestore?: (warehouse: Warehouse) => void;
}

export default function WarehouseTable({
  warehouses,
  onEdit,
  onDelete,
  onRestore,
}: WarehouseTableProps) {
  return (
    <div className="overflow-hidden bg-white border border-gray-200 rounded-xl shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <div className="overflow-x-auto relative">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="px-5 py-4 sm:px-6 text-start text-xs font-medium text-gray-500 uppercase dark:text-gray-400">
                Name
              </TableHead>
              <TableHead className="px-5 py-4 sm:px-6 text-start text-xs font-medium text-gray-500 uppercase dark:text-gray-400">
                Code
              </TableHead>
              <TableHead className="px-5 py-4 sm:px-6 text-start text-xs font-medium text-gray-500 uppercase dark:text-gray-400">
                Address
              </TableHead>
              <TableHead className="px-5 py-4 sm:px-6 text-start text-xs font-medium text-gray-500 uppercase dark:text-gray-400">
                Contact Info
              </TableHead>
              <TableHead className="px-5 py-4 sm:px-6 text-end text-xs font-medium text-gray-500 uppercase dark:text-gray-400">
                Actions
              </TableHead>
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
                    {warehouse.deleted_at ? (
                      <span className="flex items-center gap-2">
                        <span className="line-through text-gray-500">{warehouse.name}</span>
                        <Badge variant="soft" color="error" size="sm">
                          Deleted
                        </Badge>
                      </span>
                    ) : (
                      warehouse.name
                    )}
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
                    <div className="flex items-center justify-end gap-2">
                      {warehouse.deleted_at && onRestore ? (
                        <button
                          onClick={() => onRestore(warehouse)}
                          className="p-1.5 text-gray-500 hover:text-green-600 transition-colors bg-gray-100 hover:bg-green-50 rounded-lg dark:bg-white/5 dark:hover:bg-green-500/10 dark:text-gray-400 dark:hover:text-green-500"
                          title="Restore"
                        >
                          <ArrowPathIcon className="size-4" />
                        </button>
                      ) : (
                        <>
                          <button
                            onClick={() => onEdit(warehouse)}
                            className="p-1.5 text-gray-500 hover:text-primary-600 transition-colors bg-gray-100 hover:bg-primary-50 rounded-lg dark:bg-white/5 dark:hover:bg-indigo-500/10 dark:text-gray-400 dark:hover:text-white"
                          >
                            <PencilIcon className="size-4" />
                          </button>
                          <button
                            onClick={() => onDelete(warehouse)}
                            className="p-1.5 text-gray-500 hover:text-red-500 transition-colors bg-gray-100 hover:bg-red-50 rounded-lg dark:bg-white/5 dark:hover:bg-red-500/10 dark:text-gray-400 dark:hover:text-red-500"
                          >
                            <TrashIcon className="size-4" />
                          </button>
                        </>
                      )}
                    </div>
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
