'use client';

import { Table, TableBody, TableCell, TableHeader, TableRow } from '../../ui/table';
import { useState } from 'react';
import { ChevronsUpDown, ArrowUpWideNarrow, ArrowDownNarrowWide } from 'lucide-react';
import { restoreExchangeRate } from '../../../services/ExchangeRateService';
import { toast } from 'sonner';
import { ExchangeRate } from '../../../types';
import EditExchangeRateModal from './EditExchangeRateModal';
import DeleteExchangeRateModal from './DeleteExchangeRateModal';
import { TableActions } from '../../common/TableActions';
import { usePermissions } from '../../../hooks/usePermissions';

interface Props {
  data: ExchangeRate[];
  onAction: () => void;
  onSort: (column: string) => void;
  sortBy: string;
  sortDirection: string;
  currentPage: number;
  perPage: number;
  startIndex?: number;
  viewMode?: 'active' | 'trashed';
}

export default function ExchangeRateTable({
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
  const [selectedExchangeRate, setSelectedExchangeRate] = useState<ExchangeRate | null>(null);

  const handleEdit = (rate: ExchangeRate) => {
    setSelectedExchangeRate(rate);
    setIsEditModalOpen(true);
  };

  const handleDelete = (rate: ExchangeRate) => {
    setSelectedExchangeRate(rate);
    setIsDeleteModalOpen(true);
  };

  const handleCloseModals = () => {
    setIsEditModalOpen(false);
    setIsDeleteModalOpen(false);
    setSelectedExchangeRate(null);
  };

  const handleRestore = async (id: number) => {
    try {
      await restoreExchangeRate(id);
      toast.success('Exchange rate restored successfully');
      onAction();
    } catch (error) {
      console.error('Error restoring exchange rate:', error);
      toast.error('Failed to restore exchange rate');
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
                onClick={() => onSort('base_currency_id')}
              >
                Base Currency {renderSortIcon('base_currency_id')}
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-3 font-medium text-gray-500 cursor-pointer text-start text-theme-xs dark:text-gray-400"
                onClick={() => onSort('target_currency_id')}
              >
                Target Currency {renderSortIcon('target_currency_id')}
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
                className="px-5 py-3 font-medium text-gray-500 cursor-pointer text-start text-theme-xs dark:text-gray-400"
                onClick={() => onSort('effective_date')}
              >
                Effective Date {renderSortIcon('effective_date')}
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
                  colSpan={6}
                  className="px-6 py-4 text-center text-gray-500 text-theme-sm"
                >
                  No exchange rates found.
                </TableCell>
              </TableRow>
            ) : (
              data.map((rate, index) => (
                <TableRow key={rate.id}>
                  <TableCell className="px-5 py-4 sm:px-6 text-start">
                    <p className="font-medium text-gray-800 text-theme-sm dark:text-white/90">
                      {startIndex !== undefined
                        ? startIndex + index
                        : (currentPage - 1) * perPage + index + 1}
                    </p>
                  </TableCell>
                  <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-800 dark:text-white/90 text-theme-sm font-medium">
                    {rate.base_currency?.code || 'N/A'}
                  </TableCell>
                  <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-800 dark:text-white/90 text-theme-sm font-medium">
                    {rate.target_currency?.code || 'N/A'}
                  </TableCell>
                  <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 dark:text-gray-400 text-theme-sm">
                    {rate.rate}
                  </TableCell>
                  <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 dark:text-gray-400 text-theme-sm">
                    {rate.effective_date}
                  </TableCell>
                  <TableCell className="px-5 py-4 sm:px-6 text-end text-gray-500 dark:text-gray-400 text-theme-sm">
                    <TableActions
                      isTrashed={viewMode === 'trashed'}
                      onEdit={
                        hasPermission('update-exchange-rate') ? () => handleEdit(rate) : undefined
                      }
                      onDelete={
                        hasPermission('delete-exchange-rate') ? () => handleDelete(rate) : undefined
                      }
                      onRestore={
                        hasPermission('update-exchange-rate')
                          ? () => handleRestore(rate.id)
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
      {selectedExchangeRate && (
        <>
          <EditExchangeRateModal
            isOpen={isEditModalOpen}
            onClose={handleCloseModals}
            onSuccess={onAction}
            exchangeRate={selectedExchangeRate}
          />
          <DeleteExchangeRateModal
            isOpen={isDeleteModalOpen}
            onClose={handleCloseModals}
            onExchangeRateDeleted={onAction}
            exchangeRate={selectedExchangeRate}
            force={viewMode === 'trashed'}
          />
        </>
      )}
    </div>
  );
}
