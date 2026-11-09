'use client';

import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import ComponentCard from '@/components/common/ComponentCard';
import PageMeta from '@/components/common/PageMeta';
import CustomerPaymentTable from '@/app/(dashboard)/customer-payments/_components/CustomerPaymentTable';
import Pagination from '@/components/common/Pagination';
import Button from '@/components/ui/button/Button';
import Tooltip from '@/components/ui/tooltip/Tooltip';
import { CustomerPaymentService } from '@/services/CustomerPaymentService';
import { CustomerPayment } from '@/types/CustomerPayment';
import { usePermissions } from '@/hooks/usePermissions';
import { useDataTable } from '@/hooks/useDataTable';
import TableToolbar from '@/components/common/TableToolbar';
import ViewModeTabs from '@/components/common/ViewModeTabs';
import { Plus } from 'lucide-react';
import { useState } from 'react';

export default function CustomerPayments() {
  const { hasPermission } = usePermissions();
  const [activeTab, setActiveTab] = useState<'active' | 'trashed'>('active');

  const {
    data: payments,
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
  } = useDataTable<CustomerPayment>({
    fetchData: CustomerPaymentService.list,
    extraParams: {
      status: activeTab === 'trashed' ? 'VOIDED' : undefined,
    },
  });

  return (
    <>
      <PageMeta title="Customer Payments" description="List of customer payments" />
      <PageBreadcrumb pageTitle="Customer Payments" />

      <div className="space-y-6">
        <div className="p-5 border border-gray-200 rounded-2xl bg-gray-50 dark:bg-white/[0.03] dark:border-gray-800 shadow-sm">
          <TableToolbar
            className="mb-0"
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            searchPlaceholder="Search payments..."
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
          title={`Customer Payments (${activeTab === 'trashed' ? 'Voided' : 'Active'})`}
          action={
            <div className="flex flex-wrap items-center gap-4">
              <ViewModeTabs
                viewMode={activeTab}
                setViewMode={setActiveTab}
                trashedLabel="Voided"
                trashedTooltip="Show Voided Payments"
              />
              <div className="flex flex-wrap items-center gap-2">
                {hasPermission('create-customer-payment') && (
                  <Tooltip text="Add New Customer Payment">
                    <Button
                      href="/customer-payments/create"
                      size="sm"
                      startIcon={<Plus className="w-4 h-4" />}
                    >
                      Add Customer Payment
                    </Button>
                  </Tooltip>
                )}
              </div>
            </div>
          }
        >
          <CustomerPaymentTable
            data={payments}
            loading={loading}
            onAction={refresh}
            onSort={handleSort}
            sortBy={sortBy}
            sortDirection={sortDirection}
            currentPage={currentPage}
            perPage={perPage}
            startIndex={rangeFrom !== '' ? Number(rangeFrom) : undefined}
            viewMode={activeTab === 'trashed' ? 'voided' : 'active'}
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
