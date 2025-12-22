'use client';

import { Table, TableBody, TableCell, TableHeader, TableRow } from '../../ui/table';
import { useState } from 'react';
import EditChartOfAccountModal from './EditChartOfAccountModal';
import DeleteChartOfAccountModal from './DeleteChartOfAccountModal';
import { ChevronsUpDown, ArrowUpWideNarrow, ArrowDownNarrowWide } from 'lucide-react';
import { restoreChartOfAccount } from '../../../services/ChartOfAccountService';
import { toast } from 'sonner';
import { TableActions } from '../../common/TableActions';
import { ChartOfAccount } from '../../../types';
import { usePermissions } from '../../../hooks/usePermissions';
import Badge from '../../ui/badge/Badge';

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
}: Props) {
  const { hasPermission } = usePermissions();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<ChartOfAccount | null>(null);

  const handleEdit = (account: ChartOfAccount) => {
    setSelectedAccount(account);
    setIsEditModalOpen(true);
  };

  const handleDelete = (account: ChartOfAccount) => {
    setSelectedAccount(account);
    setIsDeleteModalOpen(true);
  };

  const handleCloseModals = () => {
    setIsEditModalOpen(false);
    setIsDeleteModalOpen(false);
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
            {data.map((account, index) => (
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
                    {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(
                      account.opening_balance
                    )}
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
            ))}
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
          <DeleteChartOfAccountModal
            isOpen={isDeleteModalOpen}
            onClose={handleCloseModals}
            onSuccess={onAction}
            chartOfAccount={selectedAccount}
            force={viewMode === 'trashed'}
          />
        </>
      )}
    </div>
  );
}
