'use client';

import { Table, TableBody, TableCell, TableHeader, TableRow } from '../../ui/table';
import { useState } from 'react';
import { ChevronsUpDown, ArrowUpWideNarrow, ArrowDownNarrowWide } from 'lucide-react';
import { restoreTaxRate } from '@/services/TaxService';
import { toast } from 'sonner';
import { TaxRate } from '@/types';
import EditTaxRateModal from './EditTaxRateModal';
import DeleteTaxRateModal from './DeleteTaxRateModal';
import { TableActions } from '../../common/TableActions';
import { usePermissions } from '@/hooks/usePermissions';

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
}: Props) {
  const { hasPermission } = usePermissions();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedTaxRate, setSelectedTaxRate] = useState<TaxRate | null>(null);

  const handleEdit = (taxRate: TaxRate) => {
    setSelectedTaxRate(taxRate);
    setIsEditModalOpen(true);
  };

  const handleDelete = (taxRate: TaxRate) => {
    setSelectedTaxRate(taxRate);
    setIsDeleteModalOpen(true);
  };

  const handleCloseModals = () => {
    setIsEditModalOpen(false);
    setIsDeleteModalOpen(false);
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
            {data.length === 0 ? (
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
          <DeleteTaxRateModal
            isOpen={isDeleteModalOpen}
            onClose={handleCloseModals}
            onTaxRateDeleted={onAction}
            taxRate={selectedTaxRate}
            force={viewMode === 'trashed'}
          />
        </>
      )}
    </div>
  );
}
