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
import { Category, Item, Unit, ItemInput, ChartOfAccount, TaxGroup } from '../../../types';
import CollapsibleSection from '../../common/CollapsibleSection';
import { isApiError } from '../../../utils/errors';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  item: Item;
}

export default function EditItemModal({ isOpen, onClose, onSuccess, item }: Props) {
  const [formData, setFormData] = useState<ItemInput>({
    sku: '',
    name: '',
    category_id: '',
    unit_id: '',
    description: '',
    type: 'product',
    selling_price: 0,
    tax_group_id: '',
    is_tax_inclusive: false,
  });

  const [categories, setCategories] = useState<Category[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [taxGroups, setTaxGroups] = useState<TaxGroup[]>([]);
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
        selling_price: item.selling_price,
        sales_account_id: String(item.sales_account_id || ''),
        cogs_account_id: String(item.cogs_account_id || ''),
        inventory_account_id: String(item.inventory_account_id || ''),
        inventory_adjustment_account_id: String(item.inventory_adjustment_account_id || ''),
        purchase_account_id: String(item.purchase_account_id || ''),
        tax_group_id: String(item.tax_group_id || ''),
        is_tax_inclusive: item.is_tax_inclusive || false,
      });
    }
  }, [item]);

  useEffect(() => {
    if (isOpen) {
      fetchCategories();
      fetchUnits();
      fetchAccounts();
      fetchTaxGroups();
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await updateItem(item.id, {
        ...formData,
        tax_group_id: formData.tax_group_id ? Number(formData.tax_group_id) : undefined,
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
              Selling Price <span className="text-red-500">*</span>
            </Label>
            <Input
              type="number"
              value={formData.selling_price}
              onChange={(e) => setFormData({ ...formData, selling_price: Number(e.target.value) })}
              error={!!errors.selling_price}
              hint={errors.selling_price}
            />
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

          <div>
            <Label>&nbsp;</Label>
            <div className="flex items-center gap-2 mt-2">
              <Switch
                label="Tax Inclusive Price"
                checked={formData.is_tax_inclusive}
                onChange={(checked) => setFormData({ ...formData, is_tax_inclusive: checked })}
              />
            </div>
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
            <div className="lg:col-span-2">
              <Label>Purchase Account (Optional)</Label>
              <Select
                options={cogsAccounts
                  .filter(
                    (acc) =>
                      !acc.deleted_at || String(acc.id) === String(formData.purchase_account_id)
                  )
                  .map((acc) => ({
                    value: String(acc.id),
                    label: acc.deleted_at
                      ? `${acc.code} - ${acc.name} (Deleted)`
                      : `${acc.code} - ${acc.name}`,
                    className: acc.deleted_at ? 'text-red-500' : '',
                  }))}
                value={String(formData.purchase_account_id)}
                onChange={(val) => setFormData({ ...formData, purchase_account_id: val })}
                placeholder="Select Purchase Account"
                error={!!errors.purchase_account_id}
              />
              <p className="mt-1 text-xs text-gray-500">
                Usually COGS or Expense account for non-inventory items.
              </p>
            </div>
          </div>
        </CollapsibleSection>
      </div>
    </FormModal>
  );
}
