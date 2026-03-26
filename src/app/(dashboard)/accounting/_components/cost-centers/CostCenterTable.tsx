import { CostCenter } from '@/types';
import { Table, TableBody, TableCell, TableHeader, TableRow } from '@/components/ui/table';
import { TableActions } from '@/components/common/TableActions';
import { deleteCostCenter, restoreCostCenter } from '@/services/CostCenterService';

import EditCostCenterModal from './EditCostCenterModal';
import { useState } from 'react';
import Badge from '@/components/ui/badge/Badge';
import { ChevronsUpDown, ArrowUpWideNarrow, ArrowDownNarrowWide } from 'lucide-react';
import { usePermissions } from '@/hooks/usePermissions';

interface CostCenterTableProps {
  data: CostCenter[];
  onAction: () => void;
  onSort: (column: string) => void;
  sortBy: string;
  sortDirection: 'asc' | 'desc';
  currentPage: number;
  _perPage: number;
  startIndex?: number;
  viewMode: 'active' | 'trashed';
}

export default function CostCenterTable({
  data,
  onAction,
  onSort,
  sortBy,
  sortDirection,
  startIndex = 0,
  viewMode,
}: CostCenterTableProps) {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedCostCenter, setSelectedCostCenter] = useState<CostCenter | null>(null);

  const openEditModal = (costCenter: CostCenter) => {
    setSelectedCostCenter(costCenter);
    setIsEditOpen(true);
  };

  const closeEditModal = () => {
    setIsEditOpen(false);
    setSelectedCostCenter(null);
  };

  const { hasPermission } = usePermissions();

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
                  className="px-5 py-3 font-medium text-gray-500 cursor-pointer text-start text-theme-xs dark:text-gray-400"
                  onClick={() => onSort('type')}
                >
                  Type {renderSortIcon('type')}
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Parent
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Warehouse
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
              {data.map((row, index) => (
                <TableRow key={row.id}>
                  <TableCell className="px-5 py-4 sm:px-6 text-start">
                    <p className="font-medium text-gray-800 text-theme-sm dark:text-white/90">
                      {startIndex + index + 1}
                    </p>
                  </TableCell>
                  <TableCell className="px-5 py-4 sm:px-6 text-start">
                    <p className="font-medium text-gray-800 text-theme-sm dark:text-white/90">
                      {row.code}
                    </p>
                  </TableCell>
                  <TableCell className="px-5 py-4 sm:px-6 text-start">
                    <p className="font-medium text-gray-800 text-theme-sm dark:text-white/90">
                      {row.name}
                    </p>
                  </TableCell>
                  <TableCell className="px-5 py-4 sm:px-6 text-start">
                    <Badge variant="light" color="primary">
                      {row.type}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-5 py-4 sm:px-6 text-start">
                    <p className="font-medium text-gray-800 text-theme-sm dark:text-white/90">
                      {row.parent?.name || '-'}
                    </p>
                  </TableCell>
                  <TableCell className="px-5 py-4 sm:px-6 text-start">
                    <p className="font-medium text-gray-800 text-theme-sm dark:text-white/90">
                      {row.warehouse?.name || '-'}
                    </p>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-end text-theme-sm dark:text-gray-400">
                    <TableActions
                      onEdit={
                        hasPermission('update-cost-center')
                          ? () => {
                              openEditModal(row);
                            }
                          : undefined
                      }
                      onDelete={
                        hasPermission('delete-cost-center')
                          ? () => deleteCostCenter(row.id)
                          : undefined
                      }
                      onRestore={
                        hasPermission('update-cost-center')
                          ? () => restoreCostCenter(row.id)
                          : undefined
                      }
                      isTrashed={viewMode === 'trashed'}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {selectedCostCenter && (
        <EditCostCenterModal
          isOpen={isEditOpen}
          onClose={() => {
            closeEditModal();
            setSelectedCostCenter(null);
          }}
          onSuccess={onAction}
          costCenter={selectedCostCenter}
        />
      )}
    </>
  );
}
