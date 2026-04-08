'use client';

import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import ComponentCard from '@/components/common/ComponentCard';
import PageMeta from '@/components/common/PageMeta';
import VendorTable from '@/app/(dashboard)/vendors/_components/VendorTable';
import AddVendorModal from '@/app/(dashboard)/vendors/_components/AddVendorModal';
import { useModal } from '@/hooks/useModal';
import Pagination from '@/components/common/Pagination';
import Button from '@/components/ui/button/Button';
import Tooltip from '@/components/ui/tooltip/Tooltip';
import {
  getVendors,
  exportVendors,
  importVendors,
  downloadSampleVendorExcel,
} from '@/services/VendorService';
import { Vendor } from '@/types';
import ImportModal from '@/components/common/ImportModal';
import { Download, Upload, Plus } from 'lucide-react';
import ViewModeTabs from '@/components/common/ViewModeTabs';
import { usePermissions } from '@/hooks/usePermissions';
import TableToolbar from '@/components/common/TableToolbar';
import { useDataTable } from '@/hooks/useDataTable';
import { useExport } from '@/hooks/useExport';

export default function Vendors() {
  const { hasPermission } = usePermissions();
  const { isOpen, openModal, closeModal } = useModal();
  const {
    isOpen: isImportModalOpen,
    openModal: openImportModal,
    closeModal: closeImportModal,
  } = useModal();

  const {
    data: vendors,
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
    rangeFrom,
    setRangeFrom,
    rangeTo,
    setRangeTo,
    viewMode,
    setViewMode,
    handlePageChange,
    handlePerPageChange,
    handleSort,
    resetFilters,
    refresh,
  } = useDataTable<Vendor>({
    fetchData: getVendors,
  });

  const { exportData } = useExport();

  const handleExport = () => {
    exportData({
      exportFunction: exportVendors,
      entityName: 'Vendors',
    });
  };

  return (
    <>
      <PageMeta title="Vendors" description="List of vendors" />
      <PageBreadcrumb pageTitle="Vendors" />

      <div className="space-y-6">
        <div className="p-5 border border-gray-200 rounded-2xl bg-gray-50 dark:bg-white/[0.03] dark:border-gray-800 shadow-sm">
          <TableToolbar
            className="mb-0"
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            searchPlaceholder="Search vendors..."
            rangeFrom={rangeFrom}
            onRangeFromChange={(val) => setRangeFrom(val as number | '')}
            rangeTo={rangeTo}
            onRangeToChange={(val) => setRangeTo(val as number | '')}
            perPage={perPage}
            onPerPageChange={handlePerPageChange}
            onReset={resetFilters}
          />
        </div>

        <ComponentCard
          title={`Vendors (${viewMode})`}
          action={
            <div className="flex flex-wrap items-center gap-2">
              <ViewModeTabs viewMode={viewMode} setViewMode={setViewMode} />
              <Tooltip text="Import Vendors">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={openImportModal}
                  className="flex items-center gap-2"
                >
                  <Upload className="w-4 h-4" />
                  Import
                </Button>
              </Tooltip>
              <Tooltip text="Export Vendors">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExport}
                  className="flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Export
                </Button>
              </Tooltip>
              {hasPermission('create-vendor') && (
                <Tooltip text="Add New Vendor">
                  <Button onClick={openModal} size="sm" className="flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    Add Vendor
                  </Button>
                </Tooltip>
              )}
            </div>
          }
        >
          <VendorTable
            data={vendors}
            loading={loading}
            onAction={refresh}
            onSort={handleSort}
            sortBy={sortBy}
            sortDirection={sortDirection}
            currentPage={currentPage}
            perPage={perPage}
            startIndex={rangeFrom !== '' ? Number(rangeFrom) : undefined}
            viewMode={viewMode}
          />
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            from={from}
            to={to}
            total={total}
          />
        </ComponentCard>
      </div>
      <AddVendorModal isOpen={isOpen} onClose={closeModal} onSuccess={refresh} />
      <ImportModal
        isOpen={isImportModalOpen}
        onClose={closeImportModal}
        onImport={importVendors}
        onDownloadSample={downloadSampleVendorExcel}
        onSuccess={refresh}
        entityName="Vendors"
      />
    </>
  );
}
