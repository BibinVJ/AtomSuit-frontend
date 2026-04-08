'use client';

import { Table, TableBody, TableCell, TableHeader, TableRow } from '@/components/ui/table';
import { useState } from 'react';
import ConfirmModal from '@/components/common/ConfirmModal';
import { ChevronsUpDown, ArrowUpWideNarrow, ArrowDownNarrowWide } from 'lucide-react';
import { restoreRole, deleteRole } from '@/services/RoleService';
import { toast } from 'sonner';
import { isApiError } from '@/utils/errors';
import { TableActions } from '@/components/common/TableActions';
import { Role } from '@/types';
import { useRouter } from 'next/navigation';
import SkeletonTable from '@/components/common/SkeletonTable';

import { formatKebabCase } from '@/utils/string';

interface Props {
  data: Role[];
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

export default function RoleTable({
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
  const selectedRole = null; // Removed selectedRole entirely, keeping just for syntax, wait, no, confirmTarget is needed
  const [confirmTarget, setConfirmTarget] = useState<Role | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const isTrashed = viewMode === 'trashed';

  const handleEdit = (role: Role) => {
    router.push(`/roles/${role.id}/edit`);
  };

  const handleDeleteConfirm = async () => {
    if (!confirmTarget) return;
    setIsDeleting(true);
    try {
      await deleteRole(confirmTarget.id, isTrashed);
      toast.success(isTrashed ? 'Role permanently deleted' : 'Role deleted successfully');
      onAction();
    } catch (error: unknown) {
      let message = 'Failed to delete role';
      if (isApiError(error)) {
        message = error.response?.data?.message || message;
      }
      toast.error(message);
    } finally {
      setIsDeleting(false);
      setConfirmTarget(null);
    }
  };

  const handleRestore = async (id: number) => {
    try {
      await restoreRole(id);
      toast.success('Role restored successfully');
      onAction();
    } catch (error) {
      console.error('Error restoring role:', error);
      toast.error('Failed to restore role');
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
                className="px-5 py-3 font-medium text-gray-500 text-end text-theme-xs dark:text-gray-400"
              >
                Actions
              </TableCell>
            </TableRow>
          </TableHeader>

          <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
            {loading ? (
              <TableRow>
                <TableCell colSpan={3} className="p-0">
                  <SkeletonTable rows={perPage} columns={3} />
                </TableCell>
              </TableRow>
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="px-5 py-10 text-center text-gray-500">
                  No roles found.
                </TableCell>
              </TableRow>
            ) : (
              data.map((role, index) => (
                <TableRow key={role.id}>
                  <TableCell className="px-5 py-4 sm:px-6 text-start">
                    <p className="font-medium text-gray-800 text-theme-sm dark:text-white/90">
                      {startIndex !== undefined
                        ? startIndex + index
                        : (currentPage - 1) * perPage + index + 1}
                    </p>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-800 text-start text-theme-sm dark:text-gray-400">
                    {formatKebabCase(role.name)}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-end text-theme-sm dark:text-gray-400">
                    {role.name !== 'admin' && (
                      <TableActions
                        isTrashed={viewMode === 'trashed'}
                        onEdit={() => handleEdit(role)}
                        onDelete={() => setConfirmTarget(role)}
                        onRestore={() => handleRestore(role.id)}
                      />
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      <ConfirmModal
        isOpen={!!confirmTarget}
        onClose={() => setConfirmTarget(null)}
        onConfirm={handleDeleteConfirm}
        isLoading={isDeleting}
        title={isTrashed ? 'Permanently Delete Role' : 'Delete Role'}
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
