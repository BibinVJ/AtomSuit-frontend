'use client';

import { useState, useMemo } from 'react';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import ComponentCard from '@/components/common/ComponentCard';
import PageMeta from '@/components/common/PageMeta';
import PriceListTable from '@/app/(dashboard)/inventory/_components/price-lists/PriceListTable';
import AddPriceListModal from '@/app/(dashboard)/inventory/_components/price-lists/AddPriceListModal';
import EditPriceListModal from '@/app/(dashboard)/inventory/_components/price-lists/EditPriceListModal';
import DeletePriceListModal from '@/app/(dashboard)/inventory/_components/price-lists/DeletePriceListModal';
import ViewPriceListModal from '@/app/(dashboard)/inventory/_components/price-lists/ViewPriceListModal';
import { useModal } from '@/hooks/useModal';
import Pagination from '@/components/common/Pagination';
import Button from '@/components/ui/button/Button';
import Tooltip from '@/components/ui/tooltip/Tooltip';
import Select from '@/components/form/Select';
import { getPriceLists, exportPriceLists } from '@/services/PriceListService';
import { PriceList } from '@/types/PriceList';
import { useDataTable } from '@/hooks/useDataTable';
import { Plus, Download } from 'lucide-react';
import TableToolbar from '@/components/common/TableToolbar';
import ViewModeTabs from '@/components/common/ViewModeTabs';
import { toast } from 'sonner';

export default function PriceLists() {
  const { isOpen, openModal, closeModal } = useModal();
  const { isOpen: isEditOpen, openModal: openEditModal, closeModal: closeEditModal } = useModal();
  const { isOpen: isViewOpen, openModal: openViewModal, closeModal: closeViewModal } = useModal();

  const [selectedType, setSelectedType] = useState('');

  // Edit/Delete/Manage State
  const [selectedPriceList, setSelectedPriceList] = useState<PriceList | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const extraParams = useMemo(
    () => ({
      type: selectedType,
    }),
    [selectedType]
  );

  const {
    data: priceLists,
    loading,
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
    setRangeFrom, // generic range filters
    rangeTo,
    setRangeTo,
    viewMode,
    setViewMode,
    handlePageChange,
    handlePerPageChange,
    handleSort,
    resetFilters,
    refresh,
  } = useDataTable<PriceList>({
    fetchData: getPriceLists,
    extraParams,
    initialSortBy: 'created_at',
  });

  const handleEdit = (pl: PriceList) => {
    setSelectedPriceList(pl);
    openEditModal();
  };

  const handleView = (pl: PriceList) => {
    setSelectedPriceList(pl);
    openViewModal();
  };

  const handleDelete = (pl: PriceList) => {
    setSelectedPriceList(pl);
    setIsDeleteModalOpen(true);
  };

  const handleModalClose = () => {
    closeModal();
    setSelectedPriceList(null);
  };

  const handleEditModalClose = () => {
    closeEditModal();
    setSelectedPriceList(null);
  };

  const handleViewModalClose = () => {
    closeViewModal();
    setSelectedPriceList(null);
  };

  const handleDeleteModalClose = () => {
    setIsDeleteModalOpen(false);
    setSelectedPriceList(null);
  };

  const handleReset = () => {
    resetFilters();
    setSelectedType('');
  };

  const handleExport = async () => {
    try {
      const response = await exportPriceLists();
      const url = window.URL.createObjectURL(response.data);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `price_lists_${new Date().toISOString()}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Price Lists exported successfully');
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Failed to export Price Lists');
    }
  };

  return (
    <>
      <PageMeta title="Price Lists" description="Manage multi-currency price lists" />
      <PageBreadcrumb pageTitle="Price Lists" />

      <div className="space-y-6">
        <div className="p-5 border border-gray-200 rounded-2xl bg-gray-50 dark:bg-white/[0.03] dark:border-gray-800 shadow-sm">
          <TableToolbar
            className="mb-0"
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            rangeFrom={rangeFrom}
            onRangeFromChange={(val) => setRangeFrom(val as number | '')}
            rangeTo={rangeTo}
            onRangeToChange={(val) => setRangeTo(val as number | '')}
            perPage={perPage}
            onPerPageChange={handlePerPageChange}
            onReset={handleReset}
            extraFilters={
              <div className="w-full md:w-44">
                <Select
                  options={[
                    { value: '', label: 'All Types' },
                    { value: 'sales', label: 'Sales' },
                    { value: 'purchase', label: 'Purchase' },
                  ]}
                  onChange={(value) => setSelectedType(value)}
                  defaultValue={selectedType}
                  placeholder="Type"
                  className="w-full"
                />
              </div>
            }
          />
        </div>

        <ComponentCard
          title={`Price Lists (${viewMode})`}
          action={
            <div className="flex flex-wrap items-center gap-2">
              <ViewModeTabs viewMode={viewMode} setViewMode={setViewMode} />
              <Tooltip text="Export Price Lists">
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
              <Tooltip text="Add New Price List">
                <Button onClick={openModal} size="sm" className="flex items-center gap-2">
                  <Plus size={16} />
                  Add Price List
                </Button>
              </Tooltip>
            </div>
          }
        >
          <PriceListTable
            data={priceLists}
            loading={loading}
            onAction={refresh}
            onSort={handleSort}
            sortBy={sortBy}
            sortDirection={sortDirection}
            currentPage={currentPage}
            perPage={perPage}
            startIndex={rangeFrom !== '' ? Number(rangeFrom) : undefined}
            viewMode={viewMode}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onViewDetails={handleView}
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

        <AddPriceListModal isOpen={isOpen} onClose={handleModalClose} onSuccess={refresh} />

        {selectedPriceList && (
          <EditPriceListModal
            isOpen={isEditOpen}
            onClose={handleEditModalClose}
            onSuccess={refresh}
            priceList={selectedPriceList}
          />
        )}

        {selectedPriceList && (
          <ViewPriceListModal
            isOpen={isViewOpen}
            onClose={handleViewModalClose}
            priceList={selectedPriceList}
          />
        )}

        <DeletePriceListModal
          isOpen={isDeleteModalOpen}
          onClose={handleDeleteModalClose}
          onSuccess={refresh}
          priceList={selectedPriceList}
          force={viewMode === 'trashed'}
        />
      </div>
    </>
  );
}
