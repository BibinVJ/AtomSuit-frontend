import { useState } from 'react';
import { Table, TableBody, TableCell, TableHeader, TableRow } from '@/components/ui/table';
import Badge from '@/components/ui/badge/Badge';
import { ChevronsUpDown, ArrowUpWideNarrow, ArrowDownNarrowWide } from 'lucide-react';
import { TableActions } from '@/components/common/TableActions';
import ConfirmModal from '@/components/common/ConfirmModal';
import { isApiError } from '@/utils/errors';
import { DebitNote } from '@/types/DebitNote';
import { usePermissions } from '@/hooks/usePermissions';
import { useSettings } from '@/hooks/useSettings';
import SkeletonTable from '@/components/common/SkeletonTable';
import { toast } from 'sonner';

interface Props {
  data: DebitNote[];
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

export default function DebitNoteTable({
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

  const [confirmTarget, setConfirmTarget] = useState<DebitNote | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const isVoided = viewMode === 'voided';

  const handleDeleteConfirm = async () => {
    if (!confirmTarget) return;
    setIsDeleting(true);
    const { default: DebitNoteService } = await import('@/services/DebitNoteService');
    try {
      await DebitNoteService.delete(confirmTarget.id);
      toast.success(isVoided ? 'Debit Note permanently deleted' : 'Debit Note voided successfully');
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
                  onClick={() => onSort('debit_note_number')}
                >
                  Debit Note # {renderSortIcon('debit_note_number')}
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
                  onClick={() => onSort('date')}
                >
                  Date {renderSortIcon('date')}
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
                  <TableCell colSpan={8} className="p-0">
                    <SkeletonTable rows={perPage} columns={8} />
                  </TableCell>
                </TableRow>
              ) : data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="px-5 py-10 text-center text-gray-500">
                    No debit notes found.
                  </TableCell>
                </TableRow>
              ) : (
                data.map((dn, index) => (
                  <TableRow key={dn.id}>
                    <TableCell className="px-5 py-4 sm:px-6 text-start">
                      <p className="font-medium text-gray-800 text-theme-sm dark:text-white/90">
                        {startIndex !== undefined
                          ? startIndex + index
                          : (currentPage - 1) * perPage + index + 1}
                      </p>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-800 text-start text-theme-sm dark:text-gray-400">
                      {dn.debit_note_number}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-800 text-start text-theme-sm dark:text-gray-400">
                      {dn.purchase_invoice?.invoice_number ?? (
                        <span
                          className="text-gray-400 dark:text-gray-500"
                          title="no invoice — direct debit note"
                        >
                          &mdash;
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-800 text-start text-theme-sm dark:text-gray-400">
                      {formatDate(dn.date)}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-800 text-start text-theme-sm dark:text-gray-400">
                      {dn.vendor?.name}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-800 text-start text-theme-sm dark:text-gray-400">
                      {formatCurrency(dn.total_amount || 0)}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                      <Badge size="sm" color={dn.status === 'POSTED' ? 'success' : 'error'}>
                        {dn.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-end text-theme-sm dark:text-gray-400">
                      <TableActions
                        isTrashed={isVoided}
                        viewHref={
                          hasPermission('view-debit-note') ? `/debit-notes/${dn.id}` : undefined
                        }
                        deleteTooltip={isVoided ? 'Permanently Delete' : 'Void'}
                        onDelete={
                          hasPermission('delete-debit-note')
                            ? () => setConfirmTarget(dn)
                            : undefined
                        }
                        onRestore={
                          isVoided && hasPermission('update-debit-note') && onRestore
                            ? () => onRestore(dn.id)
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
        title={isVoided ? 'Permanently Delete Debit Note' : 'Void Debit Note'}
        message={
          isVoided
            ? `Are you sure you want to permanently delete Debit Note #${confirmTarget?.debit_note_number}? This action cannot be undone.`
            : `Are you sure you want to void Debit Note #${confirmTarget?.debit_note_number}? This will mark the document as voided.`
        }
        confirmLabel={isVoided ? 'Delete Permanently' : 'Void Debit Note'}
        variant={isVoided ? 'danger' : 'warning'}
      />
    </>
  );
}
