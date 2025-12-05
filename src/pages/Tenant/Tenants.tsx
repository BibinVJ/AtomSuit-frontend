"use client";

import { useEffect, useState } from 'react';
import PageBreadcrumb from '../../components/common/PageBreadCrumb';
import ComponentCard from '../../components/common/ComponentCard';
import PageMeta from '../../components/common/PageMeta';
import TenantTable from '../../components/tenant/TenantTable';
import AddTenantModal from '../../components/tenant/AddTenantModal';
import { useModal } from '../../hooks/useModal';
import Pagination from '../../components/common/Pagination';
import Button from '../../components/ui/button/Button';
import Select from '../../components/form/Select';
import { getTenants } from '../../services/TenantService';
import { usePermissions } from '../../hooks/usePermissions';
import { Tenant } from '../../types';

export default function Tenants() {
  const { hasPermission } = usePermissions();
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const { isOpen, openModal, closeModal } = useModal();
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [from, setFrom] = useState(0);
  const [to, setTo] = useState(0);
  const [total, setTotal] = useState(0);
  const [sortBy, setSortBy] = useState('created_at');
  const [sortDirection, setSortDirection] = useState('desc');

  const fetchTenants = async (page = 1, limit = 10, sortCol = 'created_at', sortDir = 'desc') => {
    try {
      const response = await getTenants(page, limit, sortCol, sortDir);      
      // Ensure data is always an array
      const tenantsData = Array.isArray(response.data) ? response.data : [];
      setTenants(tenantsData);
      
      // Safely handle meta data
      if (response.meta) {
        setTotalPages(response.meta.last_page || 1);
        setCurrentPage(response.meta.current_page || 1);
        setFrom(response.meta.from || 0);
        setTo(response.meta.to || 0);
        setTotal(response.meta.total || 0);
      }
    } catch (error) {
      console.error('Error fetching tenants:', error);
      setTenants([]);
    }
  };

  useEffect(() => {
    fetchTenants(currentPage, perPage, sortBy, sortDirection);
  }, [currentPage, perPage, sortBy, sortDirection]);

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
      <PageMeta
        title="Tenants"
        description="List of tenants"
      />
      <PageBreadcrumb pageTitle="Tenants" />
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <label htmlFor="perPage" className="text-sm font-medium text-gray-700">Per Page:</label>
          <Select
            options={[
              { value: '10', label: '10' },
              { value: '20', label: '20' },
              { value: '50', label: '50' },
            ]}
            onChange={handlePerPageChange}
            defaultValue={String(perPage)}
            showPlaceholder={false}
            className="w-20"
            searchable={false}
          />
        </div>
        {hasPermission("create-tenant") && (
          <Button onClick={openModal}>
            Add Tenant
          </Button>
        )}
      </div>
      <div className="space-y-6">
        <ComponentCard title="Tenants">
          <TenantTable
            data={tenants}
            onAction={() => fetchTenants(currentPage, perPage, sortBy, sortDirection)}
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
      <AddTenantModal isOpen={isOpen} onClose={closeModal} onTenantAdded={() => fetchTenants(1, perPage)} />
    </>
  );
}
