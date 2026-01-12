'use client';

import { useState, useMemo, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import PageBreadcrumb from '../../components/common/PageBreadCrumb';
import ComponentCard from '../../components/common/ComponentCard';
import PageMeta from '../../components/common/PageMeta';
import ItemPriceTable from '../../components/inventory/ItemPriceTable';
import AddItemPriceModal from '../../components/inventory/AddItemPriceModal';
import DeleteItemPriceModal from '../../components/inventory/DeleteItemPriceModal';
import { useModal } from '../../hooks/useModal';
import Pagination from '../../components/common/Pagination';
import Button from '../../components/ui/button/Button';
import Tooltip from '../../components/ui/tooltip/Tooltip';
import { getItemPrices, exportItemPrices } from '../../services/ItemPriceService';
import { getPriceList } from '../../services/PriceListService';
import { ItemPrice } from '../../types/ItemPrice';
import { PriceList } from '../../types/PriceList';
import { useDataTable } from '../../hooks/useDataTable';
import { Plus, Download, ArrowLeft } from 'lucide-react';
import TableToolbar from '../../components/common/TableToolbar';
import ViewModeTabs from '../../components/common/ViewModeTabs';
import { toast } from 'sonner';

export default function PriceListDetails() {
  const params = useParams();
  const router = useRouter();
  const priceListId = Number(params?.id);

  const [priceList, setPriceList] = useState<PriceList | null>(null);
  const { isOpen, openModal, closeModal } = useModal();

  // Edit/Delete State
  const [selectedItemPrice, setSelectedItemPrice] = useState<ItemPrice | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  useEffect(() => {
    if (priceListId) {
      getPriceList(priceListId).then(setPriceList).catch(console.error);
    }
  }, [priceListId]);

  const extraParams = useMemo(
    () => ({
      price_list_id: priceListId,
    }),
    [priceListId]
  );

  const {
    data: itemPrices,
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
    setRangeFrom, // Not typically used for price range in generic logic, maybe quantity?
    rangeTo,
    setRangeTo,
    viewMode,
    setViewMode,
    handlePageChange,
    handlePerPageChange,
    handleSort,
    resetFilters,
    refresh,
  } = useDataTable<ItemPrice>({
    fetchData: getItemPrices,
    extraParams,
    initialSortBy: 'created_at',
  });

  const handleEdit = (ip: ItemPrice) => {
    setSelectedItemPrice(ip);
    openModal();
  };

  const handleDelete = (ip: ItemPrice) => {
    setSelectedItemPrice(ip);
    setIsDeleteModalOpen(true);
  };

  const handleModalClose = () => {
    closeModal();
    setSelectedItemPrice(null);
  };

  const handleDeleteModalClose = () => {
    setIsDeleteModalOpen(false);
    setSelectedItemPrice(null);
  };

  const handleExport = async () => {
    try {
      const blob = await exportItemPrices();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute(
        'download',
        `item_prices_${priceList?.name}_${new Date().toISOString()}.xlsx`
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Item Prices exported successfully');
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Failed to export Item Prices');
    }
  };

  if (!priceListId) return <div>Invalid Price List ID</div>;

  return (
    <>
      <PageMeta
        title={priceList ? `Price List: ${priceList.name}` : 'Price List Details'}
        description="Manage item prices"
      />
      <PageBreadcrumb pageTitle={priceList ? priceList.name : 'Price List Details'} />

      <div className="mb-4">
        <Button variant="outline" className="gap-2" onClick={() => router.back()}>
          <ArrowLeft size={16} /> Back to Price Lists
        </Button>
      </div>

      <div className="space-y-6">
        <div className="p-5 border border-gray-200 rounded-2xl bg-gray-50 dark:bg-white/[0.03] dark:border-gray-800 shadow-sm">
          <TableToolbar
            className="mb-0"
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            searchPlaceholder="Search Items..."
            perPage={perPage}
            onPerPageChange={handlePerPageChange}
            onReset={resetFilters}
            rangeFrom={rangeFrom}
            onRangeFromChange={(val) => setRangeFrom(val as number | '')}
            rangeTo={rangeTo}
            onRangeToChange={(val) => setRangeTo(val as number | '')}
          />
        </div>

        <ComponentCard
          title={`Item Prices (${viewMode})`}
          action={
            <div className="flex flex-wrap items-center gap-2">
              <ViewModeTabs viewMode={viewMode} setViewMode={setViewMode} />
              <Tooltip text="Export Item Prices">
                <Button
                  variant="outline"
                  className="h-[38px] w-[38px] p-0 flex items-center justify-center"
                  onClick={handleExport}
                >
                  <Download className="w-4 h-4" />
                </Button>
              </Tooltip>
              <Tooltip text="Add Item Price">
                <Button onClick={openModal} className="h-[38px] text-sm px-4">
                  <Plus className="w-4 h-4 mr-1.5" />
                  Add Item Price
                </Button>
              </Tooltip>
            </div>
          }
        >
          <div className="mb-4 px-5">
            {priceList && (
              <div className="flex gap-4 text-sm text-gray-500">
                <span>
                  <strong>Code:</strong> {priceList.code}
                </span>
                <span>
                  <strong>Currency:</strong> {priceList.currency?.code}
                </span>
                <span>
                  <strong>Type:</strong> {priceList.type}
                </span>
              </div>
            )}
          </div>
          <ItemPriceTable
            data={itemPrices}
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

        <AddItemPriceModal
          isOpen={isOpen}
          onClose={handleModalClose}
          onSuccess={refresh}
          priceListId={priceListId}
          itemPrice={selectedItemPrice}
        />

        <DeleteItemPriceModal
          isOpen={isDeleteModalOpen}
          onClose={handleDeleteModalClose}
          onSuccess={refresh}
          itemPrice={selectedItemPrice}
          force={viewMode === 'trashed'}
        />
      </div>
    </>
  );
}
