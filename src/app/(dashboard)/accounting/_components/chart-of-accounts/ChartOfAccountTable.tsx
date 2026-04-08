'use client';

import { Table, TableBody, TableCell, TableHeader, TableRow } from '@/components/ui/table';
import { useState } from 'react';
import EditChartOfAccountModal from './EditChartOfAccountModal';
import ConfirmModal from '@/components/common/ConfirmModal';
import { ChevronsUpDown, ArrowUpWideNarrow, ArrowDownNarrowWide } from 'lucide-react';
import { restoreChartOfAccount, deleteChartOfAccount } from '@/services/ChartOfAccountService';
import { toast } from 'sonner';
import { isApiError } from '@/utils/errors';
import { TableActions } from '@/components/common/TableActions';
import { ChartOfAccount } from '@/types';
import { usePermissions } from '@/hooks/usePermissions';
import SkeletonTable from '@/components/common/SkeletonTable';

interface Props {
  data: ChartOfAccount[];
  onAction: () => void;
  onSort: (column: string) => void;
  sortBy: string;
  sortDirection: string;
  currentPage: number;
  perPage: number;
  startIndex?: number;
  viewMode?: 'active' | 'trashed';
  loading?: boolean;
}

export default function ChartOfAccountTable({
  data,
  onAction,
  onSort,
  sortBy,
  sortDirection,
  currentPage,
  perPage,
  startIndex,
  viewMode = 'active',
  loading,
}: Props) {
  const { hasPermission } = usePermissions();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<ChartOfAccount | null>(null);
  const [confirmTarget, setConfirmTarget] = useState<ChartOfAccount | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const isTrashed = viewMode === 'trashed';

  const handleEdit = (account: ChartOfAccount) => {
    setSelectedAccount(account);
    setIsEditModalOpen(true);
  };

  const handleDelete = (account: ChartOfAccount) => {
    setConfirmTarget(account);
  };

  const handleDeleteConfirm = async () => {
    if (!confirmTarget) return;
    setIsDeleting(true);
    try {
      await deleteChartOfAccount(confirmTarget.id, isTrashed);
      toast.success(isTrashed ? 'Account permanently deleted' : 'Account deleted successfully');
      onAction();
    } catch (error: unknown) {
      let message = 'Failed to delete account';
      if (isApiError(error)) {
        message = error.response?.data?.message || message;
      }
      toast.error(message);
    } finally {
      setIsDeleting(false);
      setConfirmTarget(null);
    }
  };

  const handleCloseModals = () => {
    setIsEditModalOpen(false);
    setSelectedAccount(null);
  };

  const handleRestore = async (id: number) => {
    try {
      await restoreChartOfAccount(id);
      toast.success('Account restored successfully');
      onAction();
    } catch (error) {
      console.error('Error restoring account:', error);
      toast.error('Failed to restore account');
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
                onClick={() => onSort('code')}
              >
                Code {renderSortIcon('code')}
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-3 font-medium text-gray-500 cursor-pointer text-start text-theme-xs dark:text-gray-400"
                onClick={() => onSort('name')}
              >
                Name {renderSortIcon('name')}
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                Group
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                Balance
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
                <TableCell colSpan={6} className="p-0">
                  <SkeletonTable rows={perPage} columns={6} />
                </TableCell>
              </TableRow>
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="px-5 py-10 text-center text-gray-500">
                  No accounts found.
                </TableCell>
              </TableRow>
            ) : (
              data.map((account, index) => (
                <TableRow key={account.id}>
                  <TableCell className="px-5 py-4 sm:px-6 text-start">
                    <p className="font-medium text-gray-800 text-theme-sm dark:text-white/90">
                      {startIndex !== undefined
                        ? startIndex + index
                        : (currentPage - 1) * perPage + index + 1}
                    </p>
                  </TableCell>
                  <TableCell className="px-5 py-4 sm:px-6 text-start">
                    <p className="font-medium text-gray-800 text-theme-sm dark:text-white/90">
                      {account.code}
                    </p>
                  </TableCell>
                  <TableCell className="px-5 py-4 sm:px-6 text-start">
                    <p className="font-medium text-gray-800 text-theme-sm dark:text-white/90">
                      {account.name}
                    </p>
                  </TableCell>
                  <TableCell className="px-5 py-4 sm:px-6 text-start">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                        account.account_group?.deleted_at
                          ? 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-500'
                          : 'bg-gray-100 text-gray-800 dark:bg-white/10 dark:text-white'
                      }`}
                    >
                      {account.account_group?.name}
                      {account.account_group?.deleted_at ? ' (Deleted)' : ''}
                    </span>
                  </TableCell>
                  <TableCell className="px-5 py-4 sm:px-6 text-start">
                    <p className="text-gray-500 text-theme-sm dark:text-gray-400">
                      {new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: 'USD',
                      }).format(account.opening_balance)}
                    </p>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-end text-theme-sm dark:text-gray-400">
                    <TableActions
                      isTrashed={viewMode === 'trashed'}
                      onEdit={
                        hasPermission('update-chart-of-account')
                          ? () => handleEdit(account)
                          : undefined
                      }
                      onDelete={
                        hasPermission('delete-chart-of-account')
                          ? () => handleDelete(account)
                          : undefined
                      }
                      onRestore={
                        hasPermission('update-chart-of-account')
                          ? () => handleRestore(account.id)
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
      {selectedAccount && (
        <>
          <EditChartOfAccountModal
            isOpen={isEditModalOpen}
            onClose={handleCloseModals}
            onSuccess={onAction}
            chartOfAccount={selectedAccount}
          />
        </>
      )}

      <ConfirmModal
        isOpen={!!confirmTarget}
        onClose={() => setConfirmTarget(null)}
        onConfirm={handleDeleteConfirm}
        isLoading={isDeleting}
        title={isTrashed ? 'Permanently Delete Account' : 'Delete Account'}
        message={
          isTrashed
            ? `Are you sure you want to permanently delete "${confirmTarget?.name}"? This action cannot be undone.`
            : `Are you sure you want to delete "${confirmTarget?.name}"? You can restore it later from the trash.`
        }
        confirmLabel={isTrashed ? 'Delete Permanently' : 'Delete'}
        variant="danger"
      />
    </div>
  );
}
