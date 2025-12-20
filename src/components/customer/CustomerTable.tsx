"use client";


import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import { useState } from "react";
import Badge from "../ui/badge/Badge";
import EditCustomerModal from "./EditCustomerModal";
import DeleteCustomerModal from "./DeleteCustomerModal";
import { ChevronsUpDown, ArrowUpWideNarrow, ArrowDownNarrowWide, Edit, Trash2, RefreshCw } from 'lucide-react';
import { restoreCustomer } from "../../services/CustomerService";
import { toast } from "sonner";
import Button from "../ui/button/Button";
import Tooltip from "../ui/tooltip/Tooltip";

import { Customer } from '../../types';
import { usePermissions } from "../../hooks/usePermissions";

interface Props {
  data: Customer[];
  onAction: () => void;
  onSort: (column: string) => void;
  sortBy: string;
  sortDirection: string;
  currentPage: number;
  perPage: number;
  startIndex?: number;
  viewMode?: 'active' | 'trashed';
}


export default function CustomerTable({ data, onAction, onSort, sortBy, sortDirection, currentPage, perPage, startIndex, viewMode = 'active' }: Props) {
  const { hasPermission } = usePermissions();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null
  );

  const handleEdit = (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsEditModalOpen(true);
  };

  const handleDelete = (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsDeleteModalOpen(true);
  };

  const handleCloseModals = () => {
    setIsEditModalOpen(false);
    setIsDeleteModalOpen(false);
    setSelectedCustomer(null);
  };

  const handleRestore = async (id: number) => {
    try {
      await restoreCustomer(id);
      toast.success('Customer restored successfully');
      onAction();
    } catch (error) {
      console.error('Error restoring customer:', error);
      toast.error('Failed to restore customer');
    }
  };

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
              <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">#</TableCell>
              <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 cursor-pointer text-start text-theme-xs dark:text-gray-400" onClick={() => onSort('name')}>Name {renderSortIcon('name')}</TableCell>
              <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 cursor-pointer text-start text-theme-xs dark:text-gray-400" onClick={() => onSort('email')}>Email {renderSortIcon('email')}</TableCell>
              <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 cursor-pointer text-start text-theme-xs dark:text-gray-400" onClick={() => onSort('phone')}>Phone {renderSortIcon('phone')}</TableCell>
              <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Address</TableCell>
              <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Actions</TableCell>
            </TableRow>
          </TableHeader>

          <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
            {data.map((customer, index) => (
              <TableRow key={customer.id}>
                <TableCell className="px-5 py-4 sm:px-6 text-start">
                  <p className="font-medium text-gray-800 text-theme-sm dark:text-white/90">
                    {startIndex !== undefined ? startIndex + index : (currentPage - 1) * perPage + index + 1}
                  </p>
                </TableCell>
                <TableCell className="px-4 py-3 text-gray-800 text-start text-theme-sm dark:text-gray-400">{customer.name}</TableCell>
                <TableCell className="px-4 py-3 text-gray-800 text-start text-theme-sm dark:text-gray-400">{customer.email}</TableCell>
                <TableCell className="px-4 py-3 text-gray-800 text-start text-theme-sm dark:text-gray-400">{customer.phone}</TableCell>
                <TableCell className="px-4 py-3 text-gray-800 text-start text-theme-sm dark:text-gray-400">{customer.address}</TableCell>
                <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                  <div className="flex items-center gap-2">
                    {viewMode === 'active' ? (
                      <>
                        {hasPermission("update-customer") && (
                          <Tooltip text="Edit">
                            <Button
                              size="xs"
                              onClick={() => handleEdit(customer)}
                              className="bg-blue-600 hover:bg-blue-700 text-white"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                          </Tooltip>
                        )}
                        {hasPermission("delete-customer") && (
                          <Tooltip text="Delete">
                            <Button
                              size="xs"
                              onClick={() => handleDelete(customer)}
                              className="bg-red-600 hover:bg-red-700 text-white"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </Tooltip>
                        )}
                      </>
                    ) : (
                      <>
                        {hasPermission("update-customer") && (
                          <Tooltip text="Restore">
                            <Button
                              size="xs"
                              onClick={() => handleRestore(customer.id)}
                              className="bg-green-600 hover:bg-green-700 text-white"
                            >
                              <RefreshCw className="w-4 h-4" />
                            </Button>
                          </Tooltip>
                        )}
                        {hasPermission("delete-customer") && (
                          <Tooltip text="Delete Permanently">
                            <Button
                              size="xs"
                              onClick={() => handleDelete(customer)}
                              className="bg-red-600 hover:bg-red-700 text-white"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </Tooltip>
                        )}
                      </>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      {selectedCustomer && (
        <>
          <EditCustomerModal
            isOpen={isEditModalOpen}
            onClose={handleCloseModals}
            onCustomerUpdated={onAction}
            customer={selectedCustomer}
          />
          <DeleteCustomerModal
            isOpen={isDeleteModalOpen}
            onClose={handleCloseModals}
            onCustomerDeleted={onAction}
            customer={selectedCustomer}
            force={viewMode === 'trashed'}
          />
        </>
      )}
    </div>
  );
}
