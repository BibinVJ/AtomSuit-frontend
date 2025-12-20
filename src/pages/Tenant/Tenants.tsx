'use client';

import { useEffect, useState } from 'react';
import PageBreadcrumb from '../../components/common/PageBreadCrumb';
import ComponentCard from '../../components/common/ComponentCard';
import PageMeta from '../../components/common/PageMeta';
import TenantTable from '../../components/tenant/TenantTable';
import AddTenantModal from '../../components/tenant/AddTenantModal';
import { useModal } from '../../hooks/useModal';
import Pagination from '../../components/common/Pagination';
import Button from '../../components/ui/button/Button';
import Tooltip from '../../components/ui/tooltip/Tooltip';
import Select from '../../components/form/Select';
import { getTenants } from '../../services/TenantService';
import { getPlans } from '../../services/PlanService';
import { usePermissions } from '../../hooks/usePermissions';
import { Tenant, Plan } from '../../types';

import { useDebounce } from '../../hooks/useDebounce';
import TableToolbar from '../../components/common/TableToolbar';
import { Plus } from 'lucide-react';

export default function Tenants() {
  const { hasPermission } = usePermissions();
  const [tenants, setTenants] = useState<Tenant[]>([]);
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

  /* State for Range Fetching & Search */
  const [rangeFrom, setRangeFrom] = useState<number | ''>('');
  const [rangeTo, setRangeTo] = useState<number | ''>('');
  const [searchTerm, setSearchTerm] = useState('');

  /* State for Plan Filter */
  const [selectedPlan, setSelectedPlan] = useState<string | number>('');

  const debouncedSearchTerm = useDebounce(searchTerm, 1000);
  const debouncedRangeFrom = useDebounce(rangeFrom, 1000);
  const debouncedRangeTo = useDebounce(rangeTo, 1000);

  const fetchTenants = async (page = 1, limit = 10, sortCol = 'created_at', sortDir = 'desc') => {
    try {
      const response = await getTenants(
        page,
        limit,
        sortCol,
        sortDir,
        debouncedRangeFrom !== '' ? Number(debouncedRangeFrom) : undefined,
        debouncedRangeTo !== '' ? Number(debouncedRangeTo) : undefined,
        debouncedSearchTerm,
        selectedPlan
      );
      // Ensure data is always an array
      const tenantsData = Array.isArray(response.data) ? response.data : [];
      setTenants(tenantsData);

      // Safely handle meta data
      if (response.meta) {
        setTotalPages(response.meta.last_page || 1);
        setCurrentPage(response.meta.current_page || 1);
        setFrom(
          response.meta.from !== undefined
            ? response.meta.from
            : debouncedRangeFrom !== ''
              ? Number(debouncedRangeFrom)
              : 0
        );
        setTo(
          response.meta.to !== undefined
            ? response.meta.to
            : debouncedRangeTo !== ''
              ? Number(debouncedRangeTo)
              : 0
        );
        setTotal(response.meta.total || 0);
      }
    } catch (error) {
      console.error('Error fetching tenants:', error);
      setTenants([]);
    }
  };

  const fetchPlans = async () => {
    try {
      const response = await getPlans(1, 10, 'name', 'asc', true);
      setPlans(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error fetching plans:', error);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  useEffect(() => {
    fetchTenants(currentPage, perPage, sortBy, sortDirection);
  }, [
    currentPage,
    perPage,
    sortBy,
    sortDirection,
    debouncedSearchTerm,
    debouncedRangeFrom,
    debouncedRangeTo,
    selectedPlan,
  ]);

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
      <PageMeta title="Tenants" description="List of tenants" />
      <PageBreadcrumb pageTitle="Tenants" />

      <div className="space-y-6">
        <div className="p-5 border border-gray-200 rounded-2xl bg-gray-50 dark:bg-white/[0.03] dark:border-gray-800 shadow-sm">
          <TableToolbar
            className="mb-0"
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            searchPlaceholder="Search tenants..."
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
              setSelectedPlan('');
            }}
            extraFilters={
              <div className="w-full md:w-44">
                <Select
                  options={[
                    { value: '', label: 'All Plans' },
                    ...plans.map((plan) => ({ value: String(plan.id), label: plan.name })),
                  ]}
                  onChange={(value) => setSelectedPlan(value)}
                  defaultValue={String(selectedPlan)}
                  showPlaceholder={true}
                  placeholder="Plan"
                  className="w-full"
                  searchable={true}
                />
              </div>
            }
          />
        </div>

        <ComponentCard
          title="Tenants"
          action={
            <div className="flex flex-wrap items-center gap-2">
              {hasPermission('create-tenant') && (
                <Tooltip text="Add New Tenant">
                  <Button onClick={openModal} size="sm" startIcon={<Plus className="w-4 h-4" />}>
                    Add Tenant
                  </Button>
                </Tooltip>
              )}
            </div>
          }
        >
          <TenantTable
            data={tenants}
            onAction={() => fetchTenants(currentPage, perPage, sortBy, sortDirection)}
            onSort={handleSort}
            sortBy={sortBy}
            sortDirection={sortDirection}
            currentPage={currentPage}
            perPage={perPage}
            startIndex={debouncedRangeFrom !== '' ? Number(debouncedRangeFrom) : undefined}
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
      <AddTenantModal
        isOpen={isOpen}
        onClose={closeModal}
        onTenantAdded={() => fetchTenants(1, perPage)}
      />
    </>
  );
}
