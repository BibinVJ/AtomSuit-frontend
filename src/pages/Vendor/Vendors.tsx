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
import Tooltip from '../../components/ui/tooltip/Tooltip';
import Select from '../../components/form/Select';
import { getVendors, exportVendors, importVendors, downloadSampleVendorExcel } from '../../services/VendorService';
import { Vendor } from '../../types';
import ImportModal from '../../components/common/ImportModal';
import { Download, Upload } from 'lucide-react';
import { toast } from 'sonner';
import ViewModeTabs from '../../components/common/ViewModeTabs';

import { usePermissions } from '../../hooks/usePermissions';

import { useDebounce } from '../../hooks/useDebounce';
import TableToolbar from '../../components/common/TableToolbar';
import { Plus } from 'lucide-react';

export default function Vendors() {
  const { hasPermission } = usePermissions();
  const [vendors, setVendors] = useState<Vendor[]>([]);
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

  const fetchVendors = async (page = 1, limit = 10, sortCol = 'created_at', sortDir = 'desc') => {
    try {
      const response = await getVendors({
        page,
        limit,
        sortCol,
        sortDir,
        from: debouncedRangeFrom !== '' ? Number(debouncedRangeFrom) : undefined,
        to: debouncedRangeTo !== '' ? Number(debouncedRangeTo) : undefined,
        search: debouncedSearchTerm,
        trashed: viewMode === 'trashed' ? 'only' : undefined
      });
      setVendors(response.data);
      if (response.meta) {
        setTotalPages(response.meta.last_page || 1);
        setCurrentPage(response.meta.current_page || 1);
        setFrom(response.meta.from !== undefined ? response.meta.from : (debouncedRangeFrom !== '' ? Number(debouncedRangeFrom) : 0));
        setTo(response.meta.to !== undefined ? response.meta.to : (debouncedRangeTo !== '' ? Number(debouncedRangeTo) : 0));
        setTotal(response.meta.total || 0);
      }
    } catch (error) {
      console.error('Error fetching vendors:', error);
    }
  };

  useEffect(() => {
    fetchVendors(currentPage, perPage, sortBy, sortDirection);
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
      const response = await exportVendors();
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      link.setAttribute('download', `vendors_${timestamp}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      toast.error('Failed to export vendors');
      console.error('Export error:', error);
    }
  };

  return (
    <>
      <PageMeta
        title="Vendors"
        description="List of vendors"
      />
      <PageBreadcrumb pageTitle="Vendors" />

      <div className="space-y-6">
        <div className="p-5 border border-gray-200 rounded-2xl bg-gray-50 dark:bg-white/[0.03] dark:border-gray-800 shadow-sm">
          <TableToolbar
            className="mb-0"
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            searchPlaceholder="Search vendors..."
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
          title={`Vendors (${viewMode})`}
          action={
            <div className="flex flex-wrap items-center gap-2">
              <ViewModeTabs viewMode={viewMode} setViewMode={setViewMode} />
              <Tooltip text="Import Vendors">
                <Button variant="outline" size="sm" onClick={openImportModal} startIcon={<Upload className="w-4 h-4" />}>
                  Import
                </Button>
              </Tooltip>
              <Tooltip text="Export Vendors">
                <Button variant="outline" size="sm" onClick={handleExport} startIcon={<Download className="w-4 h-4" />}>
                  Export
                </Button>
              </Tooltip>
              {hasPermission("create-vendor") && (
                <Tooltip text="Add New Vendor">
                  <Button onClick={openModal} size="sm" startIcon={<Plus className="w-4 h-4" />}>
                    Add Vendor
                  </Button>
                </Tooltip>
              )}
            </div>
          }
        >
          <VendorTable
            data={vendors}
            onAction={() => fetchVendors(currentPage, perPage, sortBy, sortDirection)}
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
      <AddVendorModal isOpen={isOpen} onClose={closeModal} onVendorAdded={() => fetchVendors(1, perPage)} />
      <ImportModal
        isOpen={isImportModalOpen}
        onClose={closeImportModal}
        onImport={importVendors}
        onDownloadSample={downloadSampleVendorExcel}
        onSuccess={() => fetchVendors(1, perPage)}
        entityName="Vendors"
      />
    </>
  );
}

