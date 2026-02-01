'use client';

import { useDataTable } from '../../../hooks/useDataTable';
import PageBreadcrumb from '../../../components/common/PageBreadCrumb';
import PageMeta from '../../../components/common/PageMeta';
import AccountTypeTable from '../../../components/accounting/types/AccountTypeTable';
import { getAccountTypes } from '../../../services/AccountTypeService';
import { AccountType } from '../../../types';
import TableToolbar from '../../../components/common/TableToolbar';
import Pagination from '../../../components/common/Pagination';

export default function AccountTypes() {
  const {
    data: typesData,
    currentPage: typesCurrentPage,
    perPage: typesPerPage,
    totalPages: typesTotalPages,
    total: typesTotal,
    from: typesFrom,
    to: typesTo,
    sortBy: typesSortBy,
    sortDirection: typesSortDirection,
    searchTerm: typesSearchTerm,
    setSearchTerm: setTypesSearchTerm,
    handlePageChange: handleTypesPageChange,
    handlePerPageChange: handleTypesPerPageChange,
    handleSort: handleTypesSort,
  } = useDataTable<AccountType>({
    fetchData: getAccountTypes,
  });

  return (
    <>
      <PageMeta title="Account Types" description="Standard classification of accounts." />
      <PageBreadcrumb pageTitle="Account Types" />

      <div className="space-y-6">
        <div>
          <div className="p-5 border border-gray-200 rounded-2xl bg-gray-50 dark:bg-white/[0.03] dark:border-gray-800 shadow-sm mb-6">
            <TableToolbar
              className="mb-0"
              searchTerm={typesSearchTerm}
              onSearchChange={setTypesSearchTerm}
              searchPlaceholder="Search types..."
              perPage={typesPerPage}
              onPerPageChange={handleTypesPerPageChange}
              onReset={() => setTypesSearchTerm('')}
            />
          </div>

          <div className="overflow-hidden rounded-xl border border-gray-200 custom-card-bg dark:border-white/[0.05]">
            <div className="p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4 border-b border-gray-100 dark:border-white/[0.05]">
              <h3 className="font-semibold text-gray-800 text-theme-xl dark:text-white/90">
                Account Types
              </h3>
            </div>

            <AccountTypeTable
              data={typesData}
              onSort={handleTypesSort}
              sortBy={typesSortBy}
              sortDirection={typesSortDirection}
            />
            <div className="p-4 sm:p-5 border-t border-gray-100 dark:border-white/[0.05]">
              <Pagination
                currentPage={typesCurrentPage}
                totalPages={typesTotalPages}
                onPageChange={handleTypesPageChange}
                from={typesFrom}
                to={typesTo}
                total={typesTotal}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
