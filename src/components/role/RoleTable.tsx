'use client';

import { Table, TableBody, TableCell, TableHeader, TableRow } from '../ui/table';
import { useState } from 'react';
import DeleteRoleModal from './DeleteRoleModal';
import {
  ChevronsUpDown,
  ArrowUpWideNarrow,
  ArrowDownNarrowWide,
  Edit,
  Trash2,
  RefreshCw,
} from 'lucide-react';
import { restoreRole } from '../../services/RoleService';
import { toast } from 'sonner';
import Button from '../ui/button/Button';
import Tooltip from '../ui/tooltip/Tooltip';
import { Role } from '../../types';
import { useRouter } from 'next/navigation';

import { formatKebabCase } from '../../utils/string';

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
}: Props) {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const router = useRouter();

  const handleEdit = (role: Role) => {
    router.push(`/roles/edit/${role.id}`);
  };

  const handleDelete = (role: Role) => {
    setSelectedRole(role);
    setIsDeleteModalOpen(true);
  };

  const handleCloseModals = () => {
    setIsDeleteModalOpen(false);
    setSelectedRole(null);
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
                className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                Actions
              </TableCell>
            </TableRow>
          </TableHeader>

          <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
            {data.map((role, index) => (
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
                <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                  {role.name !== 'admin' && (
                    <div className="flex items-center gap-2">
                      {viewMode === 'active' ? (
                        <>
                          <Tooltip text="Edit">
                            <Button
                              size="xs"
                              onClick={() => handleEdit(role)}
                              className="bg-blue-600 hover:bg-blue-700 text-white"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                          </Tooltip>
                          <Tooltip text="Delete">
                            <Button
                              size="xs"
                              onClick={() => handleDelete(role)}
                              className="bg-red-600 hover:bg-red-700 text-white"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </Tooltip>
                        </>
                      ) : (
                        <>
                          <Tooltip text="Restore">
                            <Button
                              size="xs"
                              onClick={() => handleRestore(role.id)}
                              className="bg-green-600 hover:bg-green-700 text-white"
                            >
                              <RefreshCw className="w-4 h-4" />
                            </Button>
                          </Tooltip>
                          <Tooltip text="Delete Permanently">
                            <Button
                              size="xs"
                              onClick={() => handleDelete(role)}
                              className="bg-red-600 hover:bg-red-700 text-white"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </Tooltip>
                        </>
                      )}
                    </div>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      {selectedRole && (
        <DeleteRoleModal
          isOpen={isDeleteModalOpen}
          onClose={handleCloseModals}
          onRoleDeleted={onAction}
          role={selectedRole}
          force={viewMode === 'trashed'}
        />
      )}
    </div>
  );
}
