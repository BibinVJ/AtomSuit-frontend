'use client';

import { useState, useEffect } from 'react';
import FormModal from '../../common/FormModal';
import Input from '../../form/input/InputField';
import Label from '../../form/Label';
import { toast } from 'sonner';
import { updateCurrency } from '../../../services/CurrencyService';
import { Currency } from '../../../types';
import { isApiError } from '../../../utils/errors';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  currency: Currency;
}

export default function EditCurrencyModal({ isOpen, onClose, onSuccess, currency }: Props) {
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    symbol: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (currency) {
      setFormData({
        code: currency.code,
        name: currency.name,
        symbol: currency.symbol || '',
      });
    }
  }, [currency]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await updateCurrency(currency.id, formData);
      onSuccess();
      toast.success('Currency updated successfully');
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
        toast.error('Failed to update currency');
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
      title="Edit Currency"
      description="Update the details of the currency."
      isSubmitting={isSubmitting}
    >
      <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
        <div>
          <Label>
            Code <span className="text-red-500">*</span>
          </Label>
          <Input
            type="text"
            placeholder="e.g. USD"
            value={formData.code}
            onChange={(e) => {
              setFormData({ ...formData, code: e.target.value.toUpperCase() });
              setErrors({ ...errors, code: '' });
            }}
            error={!!errors.code}
            hint={errors.code}
          />
        </div>

        <div>
          <Label>
            Name <span className="text-red-500">*</span>
          </Label>
          <Input
            type="text"
            placeholder="e.g. US Dollar"
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
          <Label>Symbol</Label>
          <Input
            type="text"
            placeholder="e.g. $"
            value={formData.symbol}
            onChange={(e) => setFormData({ ...formData, symbol: e.target.value })}
          />
        </div>
      </div>
    </FormModal>
  );
}
