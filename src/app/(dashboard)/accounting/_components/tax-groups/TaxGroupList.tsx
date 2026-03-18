'use client';

import ComponentCard from '@/components/common/ComponentCard';
import TaxGroupTable from './TaxGroupTable';
import AddTaxGroupModal from './AddTaxGroupModal';
import { useModal } from '@/hooks/useModal';
import Pagination from '@/components/common/Pagination';
import Button from '@/components/ui/button/Button';
import Tooltip from '@/components/ui/tooltip/Tooltip';
import { getTaxGroups } from '@/services/TaxService';
import { TaxGroup } from '@/types';
import { Plus } from 'lucide-react';
import ViewModeTabs from '@/components/common/ViewModeTabs';
import TableToolbar from '@/components/common/TableToolbar';
import { useDataTable } from '@/hooks/useDataTable';
import { usePermissions } from '@/hooks/usePermissions';

export default function TaxGroupList() {
  const { isOpen, openModal, closeModal } = useModal();
  const { hasPermission } = usePermissions();

  const {
    data: taxGroups,
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
  } = useDataTable<TaxGroup>({
    fetchData: getTaxGroups,
    initialSortBy: 'name',
    initialSortDirection: 'asc',
  });

  return (
    <>
      <div className="space-y-6">
        <div className="p-5 border border-gray-200 rounded-2xl bg-gray-50 dark:bg-white/[0.03] dark:border-gray-800 shadow-sm">
          <TableToolbar
            className="mb-0"
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            searchPlaceholder="Search tax groups..."
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
          title={`Tax Groups (${viewMode})`}
          action={
            <div className="flex flex-wrap items-center gap-3">
              <ViewModeTabs viewMode={viewMode} setViewMode={setViewMode} />

              {hasPermission('create-tax-group') && (
                <Tooltip text="Add New Tax Group">
                  <Button onClick={openModal} size="sm" className="flex items-center gap-2">
                    <Plus size={16} />
                    Add Tax Group
                  </Button>
                </Tooltip>
              )}
            </div>
          }
        >
          <TaxGroupTable
            data={taxGroups}
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
      <AddTaxGroupModal isOpen={isOpen} onClose={closeModal} onSuccess={refresh} />
    </>
  );
}
