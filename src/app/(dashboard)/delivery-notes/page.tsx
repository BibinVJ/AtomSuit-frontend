'use client';

import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import ComponentCard from '@/components/common/ComponentCard';
import PageMeta from '@/components/common/PageMeta';
import DeliveryNoteTable from '@/app/(dashboard)/delivery-notes/_components/DeliveryNoteTable';
import Pagination from '@/components/common/Pagination';
import Button from '@/components/ui/button/Button';
import Tooltip from '@/components/ui/tooltip/Tooltip';
import { DeliveryNoteService } from '@/services/DeliveryNoteService';
import { DeliveryNote } from '@/types/DeliveryNote';
import { usePermissions } from '@/hooks/usePermissions';
import { useDataTable } from '@/hooks/useDataTable';
import TableToolbar from '@/components/common/TableToolbar';
import ViewModeTabs from '@/components/common/ViewModeTabs';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import { isApiError } from '@/utils/errors';

import { useState } from 'react';

export default function DeliveryNotes() {
  const { hasPermission } = usePermissions();

  const [activeTab, setActiveTab] = useState<'active' | 'trashed'>('active');

  const {
    data: dns,
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
    handlePageChange,
    handlePerPageChange,
    handleSort,
    refresh,
    resetFilters,
  } = useDataTable<DeliveryNote>({
    fetchData: DeliveryNoteService.list,
    extraParams: {
      exclude_status: activeTab === 'active' ? 'voided' : undefined,
      status: activeTab === 'trashed' ? 'voided' : undefined,
    },
  });

  const handleRestore = async (id: number) => {
    try {
      await DeliveryNoteService.restore(id);
      toast.success('DN restored successfully');
      refresh();
    } catch (error: unknown) {
      let message = 'Failed to restore DN';
      if (isApiError(error)) {
        message = error.response?.data?.message || message;
      }
      toast.error(message);
    }
  };

  return (
    <>
      <PageMeta title="Delivery Notes" description="List of delivery notes" />
      <PageBreadcrumb pageTitle="Delivery Notes" />

      <div className="space-y-6">
        <div className="p-5 border border-gray-200 rounded-2xl bg-gray-50 dark:bg-white/[0.03] dark:border-gray-800 shadow-sm">
          <TableToolbar
            className="mb-0"
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            searchPlaceholder="Search DNs..."
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
          title={`Delivery Notes (${activeTab === 'trashed' ? 'Voided' : 'Active'})`}
          action={
            <div className="flex flex-wrap items-center gap-4">
              <ViewModeTabs
                viewMode={activeTab}
                setViewMode={setActiveTab}
                trashedLabel="Voided"
                trashedTooltip="Show Voided DNs"
              />
              <div className="flex flex-wrap items-center gap-2">
                {hasPermission('create-delivery-note') && (
                  <Tooltip text="Add New DN">
                    <Button
                      href="/delivery-notes/create"
                      size="sm"
                      startIcon={<Plus className="w-4 h-4" />}
                    >
                      Add DN
                    </Button>
                  </Tooltip>
                )}
              </div>
            </div>
          }
        >
          <DeliveryNoteTable
            data={dns}
            loading={loading}
            onAction={refresh}
            onSort={handleSort}
            sortBy={sortBy}
            sortDirection={sortDirection}
            currentPage={currentPage}
            perPage={perPage}
            startIndex={rangeFrom !== '' ? Number(rangeFrom) : undefined}
            viewMode={activeTab === 'trashed' ? 'voided' : 'active'}
            onRestore={handleRestore}
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
    </>
  );
}
