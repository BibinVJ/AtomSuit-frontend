import { useState, useEffect } from 'react';
import FormModal from '@/components/common/FormModal';
import Input from '@/components/form/input/InputField';
import Label from '@/components/form/Label';
import Select from '@/components/form/Select';
import TextArea from '@/components/form/input/TextArea';
import CollapsibleSection from '@/components/common/CollapsibleSection';
import { toast } from 'sonner';
import { updateCategory } from '@/services/CategoryService';
import { getChartOfAccounts } from '@/services/ChartOfAccountService';
import { getTaxGroups } from '@/services/TaxService';
import { ChartOfAccount, Category, TaxGroup } from '@/types';
import { isApiError } from '@/utils/errors';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  category: Category;
}

export default function EditCategoryModal({ isOpen, onClose, onSuccess, category }: Props) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    sales_account_id: '',
    cogs_account_id: '',
    inventory_account_id: '',
    inventory_adjustment_account_id: '',
    tax_group_id: '',
  });

  const [salesAccounts, setSalesAccounts] = useState<ChartOfAccount[]>([]);
  const [cogsAccounts, setCogsAccounts] = useState<ChartOfAccount[]>([]);
  const [inventoryAccounts, setInventoryAccounts] = useState<ChartOfAccount[]>([]);
  const [expenseAccounts, setExpenseAccounts] = useState<ChartOfAccount[]>([]);
  const [taxGroups, setTaxGroups] = useState<TaxGroup[]>([]);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchAccounts();
      fetchTaxGroups();
    }
  }, [isOpen]);

  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name,
        description: category.description || '',
        sales_account_id: category.sales_account?.id ? String(category.sales_account.id) : '',
        cogs_account_id: category.cogs_account?.id ? String(category.cogs_account.id) : '',
        inventory_account_id: category.inventory_account?.id
          ? String(category.inventory_account.id)
          : '',
        inventory_adjustment_account_id: category.inventory_adjustment_account?.id
          ? String(category.inventory_adjustment_account.id)
          : '',
        tax_group_id: category.tax_group?.id ? String(category.tax_group.id) : '',
      });
    }
  }, [category]);

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

    const dataToSubmit = {
      ...formData,
      sales_account_id: formData.sales_account_id ? Number(formData.sales_account_id) : undefined,
      cogs_account_id: formData.cogs_account_id ? Number(formData.cogs_account_id) : undefined,
      inventory_account_id: formData.inventory_account_id
        ? Number(formData.inventory_account_id)
        : undefined,
      inventory_adjustment_account_id: formData.inventory_adjustment_account_id
        ? Number(formData.inventory_adjustment_account_id)
        : undefined,
      tax_group_id: formData.tax_group_id ? Number(formData.tax_group_id) : undefined,
    };

    try {
      await updateCategory(category.id, dataToSubmit);
      onSuccess();
      toast.success('Category updated successfully');
      onClose();
    } catch (error: unknown) {
      if (isApiError(error) && error.response?.status === 422) {
        const apiErrors = error.response.data.errors;
        setErrors({
          name: apiErrors?.name?.[0] || '',
          sales_account_id: apiErrors?.sales_account_id?.[0] || '',
          cogs_account_id: apiErrors?.cogs_account_id?.[0] || '',
          inventory_account_id: apiErrors?.inventory_account_id?.[0] || '',
          inventory_adjustment_account_id: apiErrors?.inventory_adjustment_account_id?.[0] || '',
        });
        toast.error('Please correct the errors in the form');
      } else {
        toast.error('Failed to update category');
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
      title="Edit Category"
      description="Update the details of the category."
      isSubmitting={isSubmitting}
    >
      <div className="grid grid-cols-1 gap-x-6 gap-y-5">
        <div>
          <Label>
            Name <span className="text-red-500">*</span>
          </Label>
          <Input
            type="text"
            value={formData.name}
            onChange={(e) => {
              setFormData({ ...formData, name: e.target.value });
              setErrors({ name: '' });
            }}
            error={!!errors.name}
            hint={errors.name}
          />
        </div>
        <div>
          <Label>Description</Label>
          <TextArea
            placeholder="Enter description (optional)"
            value={formData.description}
            onChange={(val) => setFormData({ ...formData, description: val })}
          />
        </div>
        <div>
          <Label>
            Default Tax Group <span className="text-red-500">*</span>
          </Label>
          <Select
            options={taxGroups.map((tg) => ({ value: String(tg.id), label: tg.name }))}
            value={String(formData.tax_group_id || '')}
            onChange={(val) => setFormData({ ...formData, tax_group_id: val })}
            placeholder="Select Default Tax Group"
            error={!!errors.tax_group_id}
          />
          <p className="mt-1 text-xs text-gray-500">
            Items in this category will default to this tax group.
          </p>
        </div>
      </div>

      <div className="mt-5">
        <CollapsibleSection title="Accounting Defaults">
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
                    variant: (acc.deleted_at ? 'danger' : 'default') as 'danger' | 'default',
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
                    variant: (acc.deleted_at ? 'danger' : 'default') as 'danger' | 'default',
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
                    variant: (acc.deleted_at ? 'danger' : 'default') as 'danger' | 'default',
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
                    variant: (acc.deleted_at ? 'danger' : 'default') as 'danger' | 'default',
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
