'use client';

import { useState, useEffect } from 'react';
import FormModal from '../../common/FormModal';
import Input from '../../form/input/InputField';
import Label from '../../form/Label';
import TextArea from '../../form/input/TextArea';
import Select from '../../form/Select';
import Switch from '../../form/switch/Switch';
import { toast } from 'sonner';
import { updateItem } from '../../../services/ItemService';
import { getCategories } from '../../../services/CategoryService';
import { getUnits } from '../../../services/UnitService';
import { getChartOfAccounts } from '../../../services/ChartOfAccountService';
import { getTaxGroups } from '../../../services/TaxService';
import {
  Category,
  Item,
  Unit,
  ItemInput,
  ChartOfAccount,
  TaxGroup,
  PriceList,
  ItemPrice,
} from '../../../types';
import CollapsibleSection from '../../common/CollapsibleSection';
import { isApiError } from '../../../utils/errors';
import { getPriceLists } from '../../../services/PriceListService';
import {
  getItemPrices,
  createItemPrice,
  updateItemPrice,
  deleteItemPrice,
} from '../../../services/ItemPriceService';
import { Plus, Trash2 } from 'lucide-react';
import Button from '../../ui/button/Button';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  item: Item;
  onManagePricing?: (item: Item) => void;
}

export default function EditItemModal({
  isOpen,
  onClose,
  onSuccess,
  item,
  onManagePricing,
}: Props) {
  const [formData, setFormData] = useState<ItemInput>({
    sku: '',
    name: '',
    category_id: '',
    unit_id: '',
    description: '',
    type: 'product',

    tax_group_id: '',
  });

  const [categories, setCategories] = useState<Category[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [taxGroups, setTaxGroups] = useState<TaxGroup[]>([]);
  const [priceLists, setPriceLists] = useState<PriceList[]>([]);

  // Price States
  interface PriceRow {
    uniqueId: string;
    id?: number;
    price_list_id: string;
    price: string;
    min_quantity: string;
    is_deleted?: boolean;
  }
  const [sellingPrices, setSellingPrices] = useState<PriceRow[]>([]);
  const [purchasePrices, setPurchasePrices] = useState<PriceRow[]>([]);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [salesAccounts, setSalesAccounts] = useState<ChartOfAccount[]>([]);
  const [cogsAccounts, setCogsAccounts] = useState<ChartOfAccount[]>([]);
  const [inventoryAccounts, setInventoryAccounts] = useState<ChartOfAccount[]>([]);
  const [expenseAccounts, setExpenseAccounts] = useState<ChartOfAccount[]>([]);

  useEffect(() => {
    if (item) {
      setFormData({
        sku: item.sku,
        name: item.name,
        category_id: String(item.category?.id || ''),
        unit_id: String(item.unit?.id || ''),
        description: item.description || '',
        type: item.type,

        sales_account_id: String(item.sales_account?.id || ''),
        cogs_account_id: String(item.cogs_account?.id || ''),
        inventory_account_id: String(item.inventory_account?.id || ''),
        inventory_adjustment_account_id: String(item.inventory_adjustment_account?.id || ''),
        tax_group_id: String(item.tax_group?.id || ''),
      });
    }
  }, [item]);

  useEffect(() => {
    if (isOpen) {
      fetchCategories();
      fetchUnits();
      fetchAccounts();
      fetchTaxGroups();
      fetchPriceLists();
    }
  }, [isOpen]);

  const fetchCategories = async () => {
    try {
      const response = await getCategories({ unpaginated: true, trashed: 'with' });
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchUnits = async () => {
    try {
      const response = await getUnits({ unpaginated: true, trashed: 'with' });
      setUnits(response.data);
    } catch (error) {
      console.error('Error fetching units:', error);
    }
  };

  const fetchAccounts = async () => {
    try {
      const response = await getChartOfAccounts({ unpaginated: true, trashed: 'with' });
      const accounts = response.data;
      setSalesAccounts(accounts);
      setCogsAccounts(accounts);
      setInventoryAccounts(accounts);
      setExpenseAccounts(accounts);
    } catch (error) {
      console.error('Error fetching accounts:', error);
    }
  };

  const fetchTaxGroups = async () => {
    try {
      const response = await getTaxGroups({ unpaginated: true });
      setTaxGroups(response.data);
    } catch (error) {
      console.error('Error fetching tax groups:', error);
    }
  };

  const fetchPriceLists = async () => {
    try {
      const response = await getPriceLists({ unpaginated: true, sort_by: 'id', sort_order: 'asc' });
      setPriceLists(response.data);
    } catch (error) {
      console.error('Error fetching price lists:', error);
    }
  };

  const fetchItemPrices = async () => {
    if (!item) return;
    try {
      const response = await getItemPrices({ item_id: item.id, unpaginated: true });
      const prices: ItemPrice[] = response.data;

      // Map to rows
      const salesRows: PriceRow[] = [];
      const purchaseRows: PriceRow[] = [];

      // We need to match with Price Lists to know the type
      // Wait, we need price lists loaded first or map later.
      // We can access price_list from the ItemPrice relation if eager loaded.
      // But getItemPrices might not join price_list type efficiently or we rely on the ID.
      // Let's assume we have priceLists state populated or we can derive type if we wait.
      // Actually, we can just split by price_list type if we have the list.

      // Better: Wait for priceLists?
      // Or just map what we have. API usually returns price_list object.

      // Let's use the local priceLists state if available, but it might be async race.
      // We can just iterate prices and see.
    } catch (error) {
      console.error('Error fetching item prices:', error);
    }
  };

  // Effect to load prices once item and priceLists are ready
  useEffect(() => {
    if (item && priceLists.length > 0) {
      loadPricingData();
    }
  }, [item, priceLists]);

  const loadPricingData = async () => {
    try {
      const response = await getItemPrices({ item_id: item.id, unpaginated: true });
      const prices: ItemPrice[] = response.data;

      const sRows: PriceRow[] = [];
      const pRows: PriceRow[] = [];

      prices.forEach((p) => {
        const pl = priceLists.find((l) => l.id === p.price_list?.id);
        if (pl) {
          const row: PriceRow = {
            uniqueId: `existing-${p.id}`,
            id: p.id,
            price_list_id: String(p.price_list?.id || ''),
            price: String(p.price),
            min_quantity: String(p.min_quantity || 1),
          };
          if (pl.type === 'sales') sRows.push(row);
          else if (pl.type === 'purchase') pRows.push(row);
        }
      });

      // Use functional updaters to avoid stale state if called multiple times, though usually useEffect handles it
      setSellingPrices(
        sRows.length > 0
          ? sRows
          : [{ uniqueId: 'new-init-s', price_list_id: '', price: '', min_quantity: '1' }]
      );
      setPurchasePrices(
        pRows.length > 0
          ? pRows
          : [{ uniqueId: 'new-init-p', price_list_id: '', price: '', min_quantity: '1' }]
      );
    } catch (error) {
      console.error('Error loading pricing data', error);
    }
  };

  // Selling Price Handlers
  const handleAddSellingRow = () => {
    setSellingPrices([
      ...sellingPrices,
      { uniqueId: `new-${Date.now()}`, price_list_id: '', price: '', min_quantity: '1' },
    ]);
  };

  const handleDeleteSellingRow = (index: number) => {
    const newRows = [...sellingPrices];
    // If it has an ID, mark as deleted
    if (newRows[index].id) {
      newRows[index].is_deleted = true;
      setSellingPrices(newRows);
    } else {
      // Just remove
      newRows.splice(index, 1);
      setSellingPrices(newRows);
    }
  };

  const handleUpdateSellingRow = (
    index: number,
    field: 'price_list_id' | 'price' | 'min_quantity',
    value: string
  ) => {
    const newRows = [...sellingPrices];
    newRows[index] = { ...newRows[index], [field]: value };
    setSellingPrices(newRows);
  };

  // Purchase Price Handlers
  const handleAddPurchaseRow = () => {
    setPurchasePrices([
      ...purchasePrices,
      { uniqueId: `new-${Date.now()}`, price_list_id: '', price: '', min_quantity: '1' },
    ]);
  };

  const handleDeletePurchaseRow = (index: number) => {
    const newRows = [...purchasePrices];
    if (newRows[index].id) {
      newRows[index].is_deleted = true;
      setPurchasePrices(newRows);
    } else {
      newRows.splice(index, 1);
      setPurchasePrices(newRows);
    }
  };

  const handleUpdatePurchaseRow = (
    index: number,
    field: 'price_list_id' | 'price' | 'min_quantity',
    value: string
  ) => {
    const newRows = [...purchasePrices];
    newRows[index] = { ...newRows[index], [field]: value };
    setPurchasePrices(newRows);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const allRows = [...sellingPrices, ...purchasePrices];
      const pricesPayload = allRows
        .filter((row) => {
          // If deleted, we need to send it if it has an ID, so backend knows to delete.
          if (row.is_deleted && row.id) return true;
          // If not deleted, must have valid data
          if (!row.is_deleted && row.price_list_id && row.price && Number(row.price) >= 0)
            return true;
          return false;
        })
        .map((row) => ({
          id: row.id,
          price_list_id: Number(row.price_list_id),
          price: Number(row.price),
          min_quantity: row.min_quantity ? Number(row.min_quantity) : 1,
          is_deleted: row.is_deleted,
        }));

      await updateItem(item.id, {
        ...formData,
        tax_group_id: formData.tax_group_id ? Number(formData.tax_group_id) : undefined,
        prices: pricesPayload,
      });

      onSuccess();
      toast.success('Item updated successfully');
      onClose();
    } catch (error: unknown) {
      if (isApiError(error) && error.response?.status === 422) {
        const apiErrors = error.response.data.errors;
        if (apiErrors) {
          setErrors(
            Object.keys(apiErrors).reduce(
              (acc, key) => {
                acc[key] = apiErrors[key][0];
                return acc;
              },
              {} as Record<string, string>
            )
          );
        }
        toast.error('Please correct the errors in the form');
      } else {
        toast.error('Failed to update item');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={handleSubmit}
      title="Edit Item"
      description="Update the details of the item."
      isSubmitting={isSubmitting}
      size="2xl"
    >
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
          <div>
            <Label>
              SKU <span className="text-red-500">*</span>
            </Label>
            <Input
              type="text"
              value={formData.sku}
              onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
              error={!!errors.sku}
              hint={errors.sku}
            />
          </div>
          <div>
            <Label>
              Name <span className="text-red-500">*</span>
            </Label>
            <Input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              error={!!errors.name}
              hint={errors.name}
            />
          </div>
          <div>
            <Label>
              Category <span className="text-red-500">*</span>
            </Label>
            <Select
              options={categories
                .filter((cat) => !cat.deleted_at || String(cat.id) === String(formData.category_id))
                .map((cat) => ({
                  value: String(cat.id),
                  label: cat.deleted_at ? `${cat.name} (Deleted)` : cat.name,
                  variant: (cat.deleted_at ? 'danger' : 'default') as 'danger' | 'default',
                }))}
              value={String(formData.category_id)}
              onChange={(val) => setFormData({ ...formData, category_id: val })}
              placeholder="Select a category"
              error={!!errors.category_id}
            />
            {errors.category_id && (
              <p className="mt-1 text-xs text-red-500">{errors.category_id}</p>
            )}
          </div>
          <div>
            <Label>
              Unit <span className="text-red-500">*</span>
            </Label>
            <Select
              options={units
                .filter((unit) => !unit.deleted_at || String(unit.id) === String(formData.unit_id))
                .map((unit) => ({
                  value: String(unit.id),
                  label: unit.deleted_at
                    ? `${unit.name} (${unit.code}) (Deleted)`
                    : `${unit.name} (${unit.code})`,
                  variant: (unit.deleted_at ? 'danger' : 'default') as 'danger' | 'default',
                }))}
              value={String(formData.unit_id)}
              onChange={(val) => setFormData({ ...formData, unit_id: val })}
              placeholder="Select a unit"
              error={!!errors.unit_id}
            />
            {errors.unit_id && <p className="mt-1 text-xs text-red-500">{errors.unit_id}</p>}
          </div>

          <div>
            <Label>
              Type <span className="text-red-500">*</span>
            </Label>
            <Select
              options={[
                { value: 'product', label: 'Product' },
                { value: 'service', label: 'Service' },
              ]}
              value={formData.type}
              onChange={(val) => setFormData({ ...formData, type: val })}
              error={!!errors.type}
            />
            {errors.type && <p className="mt-1 text-xs text-red-500">{errors.type}</p>}
          </div>

          <div>
            <Label>
              Tax Group <span className="text-red-500">*</span>
            </Label>
            <Select
              options={taxGroups.map((tg) => ({ value: String(tg.id), label: tg.name }))}
              value={String(formData.tax_group_id || '')}
              onChange={(val) => setFormData({ ...formData, tax_group_id: val })}
              placeholder="Select Tax Group"
              error={!!errors.tax_group_id}
            />
            {errors.tax_group_id && (
              <p className="mt-1 text-xs text-red-500">{errors.tax_group_id}</p>
            )}
          </div>

          <div className="lg:col-span-2">
            <Label>Description</Label>
            <TextArea
              placeholder="Enter description"
              value={formData.description}
              onChange={(val) => setFormData({ ...formData, description: val })}
            />
          </div>
        </div>

        <CollapsibleSection title="Accounting Details">
          <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
            <div>
              <Label>
                Sales Account <span className="text-red-500">*</span>
              </Label>
              <Select
                options={salesAccounts
                  .filter(
                    (acc) => !acc.deleted_at || String(acc.id) === String(formData.sales_account_id)
                  )
                  .map((acc) => ({
                    value: String(acc.id),
                    label: acc.deleted_at
                      ? `${acc.code} - ${acc.name} (Deleted)`
                      : `${acc.code} - ${acc.name}`,
                    className: acc.deleted_at ? 'text-red-500' : '',
                  }))}
                value={String(formData.sales_account_id)}
                onChange={(val) => setFormData({ ...formData, sales_account_id: val })}
                placeholder="Select Sales Account"
                error={!!errors.sales_account_id}
              />
              {errors.sales_account_id && (
                <p className="mt-1 text-xs text-red-500">{errors.sales_account_id}</p>
              )}
            </div>
            <div>
              <Label>
                Cost of Goods Sold Account <span className="text-red-500">*</span>
              </Label>
              <Select
                options={cogsAccounts
                  .filter(
                    (acc) => !acc.deleted_at || String(acc.id) === String(formData.cogs_account_id)
                  )
                  .map((acc) => ({
                    value: String(acc.id),
                    label: acc.deleted_at
                      ? `${acc.code} - ${acc.name} (Deleted)`
                      : `${acc.code} - ${acc.name}`,
                    className: acc.deleted_at ? 'text-red-500' : '',
                  }))}
                value={String(formData.cogs_account_id)}
                onChange={(val) => setFormData({ ...formData, cogs_account_id: val })}
                placeholder="Select COGS Account"
                error={!!errors.cogs_account_id}
              />
              {errors.cogs_account_id && (
                <p className="mt-1 text-xs text-red-500">{errors.cogs_account_id}</p>
              )}
            </div>
            <div>
              <Label>
                Inventory Account <span className="text-red-500">*</span>
              </Label>
              <Select
                options={inventoryAccounts
                  .filter(
                    (acc) =>
                      !acc.deleted_at || String(acc.id) === String(formData.inventory_account_id)
                  )
                  .map((acc) => ({
                    value: String(acc.id),
                    label: acc.deleted_at
                      ? `${acc.code} - ${acc.name} (Deleted)`
                      : `${acc.code} - ${acc.name}`,
                    className: acc.deleted_at ? 'text-red-500' : '',
                  }))}
                value={String(formData.inventory_account_id)}
                onChange={(val) => setFormData({ ...formData, inventory_account_id: val })}
                placeholder="Select Inventory Account"
                error={!!errors.inventory_account_id}
              />
              {errors.inventory_account_id && (
                <p className="mt-1 text-xs text-red-500">{errors.inventory_account_id}</p>
              )}
            </div>
            <div>
              <Label>
                Inventory Adjustments Account <span className="text-red-500">*</span>
              </Label>
              <Select
                options={expenseAccounts
                  .filter(
                    (acc) =>
                      !acc.deleted_at ||
                      String(acc.id) === String(formData.inventory_adjustment_account_id)
                  )
                  .map((acc) => ({
                    value: String(acc.id),
                    label: acc.deleted_at
                      ? `${acc.code} - ${acc.name} (Deleted)`
                      : `${acc.code} - ${acc.name}`,
                    className: acc.deleted_at ? 'text-red-500' : '',
                  }))}
                value={String(formData.inventory_adjustment_account_id)}
                onChange={(val) =>
                  setFormData({ ...formData, inventory_adjustment_account_id: val })
                }
                placeholder="Select Adjustment Account"
                error={!!errors.inventory_adjustment_account_id}
              />
              {errors.inventory_adjustment_account_id && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.inventory_adjustment_account_id}
                </p>
              )}
            </div>
          </div>
        </CollapsibleSection>

        {/* Selling Prices Section */}
        <CollapsibleSection
          title="Selling Prices"
          defaultOpen={true}
          rightElement={
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleAddSellingRow();
              }}
              className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors"
            >
              <Plus size={16} strokeWidth={4} className="text-brand-600 dark:text-gray-400" />
            </button>
          }
        >
          <div className="overflow-x-auto">
            <div className="space-y-3 min-w-[500px] pb-2">
              <div className="grid grid-cols-12 gap-4 text-xs font-medium text-gray-500 uppercase">
                <div className="col-span-5">Price List</div>
                <div className="col-span-2 text-center">Currency</div>
                <div className="col-span-2">Price</div>
                <div className="col-span-2">Min Qty</div>
                <div className="col-span-1"></div>
              </div>
              {sellingPrices.map((row, index) => {
                if (row.is_deleted) return null;
                const selectedPl = priceLists.find((pl) => String(pl.id) === row.price_list_id);
                return (
                  <div key={row.uniqueId} className="grid grid-cols-12 gap-4 items-start">
                    <div className="col-span-5">
                      <Select
                        options={priceLists
                          .filter((pl) => pl.type === 'sales')
                          .map((pl) => ({ value: String(pl.id), label: pl.name }))}
                        value={row.price_list_id}
                        onChange={(val) => handleUpdateSellingRow(index, 'price_list_id', val)}
                        placeholder="Select List"
                        className="text-sm"
                      />
                    </div>
                    <div className="col-span-2 py-2 text-sm text-center text-gray-700 dark:text-gray-300">
                      {selectedPl?.currency?.code || '-'}
                    </div>
                    <div className="col-span-2">
                      <div className="relative">
                        <span className="absolute left-3 top-2 text-gray-500 text-sm">
                          {selectedPl?.currency?.symbol || ''}
                        </span>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={row.price}
                          onChange={(e) => handleUpdateSellingRow(index, 'price', e.target.value)}
                          className={`w-full h-10 pl-7 pr-3 rounded-lg border bg-white dark:bg-white/5 text-gray-900 dark:text-white focus:ring-1 focus:ring-brand-500/20 focus:border-brand-500 transition-colors border-gray-200 dark:border-white/10`}
                          placeholder="0.00"
                        />
                      </div>
                    </div>
                    <div className="col-span-2">
                      <input
                        type="number"
                        min="1"
                        step="1"
                        value={row.min_quantity}
                        onChange={(e) =>
                          handleUpdateSellingRow(index, 'min_quantity', e.target.value)
                        }
                        className={`w-full h-10 px-3 rounded-lg border bg-white dark:bg-white/5 text-gray-900 dark:text-white focus:ring-1 focus:ring-brand-500/20 focus:border-brand-500 transition-colors border-gray-200 dark:border-white/10`}
                        placeholder="1"
                      />
                    </div>
                    <div className="col-span-1 flex justify-center py-2">
                      <button
                        type="button"
                        onClick={() => handleDeleteSellingRow(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </CollapsibleSection>

        {/* Purchase Prices Section */}
        <CollapsibleSection
          title="Purchase Prices"
          rightElement={
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleAddPurchaseRow();
              }}
              className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors"
            >
              <Plus size={16} strokeWidth={4} className="text-brand-600 dark:text-gray-400" />
            </button>
          }
        >
          <div className="overflow-x-auto">
            <div className="space-y-3 min-w-[500px] pb-2">
              <div className="grid grid-cols-12 gap-4 text-xs font-medium text-gray-500 uppercase">
                <div className="col-span-5">Price List</div>
                <div className="col-span-2 text-center">Currency</div>
                <div className="col-span-2">Price</div>
                <div className="col-span-2">Min Qty</div>
                <div className="col-span-1"></div>
              </div>
              {purchasePrices.map((row, index) => {
                if (row.is_deleted) return null;
                const selectedPl = priceLists.find((pl) => String(pl.id) === row.price_list_id);
                return (
                  <div key={row.uniqueId} className="grid grid-cols-12 gap-4 items-start">
                    <div className="col-span-5">
                      <Select
                        options={priceLists
                          .filter((pl) => pl.type === 'purchase')
                          .map((pl) => ({ value: String(pl.id), label: pl.name }))}
                        value={row.price_list_id}
                        onChange={(val) => handleUpdatePurchaseRow(index, 'price_list_id', val)}
                        placeholder="Select List"
                        className="text-sm"
                      />
                    </div>
                    <div className="col-span-2 py-2 text-sm text-center text-gray-700 dark:text-gray-300">
                      {selectedPl?.currency?.code || '-'}
                    </div>
                    <div className="col-span-2">
                      <div className="relative">
                        <span className="absolute left-3 top-2 text-gray-500 text-sm">
                          {selectedPl?.currency?.symbol || ''}
                        </span>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={row.price}
                          onChange={(e) => handleUpdatePurchaseRow(index, 'price', e.target.value)}
                          className={`w-full h-10 pl-7 pr-3 rounded-lg border bg-white dark:bg-white/5 text-gray-900 dark:text-white focus:ring-1 focus:ring-brand-500/20 focus:border-brand-500 transition-colors border-gray-200 dark:border-white/10`}
                          placeholder="0.00"
                        />
                      </div>
                    </div>
                    <div className="col-span-2">
                      <input
                        type="number"
                        min="1"
                        step="1"
                        value={row.min_quantity}
                        onChange={(e) =>
                          handleUpdatePurchaseRow(index, 'min_quantity', e.target.value)
                        }
                        className={`w-full h-10 px-3 rounded-lg border bg-white dark:bg-white/5 text-gray-900 dark:text-white focus:ring-1 focus:ring-brand-500/20 focus:border-brand-500 transition-colors border-gray-200 dark:border-white/10`}
                        placeholder="1"
                      />
                    </div>
                    <div className="col-span-1 flex justify-center py-2">
                      <button
                        type="button"
                        onClick={() => handleDeletePurchaseRow(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </CollapsibleSection>
      </div>
    </FormModal>
  );
}
