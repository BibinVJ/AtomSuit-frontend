'use client';

import { Table, TableBody, TableCell, TableHeader, TableRow } from '@/components/ui/table';
import { useState } from 'react';
import { ChevronsUpDown, ArrowUpWideNarrow, ArrowDownNarrowWide } from 'lucide-react';
import { restoreTaxRate, deleteTaxRate } from '@/services/TaxService';
import { toast } from 'sonner';
import { isApiError } from '@/utils/errors';
import { TaxRate } from '@/types';
import EditTaxRateModal from './EditTaxRateModal';
import ConfirmModal from '@/components/common/ConfirmModal';
import { TableActions } from '@/components/common/TableActions';
import { usePermissions } from '@/hooks/usePermissions';
import SkeletonTable from '@/components/common/SkeletonTable';

interface Props {
  data: TaxRate[];
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

export default function TaxRateTable({
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
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedTaxRate, setSelectedTaxRate] = useState<TaxRate | null>(null);
  const [confirmTarget, setConfirmTarget] = useState<TaxRate | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const isTrashed = viewMode === 'trashed';

  const handleEdit = (taxRate: TaxRate) => {
    setSelectedTaxRate(taxRate);
    setIsEditModalOpen(true);
  };

  const handleDelete = (taxRate: TaxRate) => {
    setConfirmTarget(taxRate);
  };

  const handleDeleteConfirm = async () => {
    if (!confirmTarget) return;
    setIsDeleting(true);
    try {
      await deleteTaxRate(confirmTarget.id, isTrashed);
      toast.success(isTrashed ? 'Tax rate permanently deleted' : 'Tax rate deleted successfully');
      onAction();
    } catch (error: unknown) {
      let message = 'Failed to delete tax rate';
      if (isApiError(error)) {
        message = error.response?.data?.message || message;
      }
      toast.error(message);
    } finally {
      setIsDeleting(false);
      setConfirmTarget(null);
    }
  };

  const handleCloseModals = () => {
    setIsEditModalOpen(false);
    setSelectedTaxRate(null);
  };

  const handleRestore = async (id: number) => {
    try {
      await restoreTaxRate(id);
      toast.success('Tax rate restored successfully');
      onAction();
    } catch (error) {
      console.error('Error restoring tax rate:', error);
      toast.error('Failed to restore tax rate');
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
                className="px-5 py-3 font-medium text-gray-500 cursor-pointer text-start text-theme-xs dark:text-gray-400"
                onClick={() => onSort('rate')}
              >
                Rate {renderSortIcon('rate')}
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                Type
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                Sales Account
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                Purchase Account
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
                <TableCell colSpan={7} className="p-0">
                  <SkeletonTable rows={perPage} columns={7} />
                </TableCell>
              </TableRow>
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="px-6 py-4 text-center text-gray-500 text-theme-sm"
                >
                  No tax rates found.
                </TableCell>
              </TableRow>
            ) : (
              data.map((taxRate, index) => (
                <TableRow key={taxRate.id}>
                  <TableCell className="px-5 py-4 sm:px-6 text-start">
                    <p className="font-medium text-gray-800 text-theme-sm dark:text-white/90">
                      {startIndex !== undefined
                        ? startIndex + index
                        : (currentPage - 1) * perPage + index + 1}
                    </p>
                  </TableCell>
                  <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 dark:text-gray-400 text-theme-sm">
                    {taxRate.name}
                  </TableCell>
                  <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 dark:text-gray-400 text-theme-sm">
                    {taxRate.rate}%
                  </TableCell>
                  <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 dark:text-gray-400 text-theme-sm capitalize">
                    {taxRate.type}
                  </TableCell>
                  <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 dark:text-gray-400 text-theme-sm">
                    {taxRate.sales_account?.name || '-'}
                  </TableCell>
                  <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 dark:text-gray-400 text-theme-sm">
                    {taxRate.purchase_account?.name || '-'}
                  </TableCell>
                  <TableCell className="px-5 py-4 sm:px-6 text-end text-gray-500 dark:text-gray-400 text-theme-sm">
                    <TableActions
                      isTrashed={viewMode === 'trashed'}
                      onEdit={
                        hasPermission('update-tax-rate') ? () => handleEdit(taxRate) : undefined
                      }
                      onDelete={
                        hasPermission('delete-tax-rate') ? () => handleDelete(taxRate) : undefined
                      }
                      onRestore={
                        hasPermission('update-tax-rate')
                          ? () => handleRestore(taxRate.id)
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
      {selectedTaxRate && (
        <>
          <EditTaxRateModal
            isOpen={isEditModalOpen}
            onClose={handleCloseModals}
            onSuccess={onAction}
            taxRate={selectedTaxRate}
          />
        </>
      )}

      <ConfirmModal
        isOpen={!!confirmTarget}
        onClose={() => setConfirmTarget(null)}
        onConfirm={handleDeleteConfirm}
        isLoading={isDeleting}
        title={isTrashed ? 'Permanently Delete Tax Rate' : 'Delete Tax Rate'}
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
