'use client';

import { Table, TableBody, TableCell, TableHeader, TableRow } from '../ui/table';
import { useState } from 'react';
import Badge from '../ui/badge/Badge';
import { ChevronsUpDown, ArrowUpWideNarrow, ArrowDownNarrowWide } from 'lucide-react';
import { TableActions } from '../common/TableActions';
import { useRouter } from 'next/navigation';
import VoidPurchaseModal from './VoidPurchaseModal';

import { Purchase } from '../../types';

interface Props {
  data: Purchase[];
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

export default function PurchaseTable({
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
  const [selectedPurchase, setSelectedPurchase] = useState<Purchase | null>(null);

  const handleView = (id: number) => {
    router.push(`/purchases/${id}`);
  };

  const handleEdit = (id: number) => {
    router.push(`/purchases/edit/${id}`);
  };

  const handleDelete = (purchase: Purchase) => {
    setSelectedPurchase(purchase);
    setIsVoidModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsVoidModalOpen(false);
    setSelectedPurchase(null);
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
                onClick={() => onSort('purchase_date')}
              >
                Purchase Date {renderSortIcon('purchase_date')}
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-3 font-medium text-gray-500 cursor-pointer text-start text-theme-xs dark:text-gray-400"
                onClick={() => onSort('vendor_id')}
              >
                Vendor {renderSortIcon('vendor_id')}
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
                onClick={() => onSort('payment_status')}
              >
                Payment Status {renderSortIcon('payment_status')}
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
                    <p className="text-gray-500">Loading purchases...</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="px-5 py-10 text-center text-gray-500">
                  No purchases found.
                </TableCell>
              </TableRow>
            ) : (
              data.map((purchase, index) => (
                <TableRow key={purchase.id}>
                  <TableCell className="px-5 py-4 sm:px-6 text-start">
                    <p className="font-medium text-gray-800 text-theme-sm dark:text-white/90">
                      {startIndex !== undefined
                        ? startIndex + index
                        : (currentPage - 1) * perPage + index + 1}
                    </p>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-800 text-start text-theme-sm dark:text-gray-400">
                    {purchase.invoice_number}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-800 text-start text-theme-sm dark:text-gray-400">
                    {formatDate(purchase.purchase_date)}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-800 text-start text-theme-sm dark:text-gray-400">
                    {purchase.vendor.name}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-800 text-start text-theme-sm dark:text-gray-400">
                    {formatCurrency(purchase.total_amount)}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    <Badge
                      size="sm"
                      color={purchase.payment_status === 'paid' ? 'success' : 'warning'}
                    >
                      {purchase.payment_status}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-end text-theme-sm dark:text-gray-400">
                    <TableActions
                      onView={
                        hasPermission('view-purchase') ? () => handleView(purchase.id) : undefined
                      }
                      onEdit={
                        hasPermission('update-purchase') ? () => handleEdit(purchase.id) : undefined
                      }
                      onDelete={
                        hasPermission('delete-purchase') ? () => handleDelete(purchase) : undefined
                      }
                      deleteTooltip="Void"
                    />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      {selectedPurchase && (
        <VoidPurchaseModal
          isOpen={isVoidModalOpen}
          onClose={handleCloseModal}
          onPurchaseVoided={onAction}
          purchase={selectedPurchase}
        />
      )}
    </div>
  );
}
