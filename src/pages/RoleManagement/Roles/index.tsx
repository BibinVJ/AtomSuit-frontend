'use client';

import { useRouter } from 'next/navigation';
import PageBreadcrumb from '../../../components/common/PageBreadCrumb';
import ComponentCard from '../../../components/common/ComponentCard';
import PageMeta from '../../../components/common/PageMeta';
import RoleTable from '../../../components/role/RoleTable';
import Pagination from '../../../components/common/Pagination';
import Button from '../../../components/ui/button/Button';
import Tooltip from '../../../components/ui/tooltip/Tooltip';
import { getRoles } from '../../../services/RoleService';
import { Role } from '../../../types';
import { useDataTable } from '../../../hooks/useDataTable';
import TableToolbar from '../../../components/common/TableToolbar';
import { Plus } from 'lucide-react';
import ViewModeTabs from '../../../components/common/ViewModeTabs';

export default function Roles() {
  const router = useRouter();

  const {
    data: roles,
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
    viewMode,
    setViewMode,
    handlePageChange,
    handlePerPageChange,
    handleSort,
    refresh,
  } = useDataTable<Role>({
    fetchData: getRoles,
  });

  return (
    <>
      <PageMeta title="Roles" description="List of roles" />
      <PageBreadcrumb pageTitle="Roles" />

      <div className="space-y-6">
        <div className="p-5 border border-gray-200 rounded-2xl bg-gray-50 dark:bg-white/[0.03] dark:border-gray-800 shadow-sm">
          <TableToolbar
            className="mb-0"
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            searchPlaceholder="Search roles..."
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
          title={`Roles (${viewMode})`}
          action={
            <div className="flex flex-wrap items-center gap-2">
              <ViewModeTabs viewMode={viewMode} setViewMode={setViewMode} />
              <Tooltip text="Add New Role">
                <Button
                  onClick={() => router.push('/roles/add')}
                  size="sm"
                  startIcon={<Plus className="w-4 h-4" />}
                >
                  Add Role
                </Button>
              </Tooltip>
            </div>
          }
        >
          <RoleTable
            data={roles}
            loading={loading}
            onAction={refresh}
            onSort={handleSort}
            sortBy={sortBy}
            sortDirection={sortDirection}
            currentPage={currentPage}
            perPage={perPage}
            startIndex={rangeFrom !== '' ? Number(rangeFrom) : undefined}
            viewMode={viewMode}
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
