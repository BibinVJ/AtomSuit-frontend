'use client';

import { useState, useEffect } from 'react';
import FormModal from '../../common/FormModal';
import Input from '../../form/input/InputField';
import Label from '../../form/Label';
import MultiSelect from '../../form/MultiSelect';
import { toast } from 'sonner';
import { updateTaxGroup, getTaxRates } from '@/services/TaxService';
import { TaxGroup, TaxRate } from '@/types';
import { isApiError } from '@/utils/errors';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  taxGroup: TaxGroup;
}

export default function EditTaxGroupModal({ isOpen, onClose, onSuccess, taxGroup }: Props) {
  const [formData, setFormData] = useState({
    name: '',
    tax_rates: [] as string[],
  });

  const [availableRates, setAvailableRates] = useState<TaxRate[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      getTaxRates({ perPage: 100, trashed: 'with' })
        .then((res) => {
          setAvailableRates(res.data);
        })
        .catch((err) => console.error('Failed to fetch tax rates', err));
    }
  }, [isOpen]);

  useEffect(() => {
    if (taxGroup) {
      setFormData({
        name: taxGroup.name,
        tax_rates: taxGroup.tax_rates ? taxGroup.tax_rates.map((r) => String(r.id)) : [],
      });
    }
  }, [taxGroup]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const payload = {
        ...formData,
        tax_rates: formData.tax_rates.map(Number),
      };
      await updateTaxGroup(taxGroup.id, payload);
      onSuccess();
      toast.success('Tax group updated successfully');
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
        toast.error('Failed to update tax group');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const rateOptions = availableRates.map((rate) => ({
    value: String(rate.id),
    text: `${rate.name} (${rate.rate}%) ${rate.deleted_at ? '(Deleted)' : ''}`,
    variant: (rate.deleted_at ? 'danger' : 'default') as 'danger' | 'default',
  }));

  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={handleSubmit}
      title="Edit Tax Group"
      description="Update the details of the tax group."
      isSubmitting={isSubmitting}
    >
      <div className="grid grid-cols-1 gap-x-6 gap-y-5">
        <div>
          <Label>
            Name <span className="text-red-500">*</span>
          </Label>
          <Input
            type="text"
            placeholder="e.g. GST 18%"
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
          <MultiSelect
            label="Tax Rates"
            options={rateOptions}
            defaultSelected={formData.tax_rates}
            onChange={(selected) => setFormData({ ...formData, tax_rates: selected })}
            placeholder="Select Tax Rates..."
          />
        </div>
      </div>
    </FormModal>
  );
}
