'use client';

import { useRouter } from 'next/navigation';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import ComponentCard from '@/components/common/ComponentCard';
import PageMeta from '@/components/common/PageMeta';
import PurchaseOrderTable from '@/app/(dashboard)/purchase-orders/_components/PurchaseOrderTable';
import Pagination from '@/components/common/Pagination';
import Button from '@/components/ui/button/Button';
import Tooltip from '@/components/ui/tooltip/Tooltip';
import { getPurchaseOrders } from '@/services/PurchaseOrderService';
import { PurchaseOrder } from '@/types/PurchaseOrder';
import { usePermissions } from '@/hooks/usePermissions';
import { useDataTable } from '@/hooks/useDataTable';
import TableToolbar from '@/components/common/TableToolbar';
import { Plus } from 'lucide-react';

export default function PurchaseOrders() {
  const { hasPermission } = usePermissions();
  const router = useRouter();

  const {
    data: purchaseOrders,
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
  } = useDataTable<PurchaseOrder>({
    fetchData: getPurchaseOrders,
  });

  return (
    <>
      <PageMeta title="Purchase Orders" description="List of purchase orders" />
      <PageBreadcrumb pageTitle="Purchase Orders" />

      <div className="space-y-6">
        <div className="p-5 border border-gray-200 rounded-2xl bg-gray-50 dark:bg-white/[0.03] dark:border-gray-800 shadow-sm">
          <TableToolbar
            className="mb-0"
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            searchPlaceholder="Search purchase orders..."
            rangeFrom={rangeFrom}
            onRangeFromChange={(val) => setRangeFrom(val as number | '')}
            rangeTo={rangeTo}
            onRangeToChange={(val) => setRangeTo(val as number | '')}
            perPage={perPage}
            onPerPageChange={handlePerPageChange}
            onReset={() => {
              setSearchTerm('');
              setRangeFrom('');
              setRangeTo('');
            }}
          />
        </div>

        <ComponentCard
          title="Purchase Orders"
          action={
            <div className="flex flex-wrap items-center gap-2">
              {hasPermission('create-purchase-order') && (
                <Tooltip text="Add New Purchase Order">
                  <Button
                    onClick={() => router.push('/purchase-orders/create')}
                    size="sm"
                    startIcon={<Plus className="w-4 h-4" />}
                  >
                    Add Purchase Order
                  </Button>
                </Tooltip>
              )}
            </div>
          }
        >
          <PurchaseOrderTable
            data={purchaseOrders}
            loading={loading}
            onAction={refresh}
            onSort={handleSort}
            sortBy={sortBy}
            sortDirection={sortDirection}
            currentPage={currentPage}
            perPage={perPage}
            startIndex={rangeFrom !== '' ? Number(rangeFrom) : undefined}
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
