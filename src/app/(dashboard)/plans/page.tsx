'use client';

import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import ComponentCard from '@/components/common/ComponentCard';
import PageMeta from '@/components/common/PageMeta';
import PlanTable from '@/app/(dashboard)/plans/_components/PlanTable';
import AddPlanModal from '@/app/(dashboard)/plans/_components/AddPlanModal';
import { useModal } from '@/hooks/useModal';
import Pagination from '@/components/common/Pagination';
import Button from '@/components/ui/button/Button';
import Tooltip from '@/components/ui/tooltip/Tooltip';
import { getPlans } from '@/services/PlanService';
import { usePermissions } from '@/hooks/usePermissions';
import { Plan } from '@/types';
import TableToolbar from '@/components/common/TableToolbar';
import { useDataTable } from '@/hooks/useDataTable';

export default function Plans() {
  const { hasPermission } = usePermissions();
  const { isOpen, openModal, closeModal } = useModal();

  const {
    data: plans,
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
  } = useDataTable<Plan>({
    fetchData: getPlans,
    initialSortBy: 'created_at',
    initialSortDirection: 'desc',
  });

  return (
    <>
      <PageMeta title="Plans" description="List of plans" />
      <PageBreadcrumb pageTitle="Plans" />
      <div className="space-y-6">
        <div className="p-5 border border-gray-200 rounded-2xl bg-gray-50 dark:bg-white/[0.03] dark:border-gray-800 shadow-sm">
          <TableToolbar
            className="mb-0"
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            searchPlaceholder="Search plans..."
            perPage={perPage}
            onPerPageChange={handlePerPageChange}
            showRange={false}
            onReset={() => {
              setSearchTerm('');
            }}
          />
        </div>

        <ComponentCard
          title="Plans"
          action={
            hasPermission('create-plan') && (
              <Tooltip text="Add New Plan">
                <Button onClick={openModal} size="sm">
                  Add Plan
                </Button>
              </Tooltip>
            )
          }
        >
          <PlanTable
            data={plans}
            loading={loading}
            onAction={() => refresh()}
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
      <AddPlanModal isOpen={isOpen} onClose={closeModal} onPlanAdded={() => refresh()} />
    </>
  );
}
