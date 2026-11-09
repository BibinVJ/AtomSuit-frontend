'use client';

import { useState } from 'react';
import { Table, TableBody, TableCell, TableHeader, TableRow } from '@/components/ui/table';
import Badge from '@/components/ui/badge/Badge';
import {
  ChevronsUpDown,
  ArrowUpWideNarrow,
  ArrowDownNarrowWide,
  Send,
  CheckCircle,
  PackageCheck,
  ReceiptText,
} from 'lucide-react';
import { TableActions } from '@/components/common/TableActions';
import ConfirmModal from '@/components/common/ConfirmModal';
import SkeletonTable from '@/components/common/SkeletonTable';
import Tooltip from '@/components/ui/tooltip/Tooltip';
import Button from '@/components/ui/button/Button';

import { SalesOrder, SalesOrderStatus } from '@/types/SalesOrder';
import { isApiError } from '@/utils/errors';
import { updateSalesOrderStatus } from '@/services/SalesOrderService';
import { toast } from 'sonner';

interface Props {
  data: SalesOrder[];
  onAction: () => void;
  onSort: (column: string) => void;
  sortBy: string;
  sortDirection: string;
  currentPage: number;
  perPage: number;
  startIndex?: number;
  loading?: boolean;
  viewMode?: 'active' | 'trashed';
  onRestore?: (id: number) => void;
}

import { usePermissions } from '@/hooks/usePermissions';
import { useSettings } from '@/hooks/useSettings';

export default function SalesOrderTable({
  data,
  onAction,
  onSort,
  sortBy,
  sortDirection,
  currentPage,
  perPage,
  startIndex,
  loading,
  viewMode = 'active',
  onRestore,
}: Props) {
  const { hasPermission } = usePermissions();
  const { formatCurrency, formatDate } = useSettings();
  const [confirmTarget, setConfirmTarget] = useState<SalesOrder | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [isUpdating, setIsUpdating] = useState<number | null>(null);

  const handleQuickStatus = async (id: number, newStatus: SalesOrderStatus) => {
    try {
      setIsUpdating(id);
      await updateSalesOrderStatus(id, newStatus);
      toast.success(`Sales Order marked as ${newStatus}`);
      onAction();
    } catch (error: unknown) {
      let message = 'Failed to update status';
      if (isApiError(error)) {
        message = error.response?.data?.message || message;
      }
      toast.error(message);
    } finally {
      setIsUpdating(null);
    }
  };

  const isTrashed = viewMode === 'trashed';

  const handleDeleteConfirm = async () => {
    if (!confirmTarget) return;
    setIsDeleting(true);
    const { deleteSalesOrder } = await import('@/services/SalesOrderService');
    try {
      await deleteSalesOrder(confirmTarget.id, isTrashed);
      toast.success(isTrashed ? 'Sales Order permanently deleted' : 'Sales Order moved to trash');
      onAction();
    } catch (error: unknown) {
      console.error(error);
      let message = 'Failed to delete';
      if (isApiError(error)) {
        message = error.response?.data?.message || message;
      }
      toast.error(message);
    } finally {
      setIsDeleting(false);
      setConfirmTarget(null);
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
    <>
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
                  onClick={() => onSort('order_number')}
                >
                  Order # {renderSortIcon('order_number')}
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 cursor-pointer text-start text-theme-xs dark:text-gray-400"
                  onClick={() => onSort('order_date')}
                >
                  Order Date {renderSortIcon('order_date')}
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
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Total Amount
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
                  <TableCell colSpan={7} className="p-0">
                    <SkeletonTable rows={perPage} columns={7} />
                  </TableCell>
                </TableRow>
              ) : data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="px-5 py-10 text-center text-gray-500">
                    No sales orders found.
                  </TableCell>
                </TableRow>
              ) : (
                data.map((sale, index) => (
                  <TableRow key={sale.id}>
                    <TableCell className="px-5 py-4 sm:px-6 text-start">
                      <p className="font-medium text-gray-800 text-theme-sm dark:text-white/90">
                        {startIndex !== undefined
                          ? startIndex + index
                          : (currentPage - 1) * perPage + index + 1}
                      </p>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-800 text-start text-theme-sm dark:text-gray-400">
                      {sale.order_number}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-800 text-start text-theme-sm dark:text-gray-400">
                      {formatDate(sale.order_date)}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-800 text-start text-theme-sm dark:text-gray-400">
                      {sale.customer?.name}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-800 text-start text-theme-sm dark:text-gray-400">
                      {formatCurrency(sale.total_amount || 0)}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                      <Badge
                        size="sm"
                        color={
                          sale.status === 'CONFIRMED' || sale.status === 'COMPLETED'
                            ? 'success'
                            : sale.status === 'DRAFT'
                              ? 'warning'
                              : 'error'
                        }
                      >
                        {sale.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-end text-theme-sm dark:text-gray-400">
                      <TableActions
                        isTrashed={viewMode === 'trashed'}
                        customActions={
                          viewMode === 'active' && (
                            <>
                              {hasPermission('update-sales-order') && (
                                <>
                                  {sale.status === SalesOrderStatus.DRAFT && (
                                    <Tooltip text="Mark as Sent">
                                      <Button
                                        variant="ghost"
                                        size="xs"
                                        disabled={isUpdating === sale.id}
                                        onClick={() =>
                                          handleQuickStatus(sale.id, SalesOrderStatus.SENT)
                                        }
                                        className="text-gray-500 hover:text-blue-600"
                                      >
                                        <Send size={18} />
                                      </Button>
                                    </Tooltip>
                                  )}
                                  {(sale.status === SalesOrderStatus.DRAFT ||
                                    sale.status === SalesOrderStatus.SENT) && (
                                    <Tooltip text="Confirm Order">
                                      <Button
                                        variant="ghost"
                                        size="xs"
                                        disabled={isUpdating === sale.id}
                                        onClick={() =>
                                          handleQuickStatus(sale.id, SalesOrderStatus.CONFIRMED)
                                        }
                                        className="text-gray-500 hover:text-green-600"
                                      >
                                        <CheckCircle size={18} />
                                      </Button>
                                    </Tooltip>
                                  )}
                                </>
                              )}
                              {!sale.is_fully_delivered &&
                                hasPermission('create-delivery-note') &&
                                [
                                  SalesOrderStatus.CONFIRMED,
                                  SalesOrderStatus.PARTIALLY_DELIVERED,
                                ].includes(sale.status) && (
                                  <Tooltip text="Convert to Delivery Note">
                                    <Button
                                      variant="ghost"
                                      size="xs"
                                      href={`/delivery-notes/create?sales_order_id=${sale.id}`}
                                      className="text-gray-500 hover:text-blue-600"
                                    >
                                      <PackageCheck size={18} />
                                    </Button>
                                  </Tooltip>
                                )}
                              {!sale.is_fully_invoiced &&
                                hasPermission('create-sales-invoice') &&
                                [
                                  SalesOrderStatus.CONFIRMED,
                                  SalesOrderStatus.PARTIALLY_DELIVERED,
                                  SalesOrderStatus.DELIVERED,
                                ].includes(sale.status) && (
                                  <Tooltip text="Convert to Invoice">
                                    <Button
                                      variant="ghost"
                                      size="xs"
                                      href={`/sales-invoices/create?sales_order_id=${sale.id}`}
                                      className="text-gray-500 hover:text-green-600"
                                    >
                                      <ReceiptText size={18} />
                                    </Button>
                                  </Tooltip>
                                )}
                            </>
                          )
                        }
                        viewHref={
                          hasPermission('view-sales-order') ? `/sales-orders/${sale.id}` : undefined
                        }
                        editHref={
                          viewMode === 'active' &&
                          hasPermission('update-sales-order') &&
                          (sale.status === SalesOrderStatus.DRAFT ||
                            sale.status === SalesOrderStatus.SENT)
                            ? `/sales-orders/${sale.id}/edit`
                            : undefined
                        }
                        onDelete={
                          hasPermission('delete-sales-order')
                            ? () => setConfirmTarget(sale)
                            : undefined
                        }
                        onRestore={
                          viewMode === 'trashed' && hasPermission('update-sales-order') && onRestore
                            ? () => onRestore(sale.id)
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
      </div>

      <ConfirmModal
        isOpen={!!confirmTarget}
        onClose={() => setConfirmTarget(null)}
        onConfirm={handleDeleteConfirm}
        isLoading={isDeleting}
        title={isTrashed ? 'Permanently Delete Sales Order' : 'Delete Sales Order'}
        message={
          isTrashed
            ? `Are you sure you want to permanently delete Sales Order #${confirmTarget?.order_number}? This action cannot be undone.`
            : `Are you sure you want to move Sales Order #${confirmTarget?.order_number} to trash?`
        }
        confirmLabel={isTrashed ? 'Delete Permanently' : 'Delete'}
        variant="danger"
      />
    </>
  );
}
