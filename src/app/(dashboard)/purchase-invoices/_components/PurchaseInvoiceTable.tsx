'use client';

import { Table, TableBody, TableCell, TableHeader, TableRow } from '@/components/ui/table';
import Badge from '@/components/ui/badge/Badge';
import { ChevronsUpDown, ArrowUpWideNarrow, ArrowDownNarrowWide } from 'lucide-react';
import { TableActions } from '@/components/common/TableActions';
import { useRouter } from 'next/navigation';

import { PurchaseInvoice } from '@/types/PurchaseInvoice';
import { usePermissions } from '@/hooks/usePermissions';
import { useSettings } from '@/hooks/useSettings';

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
  viewMode?: 'active' | 'trashed';
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
  const router = useRouter();

  const handleView = (id: number) => {
    router.push(`/purchase-invoices/${id}`);
  };

  const handleEdit = (id: number) => {
    router.push(`/purchase-invoices/${id}/edit`);
  };

  const handleDelete = async (invoice: PurchaseInvoice) => {
    const isTrashed = viewMode === 'trashed';
    const message = isTrashed
      ? 'Are you sure you want to permanently delete this Purchase Invoice? This action cannot be undone.'
      : 'Are you sure you want to void this Purchase Invoice?';

    if (confirm(message)) {
      const { default: PurchaseInvoiceService } = await import('@/services/PurchaseInvoiceService');
      try {
        await PurchaseInvoiceService.delete(invoice.id, isTrashed);
        onAction(); // Refresh
      } catch (error: any) {
        console.error(error);
        alert(error.response?.data?.message || 'Failed to delete');
      }
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
                <TableCell colSpan={7} className="px-5 py-10 text-center">
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-gray-500">Loading purchase invoices...</p>
                  </div>
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
                      isTrashed={viewMode === 'trashed'}
                      onView={
                        hasPermission('view-purchase-invoice')
                          ? () => handleView(invoice.id)
                          : undefined
                      }
                      onEdit={
                        viewMode === 'active' && hasPermission('update-purchase-invoice')
                          ? () => handleEdit(invoice.id)
                          : undefined
                      }
                      onDelete={
                        hasPermission('delete-purchase-invoice')
                          ? () => handleDelete(invoice)
                          : undefined
                      }
                      onRestore={
                        viewMode === 'trashed' &&
                        hasPermission('update-purchase-invoice') &&
                        onRestore
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
  );
}
