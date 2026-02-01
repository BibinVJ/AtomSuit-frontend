'use client';

import { useEffect, useState, useMemo } from 'react';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import ComponentCard from '@/components/common/ComponentCard';
import PageMeta from '@/components/common/PageMeta';
import ItemTable from '@/components/inventory/items/ItemTable';
import AddItemModal from '@/components/inventory/items/AddItemModal';
import ImportItemModal from '@/components/inventory/items/ImportItemModal';
import ItemPricingModal from '@/components/inventory/items/ItemPricingModal';
import { useModal } from '@/hooks/useModal';
import Pagination from '@/components/common/Pagination';
import Button from '@/components/ui/button/Button';
import Tooltip from '@/components/ui/tooltip/Tooltip';
import Select from '@/components/form/Select';
import { getItems, exportItems } from '@/services/ItemService';
import { getCategories } from '@/services/CategoryService';
import { getUnits } from '@/services/UnitService';
import { Item, Category, Unit } from '@/types';
import { Download, Upload, Plus } from 'lucide-react';
import { usePermissions } from '@/hooks/usePermissions';
import TableToolbar from '@/components/common/TableToolbar';
import ViewModeTabs from '@/components/common/ViewModeTabs';
import { useDataTable } from '@/hooks/useDataTable';
import { useExport } from '@/hooks/useExport';

export default function Items() {
  const { hasPermission } = usePermissions();
  const [categories, setCategories] = useState<Category[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const { isOpen: isAddOpen, openModal: openAddModal, closeModal: closeAddModal } = useModal();
  const {
    isOpen: isImportOpen,
    openModal: openImportModal,
    closeModal: closeImportModal,
  } = useModal();
  const {
    isOpen: isPricingOpen,
    openModal: openPricingModal,
    closeModal: closePricingModal,
  } = useModal();

  const [selectedItemForPricing, setSelectedItemForPricing] = useState<Item | null>(null);

  const [selectedCategory, setSelectedCategory] = useState<string | number>('');
  const [selectedUnit, setSelectedUnit] = useState<string | number>('');
  const [selectedType, setSelectedType] = useState<string>('');

  const extraParams = useMemo(
    () => ({
      category_id: selectedCategory || undefined,
      unit_id: selectedUnit || undefined,
      type: selectedType || undefined,
    }),
    [selectedCategory, selectedUnit, selectedType]
  );

  const {
    data: items,
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
  } = useDataTable<Item>({
    fetchData: getItems,
    extraParams,
  });

  const { exportData } = useExport();

  const fetchOptions = async () => {
    try {
      const [categoriesRes, unitsRes] = await Promise.all([
        getCategories({ unpaginated: true }),
        getUnits({ unpaginated: true }),
      ]);
      setCategories(categoriesRes.data || []);
      setUnits(unitsRes.data || []);
    } catch (error) {
      console.error('Error fetching options:', error);
    }
  };

  useEffect(() => {
    fetchOptions();
  }, []);

  const handleExport = () => {
    exportData({
      exportFunction: exportItems,
      entityName: 'Items',
    });
  };

  const handleManagePricing = (item: Item) => {
    setSelectedItemForPricing(item);
    openPricingModal();
  };

  const handlePricingModalClose = () => {
    closePricingModal();
    setSelectedItemForPricing(null);
  };

  const handleReset = () => {
    resetFilters();
    setSelectedCategory('');
    setSelectedUnit('');
    setSelectedType('');
  };

  return (
    <>
      <PageMeta title="Items" description="List of items" />
      <PageBreadcrumb pageTitle="Items" />

      <div className="space-y-6">
        <div className="p-5 border border-gray-200 rounded-2xl bg-gray-50 dark:bg-white/[0.03] dark:border-gray-800 shadow-sm">
          <TableToolbar
            className="mb-0"
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            searchPlaceholder="Search items..."
            rangeFrom={rangeFrom}
            onRangeFromChange={(val) => setRangeFrom(val as number | '')}
            rangeTo={rangeTo}
            onRangeToChange={(val) => setRangeTo(val as number | '')}
            perPage={perPage}
            onPerPageChange={handlePerPageChange}
            onReset={handleReset}
            extraFilters={
              <>
                <div className="w-full md:w-44">
                  <Select
                    options={[
                      { value: '', label: 'All Categories' },
                      ...categories.map((cat) => ({ value: String(cat.id), label: cat.name })),
                    ]}
                    onChange={(value) => setSelectedCategory(value)}
                    value={String(selectedCategory)}
                    placeholder="Category"
                    className="w-full"
                    searchable={true}
                  />
                </div>
                <div className="w-full md:w-36">
                  <Select
                    options={[
                      { value: '', label: 'All Units' },
                      ...units.map((unit) => ({ value: String(unit.id), label: unit.name })),
                    ]}
                    onChange={(value) => setSelectedUnit(value)}
                    value={String(selectedUnit)}
                    placeholder="Unit"
                    className="w-full"
                    searchable={true}
                  />
                </div>
                <div className="w-full md:w-36">
                  <Select
                    options={[
                      { value: '', label: 'All Types' },
                      { value: 'product', label: 'Product' },
                      { value: 'service', label: 'Service' },
                    ]}
                    onChange={(value) => setSelectedType(String(value))}
                    value={selectedType}
                    placeholder="Type"
                    className="w-full"
                  />
                </div>
              </>
            }
          />
        </div>

        <ComponentCard
          title={`Items (${viewMode})`}
          action={
            <div className="flex flex-wrap items-center gap-4">
              <ViewModeTabs viewMode={viewMode} setViewMode={setViewMode} />

              <div className="flex flex-wrap items-center gap-2">
                {hasPermission('view-item') && (
                  <Tooltip text="Export Items">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleExport}
                      className="flex items-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      Export
                    </Button>
                  </Tooltip>
                )}
                {hasPermission('create-item') && (
                  <>
                    <Tooltip text="Import Items">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={openImportModal}
                        className="flex items-center gap-2"
                      >
                        <Upload className="w-4 h-4" />
                        Import
                      </Button>
                    </Tooltip>
                    <Tooltip text="Add New Item">
                      <Button onClick={openAddModal} size="sm" className="flex items-center gap-2">
                        <Plus className="w-4 h-4" />
                        Add Item
                      </Button>
                    </Tooltip>
                  </>
                )}
              </div>
            </div>
          }
        >
          <ItemTable
            data={items}
            onAction={refresh}
            onSort={handleSort}
            sortBy={sortBy}
            sortDirection={sortDirection}
            currentPage={currentPage}
            perPage={perPage}
            startIndex={rangeFrom !== '' ? Number(rangeFrom) : undefined}
            viewMode={viewMode}
            onManagePricing={handleManagePricing}
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
      <AddItemModal isOpen={isAddOpen} onClose={closeAddModal} onSuccess={refresh} />
      <ImportItemModal isOpen={isImportOpen} onClose={closeImportModal} onSuccess={refresh} />
      <ItemPricingModal
        isOpen={isPricingOpen}
        onClose={handlePricingModalClose}
        item={selectedItemForPricing}
      />
    </>
  );
}
