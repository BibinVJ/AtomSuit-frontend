"use client";


import { useEffect, useState } from 'react';
import PageBreadcrumb from '../../components/common/PageBreadCrumb';
import ComponentCard from '../../components/common/ComponentCard';
import PageMeta from '../../components/common/PageMeta';
import CustomerTable from '../../components/customer/CustomerTable';
import AddCustomerModal from '../../components/customer/AddCustomerModal';
import { useModal } from '../../hooks/useModal';
import Pagination from '../../components/common/Pagination';
import Button from '../../components/ui/button/Button';
import Tooltip from '../../components/ui/tooltip/Tooltip';
import Select from '../../components/form/Select';

import { getCustomers, exportCustomers, importCustomers, downloadSampleCustomerExcel } from '../../services/CustomerService';
import ImportModal from '../../components/common/ImportModal';
import { Download, Upload } from 'lucide-react';
import { toast } from 'sonner';
import ViewModeTabs from '../../components/common/ViewModeTabs';

import { usePermissions } from '../../hooks/usePermissions';
import { Customer } from '../../types';

import { useDebounce } from '../../hooks/useDebounce';
import TableToolbar from '../../components/common/TableToolbar';
import { Plus } from 'lucide-react';

export default function Customers() {
  const { hasPermission } = usePermissions();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const { isOpen, openModal, closeModal } = useModal();
  const { isOpen: isImportModalOpen, openModal: openImportModal, closeModal: closeImportModal } = useModal();
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [from, setFrom] = useState(0);
  const [to, setTo] = useState(0);
  const [total, setTotal] = useState(0);
  const [sortBy, setSortBy] = useState('created_at');
  const [sortDirection, setSortDirection] = useState('desc');
  const [viewMode, setViewMode] = useState<'active' | 'trashed'>('active');

  /* State for Range Fetching & Search */
  const [rangeFrom, setRangeFrom] = useState<number | ''>('');
  const [rangeTo, setRangeTo] = useState<number | ''>('');
  const [searchTerm, setSearchTerm] = useState('');

  const debouncedSearchTerm = useDebounce(searchTerm, 1000);
  const debouncedRangeFrom = useDebounce(rangeFrom, 1000);
  const debouncedRangeTo = useDebounce(rangeTo, 1000);

  const fetchCustomers = async (page = 1, limit = 10, sortCol = 'created_at', sortDir = 'desc') => {
    try {
      const response = await getCustomers({
        page,
        limit,
        sortCol,
        sortDir,
        from: debouncedRangeFrom !== '' ? Number(debouncedRangeFrom) : undefined,
        to: debouncedRangeTo !== '' ? Number(debouncedRangeTo) : undefined,
        search: debouncedSearchTerm,
        trashed: viewMode === 'trashed' ? 'only' : undefined
      });
      setCustomers(response.data);
      if (response.meta) {
        setTotalPages(response.meta.last_page || 1);
        setCurrentPage(response.meta.current_page || 1);
        setFrom(response.meta.from !== undefined ? response.meta.from : (debouncedRangeFrom !== '' ? Number(debouncedRangeFrom) : 0));
        setTo(response.meta.to !== undefined ? response.meta.to : (debouncedRangeTo !== '' ? Number(debouncedRangeTo) : 0));
        setTotal(response.meta.total || 0);
      }
    } catch (error) {
      console.error('Error fetching customers:', error);
    }
  };

  useEffect(() => {
    fetchCustomers(currentPage, perPage, sortBy, sortDirection);
  }, [currentPage, perPage, sortBy, sortDirection, debouncedSearchTerm, debouncedRangeFrom, debouncedRangeTo, viewMode]);

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
      const response = await exportCustomers();
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      link.setAttribute('download', `customers_${timestamp}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      toast.error('Failed to export customers');
      console.error('Export error:', error);
    }
  };

  return (
    <>
      <PageMeta
        title="Customers"
        description="List of customers"
      />
      <PageBreadcrumb pageTitle="Customers" />

      <div className="space-y-6">
        <div className="p-5 border border-gray-200 rounded-2xl bg-gray-50 dark:bg-white/[0.03] dark:border-gray-800 shadow-sm">
          <TableToolbar
            className="mb-0"
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            searchPlaceholder="Search customers..."
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
          title={`Customers (${viewMode})`}
          action={
            <div className="flex flex-wrap items-center gap-2">
              <ViewModeTabs viewMode={viewMode} setViewMode={setViewMode} />
              <Tooltip text="Import Customers">
                <Button variant="outline" size="sm" onClick={openImportModal} startIcon={<Upload className="w-4 h-4" />}>
                  Import
                </Button>
              </Tooltip>
              <Tooltip text="Export Customers">
                <Button variant="outline" size="sm" onClick={handleExport} startIcon={<Download className="w-4 h-4" />}>
                  Export
                </Button>
              </Tooltip>
              {hasPermission("create-customer") && (
                <Tooltip text="Add New Customer">
                  <Button onClick={openModal} size="sm" startIcon={<Plus className="w-4 h-4" />}>
                    Add Customer
                  </Button>
                </Tooltip>
              )}
            </div>
          }
        >
          <CustomerTable
            data={customers}
            onAction={() => fetchCustomers(currentPage, perPage, sortBy, sortDirection)}
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
      <AddCustomerModal isOpen={isOpen} onClose={closeModal} onCustomerAdded={() => fetchCustomers(1, perPage)} />
      <ImportModal
        isOpen={isImportModalOpen}
        onClose={closeImportModal}
        onImport={importCustomers}
        onDownloadSample={downloadSampleCustomerExcel}
        onSuccess={() => fetchCustomers(1, perPage)}
        entityName="Customers"
      />
    </>
  );
}

