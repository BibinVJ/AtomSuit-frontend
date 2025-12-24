'use client';

import { useState, useCallback, useEffect } from 'react';
import { Plus } from 'lucide-react';
import Button from '@/components/ui/button/Button';
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
import TableToolbar from '@/components/common/TableToolbar';
import PageMeta from '@/components/common/PageMeta';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import ComponentCard from '@/components/common/ComponentCard';
import ImportModal from '@/components/common/ImportModal';
import { Download, Upload } from 'lucide-react';

export default function WarehousesPage() {
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [editingWarehouse, setEditingWarehouse] = useState<Warehouse | null>(null);
  const [deletingWarehouse, setDeletingWarehouse] = useState<Warehouse | null>(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [from, setFrom] = useState(0);
  const [to, setTo] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(15);
  const [searchQuery, setSearchQuery] = useState('');
  const [showDeleted, setShowDeleted] = useState(false);

  // Sorting - hardcoded for now as UI doesn't support it yet
  const sortCol = 'created_at';
  const sortDir = 'desc';

  const fetchWarehouses = useCallback(async () => {
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
      setFrom(response.meta.from || 0);
      setTo(response.meta.to || 0);
    } catch (error) {
      console.error('Error fetching warehouses:', error);
      toast.error('Failed to fetch warehouses');
    } finally {
      // setIsLoading(false);
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

  const onImport = async (file: File) => {
    // Wrapper for importWarehouses to be passed to ImportModal
    return importWarehouses(file);
  };

  const onDownloadSample = async () => {
    return downloadSampleWarehouseExcel();
  };

  return (
    <>
      <PageMeta title="Warehouses" description="Manage your warehouse locations and details." />
      <PageBreadcrumb pageTitle="Warehouses" />

      <div className="space-y-6">
        <ComponentCard
          title="Warehouses"
          action={
            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleExport}
                className="flex items-center gap-2"
              >
                <Download className="w-4 h-4" /> Export
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsImportModalOpen(true)}
                className="flex items-center gap-2"
              >
                <Upload className="w-4 h-4" /> Import
              </Button>
              <Button
                onClick={() => setIsCreateModalOpen(true)}
                size="sm"
                className="flex items-center gap-2"
              >
                <Plus className="w-4 h-4" /> Add Warehouse
              </Button>
            </div>
          }
        >
          <TableToolbar
            searchTerm={searchQuery}
            onSearchChange={setSearchQuery}
            searchPlaceholder="Search warehouses..."
            perPage={itemsPerPage}
            onPerPageChange={(val) => setItemsPerPage(Number(val))}
            extraFilters={
              <label className="flex items-center space-x-2 text-sm text-gray-700 dark:text-gray-300">
                <input
                  type="checkbox"
                  checked={showDeleted}
                  onChange={(e) => setShowDeleted(e.target.checked)}
                  className="rounded border-gray-300 text-brand-600 focus:ring-brand-500"
                />
                <span>Show Deleted</span>
              </label>
            }
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
            total={totalItems}
            from={from}
            to={to}
            onPageChange={setCurrentPage}
          />
        </ComponentCard>
      </div>

      <CreateWarehouseModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onWarehouseCreated={fetchWarehouses}
      />

      <ImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImport={onImport}
        onDownloadSample={onDownloadSample}
        onSuccess={fetchWarehouses}
        entityName="Warehouses"
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
    </>
  );
}
