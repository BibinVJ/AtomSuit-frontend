'use client';

import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import ComponentCard from '@/components/common/ComponentCard';
import PageMeta from '@/components/common/PageMeta';
import DomainTable from '@/app/(dashboard)/domains/_components/DomainTable';
import Pagination from '@/components/common/Pagination';
import { getDomains } from '@/services/DomainService';
import { Domain } from '@/types';
import { useDataTable } from '@/hooks/useDataTable';
import TableToolbar from '@/components/common/TableToolbar';

export default function Domains() {
  const {
    data: domains,
    currentPage,
    perPage,
    totalPages,
    total,
    from,
    to,
    sortBy,
    sortDirection,
    handlePageChange,
    handlePerPageChange,
    handleSort,
  } = useDataTable<Domain>({
    fetchData: getDomains,
    initialSortBy: 'domain',
    initialSortDirection: 'asc',
  });

  return (
    <>
      <PageMeta title="Domains" description="List of domains" />
      <PageBreadcrumb pageTitle="Domains" />

      <div className="space-y-6">
        <div className="p-5 border border-gray-200 rounded-2xl bg-gray-50 dark:bg-white/[0.03] dark:border-gray-800 shadow-sm">
          <TableToolbar
            className="mb-0"
            searchTerm=""
            onSearchChange={() => {}}
            perPage={perPage}
            onPerPageChange={handlePerPageChange}
            onReset={() => {}}
          />
        </div>

        <ComponentCard title="Domains">
          <DomainTable
            data={domains}
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
