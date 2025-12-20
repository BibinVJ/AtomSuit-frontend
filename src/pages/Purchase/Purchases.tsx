'use client';

import { useEffect, useState } from 'react';
import PageBreadcrumb from '../../components/common/PageBreadCrumb';
import ComponentCard from '../../components/common/ComponentCard';
import PageMeta from '../../components/common/PageMeta';
import PurchaseTable from '../../components/purchase/PurchaseTable';
import Pagination from '../../components/common/Pagination';
import Button from '../../components/ui/button/Button';
import Tooltip from '../../components/ui/tooltip/Tooltip';
import Select from '../../components/form/Select';
import { useRouter } from 'next/navigation';
import { getPurchases } from '../../services/PurchaseService';
import { Purchase } from '../../types';

import { usePermissions } from '../../hooks/usePermissions';

import { useDebounce } from '../../hooks/useDebounce';
import TableToolbar from '../../components/common/TableToolbar';
import { Plus } from 'lucide-react';

export default function Purchases() {
  const { hasPermission } = usePermissions();
  const router = useRouter();
  const [purchases, setPurchases] = useState<Purchase[]>([]);
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

  const debouncedSearchTerm = useDebounce(searchTerm, 1000);
  const debouncedRangeFrom = useDebounce(rangeFrom, 1000);
  const debouncedRangeTo = useDebounce(rangeTo, 1000);

  const fetchPurchases = async (page = 1, limit = 10, sortCol = 'created_at', sortDir = 'desc') => {
    try {
      const response = await getPurchases(
        page,
        limit,
        sortCol,
        sortDir,
        debouncedRangeFrom !== '' ? Number(debouncedRangeFrom) : undefined,
        debouncedRangeTo !== '' ? Number(debouncedRangeTo) : undefined,
        debouncedSearchTerm
      );
      setPurchases(response.data);
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
      console.error('Error fetching purchases:', error);
    }
  };

  useEffect(() => {
    fetchPurchases(currentPage, perPage, sortBy, sortDirection);
  }, [
    currentPage,
    perPage,
    sortBy,
    sortDirection,
    debouncedSearchTerm,
    debouncedRangeFrom,
    debouncedRangeTo,
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
      <PageMeta title="Purchases" description="List of purchases" />
      <PageBreadcrumb pageTitle="Purchases" />

      <div className="space-y-6">
        <div className="p-5 border border-gray-200 rounded-2xl bg-gray-50 dark:bg-white/[0.03] dark:border-gray-800 shadow-sm">
          <TableToolbar
            className="mb-0"
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            searchPlaceholder="Search purchases..."
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
          title="Purchases"
          action={
            <div className="flex flex-wrap items-center gap-2">
              {hasPermission('create-purchase') && (
                <Tooltip text="Add New Purchase">
                  <Button
                    onClick={() => router.push('/purchases/add')}
                    size="sm"
                    startIcon={<Plus className="w-4 h-4" />}
                  >
                    Add Purchase
                  </Button>
                </Tooltip>
              )}
            </div>
          }
        >
          <PurchaseTable
            data={purchases}
            onAction={() => fetchPurchases(currentPage, perPage, sortBy, sortDirection)}
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
    </>
  );
}
