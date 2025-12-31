'use client';

import { Table, TableBody, TableCell, TableHeader, TableRow } from '../ui/table';
import { useState } from 'react';
import Badge from '../ui/badge/Badge';
import { ChevronsUpDown, ArrowUpWideNarrow, ArrowDownNarrowWide } from 'lucide-react';
import { TableActions } from '../common/TableActions';
import { useRouter } from 'next/navigation';
import VoidSaleModal from './VoidSaleModal';

import { Sale } from '../../types';

interface Props {
  data: Sale[];
  onAction: () => void;
  onSort: (column: string) => void;
  sortBy: string;
  sortDirection: string;
  currentPage: number;
  perPage: number;
  startIndex?: number;
  loading?: boolean;
}

import { usePermissions } from '../../hooks/usePermissions';
import { useSettings } from '../../hooks/useSettings';

export default function SaleTable({
  data,
  onAction,
  onSort,
  sortBy,
  sortDirection,
  currentPage,
  perPage,
  startIndex,
  loading,
}: Props) {
  const { hasPermission } = usePermissions();
  const { formatCurrency, formatDate } = useSettings();
  const router = useRouter();
  const [isVoidModalOpen, setIsVoidModalOpen] = useState(false);
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);

  const handleView = (id: number) => {
    router.push(`/sales/${id}`);
  };

  const handleEdit = (id: number) => {
    router.push(`/sales/edit/${id}`);
  };

  const handleDelete = (sale: Sale) => {
    setSelectedSale(sale);
    setIsVoidModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsVoidModalOpen(false);
    setSelectedSale(null);
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
                onClick={() => onSort('invoice_number')}
              >
                Invoice # {renderSortIcon('invoice_number')}
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-3 font-medium text-gray-500 cursor-pointer text-start text-theme-xs dark:text-gray-400"
                onClick={() => onSort('sale_date')}
              >
                Sale Date {renderSortIcon('sale_date')}
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-3 font-medium text-gray-500 cursor-pointer text-start text-theme-xs dark:text-gray-400"
                onClick={() => onSort('customer_id')}
              >
                Customer {renderSortIcon('customer_id')}
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-3 font-medium text-gray-500 cursor-pointer text-start text-theme-xs dark:text-gray-400"
                onClick={() => onSort('total_amount')}
              >
                Total Amount {renderSortIcon('total_amount')}
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-3 font-medium text-gray-500 cursor-pointer text-start text-theme-xs dark:text-gray-400"
                onClick={() => onSort('status')}
              >
                Status {renderSortIcon('status')}
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
                <TableCell colSpan={7} className="px-5 py-10 text-center">
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-gray-500">Loading sales...</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="px-5 py-10 text-center text-gray-500">
                  No sales found.
                </TableCell>
              </TableRow>
            ) : (
              data.map((sale, index) => (
                <TableRow key={sale.id}>
                  <TableCell className="px-5 py-3 text-start">
                    <p className="font-medium text-gray-800 text-theme-sm dark:text-white/90">
                      {startIndex !== undefined
                        ? startIndex + index
                        : (currentPage - 1) * perPage + index + 1}
                    </p>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-800 text-start text-theme-sm dark:text-gray-400">
                    {sale.invoice_number}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-800 text-start text-theme-sm dark:text-gray-400">
                    {formatDate(sale.sale_date)}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-800 text-start text-theme-sm dark:text-gray-400">
                    {sale.customer.name}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-800 text-start text-theme-sm dark:text-gray-400">
                    {formatCurrency(sale.total_amount)}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    <Badge
                      size="sm"
                      color={
                        sale.status === 'completed'
                          ? 'success'
                          : sale.status === 'voided'
                            ? 'error'
                            : 'primary'
                      }
                    >
                      {sale.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-end text-theme-sm dark:text-gray-400">
                    <TableActions
                      onView={hasPermission('view-sale') ? () => handleView(sale.id) : undefined}
                      onEdit={hasPermission('update-sale') ? () => handleEdit(sale.id) : undefined}
                      onDelete={hasPermission('delete-sale') ? () => handleDelete(sale) : undefined}
                      deleteTooltip="Void"
                    />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      {selectedSale && (
        <VoidSaleModal
          isOpen={isVoidModalOpen}
          onClose={handleCloseModal}
          onSaleVoided={onAction}
          sale={selectedSale}
        />
      )}
    </div>
  );
}
