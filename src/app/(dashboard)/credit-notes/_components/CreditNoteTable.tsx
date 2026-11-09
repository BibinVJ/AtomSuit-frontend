import { useState } from 'react';
import { Table, TableBody, TableCell, TableHeader, TableRow } from '@/components/ui/table';
import Badge from '@/components/ui/badge/Badge';
import { ChevronsUpDown, ArrowUpWideNarrow, ArrowDownNarrowWide } from 'lucide-react';
import { TableActions } from '@/components/common/TableActions';
import ConfirmModal from '@/components/common/ConfirmModal';
import { isApiError } from '@/utils/errors';
import { CreditNote } from '@/types/CreditNote';
import { usePermissions } from '@/hooks/usePermissions';
import { useSettings } from '@/hooks/useSettings';
import SkeletonTable from '@/components/common/SkeletonTable';
import { toast } from 'sonner';

interface Props {
  data: CreditNote[];
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

export default function CreditNoteTable({
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

  const [confirmTarget, setConfirmTarget] = useState<CreditNote | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const isVoided = viewMode === 'voided';

  const handleDeleteConfirm = async () => {
    if (!confirmTarget) return;
    setIsDeleting(true);
    const { default: CreditNoteService } = await import('@/services/CreditNoteService');
    try {
      await CreditNoteService.delete(confirmTarget.id);
      toast.success(
        isVoided ? 'Credit Note permanently deleted' : 'Credit Note voided successfully'
      );
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
                  onClick={() => onSort('credit_note_number')}
                >
                  Credit Note # {renderSortIcon('credit_note_number')}
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Invoice #
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 cursor-pointer text-start text-theme-xs dark:text-gray-400"
                  onClick={() => onSort('credit_note_date')}
                >
                  Date {renderSortIcon('credit_note_date')}
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
                  <TableCell colSpan={8} className="p-0">
                    <SkeletonTable rows={perPage} columns={8} />
                  </TableCell>
                </TableRow>
              ) : data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="px-5 py-10 text-center text-gray-500">
                    No credit notes found.
                  </TableCell>
                </TableRow>
              ) : (
                data.map((cn, index) => (
                  <TableRow key={cn.id}>
                    <TableCell className="px-5 py-4 sm:px-6 text-start">
                      <p className="font-medium text-gray-800 text-theme-sm dark:text-white/90">
                        {startIndex !== undefined
                          ? startIndex + index
                          : (currentPage - 1) * perPage + index + 1}
                      </p>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-800 text-start text-theme-sm dark:text-gray-400">
                      {cn.credit_note_number}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-800 text-start text-theme-sm dark:text-gray-400">
                      {cn.sales_invoice?.invoice_number ?? (
                        <span
                          className="text-gray-400 dark:text-gray-500"
                          title="no invoice — direct credit note"
                        >
                          &mdash;
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-800 text-start text-theme-sm dark:text-gray-400">
                      {formatDate(cn.credit_note_date)}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-800 text-start text-theme-sm dark:text-gray-400">
                      {cn.customer?.name}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-800 text-start text-theme-sm dark:text-gray-400">
                      {formatCurrency(cn.total_amount || 0)}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                      <Badge size="sm" color={cn.status === 'POSTED' ? 'success' : 'error'}>
                        {cn.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-end text-theme-sm dark:text-gray-400">
                      <TableActions
                        isTrashed={isVoided}
                        viewHref={
                          hasPermission('view-credit-note') ? `/credit-notes/${cn.id}` : undefined
                        }
                        deleteTooltip={isVoided ? 'Permanently Delete' : 'Void'}
                        onDelete={
                          hasPermission('delete-credit-note')
                            ? () => setConfirmTarget(cn)
                            : undefined
                        }
                        onRestore={
                          isVoided && hasPermission('update-credit-note') && onRestore
                            ? () => onRestore(cn.id)
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
        title={isVoided ? 'Permanently Delete Credit Note' : 'Void Credit Note'}
        message={
          isVoided
            ? `Are you sure you want to permanently delete Credit Note #${confirmTarget?.credit_note_number}? This action cannot be undone.`
            : `Are you sure you want to void Credit Note #${confirmTarget?.credit_note_number}? This will mark the document as voided.`
        }
        confirmLabel={isVoided ? 'Delete Permanently' : 'Void Credit Note'}
        variant={isVoided ? 'danger' : 'warning'}
      />
    </>
  );
}
