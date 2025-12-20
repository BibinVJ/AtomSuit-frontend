'use client';

import { useEffect, useState } from 'react';
import PageBreadcrumb from '../../components/common/PageBreadCrumb';
import ComponentCard from '../../components/common/ComponentCard';
import PageMeta from '../../components/common/PageMeta';
import ItemTable from '../../components/inventory/items/ItemTable';
import AddItemModal from '../../components/inventory/items/AddItemModal';
import ImportItemModal from '../../components/inventory/items/ImportItemModal';
import { useModal } from '../../hooks/useModal';
import Pagination from '../../components/common/Pagination';
import Button from '../../components/ui/button/Button';
import Tooltip from '../../components/ui/tooltip/Tooltip';
import Select from '../../components/form/Select';
import { getItems, exportItems } from '../../services/ItemService';
import { getCategories } from '../../services/CategoryService';
import { getUnits } from '../../services/UnitService';
import { Item, Category, Unit } from '../../types';
import { Download, Upload, Plus } from 'lucide-react';
import { toast } from 'sonner';

import { usePermissions } from '../../hooks/usePermissions';

import { useDebounce } from '../../hooks/useDebounce';
import TableToolbar from '../../components/common/TableToolbar';
import ViewModeTabs from '../../components/common/ViewModeTabs';

export default function Items() {
  const { hasPermission } = usePermissions();
  const [items, setItems] = useState<Item[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const { isOpen: isAddOpen, openModal: openAddModal, closeModal: closeAddModal } = useModal();
  const {
    isOpen: isImportOpen,
    openModal: openImportModal,
    closeModal: closeImportModal,
  } = useModal();
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

  /* State for Advanced Filters */
  const [selectedCategory, setSelectedCategory] = useState<string | number>('');
  const [selectedUnit, setSelectedUnit] = useState<string | number>('');
  const [selectedType, setSelectedType] = useState<string>('');
  const [viewMode, setViewMode] = useState<'active' | 'trashed'>('active');

  const debouncedSearchTerm = useDebounce(searchTerm, 1000);
  const debouncedRangeFrom = useDebounce(rangeFrom, 1000);
  const debouncedRangeTo = useDebounce(rangeTo, 1000);

  const fetchItems = async (page = 1, limit = 10, sortCol = 'created_at', sortDir = 'desc') => {
    try {
      const response = await getItems({
        page,
        limit,
        sortCol,
        sortDir,
        from: debouncedRangeFrom !== '' ? Number(debouncedRangeFrom) : undefined,
        to: debouncedRangeTo !== '' ? Number(debouncedRangeTo) : undefined,
        search: debouncedSearchTerm,
        category_id: selectedCategory,
        unit_id: selectedUnit,
        type: selectedType,
        trashed: viewMode === 'trashed' ? 'only' : undefined,
      });
      setItems(response.data);
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
      console.error('Error fetching items:', error);
    }
  };

  const fetchOptions = async () => {
    try {
      const [categoriesRes, unitsRes] = await Promise.all([
        getCategories({ page: 1, limit: 10, sortCol: 'name', sortDir: 'asc', unpaginated: true }),
        getUnits({ page: 1, limit: 10, sortCol: 'name', sortDir: 'asc', unpaginated: true }),
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

  useEffect(() => {
    fetchItems(currentPage, perPage, sortBy, sortDirection);
  }, [
    currentPage,
    perPage,
    sortBy,
    sortDirection,
    debouncedSearchTerm,
    debouncedRangeFrom,
    debouncedRangeTo,
    selectedCategory,
    selectedUnit,
    selectedType,
    viewMode,
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
      const response = await exportItems();
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      link.setAttribute('download', `items_${timestamp}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Items exported successfully');
    } catch (error) {
      console.error('Error exporting items:', error);
      toast.error('Failed to export items');
    }
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
            onReset={() => {
              setSearchTerm('');
              setRangeFrom('');
              setRangeTo('');
              setSelectedCategory('');
              setSelectedUnit('');
              setSelectedType('');
            }}
            extraFilters={
              <>
                <div className="w-full md:w-44">
                  <Select
                    options={[
                      { value: '', label: 'All Categories' },
                      ...categories.map((cat) => ({ value: String(cat.id), label: cat.name })),
                    ]}
                    onChange={(value) => setSelectedCategory(value)}
                    defaultValue={String(selectedCategory)}
                    showPlaceholder={true}
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
                    defaultValue={String(selectedUnit)}
                    showPlaceholder={true}
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
                      { value: 'raw_material', label: 'Raw Material' },
                    ]}
                    onChange={(value) => setSelectedType(value)}
                    defaultValue={selectedType}
                    showPlaceholder={true}
                    placeholder="Type"
                    className="w-full"
                    searchable={false}
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
            onAction={() => fetchItems(currentPage, perPage, sortBy, sortDirection)}
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
      <AddItemModal
        isOpen={isAddOpen}
        onClose={closeAddModal}
        onItemAdded={() => fetchItems(1, perPage)}
      />
      <ImportItemModal
        isOpen={isImportOpen}
        onClose={closeImportModal}
        onItemsImported={() => fetchItems(1, perPage)}
      />
    </>
  );
}
