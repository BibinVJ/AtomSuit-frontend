'use client';

import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import ComponentCard from '@/components/common/ComponentCard';
import PageMeta from '@/components/common/PageMeta';
import SalesInvoiceTable from '@/app/(dashboard)/sales-invoices/_components/SalesInvoiceTable';
import Pagination from '@/components/common/Pagination';
import Button from '@/components/ui/button/Button';
import Tooltip from '@/components/ui/tooltip/Tooltip';
import { SalesInvoiceService } from '@/services/SalesInvoiceService';
import { SalesInvoice } from '@/types/SalesInvoice';
import { usePermissions } from '@/hooks/usePermissions';
import { useDataTable } from '@/hooks/useDataTable';
import TableToolbar from '@/components/common/TableToolbar';
import ViewModeTabs from '@/components/common/ViewModeTabs';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import { isApiError } from '@/utils/errors';

import { useState } from 'react';

export default function SalesInvoices() {
  const { hasPermission } = usePermissions();

  const [activeTab, setActiveTab] = useState<'active' | 'trashed'>('active');

  const {
    data: salesInvoices,
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
  } = useDataTable<SalesInvoice>({
    fetchData: SalesInvoiceService.list,
    extraParams: {
      exclude_status: activeTab === 'active' ? 'voided' : undefined,
      status: activeTab === 'trashed' ? 'voided' : undefined,
    },
  });

  const handleRestore = async (id: number) => {
    try {
      await SalesInvoiceService.restore(id);
      toast.success('Sales Invoice restored successfully');
      refresh();
    } catch (error: unknown) {
      let message = 'Failed to restore sales invoice';
      if (isApiError(error)) {
        message = error.response?.data?.message || message;
      }
      toast.error(message);
    }
  };

  return (
    <>
      <PageMeta title="Sales Invoices" description="List of sales invoices" />
      <PageBreadcrumb pageTitle="Sales Invoices" />

      <div className="space-y-6">
        <div className="p-5 border border-gray-200 rounded-2xl bg-gray-50 dark:bg-white/[0.03] dark:border-gray-800 shadow-sm">
          <TableToolbar
            className="mb-0"
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            searchPlaceholder="Search sales invoices..."
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
          title={`Sales Invoices (${activeTab === 'trashed' ? 'Voided' : 'Active'})`}
          action={
            <div className="flex flex-wrap items-center gap-4">
              <ViewModeTabs
                viewMode={activeTab}
                setViewMode={setActiveTab}
                trashedLabel="Voided"
                trashedTooltip="Show Voided Invoices"
              />
              <div className="flex flex-wrap items-center gap-2">
                {hasPermission('create-sales-invoice') && (
                  <Tooltip text="Add New Sales Invoice">
                    <Button
                      href="/sales-invoices/create"
                      size="sm"
                      startIcon={<Plus className="w-4 h-4" />}
                    >
                      Add Sales Invoice
                    </Button>
                  </Tooltip>
                )}
              </div>
            </div>
          }
        >
          <SalesInvoiceTable
            data={salesInvoices}
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
