'use client';

import { useEffect, useState } from 'react';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import ComponentCard from '@/components/common/ComponentCard';
import PageMeta from '@/components/common/PageMeta';
import PlanTable from '@/app/plans/_components/PlanTable';
import AddPlanModal from '@/app/plans/_components/AddPlanModal';
import { useModal } from '@/hooks/useModal';
import Pagination from '@/components/common/Pagination';
import Button from '@/components/ui/button/Button';
import Tooltip from '@/components/ui/tooltip/Tooltip';
import { getPlans } from '@/services/PlanService';
import { usePermissions } from '@/hooks/usePermissions';
import { Plan } from '@/types';
import TableToolbar from '@/components/common/TableToolbar';

export default function Plans() {
  const { hasPermission } = usePermissions();
  const [plans, setPlans] = useState<Plan[]>([]);
  const { isOpen, openModal, closeModal } = useModal();
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [from, setFrom] = useState(0);
  const [to, setTo] = useState(0);
  const [total, setTotal] = useState(0);
  const [sortBy, setSortBy] = useState('created_at');
  const [sortDirection, setSortDirection] = useState('desc');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchPlans = async (page = 1, limit = 10, sortCol = 'created_at', sortDir = 'desc') => {
    try {
      const response = await getPlans({
        page,
        perPage: limit,
        sort_by: sortCol,
        sort_direction: sortDir,
      });
      setPlans(Array.isArray(response.data) ? response.data : []);
      if (response.meta) {
        setTotalPages(response.meta.last_page || 1);
        setCurrentPage(response.meta.current_page || 1);
        setFrom(response.meta.from || 0);
        setTo(response.meta.to || 0);
        setTotal(response.meta.total || 0);
      }
    } catch (error) {
      console.error('Error fetching plans:', error);
    }
  };

  useEffect(() => {
    fetchPlans(currentPage, perPage, sortBy, sortDirection);
  }, [currentPage, perPage, sortBy, sortDirection, searchTerm]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePerPageChange = (value: string) => {
    setPerPage(parseInt(value, 10));
    setCurrentPage(1);
  };

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortDirection('asc');
    }
  };

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
            onAction={() => fetchPlans(currentPage, perPage, sortBy, sortDirection)}
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
      <AddPlanModal
        isOpen={isOpen}
        onClose={closeModal}
        onPlanAdded={() => fetchPlans(1, perPage)}
      />
    </>
  );
}
