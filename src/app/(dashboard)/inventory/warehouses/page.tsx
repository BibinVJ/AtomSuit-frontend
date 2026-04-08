'use client';

import { useState } from 'react';
import { Plus, Download, Upload } from 'lucide-react';
import Button from '@/components/ui/button/Button';
import {
  getWarehouses,
  exportWarehouses,
  importWarehouses,
  downloadSampleWarehouseExcel,
} from '@/services/WarehouseService';
import WarehouseTable from '@/app/(dashboard)/inventory/_components/warehouses/WarehouseTable';
import CreateWarehouseModal from '@/app/(dashboard)/inventory/_components/warehouses/CreateWarehouseModal';
import EditWarehouseModal from '@/app/(dashboard)/inventory/_components/warehouses/EditWarehouseModal';
import ConfirmModal from '@/components/common/ConfirmModal';
import { Warehouse } from '@/types/Warehouse';
import { deleteWarehouse } from '@/services/WarehouseService';
import { isApiError } from '@/utils/errors';
import { toast } from 'sonner';
import Pagination from '@/components/common/Pagination';
import TableToolbar from '@/components/common/TableToolbar';
import PageMeta from '@/components/common/PageMeta';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import ComponentCard from '@/components/common/ComponentCard';
import ImportModal from '@/components/common/ImportModal';
import ViewModeTabs from '@/components/common/ViewModeTabs';
import { useDataTable } from '@/hooks/useDataTable';
import { useExport } from '@/hooks/useExport';
import Tooltip from '@/components/ui/tooltip/Tooltip';

export default function Warehouses() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [editingWarehouse, setEditingWarehouse] = useState<Warehouse | null>(null);
  const [confirmTarget, setConfirmTarget] = useState<Warehouse | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const {
    data: warehouses,
    loading,
    currentPage,
    perPage,
    totalPages,
    total,
    from,
    to,
    sortBy,
    sortDirection,
    searchTerm,
    setSearchTerm,
    viewMode,
    setViewMode,
    handlePageChange,
    handlePerPageChange,
    handleSort,
    resetFilters,
    refresh,
  } = useDataTable<Warehouse>({
    fetchData: getWarehouses,
    initialSortBy: 'created_at',
    initialSortDirection: 'desc',
  });

  const { exportData } = useExport();

  const handleExport = () => {
    exportData({
      exportFunction: exportWarehouses,
      entityName: 'Warehouses',
    });
  };

  const handleEdit = (warehouse: Warehouse) => {
    setEditingWarehouse(warehouse);
  };

  const handleDelete = (warehouse: Warehouse) => {
    setConfirmTarget(warehouse);
  };

  const handleDeleteConfirm = async () => {
    if (!confirmTarget) return;
    setIsDeleting(true);
    try {
      await deleteWarehouse(confirmTarget.id);
      toast.success('Warehouse deleted successfully');
      refresh();
    } catch (error: boolean | unknown) {
      let message = 'Failed to delete warehouse';
      if (isApiError(error)) {
        message =
          (error as { response?: { data?: { message?: string } } }).response?.data?.message ||
          message;
      }
      toast.error(message);
    } finally {
      setIsDeleting(false);
      setConfirmTarget(null);
    }
  };

  const onImport = async (file: File) => {
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
        <div className="p-5 border border-gray-200 rounded-2xl bg-gray-50 dark:bg-white/[0.03] dark:border-gray-800 shadow-sm">
          <TableToolbar
            className="mb-0"
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            searchPlaceholder="Search warehouses..."
            perPage={perPage}
            onPerPageChange={handlePerPageChange}
            onReset={resetFilters}
          />
        </div>

        <ComponentCard
          title={`Warehouses (${viewMode})`}
          action={
            <div className="flex flex-wrap items-center gap-3">
              <ViewModeTabs viewMode={viewMode} setViewMode={setViewMode} />

              <div className="flex flex-wrap items-center gap-2">
                <Tooltip text="Export Warehouses">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleExport}
                    className="flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" /> Export
                  </Button>
                </Tooltip>
                <Tooltip text="Import Warehouses">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsImportModalOpen(true)}
                    className="flex items-center gap-2"
                  >
                    <Upload className="w-4 h-4" /> Import
                  </Button>
                </Tooltip>
                <Tooltip text="Add New Warehouse">
                  <Button
                    onClick={() => setIsCreateModalOpen(true)}
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" /> Add Warehouse
                  </Button>
                </Tooltip>
              </div>
            </div>
          }
        >
          <WarehouseTable
            warehouses={warehouses}
            loading={loading}
            perPage={perPage}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onRestore={viewMode === 'trashed' ? (u) => handleEdit(u) : undefined}
            viewMode={viewMode}
            onSort={handleSort}
            sortBy={sortBy}
            sortDirection={sortDirection}
          />

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            total={total}
            from={from}
            to={to}
            onPageChange={handlePageChange}
          />
        </ComponentCard>
      </div>

      <CreateWarehouseModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onWarehouseCreated={refresh}
      />

      <ImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImport={onImport}
        onDownloadSample={onDownloadSample}
        onSuccess={refresh}
        entityName="Warehouses"
      />

      {editingWarehouse && (
        <EditWarehouseModal
          isOpen={!!editingWarehouse}
          onClose={() => setEditingWarehouse(null)}
          onWarehouseUpdated={refresh}
          warehouse={editingWarehouse}
        />
      )}

      <ConfirmModal
        isOpen={!!confirmTarget}
        onClose={() => setConfirmTarget(null)}
        onConfirm={handleDeleteConfirm}
        isLoading={isDeleting}
        title="Delete Warehouse"
        message={`Are you sure you want to delete "${confirmTarget?.name}"? You can restore it later.`}
        confirmLabel="Delete Warehouse"
        variant="danger"
      />
    </>
  );
}
