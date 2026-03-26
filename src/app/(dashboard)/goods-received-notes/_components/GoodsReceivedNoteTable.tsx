'use client';

import { Table, TableBody, TableCell, TableHeader, TableRow } from '@/components/ui/table';
import Badge from '@/components/ui/badge/Badge';
import { ChevronsUpDown, ArrowUpWideNarrow, ArrowDownNarrowWide } from 'lucide-react';
import { TableActions } from '@/components/common/TableActions';
import { useRouter } from 'next/navigation';

import { isApiError } from '@/utils/errors';
import { GoodsReceivedNote } from '@/types/GoodsReceivedNote';
import { usePermissions } from '@/hooks/usePermissions';
import { useSettings } from '@/hooks/useSettings';

interface Props {
  data: GoodsReceivedNote[];
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

export default function GoodsReceivedNoteTable({
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
    router.push(`/goods-received-notes/${id}`);
  };

  const handleEdit = (id: number) => {
    router.push(`/goods-received-notes/${id}/edit`);
  };

  const handleDelete = async (grn: GoodsReceivedNote) => {
    const isTrashed = viewMode === 'trashed';
    const message = isTrashed
      ? 'Are you sure you want to permanently delete this GRN? This action cannot be undone.'
      : 'Are you sure you want to void this GRN?';

    if (confirm(message)) {
      const { default: GoodsReceivedNoteService } =
        await import('@/services/GoodsReceivedNoteService');
      try {
        await GoodsReceivedNoteService.delete(grn.id, isTrashed);
        onAction(); // Refresh
      } catch (error: unknown) {
        console.error(error);
        let message = 'Failed to delete';
        if (isApiError(error)) {
          message = error.response?.data?.message || message;
        }
        alert(message);
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
                onClick={() => onSort('grn_number')}
              >
                GRN # {renderSortIcon('grn_number')}
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-3 font-medium text-gray-500 cursor-pointer text-start text-theme-xs dark:text-gray-400"
                onClick={() => onSort('received_date')}
              >
                Received Date {renderSortIcon('received_date')}
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
                    <p className="text-gray-500">Loading GRNs...</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="px-5 py-10 text-center text-gray-500">
                  No Goods Received Notes found.
                </TableCell>
              </TableRow>
            ) : (
              data.map((grn, index) => (
                <TableRow key={grn.id}>
                  <TableCell className="px-5 py-4 sm:px-6 text-start">
                    <p className="font-medium text-gray-800 text-theme-sm dark:text-white/90">
                      {startIndex !== undefined
                        ? startIndex + index
                        : (currentPage - 1) * perPage + index + 1}
                    </p>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-800 text-start text-theme-sm dark:text-gray-400">
                    {grn.grn_number}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-800 text-start text-theme-sm dark:text-gray-400">
                    {formatDate(grn.received_date)}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-800 text-start text-theme-sm dark:text-gray-400">
                    {grn.vendor?.name}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-800 text-start text-theme-sm dark:text-gray-400">
                    {formatCurrency(grn.total_amount || 0)}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    <Badge size="sm" color={grn.status === 'RECEIVED' ? 'success' : 'error'}>
                      {grn.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-end text-theme-sm dark:text-gray-400">
                    <TableActions
                      isTrashed={viewMode === 'trashed'}
                      onView={hasPermission('view-grn') ? () => handleView(grn.id) : undefined}
                      onEdit={
                        viewMode === 'active' && hasPermission('update-grn')
                          ? () => handleEdit(grn.id)
                          : undefined
                      }
                      onDelete={hasPermission('delete-grn') ? () => handleDelete(grn) : undefined}
                      onRestore={
                        viewMode === 'trashed' && hasPermission('update-grn') && onRestore
                          ? () => onRestore(grn.id)
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
