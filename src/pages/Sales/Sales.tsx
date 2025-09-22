"use client";

import { useEffect, useState } from 'react';
import PageBreadcrumb from '../../components/common/PageBreadCrumb';
import ComponentCard from '../../components/common/ComponentCard';
import PageMeta from '../../components/common/PageMeta';
import SaleTable from '../../components/sales/SaleTable';
import Pagination from '../../components/common/Pagination';
import Button from '../../components/ui/button/Button';
import Select from '../../components/form/Select';
import { useNavigate } from 'react-router';
import { getSales } from '../../services/SaleService';
import { Sale } from '../../types';

import { usePermissions } from '../../hooks/usePermissions';

export default function Sales() {
  const { hasPermission } = usePermissions();
  const [sales, setSales] = useState<Sale[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [from, setFrom] = useState(0);
  const [to, setTo] = useState(0);
  const [total, setTotal] = useState(0);
  const [sortBy, setSortBy] = useState('created_at');
  const [sortDirection, setSortDirection] = useState('desc');
  const router = useRouter();

  const fetchSales = async (page = 1, limit = 10, sortCol = 'created_at', sortDir = 'desc') => {
    try {
      const response = await getSales(page, limit, sortCol, sortDir);
      setSales(response.data);
      setTotalPages(response.meta.last_page);
      setCurrentPage(response.meta.current_page);
      setFrom(response.meta.from);
      setTo(response.meta.to);
      setTotal(response.meta.total);
    } catch (error) {
      console.error('Error fetching sales:', error);
    }
  };

  useEffect(() => {
    fetchSales(currentPage, perPage, sortBy, sortDirection);
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
        title="Sales"
        description="List of sales"
      />
      <PageBreadcrumb pageTitle="Sales" />
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
        {hasPermission("create-sale") && (
          <Button onClick={() => router.push('/sales/add')}>
            Add Sale
          </Button>
        )}
      </div>
      <div className="space-y-6">
        <ComponentCard>
          <SaleTable
            data={sales}
            onAction={() => fetchSales(currentPage, perPage, sortBy, sortDirection)}
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