'use client';

import { useState, useMemo } from 'react';
import { Modal } from '../../ui/modal';
import ItemPriceTable from './ItemPriceTable';
import AddItemPriceModal from './AddItemPriceModal';
import DeleteItemPriceModal from './DeleteItemPriceModal';
import { useModal } from '../../../hooks/useModal';
import Pagination from '../../common/Pagination';
import Button from '../../ui/button/Button';
import Tooltip from '../../ui/tooltip/Tooltip';
import { getItemPrices, exportItemPrices } from '../../../services/ItemPriceService';
import { ItemPrice } from '../../../types/ItemPrice';
import { PriceList } from '../../../types/PriceList';
import { useDataTable } from '../../../hooks/useDataTable';
import { Plus, Download } from 'lucide-react';
import TableToolbar from '../../common/TableToolbar';
import ViewModeTabs from '../../common/ViewModeTabs';
import { toast } from 'sonner';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  priceList: PriceList | null;
}

export default function ManageItemPricesModal({ isOpen, onClose, priceList }: Props) {
  const priceListId = priceList?.id;
  const { isOpen: isAddOpen, openModal: openAddModal, closeModal: closeAddModal } = useModal();

  // Edit/Delete State
  const [selectedItemPrice, setSelectedItemPrice] = useState<ItemPrice | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

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
    enabled: !!priceListId && isOpen, // Only fetch when modal is open and ID exists
  });

  const handleEdit = (ip: ItemPrice) => {
    setSelectedItemPrice(ip);
    openAddModal();
  };

  const handleDelete = (ip: ItemPrice) => {
    setSelectedItemPrice(ip);
    setIsDeleteModalOpen(true);
  };

  const handleAddModalClose = () => {
    closeAddModal();
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

  if (!priceList) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-[900px] p-6 h-[80vh] flex flex-col">
      <div className="flex flex-col h-full">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              Manage Prices: {priceList.name}
            </h3>
            <p className="text-sm text-gray-500">
              {priceList.code} ({priceList.currency?.code}) - {priceList.type}
            </p>
          </div>
          <Button variant="outline" onClick={onClose} className="shrink-0">
            Close
          </Button>
        </div>

        <div className="flex-1 overflow-hidden flex flex-col space-y-4">
          <div className="p-3 border border-gray-200 rounded-xl bg-gray-50 dark:bg-white/[0.03] dark:border-gray-800 shadow-sm shrink-0">
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

          <div className="flex flex-wrap items-center gap-2 justify-end shrink-0">
            <ViewModeTabs viewMode={viewMode} setViewMode={setViewMode} />
            <Tooltip text="Export Item Prices">
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
            <Tooltip text="Add Item Price">
              <Button onClick={openAddModal} size="sm" className="flex items-center gap-2">
                <Plus size={16} />
                Add Item Price
              </Button>
            </Tooltip>
          </div>

          <div className="flex-1 overflow-auto border border-gray-200 rounded-xl dark:border-gray-800">
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
          </div>

          <div className="shrink-0">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              from={from}
              to={to}
              total={total}
            />
          </div>
        </div>

        <AddItemPriceModal
          isOpen={isAddOpen}
          onClose={handleAddModalClose}
          onSuccess={refresh}
          priceListId={priceList.id}
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
    </Modal>
  );
}
