import { useState, useEffect } from 'react';
import FormModal from '../../common/FormModal';
import Input from '../../form/input/InputField';
import Label from '../../form/Label';
import Select from '../../form/Select';
import TextArea from '../../form/input/TextArea';
import CollapsibleSection from '../../common/CollapsibleSection';
import { toast } from 'sonner';
import { addCategory } from '../../../services/CategoryService';
import { getChartOfAccounts } from '../../../services/ChartOfAccountService';
import { getTaxGroups } from '../../../services/TaxService';
import { ChartOfAccount, TaxGroup } from '../../../types';
import { isApiError } from '../../../utils/errors';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddCategoryModal({ isOpen, onClose, onSuccess }: Props) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    sales_account_id: '',
    cogs_account_id: '',
    inventory_account_id: '',
    inventory_adjustment_account_id: '',
    purchase_account_id: '',
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

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      sales_account_id: '',
      cogs_account_id: '',
      inventory_account_id: '',
      inventory_adjustment_account_id: '',
      purchase_account_id: '',
      tax_group_id: '',
    });
    setErrors({ name: '' });
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const dataToSubmit = {
      ...formData,
      sales_account_id: formData.sales_account_id ? Number(formData.sales_account_id) : null,
      cogs_account_id: formData.cogs_account_id ? Number(formData.cogs_account_id) : null,
      inventory_account_id: formData.inventory_account_id
        ? Number(formData.inventory_account_id)
        : null,
      inventory_adjustment_account_id: formData.inventory_adjustment_account_id
        ? Number(formData.inventory_adjustment_account_id)
        : null,
      purchase_account_id: formData.purchase_account_id
        ? Number(formData.purchase_account_id)
        : null,
      tax_group_id: formData.tax_group_id ? Number(formData.tax_group_id) : null,
    };

    try {
      await addCategory(dataToSubmit);
      onSuccess();
      toast.success('Category added successfully');
      handleClose();
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
        toast.error('Failed to add category');
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
      title="Add New Category"
      description="Fill in the details to add a new category."
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
        <CollapsibleSection title="Accounting Defaults" defaultOpen>
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
              />
            </div>
          </div>
        </CollapsibleSection>
      </div>
    </FormModal>
  );
}
