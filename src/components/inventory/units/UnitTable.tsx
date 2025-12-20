'use client';

import { Table, TableBody, TableCell, TableHeader, TableRow } from '../../ui/table';
import { useState } from 'react';
import Badge from '../../ui/badge/Badge';
import EditUnitModal from './EditUnitModal';
import DeleteUnitModal from './DeleteUnitModal';
import {
  ChevronsUpDown,
  ArrowUpWideNarrow,
  ArrowDownNarrowWide,
  Edit,
  Trash2,
  RefreshCw,
} from 'lucide-react';
import { restoreUnit } from '../../../services/UnitService';
import { toast } from 'sonner';
import Button from '../../ui/button/Button';
import Tooltip from '../../ui/tooltip/Tooltip';

import { Unit } from '../../../types';

interface Props {
  data: Unit[];
  onAction: () => void;
  onSort: (column: string) => void;
  sortBy: string;
  sortDirection: string;
  currentPage: number;
  perPage: number;
  startIndex?: number;
  viewMode?: 'active' | 'trashed';
}

import { usePermissions } from '../../../hooks/usePermissions';

export default function UnitTable({
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
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);

  const handleEdit = (unit: Unit) => {
    setSelectedUnit(unit);
    setIsEditModalOpen(true);
  };

  const handleDelete = (unit: Unit) => {
    setSelectedUnit(unit);
    setIsDeleteModalOpen(true);
  };

  const handleCloseModals = () => {
    setIsEditModalOpen(false);
    setIsDeleteModalOpen(false);
    setSelectedUnit(null);
  };

  const handleRestore = async (id: number) => {
    try {
      await restoreUnit(id);
      toast.success('Unit restored successfully');
      onAction();
    } catch (error) {
      console.error('Error restoring unit:', error);
      toast.error('Failed to restore unit');
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
                className="px-5 py-3 font-medium text-gray-500 cursor-pointer text-start text-theme-xs dark:text-gray-400"
                onClick={() => onSort('description')}
              >
                Description {renderSortIcon('description')}
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
            {data.map((unit, index) => (
              <TableRow key={unit.id}>
                <TableCell className="px-5 py-4 sm:px-6 text-start">
                  <p className="font-medium text-gray-800 text-theme-sm dark:text-white/90">
                    {startIndex !== undefined
                      ? startIndex + index
                      : (currentPage - 1) * perPage + index + 1}
                  </p>
                </TableCell>
                <TableCell className="px-5 py-4 sm:px-6 text-start">
                  <p className="font-medium text-gray-800 text-theme-sm dark:text-white/90">
                    {unit.name}
                  </p>
                </TableCell>
                <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                  {unit.code}
                </TableCell>
                <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                  {unit.description}
                </TableCell>
                <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                  <div className="flex items-center gap-2">
                    {viewMode === 'active' ? (
                      <>
                        {hasPermission('update-unit') && (
                          <Tooltip text="Edit">
                            <Button
                              size="xs"
                              onClick={() => handleEdit(unit)}
                              className="bg-blue-600 hover:bg-blue-700 text-white"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                          </Tooltip>
                        )}
                        {hasPermission('delete-unit') && (
                          <Tooltip text="Delete">
                            <Button
                              size="xs"
                              onClick={() => handleDelete(unit)}
                              className="bg-red-600 hover:bg-red-700 text-white"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </Tooltip>
                        )}
                      </>
                    ) : (
                      <>
                        {hasPermission('update-unit') && (
                          <Tooltip text="Restore">
                            <Button
                              size="xs"
                              onClick={() => handleRestore(unit.id)}
                              className="bg-green-600 hover:bg-green-700 text-white"
                            >
                              <RefreshCw className="w-4 h-4" />
                            </Button>
                          </Tooltip>
                        )}
                        {hasPermission('delete-unit') && (
                          <Tooltip text="Delete Permanently">
                            <Button
                              size="xs"
                              onClick={() => handleDelete(unit)}
                              className="bg-red-600 hover:bg-red-700 text-white"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </Tooltip>
                        )}
                      </>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      {selectedUnit && (
        <>
          <EditUnitModal
            isOpen={isEditModalOpen}
            onClose={handleCloseModals}
            onUnitUpdated={onAction}
            unit={selectedUnit}
          />
          <DeleteUnitModal
            isOpen={isDeleteModalOpen}
            onClose={handleCloseModals}
            onUnitDeleted={onAction}
            unit={selectedUnit}
            force={viewMode === 'trashed'}
          />
        </>
      )}
    </div>
  );
}
