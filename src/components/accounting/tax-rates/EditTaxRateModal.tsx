'use client';

import { useState, useEffect } from 'react';
import FormModal from '../../common/FormModal';
import Input from '../../form/input/InputField';
import Label from '../../form/Label';
import Select from '../../form/Select';
import { toast } from 'sonner';
import { updateTaxRate } from '../../../services/TaxService';
import { getChartOfAccounts } from '../../../services/ChartOfAccountService';
import { TaxRate, ChartOfAccount } from '../../../types';
import { isApiError } from '../../../utils/errors';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  taxRate: TaxRate;
}

export default function EditTaxRateModal({ isOpen, onClose, onSuccess, taxRate }: Props) {
  const [formData, setFormData] = useState({
    name: '',
    rate: 0,
    type: 'percentage' as 'percentage' | 'fixed',
    sales_account_id: null as number | null,
    purchase_account_id: null as number | null,
  });

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

  useEffect(() => {
    if (taxRate) {
      setFormData({
        name: taxRate.name,
        rate: taxRate.rate,
        type: taxRate.type,
        sales_account_id: taxRate.sales_account_id ?? null,
        purchase_account_id: taxRate.purchase_account_id ?? null,
      });
    }
  }, [taxRate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await updateTaxRate(taxRate.id, formData);
      onSuccess();
      toast.success('Tax rate updated successfully');
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
        toast.error('Failed to update tax rate');
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
      onClose={onClose}
      onSubmit={handleSubmit}
      title="Edit Tax Rate"
      description="Update the details of the tax rate."
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
            step="0.01"
            value={formData.rate}
            onChange={(e) => {
              setFormData({ ...formData, rate: parseFloat(e.target.value) });
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
            value={formData.sales_account_id?.toString() ?? ''}
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
            value={formData.purchase_account_id?.toString() ?? ''}
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
