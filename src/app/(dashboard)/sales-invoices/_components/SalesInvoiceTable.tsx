'use client';

import { useState } from 'react';
import { Table, TableBody, TableCell, TableHeader, TableRow } from '@/components/ui/table';
import Badge from '@/components/ui/badge/Badge';
import {
  ChevronsUpDown,
  ArrowUpWideNarrow,
  ArrowDownNarrowWide,
  Banknote,
  Undo2,
} from 'lucide-react';
import { TableActions } from '@/components/common/TableActions';
import ConfirmModal from '@/components/common/ConfirmModal';
import { isApiError } from '@/utils/errors';
import { SalesInvoice } from '@/types/SalesInvoice';
import { usePermissions } from '@/hooks/usePermissions';
import { useSettings } from '@/hooks/useSettings';
import SkeletonTable from '@/components/common/SkeletonTable';
import Tooltip from '@/components/ui/tooltip/Tooltip';
import Button from '@/components/ui/button/Button';
import { toast } from 'sonner';

interface Props {
  data: SalesInvoice[];
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

export default function SalesInvoiceTable({
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

  const [confirmTarget, setConfirmTarget] = useState<SalesInvoice | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const isVoided = viewMode === 'voided';

  const handleDeleteConfirm = async () => {
    if (!confirmTarget) return;
    setIsDeleting(true);
    const { default: SalesInvoiceService } = await import('@/services/SalesInvoiceService');
    try {
      await SalesInvoiceService.delete(confirmTarget.id, isVoided);
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
                  onClick={() => onSort('invoice_date')}
                >
                  Invoice Date {renderSortIcon('invoice_date')}
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
                    No sales invoices found.
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
                      {formatDate(invoice.invoice_date)}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-800 text-start text-theme-sm dark:text-gray-400">
                      {invoice.customer?.name}
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
                        customActions={
                          !isVoided && (
                            <>
                              {invoice.status !== 'PAID' && (
                                <Tooltip text="Record Payment">
                                  <Button
                                    variant="ghost"
                                    size="xs"
                                    href={`/customer-payments/create?customer_id=${invoice.customer_id}`}
                                    className="text-gray-500 hover:text-green-600"
                                  >
                                    <Banknote size={18} />
                                  </Button>
                                </Tooltip>
                              )}
                              <Tooltip text="Create Credit Note">
                                <Button
                                  variant="ghost"
                                  size="xs"
                                  href={`/credit-notes/create?sales_invoice_id=${invoice.id}`}
                                  className="text-gray-500 hover:text-orange-500"
                                >
                                  <Undo2 size={18} />
                                </Button>
                              </Tooltip>
                            </>
                          )
                        }
                        viewHref={
                          hasPermission('view-sales-invoice')
                            ? `/sales-invoices/${invoice.id}`
                            : undefined
                        }
                        deleteTooltip={isVoided ? 'Permanently Delete' : 'Void'}
                        onDelete={
                          hasPermission('delete-sales-invoice')
                            ? () => setConfirmTarget(invoice)
                            : undefined
                        }
                        onRestore={
                          isVoided && hasPermission('update-sales-invoice') && onRestore
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
        title={isVoided ? 'Permanently Delete Invoice' : 'Void Sales Invoice'}
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
