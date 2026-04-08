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
} from 'lucide-react';
import { TableActions } from '@/components/common/TableActions';
import ConfirmModal from '@/components/common/ConfirmModal';
import { useRouter } from 'next/navigation';
import SkeletonTable from '@/components/common/SkeletonTable';
import Tooltip from '@/components/ui/tooltip/Tooltip';
import Button from '@/components/ui/button/Button';

import { PurchaseOrder, PurchaseOrderStatus } from '@/types/PurchaseOrder';
import { isApiError } from '@/utils/errors';
import { updatePurchaseOrderStatus } from '@/services/PurchaseOrderService';
import { toast } from 'sonner';

interface Props {
  data: PurchaseOrder[];
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

export default function PurchaseOrderTable({
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
  const router = useRouter();
  const [confirmTarget, setConfirmTarget] = useState<PurchaseOrder | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [isUpdating, setIsUpdating] = useState<number | null>(null);

  const handleQuickStatus = async (id: number, newStatus: PurchaseOrderStatus) => {
    try {
      setIsUpdating(id);
      await updatePurchaseOrderStatus(id, newStatus);
      toast.success(`Purchase Order marked as ${newStatus}`);
      onAction();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update status');
    } finally {
      setIsUpdating(null);
    }
  };

  const isTrashed = viewMode === 'trashed';

  const handleDeleteConfirm = async () => {
    if (!confirmTarget) return;
    setIsDeleting(true);
    const { deletePurchaseOrder } = await import('@/services/PurchaseOrderService');
    try {
      await deletePurchaseOrder(confirmTarget.id, isTrashed);
      toast.success(
        isTrashed ? 'Purchase Order permanently deleted' : 'Purchase Order moved to trash'
      );
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
                  onClick={() => onSort('vendor_id')}
                >
                  Vendor {renderSortIcon('vendor_id')}
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
                    No purchase orders found.
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
                      {purchase.order_number}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-800 text-start text-theme-sm dark:text-gray-400">
                      {formatDate(purchase.order_date)}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-800 text-start text-theme-sm dark:text-gray-400">
                      {purchase.vendor?.name}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-800 text-start text-theme-sm dark:text-gray-400">
                      {formatCurrency(purchase.total_amount || 0)}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                      <Badge
                        size="sm"
                        color={
                          purchase.status === 'CONFIRMED' || purchase.status === 'COMPLETED'
                            ? 'success'
                            : purchase.status === 'DRAFT'
                              ? 'warning'
                              : 'error'
                        }
                      >
                        {purchase.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-end text-theme-sm dark:text-gray-400">
                      <TableActions
                        isTrashed={viewMode === 'trashed'}
                        customActions={
                          viewMode === 'active' &&
                          hasPermission('update-purchase-order') && (
                            <>
                              {purchase.status === PurchaseOrderStatus.DRAFT && (
                                <Tooltip text="Mark as Sent">
                                  <Button
                                    variant="ghost"
                                    size="xs"
                                    disabled={isUpdating === purchase.id}
                                    onClick={() =>
                                      handleQuickStatus(purchase.id, PurchaseOrderStatus.SENT)
                                    }
                                    className="text-gray-500 hover:text-blue-600"
                                  >
                                    <Send size={18} />
                                  </Button>
                                </Tooltip>
                              )}
                              {(purchase.status === PurchaseOrderStatus.DRAFT ||
                                purchase.status === PurchaseOrderStatus.SENT) && (
                                <Tooltip text="Confirm Order">
                                  <Button
                                    variant="ghost"
                                    size="xs"
                                    disabled={isUpdating === purchase.id}
                                    onClick={() =>
                                      handleQuickStatus(purchase.id, PurchaseOrderStatus.CONFIRMED)
                                    }
                                    className="text-gray-500 hover:text-green-600"
                                  >
                                    <CheckCircle size={18} />
                                  </Button>
                                </Tooltip>
                              )}
                            </>
                          )
                        }
                        viewHref={
                          hasPermission('view-purchase-order')
                            ? `/purchase-orders/${purchase.id}`
                            : undefined
                        }
                        editHref={
                          viewMode === 'active' && hasPermission('update-purchase-order')
                            ? `/purchase-orders/${purchase.id}/edit`
                            : undefined
                        }
                        onDelete={
                          hasPermission('delete-purchase-order')
                            ? () => setConfirmTarget(purchase)
                            : undefined
                        }
                        onRestore={
                          viewMode === 'trashed' &&
                          hasPermission('update-purchase-order') &&
                          onRestore
                            ? () => onRestore(purchase.id)
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
        title={isTrashed ? 'Permanently Delete Purchase Order' : 'Delete Purchase Order'}
        message={
          isTrashed
            ? `Are you sure you want to permanently delete Purchase Order #${confirmTarget?.order_number}? This action cannot be undone.`
            : `Are you sure you want to move Purchase Order #${confirmTarget?.order_number} to trash?`
        }
        confirmLabel={isTrashed ? 'Delete Permanently' : 'Delete'}
        variant="danger"
      />
    </>
  );
}
