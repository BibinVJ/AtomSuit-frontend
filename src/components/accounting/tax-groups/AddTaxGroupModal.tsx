'use client';

import { useState, useEffect } from 'react';
import FormModal from '../../common/FormModal';
import Input from '../../form/input/InputField';
import Label from '../../form/Label';
import MultiSelect from '../../form/MultiSelect';
import { toast } from 'sonner';
import { addTaxGroup, getTaxRates } from '../../../services/TaxService';
import { isApiError } from '../../../utils/errors';
import { TaxRate } from '../../../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddTaxGroupModal({ isOpen, onClose, onSuccess }: Props) {
  const [formData, setFormData] = useState({
    name: '',
    tax_rates: [] as string[],
  });

  const [availableRates, setAvailableRates] = useState<TaxRate[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      getTaxRates({ perPage: 100 })
        .then((res) => {
          setAvailableRates(res.data);
        })
        .catch((err) => console.error('Failed to fetch tax rates', err));
    }
  }, [isOpen]);

  const resetForm = () => {
    setFormData({
      name: '',
      tax_rates: [],
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
      // Backend expects array of numbers for IDs
      const payload = {
        ...formData,
        tax_rates: formData.tax_rates.map(Number),
      };
      await addTaxGroup(payload);
      onSuccess();
      toast.success('Tax group added successfully');
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
        toast.error('Failed to add tax group');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const rateOptions = availableRates.map((rate) => ({
    value: String(rate.id),
    text: `${rate.name} (${rate.rate}%)`,
  }));

  return (
    <FormModal
      isOpen={isOpen}
      onClose={handleClose}
      onSubmit={handleSubmit}
      title="Add New Tax Group"
      description="Create a new tax group by combining tax rates."
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
