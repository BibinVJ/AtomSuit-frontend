'use client';

import { Table, TableBody, TableCell, TableHeader, TableRow } from '@/components/ui/table';
import { useState } from 'react';
import EditAccountGroupModal from './EditAccountGroupModal';
import DeleteAccountGroupModal from './DeleteAccountGroupModal';
import { ChevronsUpDown, ArrowUpWideNarrow, ArrowDownNarrowWide } from 'lucide-react';
import { restoreAccountGroup } from '@/services/AccountGroupService';
import { toast } from 'sonner';
import { TableActions } from '@/components/common/TableActions';
import { AccountGroup } from '@/types';
import { usePermissions } from '@/hooks/usePermissions';

interface Props {
  data: AccountGroup[];
  onAction: () => void;
  onSort: (column: string) => void;
  sortBy: string;
  sortDirection: string;
  currentPage: number;
  perPage: number;
  startIndex?: number;
  viewMode?: 'active' | 'trashed';
}

export default function AccountGroupTable({
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
  const [selectedGroup, setSelectedGroup] = useState<AccountGroup | null>(null);

  const handleEdit = (group: AccountGroup) => {
    setSelectedGroup(group);
    setIsEditModalOpen(true);
  };

  const handleDelete = (group: AccountGroup) => {
    setSelectedGroup(group);
    setIsDeleteModalOpen(true);
  };

  const handleCloseModals = () => {
    setIsEditModalOpen(false);
    setIsDeleteModalOpen(false);
    setSelectedGroup(null);
  };

  const handleRestore = async (id: number) => {
    try {
      await restoreAccountGroup(id);
      toast.success('Account Group restored successfully');
      onAction();
    } catch (error) {
      console.error('Error restoring account group:', error);
      toast.error('Failed to restore account group');
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
                onClick={() => onSort('name')}
              >
                Name {renderSortIcon('name')}
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
                className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                Type
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                Parent
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
            {data.map((group, index) => (
              <TableRow key={group.id}>
                <TableCell className="px-5 py-4 sm:px-6 text-start">
                  <p className="font-medium text-gray-800 text-theme-sm dark:text-white/90">
                    {startIndex !== undefined
                      ? startIndex + index
                      : (currentPage - 1) * perPage + index + 1}
                  </p>
                </TableCell>
                <TableCell className="px-5 py-4 sm:px-6 text-start">
                  <p className="font-medium text-gray-800 text-theme-sm dark:text-white/90">
                    {group.name}
                  </p>
                </TableCell>
                <TableCell className="px-5 py-4 sm:px-6 text-start">
                  <p className="text-gray-500 text-theme-sm dark:text-gray-400">
                    {group.code || '-'}
                  </p>
                </TableCell>
                <TableCell className="px-5 py-4 sm:px-6 text-start">
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 dark:bg-white/10 dark:text-white">
                    {group.account_type?.name}
                  </span>
                </TableCell>
                <TableCell className="px-5 py-4 sm:px-6 text-start">
                  {group.parent ? (
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                        group.parent.deleted_at
                          ? 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-500'
                          : 'bg-gray-100 text-gray-800 dark:bg-white/10 dark:text-white'
                      }`}
                    >
                      {group.parent.name}
                      {group.parent.deleted_at ? ' (Deleted)' : ''}
                    </span>
                  ) : (
                    <span className="text-gray-500 text-theme-sm dark:text-gray-400">-</span>
                  )}
                </TableCell>
                <TableCell className="px-4 py-3 text-gray-500 text-end text-theme-sm dark:text-gray-400">
                  <TableActions
                    isTrashed={viewMode === 'trashed'}
                    onEdit={
                      hasPermission('update-account-group') ? () => handleEdit(group) : undefined
                    }
                    onDelete={
                      hasPermission('delete-account-group') ? () => handleDelete(group) : undefined
                    }
                    onRestore={
                      hasPermission('update-account-group')
                        ? () => handleRestore(group.id)
                        : undefined
                    }
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      {selectedGroup && (
        <>
          <EditAccountGroupModal
            isOpen={isEditModalOpen}
            onClose={handleCloseModals}
            onSuccess={onAction}
            accountGroup={selectedGroup}
          />
          <DeleteAccountGroupModal
            isOpen={isDeleteModalOpen}
            onClose={handleCloseModals}
            onSuccess={onAction}
            accountGroup={selectedGroup}
            force={viewMode === 'trashed'}
          />
        </>
      )}
    </div>
  );
}
