'use client';

import { useState, useEffect } from 'react';
import FormModal from '@/components/common/FormModal';
import Input from '@/components/form/input/InputField';
import Label from '@/components/form/Label';
import Select from '@/components/form/Select';
import { toast } from 'sonner';
import { addTaxRate } from '@/services/TaxService';
import { getChartOfAccounts } from '@/services/ChartOfAccountService';
import { isApiError } from '@/utils/errors';
import { ChartOfAccount } from '@/types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddTaxRateModal({ isOpen, onClose, onSuccess }: Props) {
  const [formData, setFormData] = useState({
    name: '',
    rate: 0,
    type: 'percentage' as 'percentage' | 'fixed',
    sales_account_id: null as number | null,
    purchase_account_id: null as number | null,
  });

  // Fetch accounts manually since hook is missing
  const [allAccounts, setAllAccounts] = useState<ChartOfAccount[]>([]);
  useEffect(() => {
    if (isOpen) {
      getChartOfAccounts({ perPage: 1000 })
        .then((res) => setAllAccounts(res.data))
        .catch((err) => console.error(err));
    }
  }, [isOpen]);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetForm = () => {
    setFormData({
      name: '',
      rate: 0,
      type: 'percentage',
      sales_account_id: null,
      purchase_account_id: null,
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
      await addTaxRate(formData);
      onSuccess();
      toast.success('Tax rate added successfully');
      handleClose();
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
        toast.error('Failed to add tax rate');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const accountOptions = allAccounts.map((acc) => ({
    value: acc.id.toString(),
    label: `${acc.code} - ${acc.name}`,
  }));

  return (
    <FormModal
      isOpen={isOpen}
      onClose={handleClose}
      onSubmit={handleSubmit}
      title="Add New Tax Rate"
      description="Fill in the details to add a new tax rate."
      isSubmitting={isSubmitting}
    >
      <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
        <div className="lg:col-span-2">
          <Label>
            Name <span className="text-red-500">*</span>
          </Label>
          <Input
            type="text"
            placeholder="e.g. VAT 20%"
            value={formData.name}
            onChange={(e) => {
              setFormData({ ...formData, name: e.target.value });
              setErrors({ ...errors, name: '' });
            }}
            error={!!errors.name}
            hint={errors.name}
          />
        </div>

        <div>
          <Label>
            Rate (%) <span className="text-red-500">*</span>
          </Label>
          <Input
            type="number"
            step={0.01}
            value={formData.rate.toString()}
            onChange={(e) => {
              const val = parseFloat(e.target.value);
              setFormData({ ...formData, rate: isNaN(val) ? 0 : val });
              setErrors({ ...errors, rate: '' });
            }}
            error={!!errors.rate}
            hint={errors.rate}
          />
        </div>

        <div>
          <Label>Type</Label>
          <Select
            options={[
              { value: 'percentage', label: 'Percentage' },
              { value: 'fixed', label: 'Fixed Amount' },
            ]}
            value={formData.type}
            onChange={(val) => setFormData({ ...formData, type: val as 'percentage' | 'fixed' })}
            placeholder="Select Type"
          />
        </div>

        <div>
          <Label>Sales Account (Liability)</Label>
          <Select
            options={accountOptions}
            value={formData.sales_account_id?.toString() || ''}
            onChange={(val) =>
              setFormData({ ...formData, sales_account_id: val ? parseInt(val) : null })
            }
            placeholder="Select Account"
            className="w-full"
          />
          {errors.sales_account_id && (
            <p className="mt-1 text-xs text-red-500">{errors.sales_account_id}</p>
          )}
        </div>

        <div>
          <Label>Purchase Account (Asset/Expense)</Label>
          <Select
            options={accountOptions}
            value={formData.purchase_account_id?.toString() || ''}
            onChange={(val) =>
              setFormData({ ...formData, purchase_account_id: val ? parseInt(val) : null })
            }
            placeholder="Select Account"
            className="w-full"
          />
          {errors.purchase_account_id && (
            <p className="mt-1 text-xs text-red-500">{errors.purchase_account_id}</p>
          )}
        </div>
      </div>
    </FormModal>
  );
}
