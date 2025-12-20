'use client';

import { useEffect, useState } from 'react';
import PageBreadcrumb from '../../components/common/PageBreadCrumb';
import ComponentCard from '../../components/common/ComponentCard';
import PageMeta from '../../components/common/PageMeta';
import DomainTable from '../../components/domain/DomainTable';
import Pagination from '../../components/common/Pagination';
import Select from '../../components/form/Select';
import { getDomains } from '../../services/DomainService';
import { Domain } from '../../types';

export default function Domains() {
  const [domains, setDomains] = useState<Domain[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [from, setFrom] = useState(0);
  const [to, setTo] = useState(0);
  const [total, setTotal] = useState(0);
  const [sortBy, setSortBy] = useState('domain');
  const [sortDirection, setSortDirection] = useState('asc');

  const fetchDomains = async (page = 1, limit = 10, sortCol = 'domain', sortDir = 'asc') => {
    try {
      const response = await getDomains(page, limit, sortCol, sortDir);
      setDomains(response.data as Domain[]);
      if (response.meta) {
        setTotalPages(response.meta.last_page);
        setCurrentPage(response.meta.current_page);
        setFrom(response.meta.from);
        setTo(response.meta.to);
        setTotal(response.meta.total);
      }
    } catch (error) {
      console.error('Error fetching domains:', error);
    }
  };

  useEffect(() => {
    fetchDomains(currentPage, perPage, sortBy, sortDirection);
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
      <PageMeta title="Domains" description="List of domains" />
      <PageBreadcrumb pageTitle="Domains" />
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <label htmlFor="perPage" className="text-sm font-medium text-gray-700">
            Per Page:
          </label>
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
      </div>
      <div className="space-y-6">
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
