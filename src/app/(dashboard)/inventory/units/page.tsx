'use client';

import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import ComponentCard from '@/components/common/ComponentCard';
import PageMeta from '@/components/common/PageMeta';
import UnitTable from '@/app/(dashboard)/inventory/_components/units/UnitTable';
import AddUnitModal from '@/app/(dashboard)/inventory/_components/units/AddUnitModal';
import { useModal } from '@/hooks/useModal';
import Pagination from '@/components/common/Pagination';
import Button from '@/components/ui/button/Button';
import Tooltip from '@/components/ui/tooltip/Tooltip';
import { getUnits, exportUnits } from '@/services/UnitService';
import { Unit } from '@/types';
import { Download, Plus } from 'lucide-react';
import ViewModeTabs from '@/components/common/ViewModeTabs';
import TableToolbar from '@/components/common/TableToolbar';
import { useDataTable } from '@/hooks/useDataTable';
import { useExport } from '@/hooks/useExport';

export default function Units() {
  const { isOpen, openModal, closeModal } = useModal();

  const {
    data: units,
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
  } = useDataTable<Unit>({
    fetchData: getUnits,
    initialSortBy: 'name',
    initialSortDirection: 'asc',
  });

  const { exportData } = useExport();

  const handleExport = () => {
    exportData({
      exportFunction: exportUnits,
      entityName: 'Units',
    });
  };

  return (
    <>
      <PageMeta title="Units of Measurement" description="Manage system units" />
      <PageBreadcrumb pageTitle="Units" />

      <div className="space-y-6">
        <div className="p-5 border border-gray-200 rounded-2xl bg-gray-50 dark:bg-white/[0.03] dark:border-gray-800 shadow-sm">
          <TableToolbar
            className="mb-0"
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            searchPlaceholder="Search units..."
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
          title={`Units (${viewMode})`}
          action={
            <div className="flex flex-wrap items-center gap-3">
              <ViewModeTabs viewMode={viewMode} setViewMode={setViewMode} />
              <Tooltip text="Export Units">
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
              <Tooltip text="Add New Unit">
                <Button onClick={openModal} size="sm" className="flex items-center gap-2">
                  <Plus size={16} />
                  Add Unit
                </Button>
              </Tooltip>
            </div>
          }
        >
          <UnitTable
            data={units}
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
      <AddUnitModal isOpen={isOpen} onClose={closeModal} onSuccess={refresh} />
    </>
  );
}
