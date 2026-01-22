'use client';

import { useState, useEffect } from 'react';
import FormModal from '../../common/FormModal';
import Input from '../../form/input/InputField';
import Label from '../../form/Label';
import TextArea from '../../form/input/TextArea';
import Select from '../../form/Select';
import { toast } from 'sonner';
import { addItem } from '../../../services/ItemService';
import { getCategories } from '../../../services/CategoryService';
import { getUnits } from '../../../services/UnitService';
import { getChartOfAccounts } from '../../../services/ChartOfAccountService';
import { getTaxGroups } from '../../../services/TaxService';
import { getPriceLists } from '../../../services/PriceListService';

import { Category, Unit, ItemInput, ChartOfAccount, TaxGroup, PriceList } from '../../../types';
import CollapsibleSection from '../../common/CollapsibleSection';
import { isApiError } from '../../../utils/errors';
import { Plus, Trash2 } from 'lucide-react';
import { useSettings } from '../../../hooks/useSettings';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddItemModal({ isOpen, onClose, onSuccess }: Props) {
  const { getSetting } = useSettings();
  const [formData, setFormData] = useState<ItemInput>({
    sku: '',
    name: '',
    category_id: '',
    unit_id: '',
    description: '',
    type: 'product',

    sales_account_id: '',
    cogs_account_id: '',
    inventory_account_id: '',
    inventory_adjustment_account_id: '',
    tax_group_id: '',
  });

  const [categories, setCategories] = useState<Category[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [taxGroups, setTaxGroups] = useState<TaxGroup[]>([]);
  const [priceLists, setPriceLists] = useState<PriceList[]>([]);

  // Price States
  const [sellingPrices, setSellingPrices] = useState<
    { price_list_id: string; price: string; min_quantity: string }[]
  >([]);
  const [purchasePrices, setPurchasePrices] = useState<
    { price_list_id: string; price: string; min_quantity: string }[]
  >([]);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [salesAccounts, setSalesAccounts] = useState<ChartOfAccount[]>([]);
  const [cogsAccounts, setCogsAccounts] = useState<ChartOfAccount[]>([]);
  const [inventoryAccounts, setInventoryAccounts] = useState<ChartOfAccount[]>([]);
  const [expenseAccounts, setExpenseAccounts] = useState<ChartOfAccount[]>([]);

  useEffect(() => {
    if (isOpen) {
      fetchCategories();
      fetchUnits();
      fetchAccounts();
      fetchTaxGroups();
      fetchTaxGroups();
      fetchPriceLists();

      // Set default accounts if not already set
      setFormData((prev) => ({
        ...prev,
        sales_account_id: prev.sales_account_id || getSetting('default_sales_account', ''),
        cogs_account_id: prev.cogs_account_id || getSetting('default_cogs_account', ''),
        inventory_account_id:
          prev.inventory_account_id || getSetting('default_inventory_account', ''),
        inventory_adjustment_account_id:
          prev.inventory_adjustment_account_id ||
          getSetting('default_inventory_adjustment_account', ''),
      }));
    }
  }, [isOpen, getSetting]);

  const fetchCategories = async () => {
    try {
      const response = await getCategories({ unpaginated: true });
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchUnits = async () => {
    try {
      const response = await getUnits({ unpaginated: true });
      setUnits(response.data);
    } catch (error) {
      console.error('Error fetching units:', error);
    }
  };

  const fetchAccounts = async () => {
    try {
      const response = await getChartOfAccounts({ unpaginated: true });
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

      // Auto-initialize rows if empty
      const salesLists = response.data.filter((pl: PriceList) => pl.type === 'sales');
      const purchaseLists = response.data.filter((pl: PriceList) => pl.type === 'purchase');

      if (salesLists.length > 0) {
        setSellingPrices([
          { price_list_id: String(salesLists[0].id), price: '', min_quantity: '1' },
        ]);
      }
      if (purchaseLists.length > 0) {
        setPurchasePrices([
          { price_list_id: String(purchaseLists[0].id), price: '', min_quantity: '1' },
        ]);
      }
    } catch (error) {
      console.error('Error fetching price lists:', error);
    }
  };

  // Selling Price Handlers
  const handleAddSellingRow = () => {
    setSellingPrices([...sellingPrices, { price_list_id: '', price: '', min_quantity: '1' }]);
  };

  const handleDeleteSellingRow = (index: number) => {
    const newRows = [...sellingPrices];
    newRows.splice(index, 1);
    setSellingPrices(newRows);
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
    setPurchasePrices([...purchasePrices, { price_list_id: '', price: '', min_quantity: '1' }]);
  };

  const handleDeletePurchaseRow = (index: number) => {
    const newRows = [...purchasePrices];
    newRows.splice(index, 1);
    setPurchasePrices(newRows);
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

  const handleCategoryChange = (categoryId: string) => {
    const selectedCategory = categories.find((c) => String(c.id) === categoryId);

    const newFormData = { ...formData, category_id: categoryId };

    if (selectedCategory) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const cat = selectedCategory as any;
      if (cat.sales_account_id) newFormData.sales_account_id = String(cat.sales_account_id);
      if (cat.cogs_account_id) newFormData.cogs_account_id = String(cat.cogs_account_id);
      if (cat.inventory_account_id)
        newFormData.inventory_account_id = String(cat.inventory_account_id);
      if (cat.inventory_adjustment_account_id)
        newFormData.inventory_adjustment_account_id = String(cat.inventory_adjustment_account_id);
      if (cat.tax_group_id) {
        newFormData.tax_group_id = String(cat.tax_group_id);
      }
    }

    setFormData(newFormData);
  };

  const resetForm = () => {
    setFormData({
      sku: '',
      name: '',
      category_id: '',
      unit_id: '',
      description: '',
      type: 'product',

      sales_account_id: '',
      cogs_account_id: '',
      inventory_account_id: '',
      inventory_adjustment_account_id: '',
      tax_group_id: '',
    });
    setSellingPrices([]);
    setPurchasePrices([]);
    setErrors({});
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const allRows = [...sellingPrices, ...purchasePrices];
      const pricesPayload = allRows
        .filter((row) => row.price_list_id && row.price && Number(row.price) >= 0)
        .map((row) => ({
          price_list_id: Number(row.price_list_id),
          price: Number(row.price),
          min_quantity: row.min_quantity ? Number(row.min_quantity) : 1,
        }));

      const payload: ItemInput & { prices: typeof pricesPayload } = {
        ...formData,
        tax_group_id: formData.tax_group_id ? Number(formData.tax_group_id) : undefined,
        prices: pricesPayload,
      };

      await addItem(payload);

      onSuccess();
      toast.success('Item added successfully');
      handleClose();
    } catch (error: unknown) {
      if (isApiError(error) && error.response?.status === 422) {
        const apiResErrors = error.response.data.errors;
        if (apiResErrors) {
          setErrors(
            Object.keys(apiResErrors).reduce(
              (acc, key) => {
                acc[key] = apiResErrors[key][0];
                return acc;
              },
              {} as Record<string, string>
            )
          );
        }
        toast.error('Please correct the errors in the form');
      } else {
        toast.error('Failed to add item');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <FormModal
      isOpen={isOpen}
      onClose={handleClose}
      onSubmit={handleSubmit}
      title="Add New Item"
      description="Fill in the details to add a new item."
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
              options={categories.map((cat) => ({ value: String(cat.id), label: cat.name }))}
              value={String(formData.category_id)}
              onChange={handleCategoryChange}
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
              options={units.map((unit) => ({
                value: String(unit.id),
                label: `${unit.name} (${unit.code})`,
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
              onChange={(val) => setFormData({ ...formData, type: String(val) })}
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
                const selectedPl = priceLists.find((pl) => String(pl.id) === row.price_list_id);
                return (
                  <div key={index} className="grid grid-cols-12 gap-4 items-start">
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
                      {sellingPrices.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleDeleteSellingRow(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
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
            <div className="space-y-3 min-w-[600px] pb-2">
              <div className="grid grid-cols-12 gap-4 text-xs font-medium text-gray-500 uppercase">
                <div className="col-span-6">Price List</div>
                <div className="col-span-2 text-center">Currency</div>
                <div className="col-span-3">Price</div>
                <div className="col-span-1"></div>
              </div>
              {purchasePrices.map((row, index) => {
                const selectedPl = priceLists.find((pl) => String(pl.id) === row.price_list_id);
                return (
                  <div key={index} className="grid grid-cols-12 gap-4 items-start">
                    <div className="col-span-6">
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
                    <div className="col-span-3">
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
                          className={`w-full h-10 pl-7 pr-3 rounded-lg border bg-white dark:bg-white/5 text-gray-900 dark:text-white focus:ring-1 focus:ring-brand-500/20 focus:border-brand-500 transition-colors ${
                            false ? 'border-red-500' : 'border-gray-200 dark:border-white/10'
                          }`}
                          placeholder="0.00"
                        />
                      </div>
                    </div>
                    <div className="col-span-1 flex justify-center py-2">
                      {purchasePrices.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleDeletePurchaseRow(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </CollapsibleSection>

        <CollapsibleSection title="Accounting Details">
          <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
            <div>
              <Label>
                Sales Account <span className="text-red-500">*</span>
              </Label>
              <Select
                options={salesAccounts.map((acc) => ({
                  value: String(acc.id),
                  label: `${acc.code} - ${acc.name}`,
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
                options={cogsAccounts.map((acc) => ({
                  value: String(acc.id),
                  label: `${acc.code} - ${acc.name}`,
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
                options={inventoryAccounts.map((acc) => ({
                  value: String(acc.id),
                  label: `${acc.code} - ${acc.name}`,
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
                options={expenseAccounts.map((acc) => ({
                  value: String(acc.id),
                  label: `${acc.code} - ${acc.name}`,
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
      </div>
    </FormModal>
  );
}
