'use client';

import { useEffect, useState } from 'react';
import PageBreadcrumb from '../../../components/common/PageBreadCrumb';
import ComponentCard from '../../../components/common/ComponentCard';
import PageMeta from '../../../components/common/PageMeta';
import CurrencyTable from '../../../components/accounting/currencies/CurrencyTable';
import AddCurrencyModal from '../../../components/accounting/currencies/AddCurrencyModal';
import { useModal } from '../../../hooks/useModal';
import Pagination from '../../../components/common/Pagination';
import Button from '../../../components/ui/button/Button';
import Tooltip from '../../../components/ui/tooltip/Tooltip';
import { getCurrencies, exportCurrencies } from '../../../services/CurrencyService';
import { Currency } from '../../../types/Currency';
import { Plus, Download } from 'lucide-react';
import { toast } from 'sonner';
import TableToolbar from '../../../components/common/TableToolbar';
import { useDebounce } from '../../../hooks/useDebounce';
import ViewModeTabs from '../../../components/common/ViewModeTabs';

export default function Currencies() {
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const { isOpen, openModal, closeModal } = useModal();
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [from, setFrom] = useState(0);
  const [to, setTo] = useState(0);
  const [total, setTotal] = useState(0);
  const [viewMode, setViewMode] = useState<'active' | 'trashed'>('active');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortDirection, setSortDirection] = useState('desc');

  const [searchTerm, setSearchTerm] = useState('');
  const [rangeFrom, setRangeFrom] = useState<number | ''>('');
  const [rangeTo, setRangeTo] = useState<number | ''>('');

  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const debouncedRangeFrom = useDebounce(rangeFrom, 1000);
  const debouncedRangeTo = useDebounce(rangeTo, 1000);

  const fetchCurrencies = async (
    page = 1,
    limit = 10,
    search = '',
    trashed = false,
    sortCol = 'created_at',
    sortDir = 'desc'
  ) => {
    try {
      const response = await getCurrencies({
        page,
        perPage: limit,
        search,
        trashed: trashed ? 'only' : undefined,
        from: debouncedRangeFrom !== '' ? Number(debouncedRangeFrom) : undefined,
        to: debouncedRangeTo !== '' ? Number(debouncedRangeTo) : undefined,
        sort_by: sortCol,
        sort_direction: sortDir,
      });
      setCurrencies(response.data);
      if (response.meta) {
        setTotalPages(response.meta.last_page || 1);
        setCurrentPage(response.meta.current_page || 1);
        setFrom(response.meta.from || 0);
        setTo(response.meta.to || 0);
        setTotal(response.meta.total || 0);
      }
    } catch (error) {
      console.error('Error fetching currencies:', error);
      toast.error('Failed to fetch currencies');
    }
  };

  useEffect(() => {
    fetchCurrencies(
      currentPage,
      perPage,
      debouncedSearchTerm,
      viewMode === 'trashed',
      sortBy,
      sortDirection
    );
  }, [
    currentPage,
    perPage,
    debouncedSearchTerm,
    viewMode,
    debouncedRangeFrom,
    debouncedRangeTo,
    sortBy,
    sortDirection,
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

  const handleExport = async () => {
    try {
      const response = await exportCurrencies();
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      link.setAttribute('download', `currencies_${timestamp}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      toast.error('Failed to export currencies');
      console.error('Export error:', error);
    }
  };

  return (
    <>
      <PageMeta title="Currencies" description="Manage system currencies" />
      <PageBreadcrumb pageTitle="Currencies" />

      <div className="space-y-6">
        <div className="p-5 border border-gray-200 rounded-2xl bg-gray-50 dark:bg-white/[0.03] dark:border-gray-800 shadow-sm">
          <TableToolbar
            className="mb-0"
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            searchPlaceholder="Search currencies..."
            perPage={perPage}
            onPerPageChange={handlePerPageChange}
            rangeFrom={rangeFrom}
            onRangeFromChange={(val) => setRangeFrom(val as number | '')}
            rangeTo={rangeTo}
            onRangeToChange={(val) => setRangeTo(val as number | '')}
            onReset={() => {
              setSearchTerm('');
              setRangeFrom('');
              setRangeTo('');
            }}
          />
        </div>

        <ComponentCard
          title={`Currencies (${viewMode})`}
          action={
            <div className="flex flex-wrap items-center gap-3">
              <ViewModeTabs viewMode={viewMode} setViewMode={setViewMode} />
              <Tooltip text="Export Currencies">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExport}
                  className="flex items-center gap-2"
                >
                  <Download size={16} />
                  Export
                </Button>
              </Tooltip>
              <Tooltip text="Add New Currency">
                <Button onClick={openModal} size="sm" className="flex items-center gap-2">
                  <Plus size={16} />
                  Add Currency
                </Button>
              </Tooltip>
            </div>
          }
        >
          <CurrencyTable
            data={currencies}
            onAction={() =>
              fetchCurrencies(
                currentPage,
                perPage,
                debouncedSearchTerm,
                viewMode === 'trashed',
                sortBy,
                sortDirection
              )
            }
            onSort={handleSort}
            sortBy={sortBy}
            sortDirection={sortDirection}
            currentPage={currentPage}
            perPage={perPage}
            startIndex={debouncedRangeFrom !== '' ? Number(debouncedRangeFrom) : undefined}
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
      <AddCurrencyModal
        isOpen={isOpen}
        onClose={closeModal}
        onSuccess={() =>
          fetchCurrencies(
            1,
            perPage,
            debouncedSearchTerm,
            viewMode === 'trashed',
            sortBy,
            sortDirection
          )
        }
      />
    </>
  );
}
