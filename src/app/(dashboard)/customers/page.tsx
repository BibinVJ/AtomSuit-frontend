'use client';

import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import ComponentCard from '@/components/common/ComponentCard';
import PageMeta from '@/components/common/PageMeta';
import CustomerTable from '@/app/(dashboard)/customers/_components/CustomerTable';
import AddCustomerModal from '@/app/(dashboard)/customers/_components/AddCustomerModal';
import { useModal } from '@/hooks/useModal';
import Pagination from '@/components/common/Pagination';
import Button from '@/components/ui/button/Button';
import Tooltip from '@/components/ui/tooltip/Tooltip';

import {
  getCustomers,
  exportCustomers,
  importCustomers,
  downloadSampleCustomerExcel,
} from '@/services/CustomerService';
import ImportModal from '@/components/common/ImportModal';
import { Download, Upload, Plus } from 'lucide-react';
import ViewModeTabs from '@/components/common/ViewModeTabs';
import { usePermissions } from '@/hooks/usePermissions';
import { Customer } from '@/types';
import TableToolbar from '@/components/common/TableToolbar';
import { useDataTable } from '@/hooks/useDataTable';
import { useExport } from '@/hooks/useExport';

export default function Customers() {
  const { hasPermission } = usePermissions();
  const { isOpen, openModal, closeModal } = useModal();
  const {
    isOpen: isImportModalOpen,
    openModal: openImportModal,
    closeModal: closeImportModal,
  } = useModal();

  const {
    data: customers,
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
  } = useDataTable<Customer>({
    fetchData: getCustomers,
  });

  const { exportData } = useExport();

  const handleExport = () => {
    exportData({
      exportFunction: exportCustomers,
      entityName: 'Customers',
    });
  };

  return (
    <>
      <PageMeta title="Customers" description="List of customers" />
      <PageBreadcrumb pageTitle="Customers" />

      <div className="space-y-6">
        <div className="p-5 border border-gray-200 rounded-2xl bg-gray-50 dark:bg-white/[0.03] dark:border-gray-800 shadow-sm">
          <TableToolbar
            className="mb-0"
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            searchPlaceholder="Search customers..."
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
          title={`Customers (${viewMode})`}
          action={
            <div className="flex flex-wrap items-center gap-2">
              <ViewModeTabs viewMode={viewMode} setViewMode={setViewMode} />
              <Tooltip text="Import Customers">
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
              <Tooltip text="Export Customers">
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
              {hasPermission('create-customer') && (
                <Tooltip text="Add New Customer">
                  <Button onClick={openModal} size="sm" className="flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    Add Customer
                  </Button>
                </Tooltip>
              )}
            </div>
          }
        >
          <CustomerTable
            data={customers}
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
      <AddCustomerModal isOpen={isOpen} onClose={closeModal} onSuccess={refresh} />
      <ImportModal
        isOpen={isImportModalOpen}
        onClose={closeImportModal}
        onImport={importCustomers}
        onDownloadSample={downloadSampleCustomerExcel}
        onSuccess={refresh}
        entityName="Customers"
      />
    </>
  );
}
