'use client';

import { useState, useEffect } from 'react';
import FormModal from '../../common/FormModal';
import Input from '../../form/input/InputField';
import Label from '../../form/Label';
import TextArea from '../../form/input/TextArea';
import Select from '../../form/Select';
import Switch from '../../form/switch/Switch';
import { toast } from 'sonner';
import { addItem } from '../../../services/ItemService';
import { getCategories } from '../../../services/CategoryService';
import { getUnits } from '../../../services/UnitService';
import { getChartOfAccounts } from '../../../services/ChartOfAccountService';
import { getTaxGroups } from '../../../services/TaxService';
import { Category, Unit, ItemInput, ChartOfAccount, TaxGroup } from '../../../types';
import CollapsibleSection from '../../common/CollapsibleSection';
import { isApiError } from '../../../utils/errors';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddItemModal({ isOpen, onClose, onSuccess }: Props) {
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
    purchase_account_id: '',
    tax_group_id: '',
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
    if (isOpen) {
      fetchCategories();
      fetchUnits();
      fetchAccounts();
      fetchTaxGroups();
    }
  }, [isOpen]);

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

  const handleCategoryChange = (categoryId: string) => {
    const selectedCategory = categories.find((c) => String(c.id) === categoryId);

    const newFormData = { ...formData, category_id: categoryId };

    if (selectedCategory) {
      if (selectedCategory.sales_account_id)
        newFormData.sales_account_id = String(selectedCategory.sales_account_id);
      if (selectedCategory.cogs_account_id)
        newFormData.cogs_account_id = String(selectedCategory.cogs_account_id);
      if (selectedCategory.inventory_account_id)
        newFormData.inventory_account_id = String(selectedCategory.inventory_account_id);
      if (selectedCategory.inventory_adjustment_account_id)
        newFormData.inventory_adjustment_account_id = String(
          selectedCategory.inventory_adjustment_account_id
        );
      if (selectedCategory.purchase_account_id)
        newFormData.purchase_account_id = String(selectedCategory.purchase_account_id);
      if (selectedCategory.tax_group_id) {
        newFormData.tax_group_id = String(selectedCategory.tax_group_id);
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
      purchase_account_id: '',
      tax_group_id: '',
    });
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
      await addItem({
        ...formData,
        tax_group_id: formData.tax_group_id ? Number(formData.tax_group_id) : undefined,
      });
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
            <div className="lg:col-span-2">
              <Label>Purchase Account (Optional)</Label>
              <Select
                options={cogsAccounts.map((acc) => ({
                  value: String(acc.id),
                  label: `${acc.code} - ${acc.name}`,
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
