'use client';

import PageBreadcrumb from '../../components/common/PageBreadCrumb';
import ComponentCard from '../../components/common/ComponentCard';
import PageMeta from '../../components/common/PageMeta';
import SubscriptionTable from '../../components/subscription/SubscriptionTable';
import Pagination from '../../components/common/Pagination';
import { getSubscriptions } from '../../services/SubscriptionService';
import { Subscription } from '../../types';
import { useDataTable } from '../../hooks/useDataTable';
import TableToolbar from '../../components/common/TableToolbar';

export default function Subscriptions() {
  const {
    data: subscriptions,
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
    handlePageChange,
    handlePerPageChange,
    handleSort,
    refresh,
  } = useDataTable<Subscription>({
    fetchData: getSubscriptions,
  });

  return (
    <>
      <PageMeta title="Subscriptions" description="List of subscriptions" />
      <PageBreadcrumb pageTitle="Subscriptions" />
      <div className="space-y-6">
        <div className="p-5 border border-gray-200 rounded-2xl bg-gray-50 dark:bg-white/[0.03] dark:border-gray-800 shadow-sm">
          <TableToolbar
            className="mb-0"
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            searchPlaceholder="Search subscriptions..."
            perPage={perPage}
            onPerPageChange={handlePerPageChange}
            showRange={false}
            onReset={() => {
              setSearchTerm('');
            }}
          />
        </div>
        <ComponentCard title="Subscriptions">
          <SubscriptionTable
            data={subscriptions}
            loading={loading}
            onAction={refresh}
            onSort={handleSort}
            sortBy={sortBy}
            sortDirection={sortDirection}
            currentPage={currentPage}
            perPage={perPage}
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
