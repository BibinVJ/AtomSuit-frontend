'use client';

import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import ComponentCard from '@/components/common/ComponentCard';
import PageMeta from '@/components/common/PageMeta';
import SalesOrderTable from '@/app/(dashboard)/sales-orders/_components/SalesOrderTable';
import Pagination from '@/components/common/Pagination';
import Button from '@/components/ui/button/Button';
import Tooltip from '@/components/ui/tooltip/Tooltip';
import { getSalesOrders, restoreSalesOrder } from '@/services/SalesOrderService';
import { SalesOrder } from '@/types/SalesOrder';
import { usePermissions } from '@/hooks/usePermissions';
import { useDataTable } from '@/hooks/useDataTable';
import TableToolbar from '@/components/common/TableToolbar';
import ViewModeTabs from '@/components/common/ViewModeTabs';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import { isApiError } from '@/utils/errors';

export default function SalesOrders() {
  const { hasPermission } = usePermissions();

  const {
    data: salesOrders,
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
  } = useDataTable<SalesOrder>({
    fetchData: getSalesOrders,
  });

  const handleRestore = async (id: number) => {
    try {
      await restoreSalesOrder(id);
      toast.success('Sales Order restored successfully');
      refresh();
    } catch (error: unknown) {
      let message = 'Failed to restore sales order';
      if (isApiError(error)) {
        message = error.response?.data?.message || message;
      }
      toast.error(message);
    }
  };

  return (
    <>
      <PageMeta title="Sales Orders" description="List of sales orders" />
      <PageBreadcrumb pageTitle="Sales Orders" />

      <div className="space-y-6">
        <div className="p-5 border border-gray-200 rounded-2xl bg-gray-50 dark:bg-white/[0.03] dark:border-gray-800 shadow-sm">
          <TableToolbar
            className="mb-0"
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            searchPlaceholder="Search sales orders..."
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
          title={`Sales Orders (${viewMode})`}
          action={
            <div className="flex flex-wrap items-center gap-4">
              <ViewModeTabs viewMode={viewMode} setViewMode={setViewMode} />
              <div className="flex flex-wrap items-center gap-2">
                {hasPermission('create-sales-order') && (
                  <Tooltip text="Add New Sales Order">
                    <Button
                      href="/sales-orders/create"
                      size="sm"
                      startIcon={<Plus className="w-4 h-4" />}
                    >
                      Add Sales Order
                    </Button>
                  </Tooltip>
                )}
              </div>
            </div>
          }
        >
          <SalesOrderTable
            data={salesOrders}
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
