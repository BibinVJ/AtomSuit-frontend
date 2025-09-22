"use client";


import { useEffect, useState } from 'react';
import PageBreadcrumb from '../../components/common/PageBreadCrumb';
import ComponentCard from '../../components/common/ComponentCard';
import PageMeta from '../../components/common/PageMeta';
import VendorTable from '../../components/vendor/VendorTable';
import AddVendorModal from '../../components/vendor/AddVendorModal';
import { useModal } from '../../hooks/useModal';
import Pagination from '../../components/common/Pagination';
import Button from '../../components/ui/button/Button';
import Select from '../../components/form/Select';
import { getVendors } from '../../services/VendorService';
import { Vendor } from '../../types';

import { usePermissions } from '../../hooks/usePermissions';

export default function Vendors() {
  const { hasPermission } = usePermissions();
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const { isOpen, openModal, closeModal } = useModal();
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [from, setFrom] = useState(0);
  const [to, setTo] = useState(0);
  const [total, setTotal] = useState(0);
  const [sortBy, setSortBy] = useState('created_at');
  const [sortDirection, setSortDirection] = useState('desc');

  const fetchVendors = async (page = 1, limit = 10, sortCol = 'created_at', sortDir = 'desc') => {
    try {
      const response = await getVendors(page, limit, sortCol, sortDir);
      setVendors(response.data);
      setTotalPages(response.meta.last_page);
      setCurrentPage(response.meta.current_page);
      setFrom(response.meta.from);
      setTo(response.meta.to);
      setTotal(response.meta.total);
    } catch (error) {
      console.error('Error fetching vendors:', error);
    }
  };

  useEffect(() => {
    fetchVendors(currentPage, perPage, sortBy, sortDirection);
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
        title="Vendors"
        description="List of vendors"
      />
      <PageBreadcrumb pageTitle="Vendors" />
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
        {hasPermission("create-vendor") && (
          <Button onClick={openModal}>
            Add Vendor
          </Button>
        )}
      </div>
      <div className="space-y-6">
        <ComponentCard title="Vendors">
          <VendorTable
            data={vendors}
            onAction={() => fetchVendors(currentPage, perPage, sortBy, sortDirection)}
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
      <AddVendorModal isOpen={isOpen} onClose={closeModal} onVendorAdded={() => fetchVendors(1, perPage)} />
    </>
  );
}
