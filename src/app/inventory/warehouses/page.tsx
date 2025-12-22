'use client';

import { useState, useCallback, useEffect } from 'react';
import PageHeader from '@/components/common/PageHeader';
import { PlusIcon } from '@heroicons/react/24/outline';
import Button from '@/components/ui/button/Button';
import { useSearchParams } from 'next/navigation';
import {
  getWarehouses,
  restoreWarehouse,
  exportWarehouses,
  importWarehouses,
  downloadSampleWarehouseExcel,
} from '@/services/WarehouseService';
import WarehouseTable from '@/components/inventory/warehouses/WarehouseTable';
import CreateWarehouseModal from '@/components/inventory/warehouses/CreateWarehouseModal';
import EditWarehouseModal from '@/components/inventory/warehouses/EditWarehouseModal';
import DeleteWarehouseModal from '@/components/inventory/warehouses/DeleteWarehouseModal';
import { Warehouse } from '@/types/Warehouse';
import { toast } from 'sonner';
import Pagination from '@/components/common/Pagination';
import TableActions from '@/components/common/TableActions';

export default function WarehousesPage() {
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingWarehouse, setEditingWarehouse] = useState<Warehouse | null>(null);
  const [deletingWarehouse, setDeletingWarehouse] = useState<Warehouse | null>(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(15);
  const [searchQuery, setSearchQuery] = useState('');
  const [showDeleted, setShowDeleted] = useState(false);

  // Sorting
  const [sortCol, setSortCol] = useState('created_at');
  const [sortDir, setSortDir] = useState('desc');

  const searchParams = useSearchParams();

  const fetchWarehouses = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await getWarehouses({
        page: currentPage,
        limit: itemsPerPage,
        search: searchQuery,
        sortCol,
        sortDir,
        trashed: showDeleted ? 'with' : undefined,
      });

      setWarehouses(response.data);
      setTotalPages(response.meta.last_page);
      setTotalItems(response.meta.total);
    } catch (error) {
      console.error('Error fetching warehouses:', error);
      toast.error('Failed to fetch warehouses');
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, itemsPerPage, searchQuery, sortCol, sortDir, showDeleted]);

  useEffect(() => {
    fetchWarehouses();
  }, [fetchWarehouses]);

  const handleEdit = (warehouse: Warehouse) => {
    setEditingWarehouse(warehouse);
  };

  const handleDelete = (warehouse: Warehouse) => {
    setDeletingWarehouse(warehouse);
  };

  const handleRestore = async (warehouse: Warehouse) => {
    try {
      await restoreWarehouse(warehouse.id);
      toast.success('Warehouse restored successfully');
      fetchWarehouses();
    } catch (error) {
      console.error('Error restoring warehouse:', error);
      toast.error('Failed to restore warehouse');
    }
  };

  const handleExport = async () => {
    try {
      const blob = await exportWarehouses();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `warehouses_${new Date().toISOString()}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('Warehouses exported successfully');
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Failed to export warehouses');
    }
  };

  const handleImport = async (file: File) => {
    try {
      await importWarehouses(file);
      toast.success('Warehouses imported successfully');
      fetchWarehouses();
    } catch (error) {
      console.error('Import failed:', error);
      toast.error('Failed to import warehouses');
    }
  };

  const handleDownloadSample = async () => {
    try {
      const blob = await downloadSampleWarehouseExcel();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'sample_warehouses.xlsx';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Download sample failed:', error);
      toast.error('Failed to download sample file');
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Warehouses"
        description="Manage your warehouse locations and details."
        actions={
          <Button
            onClick={() => setIsCreateModalOpen(true)}
            startIcon={<PlusIcon className="w-5 h-5" />}
          >
            Add Warehouse
          </Button>
        }
      />

      <TableActions
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        showDeleted={showDeleted}
        onShowDeletedChange={setShowDeleted}
        onExport={handleExport}
        onImport={handleImport}
        onDownloadSample={handleDownloadSample}
      />

      <WarehouseTable
        warehouses={warehouses}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onRestore={handleRestore}
      />

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalItems}
        itemsPerPage={itemsPerPage}
        onPageChange={setCurrentPage}
        onItemsPerPageChange={setItemsPerPage}
      />

      <CreateWarehouseModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onWarehouseCreated={fetchWarehouses}
      />

      {editingWarehouse && (
        <EditWarehouseModal
          isOpen={!!editingWarehouse}
          onClose={() => setEditingWarehouse(null)}
          onWarehouseUpdated={fetchWarehouses}
          warehouse={editingWarehouse}
        />
      )}

      {deletingWarehouse && (
        <DeleteWarehouseModal
          isOpen={!!deletingWarehouse}
          onClose={() => setDeletingWarehouse(null)}
          onWarehouseDeleted={fetchWarehouses}
          warehouse={deletingWarehouse}
        />
      )}
    </div>
  );
}
