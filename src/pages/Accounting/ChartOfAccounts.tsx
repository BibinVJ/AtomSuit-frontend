'use client';

import { useRef, useCallback } from 'react';
import { useDataTable } from '../../hooks/useDataTable';
import { useModal } from '../../hooks/useModal';
import PageBreadcrumb from '../../components/common/PageBreadCrumb';
import PageMeta from '../../components/common/PageMeta';
import AddChartOfAccountModal from '../../components/accounting/charts/AddChartOfAccountModal';
import ChartOfAccountTable from '../../components/accounting/charts/ChartOfAccountTable';
import {
  getChartOfAccounts,
  exportChartOfAccounts,
  importChartOfAccounts,
} from '../../services/ChartOfAccountService';
import { ChartOfAccount } from '../../types';
import Button from '../../components/ui/button/Button';
import { Plus, Download, Upload } from 'lucide-react';
import { toast } from 'sonner';
import TableToolbar from '../../components/common/TableToolbar';
import Pagination from '../../components/common/Pagination';
import ComponentCard from '../../components/common/ComponentCard';
import ViewModeTabs from '../../components/common/ViewModeTabs';
import Tooltip from '../../components/ui/tooltip/Tooltip';
import { useExport } from '../../hooks/useExport';

export default function ChartOfAccounts() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { isOpen, openModal, closeModal } = useModal();

  const fetchData = useCallback(
    (params: Record<string, unknown>) => getChartOfAccounts({ ...params, with: 'accountGroup' }),
    []
  );

  const {
    data: chartsData,
    currentPage,
    perPage,
    totalPages,
    total,
    from,
    to,
    sortBy,
    sortDirection,
    searchTerm,
    setSearchTerm,
    rangeFrom,
    setRangeFrom,
    rangeTo,
    setRangeTo,
    viewMode,
    setViewMode,
    handlePageChange,
    handlePerPageChange,
    handleSort,
    resetFilters,
    refresh,
  } = useDataTable<ChartOfAccount>({
    fetchData,
    initialSortBy: 'code',
    initialSortDirection: 'asc',
  });

  const { exportData } = useExport();

  const handleExport = () => {
    exportData({
      exportFunction: exportChartOfAccounts,
      entityName: 'Chart of Accounts',
    });
  };

  const handleImportTrigger = () => {
    if (fileInputRef.current) fileInputRef.current.click();
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      await importChartOfAccounts(file);
      toast.success('Chart of Accounts imported successfully');
      refresh();
    } catch (error) {
      toast.error('Failed to import Chart of Accounts');
      console.error(error);
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <>
      <PageMeta title="Chart of Accounts" description="Manage your general ledger accounts." />
      <PageBreadcrumb pageTitle="Chart of Accounts" />

      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-2 ml-auto">
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept=".xlsx,.xls,.csv"
              onChange={handleFileUpload}
            />
          </div>
        </div>

        <div className="p-5 border border-gray-200 rounded-2xl bg-gray-50 dark:bg-white/[0.03] dark:border-gray-800 shadow-sm">
          <TableToolbar
            className="mb-0"
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            searchPlaceholder="Search accounts..."
            rangeFrom={rangeFrom}
            onRangeFromChange={(val) => setRangeFrom(val as number | '')}
            rangeTo={rangeTo}
            onRangeToChange={(val) => setRangeTo(val as number | '')}
            perPage={perPage}
            onPerPageChange={handlePerPageChange}
            onReset={resetFilters}
          />
        </div>

        <ComponentCard
          title={`Chart of Accounts (${viewMode})`}
          action={
            <div className="flex flex-wrap items-center gap-3">
              <ViewModeTabs viewMode={viewMode} setViewMode={setViewMode} />
              <Tooltip text="Import Accounts">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleImportTrigger}
                  className="flex items-center gap-2"
                >
                  <Upload size={16} />
                  Import
                </Button>
              </Tooltip>
              <Tooltip text="Export Accounts">
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
              <Tooltip text="Add New Account">
                <Button onClick={openModal} size="sm" className="flex items-center gap-2">
                  <Plus size={16} />
                  Add Account
                </Button>
              </Tooltip>
            </div>
          }
        >
          <ChartOfAccountTable
            data={chartsData}
            onAction={refresh}
            onSort={handleSort}
            sortBy={sortBy}
            sortDirection={sortDirection}
            currentPage={currentPage}
            perPage={perPage}
            startIndex={rangeFrom !== '' ? Number(rangeFrom) : undefined}
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

      <AddChartOfAccountModal isOpen={isOpen} onClose={closeModal} onSuccess={refresh} />
    </>
  );
}
