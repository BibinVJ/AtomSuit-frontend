'use client';

import { useState } from 'react';
import { Table, TableBody, TableCell, TableHeader, TableRow } from '@/components/ui/table';
import Badge from '@/components/ui/badge/Badge';
import { ChevronsUpDown, ArrowUpWideNarrow, ArrowDownNarrowWide } from 'lucide-react';
import { TableActions } from '@/components/common/TableActions';
import ConfirmModal from '@/components/common/ConfirmModal';

import { isApiError } from '@/utils/errors';
import { PurchaseInvoice } from '@/types/PurchaseInvoice';
import { usePermissions } from '@/hooks/usePermissions';
import { useSettings } from '@/hooks/useSettings';
import SkeletonTable from '@/components/common/SkeletonTable';
import { toast } from 'sonner';

interface Props {
  data: PurchaseInvoice[];
  onAction: () => void;
  onSort: (column: string) => void;
  sortBy: string;
  sortDirection: string;
  currentPage: number;
  perPage: number;
  startIndex?: number;
  loading?: boolean;
  viewMode?: 'active' | 'voided';
  onRestore?: (id: number) => void;
}

export default function PurchaseInvoiceTable({
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

  const [confirmTarget, setConfirmTarget] = useState<PurchaseInvoice | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const isVoided = viewMode === 'voided';

  const handleDeleteConfirm = async () => {
    if (!confirmTarget) return;
    setIsDeleting(true);
    const { default: PurchaseInvoiceService } = await import('@/services/PurchaseInvoiceService');
    try {
      await PurchaseInvoiceService.delete(confirmTarget.id, isVoided);
      toast.success(isVoided ? 'Invoice permanently deleted' : 'Invoice voided successfully');
      onAction();
    } catch (error: unknown) {
      console.error(error);
      let message = isVoided ? 'Failed to delete' : 'Failed to void';
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
                  onClick={() => onSort('invoice_number')}
                >
                  Invoice # {renderSortIcon('invoice_number')}
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 cursor-pointer text-start text-theme-xs dark:text-gray-400"
                  onClick={() => onSort('posting_date')}
                >
                  Posting Date {renderSortIcon('posting_date')}
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
                    No purchase invoices found.
                  </TableCell>
                </TableRow>
              ) : (
                data.map((invoice, index) => (
                  <TableRow key={invoice.id}>
                    <TableCell className="px-5 py-4 sm:px-6 text-start">
                      <p className="font-medium text-gray-800 text-theme-sm dark:text-white/90">
                        {startIndex !== undefined
                          ? startIndex + index
                          : (currentPage - 1) * perPage + index + 1}
                      </p>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-800 text-start text-theme-sm dark:text-gray-400">
                      {invoice.invoice_number}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-800 text-start text-theme-sm dark:text-gray-400">
                      {formatDate(invoice.posting_date)}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-800 text-start text-theme-sm dark:text-gray-400">
                      {invoice.vendor?.name}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-800 text-start text-theme-sm dark:text-gray-400">
                      {formatCurrency(invoice.total_amount || 0)}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                      <Badge
                        size="sm"
                        color={
                          invoice.status === 'PAID'
                            ? 'success'
                            : invoice.status === 'POSTED' || invoice.status === 'PARTIALLY_PAID'
                              ? 'warning'
                              : 'error'
                        }
                      >
                        {invoice.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-end text-theme-sm dark:text-gray-400">
                      <TableActions
                        isTrashed={isVoided}
                        viewHref={
                          hasPermission('view-purchase-invoice')
                            ? `/purchase-invoices/${invoice.id}`
                            : undefined
                        }
                        deleteTooltip={isVoided ? 'Permanently Delete' : 'Void'}
                        onDelete={
                          hasPermission('delete-purchase-invoice')
                            ? () => setConfirmTarget(invoice)
                            : undefined
                        }
                        onRestore={
                          isVoided && hasPermission('update-purchase-invoice') && onRestore
                            ? () => onRestore(invoice.id)
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
        title={isVoided ? 'Permanently Delete Invoice' : 'Void Purchase Invoice'}
        message={
          isVoided
            ? `Are you sure you want to permanently delete Invoice #${confirmTarget?.invoice_number}? This action cannot be undone.`
            : `Are you sure you want to void Invoice #${confirmTarget?.invoice_number}? This will mark the document as voided.`
        }
        confirmLabel={isVoided ? 'Delete Permanently' : 'Void Invoice'}
        variant={isVoided ? 'danger' : 'warning'}
      />
    </>
  );
}
