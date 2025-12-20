'use client';

import { useEffect, useState } from 'react';
import PageBreadcrumb from '../../components/common/PageBreadCrumb';
import ComponentCard from '../../components/common/ComponentCard';
import PageMeta from '../../components/common/PageMeta';
import SubscriptionTable from '../../components/subscription/SubscriptionTable';
import Pagination from '../../components/common/Pagination';
import Select from '../../components/form/Select';
import { getSubscriptions } from '../../services/SubscriptionService';
import { usePermissions } from '../../hooks/usePermissions';
import { Subscription } from '../../types';
import TableToolbar from '../../components/common/TableToolbar';

export default function Subscriptions() {
  const { hasPermission } = usePermissions();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [from, setFrom] = useState(0);
  const [to, setTo] = useState(0);
  const [total, setTotal] = useState(0);
  const [sortBy, setSortBy] = useState('created_at');
  const [sortDirection, setSortDirection] = useState('desc');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchSubscriptions = async (
    page = 1,
    limit = 10,
    sortCol = 'created_at',
    sortDir = 'desc'
  ) => {
    try {
      const response = await getSubscriptions(page, limit, sortCol, sortDir);
      setSubscriptions(Array.isArray(response.data) ? response.data : []);
      if (response.meta) {
        setTotalPages(response.meta.last_page || 1);
        setCurrentPage(response.meta.current_page || 1);
        setFrom(response.meta.from || 0);
        setTo(response.meta.to || 0);
        setTotal(response.meta.total || 0);
      }
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
    }
  };

  useEffect(() => {
    fetchSubscriptions(currentPage, perPage, sortBy, sortDirection);
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
      <PageMeta title="Subscriptions" description="List of subscriptions" />
      <PageBreadcrumb pageTitle="Subscriptions" />
      <div className="space-y-6">
        <div className="p-5 border border-gray-200 rounded-2xl bg-gray-50 dark:bg-white/[0.03] dark:border-gray-800 shadow-sm">
          <TableToolbar
            className="mb-0"
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            searchPlaceholder="Search subscriptions..."
            perPage={perPage}
            onPerPageChange={handlePerPageChange}
            showRange={false}
            onReset={() => {
              setSearchTerm('');
            }}
          />
        </div>
        <ComponentCard title="Subscriptions">
          <SubscriptionTable
            data={subscriptions}
            onAction={() => fetchSubscriptions(currentPage, perPage, sortBy, sortDirection)}
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
