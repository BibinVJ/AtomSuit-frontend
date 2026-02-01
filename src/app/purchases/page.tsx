'use client';

import { useRouter } from 'next/navigation';
import PageBreadcrumb from '../../components/common/PageBreadCrumb';
import ComponentCard from '../../components/common/ComponentCard';
import PageMeta from '../../components/common/PageMeta';
import PurchaseTable from '../../components/purchase/PurchaseTable';
import Pagination from '../../components/common/Pagination';
import Button from '../../components/ui/button/Button';
import Tooltip from '../../components/ui/tooltip/Tooltip';
import { getPurchases } from '../../services/PurchaseService';
import { Purchase } from '../../types';
import { usePermissions } from '../../hooks/usePermissions';
import { useDataTable } from '../../hooks/useDataTable';
import TableToolbar from '../../components/common/TableToolbar';
import { Plus } from 'lucide-react';

export default function Purchases() {
  const { hasPermission } = usePermissions();
  const router = useRouter();

  const {
    data: purchases,
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
  } = useDataTable<Purchase>({
    fetchData: getPurchases,
  });

  return (
    <>
      <PageMeta title="Purchases" description="List of purchases" />
      <PageBreadcrumb pageTitle="Purchases" />

      <div className="space-y-6">
        <div className="p-5 border border-gray-200 rounded-2xl bg-gray-50 dark:bg-white/[0.03] dark:border-gray-800 shadow-sm">
          <TableToolbar
            className="mb-0"
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            searchPlaceholder="Search purchases..."
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
          title="Purchases"
          action={
            <div className="flex flex-wrap items-center gap-2">
              {hasPermission('create-purchase') && (
                <Tooltip text="Add New Purchase">
                  <Button
                    onClick={() => router.push('/purchases/create')}
                    size="sm"
                    startIcon={<Plus className="w-4 h-4" />}
                  >
                    Add Purchase
                  </Button>
                </Tooltip>
              )}
            </div>
          }
        >
          <PurchaseTable
            data={purchases}
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
