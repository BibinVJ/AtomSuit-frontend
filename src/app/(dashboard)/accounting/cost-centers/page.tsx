'use client';

import { useRef, useCallback } from 'react';
import { useDataTable } from '@/hooks/useDataTable';
import { useModal } from '@/hooks/useModal';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import PageMeta from '@/components/common/PageMeta';
import AddCostCenterModal from '@/app/(dashboard)/accounting/_components/cost-centers/AddCostCenterModal';
import CostCenterTable from '@/app/(dashboard)/accounting/_components/cost-centers/CostCenterTable';
import { getCostCenters, exportCostCenters, importCostCenters } from '@/services/CostCenterService';
import { CostCenter } from '@/types';
import Button from '@/components/ui/button/Button';
import { Plus, Download, Upload } from 'lucide-react';
import { toast } from 'sonner';
import TableToolbar from '@/components/common/TableToolbar';
import Pagination from '@/components/common/Pagination';
import ComponentCard from '@/components/common/ComponentCard';
import ViewModeTabs from '@/components/common/ViewModeTabs';
import Tooltip from '@/components/ui/tooltip/Tooltip';
import { useExport } from '@/hooks/useExport';

export default function CostCenters() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { isOpen, openModal, closeModal } = useModal();

  const fetchData = useCallback(
    (params: Record<string, unknown>) => getCostCenters({ ...params, include: 'warehouse,parent' }),
    []
  );

  const {
    data: costCenters,
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
  } = useDataTable<CostCenter>({
    fetchData,
    initialSortBy: 'code',
    initialSortDirection: 'asc',
  });

  const { exportData } = useExport();

  const handleExport = () => {
    exportData({
      exportFunction: exportCostCenters,
      entityName: 'Cost Centers',
    });
  };

  const handleImportTrigger = () => {
    if (fileInputRef.current) fileInputRef.current.click();
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      await importCostCenters(file);
      toast.success('Cost Centers imported successfully');
      refresh();
    } catch (error) {
      toast.error('Failed to import Cost Centers');
      console.error(error);
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <>
      <PageMeta title="Cost Centers" description="Manage your cost centers." />
      <PageBreadcrumb pageTitle="Cost Centers" />

      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-2 ml-auto">
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept=".xlsx,.xls,.csv"
              onChange={handleFileUpload}
            />
          </div>
        </div>

        <div className="p-5 border border-gray-200 rounded-2xl bg-gray-50 dark:bg-white/[0.03] dark:border-gray-800 shadow-sm">
          <TableToolbar
            className="mb-0"
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            searchPlaceholder="Search cost centers..."
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
          title={`Cost Centers (${viewMode})`}
          action={
            <div className="flex flex-wrap items-center gap-3">
              <ViewModeTabs viewMode={viewMode} setViewMode={setViewMode} />
              <Tooltip text="Import">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleImportTrigger}
                  className="flex items-center gap-2"
                >
                  <Upload size={16} />
                  Import
                </Button>
              </Tooltip>
              <Tooltip text="Export">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExport}
                  className="flex items-center gap-2"
                >
                  <Download size={16} />
                  Export
                </Button>
              </Tooltip>
              <Tooltip text="Add New">
                <Button onClick={openModal} size="sm" className="flex items-center gap-2">
                  <Plus size={16} />
                  Add Cost Center
                </Button>
              </Tooltip>
            </div>
          }
        >
          <CostCenterTable
            data={costCenters}
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

      <AddCostCenterModal isOpen={isOpen} onClose={closeModal} onSuccess={refresh} />
    </>
  );
}
