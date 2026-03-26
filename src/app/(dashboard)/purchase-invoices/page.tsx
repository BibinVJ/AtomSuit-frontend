'use client';

import { useRouter } from 'next/navigation';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import ComponentCard from '@/components/common/ComponentCard';
import PageMeta from '@/components/common/PageMeta';
import PurchaseInvoiceTable from '@/app/(dashboard)/purchase-invoices/_components/PurchaseInvoiceTable';
import Pagination from '@/components/common/Pagination';
import Button from '@/components/ui/button/Button';
import Tooltip from '@/components/ui/tooltip/Tooltip';
import { PurchaseInvoiceService } from '@/services/PurchaseInvoiceService';
import { PurchaseInvoice } from '@/types/PurchaseInvoice';
import { usePermissions } from '@/hooks/usePermissions';
import { useDataTable } from '@/hooks/useDataTable';
import TableToolbar from '@/components/common/TableToolbar';
import ViewModeTabs from '@/components/common/ViewModeTabs';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';

export default function PurchaseInvoices() {
  const { hasPermission } = usePermissions();
  const router = useRouter();

  const {
    data: purchaseInvoices,
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
    viewMode,
    setViewMode,
    refresh,
    resetFilters,
  } = useDataTable<PurchaseInvoice>({
    fetchData: PurchaseInvoiceService.list,
  });

  const handleRestore = async (id: number) => {
    try {
      await PurchaseInvoiceService.restore(id);
      toast.success('Purchase Invoice restored successfully');
      refresh();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to restore purchase invoice');
    }
  };

  return (
    <>
      <PageMeta title="Purchase Invoices" description="List of purchase invoices" />
      <PageBreadcrumb pageTitle="Purchase Invoices" />

      <div className="space-y-6">
        <div className="p-5 border border-gray-200 rounded-2xl bg-gray-50 dark:bg-white/[0.03] dark:border-gray-800 shadow-sm">
          <TableToolbar
            className="mb-0"
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            searchPlaceholder="Search purchase invoices..."
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
          title={`Purchase Invoices (${viewMode})`}
          action={
            <div className="flex flex-wrap items-center gap-4">
              <ViewModeTabs viewMode={viewMode} setViewMode={setViewMode} />
              <div className="flex flex-wrap items-center gap-2">
                {hasPermission('create-purchase-invoice') && (
                  <Tooltip text="Add New Purchase Invoice">
                    <Button
                      onClick={() => router.push('/purchase-invoices/create')}
                      size="sm"
                      startIcon={<Plus className="w-4 h-4" />}
                    >
                      Add Purchase Invoice
                    </Button>
                  </Tooltip>
                )}
              </div>
            </div>
          }
        >
          <PurchaseInvoiceTable
            data={purchaseInvoices}
            loading={loading}
            onAction={refresh}
            onSort={handleSort}
            sortBy={sortBy}
            sortDirection={sortDirection}
            currentPage={currentPage}
            perPage={perPage}
            startIndex={rangeFrom !== '' ? Number(rangeFrom) : undefined}
            viewMode={viewMode}
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
