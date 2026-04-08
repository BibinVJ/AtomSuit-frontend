'use client';

import { Table, TableBody, TableCell, TableHeader, TableRow } from '@/components/ui/table';
import { useState } from 'react';
import EditItemModal from './EditItemModal';
import ViewItemModal from './ViewItemModal';
import ConfirmModal from '@/components/common/ConfirmModal';
import {
  ChevronsUpDown,
  ArrowUpWideNarrow,
  ArrowDownNarrowWide,
  BadgeDollarSign,
} from 'lucide-react';
import { restoreItem, deleteItem } from '@/services/ItemService';
import { toast } from 'sonner';
import { isApiError } from '@/utils/errors';
import { Item } from '@/types';
import { usePermissions } from '@/hooks/usePermissions';

import { TableActions } from '@/components/common/TableActions';
import Button from '@/components/ui/button/Button';
import Tooltip from '@/components/ui/tooltip/Tooltip';
import SkeletonTable from '@/components/common/SkeletonTable';

interface Props {
  data: Item[];
  onAction: () => void;
  onSort: (column: string) => void;
  sortBy: string;
  sortDirection: string;
  currentPage: number;
  perPage: number;
  startIndex?: number;
  viewMode?: 'active' | 'trashed';
  onManagePricing?: (item: Item) => void;
  loading?: boolean;
}

export default function ItemTable({
  data,
  onAction,
  onSort,
  sortBy,
  sortDirection,
  currentPage,
  perPage,
  startIndex,
  viewMode = 'active',
  onManagePricing,
  loading,
}: Props) {
  const { hasPermission } = usePermissions();

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [confirmTarget, setConfirmTarget] = useState<Item | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const isTrashed = viewMode === 'trashed';

  const handleEdit = (item: Item) => {
    setSelectedItem(item);
    setIsEditModalOpen(true);
  };

  const handleView = (item: Item) => {
    setSelectedItem(item);
    setIsViewModalOpen(true);
  };

  const handleCloseModals = () => {
    setIsEditModalOpen(false);
    setIsViewModalOpen(false);
    setSelectedItem(null);
  };

  const handleDeleteConfirm = async () => {
    if (!confirmTarget) return;
    setIsDeleting(true);
    try {
      await deleteItem(confirmTarget.id, isTrashed);
      toast.success(isTrashed ? 'Item permanently deleted' : 'Item deleted successfully');
      onAction();
    } catch (error: unknown) {
      let message = 'Failed to delete item';
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
      await restoreItem(id);
      toast.success('Item restored successfully');
      onAction();
    } catch {
      toast.error('Failed to restore item');
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
                onClick={() => onSort('sku')}
              >
                SKU {renderSortIcon('sku')}
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
                onClick={() => onSort('category_id')}
              >
                Category {renderSortIcon('category_id')}
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-3 font-medium text-gray-500 cursor-pointer text-start text-theme-xs dark:text-gray-400"
                onClick={() => onSort('unit_id')}
              >
                Unit {renderSortIcon('unit_id')}
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
                className="px-5 py-3 font-medium text-gray-500 text-end text-theme-xs dark:text-gray-400"
              >
                Actions
              </TableCell>
            </TableRow>
          </TableHeader>

          <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="p-0">
                  <SkeletonTable rows={perPage} columns={7} />
                </TableCell>
              </TableRow>
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="px-5 py-10 text-center text-gray-500">
                  No items found.
                </TableCell>
              </TableRow>
            ) : (
              data.map((item, index) => (
                <TableRow key={item.id}>
                  <TableCell className="px-5 py-4 sm:px-6 text-start">
                    <p className="font-medium text-gray-800 text-theme-sm dark:text-white/90">
                      {startIndex !== undefined
                        ? startIndex + index
                        : (currentPage - 1) * perPage + index + 1}
                    </p>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    {item.sku}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-800 text-start text-theme-sm dark:text-gray-400">
                    {item.name}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-800 text-start text-theme-sm dark:text-gray-400">
                    {item.category ? (
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                          item.category.deleted_at
                            ? 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-500'
                            : 'bg-gray-100 text-gray-800 dark:bg-white/10 dark:text-white'
                        }`}
                      >
                        {item.category.name}
                        {item.category.deleted_at ? ' (Deleted)' : ''}
                      </span>
                    ) : (
                      '-'
                    )}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-800 text-start text-theme-sm dark:text-gray-400">
                    {item.unit ? (
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                          item.unit.deleted_at
                            ? 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-500'
                            : 'bg-gray-100 text-gray-800 dark:bg-white/10 dark:text-white'
                        }`}
                      >
                        {item.unit.name} ({item.unit.code})
                        {item.unit.deleted_at ? ' (Deleted)' : ''}
                      </span>
                    ) : (
                      '-'
                    )}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-800 text-start text-theme-sm dark:text-gray-400">
                    {item.type}
                  </TableCell>

                  <TableCell className="px-4 py-3 text-end">
                    <div className="flex justify-end gap-2">
                      {onManagePricing && (
                        <Tooltip text="Manage Pricing">
                          <Button
                            variant="ghost"
                            size="xs"
                            onClick={() => onManagePricing(item)}
                            className="text-gray-500 hover:text-emerald-600"
                          >
                            <BadgeDollarSign size={18} />
                          </Button>
                        </Tooltip>
                      )}
                      <TableActions
                        isTrashed={viewMode === 'trashed'}
                        onView={() => handleView(item)}
                        onEdit={hasPermission('update-item') ? () => handleEdit(item) : undefined}
                        onDelete={
                          hasPermission('delete-item') ? () => setConfirmTarget(item) : undefined
                        }
                        onRestore={
                          hasPermission('update-item') ? () => handleRestore(item.id) : undefined
                        }
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      {selectedItem && (
        <ViewItemModal isOpen={isViewModalOpen} onClose={handleCloseModals} item={selectedItem} />
      )}
      {selectedItem && (
        <EditItemModal
          isOpen={isEditModalOpen}
          onClose={handleCloseModals}
          onSuccess={onAction}
          item={selectedItem}
          onManagePricing={onManagePricing}
        />
      )}

      <ConfirmModal
        isOpen={!!confirmTarget}
        onClose={() => setConfirmTarget(null)}
        onConfirm={handleDeleteConfirm}
        isLoading={isDeleting}
        title={isTrashed ? 'Permanently Delete Item' : 'Delete Item'}
        message={
          isTrashed
            ? `Are you sure you want to PERMANENTLY delete "${confirmTarget?.name}"? This will check for any related records and fail if any are found. This action cannot be undone.`
            : `Are you sure you want to delete "${confirmTarget?.name}"? You can restore it later from the Trashed items view.`
        }
        confirmLabel={isTrashed ? 'Delete Permanently' : 'Delete'}
        variant="danger"
      />
    </div>
  );
}
