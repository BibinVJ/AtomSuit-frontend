'use client';

import { Table, TableBody, TableCell, TableHeader, TableRow } from '../../ui/table';
import { useState } from 'react';
import EditCategoryModal from './EditCategoryModal';
import DeleteCategoryModal from './DeleteCategoryModal';
import ViewCategoryModal from './ViewCategoryModal';
import { ChevronsUpDown, ArrowUpWideNarrow, ArrowDownNarrowWide } from 'lucide-react';
import { restoreCategory } from '@/services/CategoryService';
import { toast } from 'sonner';
import { TableActions } from '../../common/TableActions';
import { Category } from '@/types';
import { usePermissions } from '@/hooks/usePermissions';

interface Props {
  data: Category[];
  onAction: () => void;
  onSort: (column: string) => void;
  sortBy: string;
  sortDirection: string;
  currentPage: number;
  perPage: number;
  startIndex?: number;
  viewMode?: 'active' | 'trashed';
}

export default function CategoryTable({
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
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

  const handleEdit = (category: Category) => {
    setSelectedCategory(category);
    setIsEditModalOpen(true);
  };

  const handleDelete = (category: Category) => {
    setSelectedCategory(category);
    setIsDeleteModalOpen(true);
  };

  const handleView = (category: Category) => {
    setSelectedCategory(category);
    setIsViewModalOpen(true);
  };

  const handleCloseModals = () => {
    setIsEditModalOpen(false);
    setIsDeleteModalOpen(false);
    setIsViewModalOpen(false);
    setSelectedCategory(null);
  };

  const handleRestore = async (id: number) => {
    try {
      await restoreCategory(id);
      toast.success('Category restored successfully');
      onAction();
    } catch (error) {
      console.error('Error restoring category:', error);
      toast.error('Failed to restore category');
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
                onClick={() => onSort('description')}
              >
                Description {renderSortIcon('description')}
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
            {data.map((category, index) => (
              <TableRow key={category.id}>
                <TableCell className="px-5 py-4 sm:px-6 text-start">
                  <p className="font-medium text-gray-800 text-theme-sm dark:text-white/90">
                    {startIndex !== undefined
                      ? startIndex + index
                      : (currentPage - 1) * perPage + index + 1}
                  </p>
                </TableCell>
                <TableCell className="px-5 py-4 sm:px-6 text-start">
                  <p className="font-medium text-gray-800 text-theme-sm dark:text-white/90">
                    {category.name}
                  </p>
                </TableCell>
                <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                  {category.description}
                </TableCell>
                <TableCell className="px-4 py-3 text-gray-500 text-end text-theme-sm dark:text-gray-400">
                  <TableActions
                    isTrashed={viewMode === 'trashed'}
                    onView={() => handleView(category)}
                    onEdit={
                      hasPermission('update-category') ? () => handleEdit(category) : undefined
                    }
                    onDelete={
                      hasPermission('delete-category') ? () => handleDelete(category) : undefined
                    }
                    onRestore={
                      hasPermission('update-category')
                        ? () => handleRestore(category.id)
                        : undefined
                    }
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      {selectedCategory && (
        <>
          <ViewCategoryModal
            isOpen={isViewModalOpen}
            onClose={handleCloseModals}
            category={selectedCategory}
          />
          <EditCategoryModal
            isOpen={isEditModalOpen}
            onClose={handleCloseModals}
            onSuccess={onAction}
            category={selectedCategory}
          />
          <DeleteCategoryModal
            isOpen={isDeleteModalOpen}
            onClose={handleCloseModals}
            onCategoryDeleted={onAction}
            category={selectedCategory}
            force={viewMode === 'trashed'}
          />
        </>
      )}
    </div>
  );
}
