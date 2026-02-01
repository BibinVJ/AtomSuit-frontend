'use client';

import { Table, TableBody, TableCell, TableHeader, TableRow } from '@/components/ui/table';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import EditVendorModal from './EditVendorModal';
import DeleteVendorModal from './DeleteVendorModal';
import { ChevronsUpDown, ArrowUpWideNarrow, ArrowDownNarrowWide } from 'lucide-react';
import { restoreVendor } from '@/services/VendorService';
import { toast } from 'sonner';
import { Vendor } from '@/types';
import { usePermissions } from '@/hooks/usePermissions';
import { TableActions } from '@/components/common/TableActions';

interface Props {
  data: Vendor[];
  onAction: () => void;
  onSort: (column: string) => void;
  sortBy: string;
  sortDirection: string;
  currentPage: number;
  perPage: number;
  startIndex?: number;
  viewMode?: 'active' | 'trashed';
}

export default function VendorTable({
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
  const router = useRouter();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);

  const handleEdit = (vendor: Vendor) => {
    setSelectedVendor(vendor);
    setIsEditModalOpen(true);
  };

  const handleDelete = (vendor: Vendor) => {
    setSelectedVendor(vendor);
    setIsDeleteModalOpen(true);
  };

  const handleCloseModals = () => {
    setIsEditModalOpen(false);
    setIsDeleteModalOpen(false);
    setSelectedVendor(null);
  };

  const handleRestore = async (id: number) => {
    try {
      await restoreVendor(id);
      toast.success('Vendor restored successfully');
      onAction();
    } catch (error) {
      console.error('Error restoring vendor:', error);
      toast.error('Failed to restore vendor');
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
                Contact Info
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                Currency
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
            {data.map((vendor, index) => (
              <TableRow key={vendor.id}>
                <TableCell className="px-5 py-4 sm:px-6 text-start">
                  <p className="font-medium text-gray-800 text-theme-sm dark:text-white/90">
                    {startIndex !== undefined
                      ? startIndex + index
                      : (currentPage - 1) * perPage + index + 1}
                  </p>
                </TableCell>
                <TableCell className="px-4 py-3 text-gray-800 text-start text-theme-sm dark:text-gray-400">
                  {vendor.name}
                </TableCell>
                <TableCell className="px-4 py-3 text-gray-800 text-start text-theme-sm dark:text-gray-400">
                  <div className="flex flex-col">
                    <span>{vendor.email}</span>
                    <span className="text-gray-500 text-xs">{vendor.phone}</span>
                  </div>
                </TableCell>
                <TableCell className="px-4 py-3 text-start">
                  {vendor.currency ? (
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                        vendor.currency.deleted_at
                          ? 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-500'
                          : 'bg-gray-100 text-gray-800 dark:bg-white/10 dark:text-white'
                      }`}
                    >
                      {vendor.currency.code}
                      {vendor.currency.deleted_at ? ' (Deleted)' : ''}
                    </span>
                  ) : (
                    '-'
                  )}
                </TableCell>
                <TableCell className="px-4 py-3 text-end">
                  <TableActions
                    isTrashed={viewMode === 'trashed'}
                    onView={() => router.push(`/vendors/${vendor.id}`)}
                    onEdit={hasPermission('update-vendor') ? () => handleEdit(vendor) : undefined}
                    onDelete={
                      hasPermission('delete-vendor') ? () => handleDelete(vendor) : undefined
                    }
                    onRestore={
                      hasPermission('update-vendor') ? () => handleRestore(vendor.id) : undefined
                    }
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      {selectedVendor && (
        <>
          <EditVendorModal
            isOpen={isEditModalOpen}
            onClose={handleCloseModals}
            onSuccess={onAction}
            vendor={selectedVendor}
          />
          <DeleteVendorModal
            isOpen={isDeleteModalOpen}
            onClose={handleCloseModals}
            onSuccess={onAction}
            vendor={selectedVendor}
            force={viewMode === 'trashed'}
          />
        </>
      )}
    </div>
  );
}
