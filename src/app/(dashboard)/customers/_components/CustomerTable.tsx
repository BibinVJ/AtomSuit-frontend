'use client';

import { Table, TableBody, TableCell, TableHeader, TableRow } from '@/components/ui/table';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import EditCustomerModal from './EditCustomerModal';
import ConfirmModal from '@/components/common/ConfirmModal';
import { ChevronsUpDown, ArrowUpWideNarrow, ArrowDownNarrowWide } from 'lucide-react';
import { restoreCustomer, deleteCustomer } from '@/services/CustomerService';
import { toast } from 'sonner';
import { isApiError } from '@/utils/errors';
import { Customer } from '@/types';
import { usePermissions } from '@/hooks/usePermissions';
import { TableActions } from '@/components/common/TableActions';
import SkeletonTable from '@/components/common/SkeletonTable';

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
  loading?: boolean;
}

export default function CustomerTable({
  data,
  onAction,
  onSort,
  sortBy,
  sortDirection,
  currentPage,
  perPage,
  startIndex,
  viewMode = 'active',
  loading,
}: Props) {
  const { hasPermission } = usePermissions();
  const router = useRouter();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [confirmTarget, setConfirmTarget] = useState<Customer | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const isTrashed = viewMode === 'trashed';

  const handleEdit = (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsEditModalOpen(true);
  };

  const handleCloseModals = () => {
    setIsEditModalOpen(false);
    setSelectedCustomer(null);
  };

  const handleDeleteConfirm = async () => {
    if (!confirmTarget) return;
    setIsDeleting(true);
    try {
      await deleteCustomer(confirmTarget.id, isTrashed);
      toast.success(isTrashed ? 'Customer permanently deleted' : 'Customer deleted successfully');
      onAction();
    } catch (error: unknown) {
      let message = 'Failed to delete customer';
      if (isApiError(error)) {
        message = error.response?.data?.message || message;
      }
      toast.error(message);
    } finally {
      setIsDeleting(false);
      setConfirmTarget(null);
    }
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
              <TableCell
                isHeader
                className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                #
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-3 font-medium text-gray-500 cursor-pointer text-start text-theme-xs dark:text-gray-400"
                onClick={() => onSort('name')}
              >
                Name {renderSortIcon('name')}
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                Contact Info
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                Currency
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
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="px-5 py-10 text-center text-gray-500">
                  No customers found.
                </TableCell>
              </TableRow>
            ) : (
              data.map((customer, index) => (
                <TableRow key={customer.id}>
                  <TableCell className="px-5 py-4 sm:px-6 text-start">
                    <p className="font-medium text-gray-800 text-theme-sm dark:text-white/90">
                      {startIndex !== undefined
                        ? startIndex + index
                        : (currentPage - 1) * perPage + index + 1}
                    </p>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-800 text-start text-theme-sm dark:text-gray-400">
                    {customer.name}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-800 text-start text-theme-sm dark:text-gray-400">
                    <div className="flex flex-col">
                      <span>{customer.email}</span>
                      <span className="text-gray-500 text-xs">{customer.phone}</span>
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-start">
                    {customer.currency ? (
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                          customer.currency.deleted_at
                            ? 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-500'
                            : 'bg-gray-100 text-gray-800 dark:bg-white/10 dark:text-white'
                        }`}
                      >
                        {customer.currency.code}
                        {customer.currency.deleted_at ? ' (Deleted)' : ''}
                      </span>
                    ) : (
                      '-'
                    )}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-end">
                    <TableActions
                      isTrashed={viewMode === 'trashed'}
                      onView={() => router.push(`/customers/${customer.id}`)}
                      onEdit={
                        hasPermission('update-customer') ? () => handleEdit(customer) : undefined
                      }
                      onDelete={
                        hasPermission('delete-customer')
                          ? () => setConfirmTarget(customer)
                          : undefined
                      }
                      onRestore={
                        hasPermission('update-customer')
                          ? () => handleRestore(customer.id)
                          : undefined
                      }
                    />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      {selectedCustomer && (
        <EditCustomerModal
          isOpen={isEditModalOpen}
          onClose={handleCloseModals}
          onSuccess={onAction}
          customer={selectedCustomer}
        />
      )}

      <ConfirmModal
        isOpen={!!confirmTarget}
        onClose={() => setConfirmTarget(null)}
        onConfirm={handleDeleteConfirm}
        isLoading={isDeleting}
        title={isTrashed ? 'Permanently Delete Customer' : 'Delete Customer'}
        message={
          isTrashed
            ? `Are you sure you want to permanently delete "${confirmTarget?.name}"? This action cannot be undone.`
            : `Are you sure you want to delete "${confirmTarget?.name}"? You can restore it later from the trash.`
        }
        confirmLabel={isTrashed ? 'Delete Permanently' : 'Delete'}
        variant="danger"
      />
    </div>
  );
}
