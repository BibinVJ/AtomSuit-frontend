'use client';

import { useState, useEffect } from 'react';
import FormModal from '../../common/FormModal';
import Input from '../../form/input/InputField';
import Label from '../../form/Label';
import { toast } from 'sonner';
import { updateExchangeRate } from '../../../services/ExchangeRateService';
import { getCurrencies } from '../../../services/CurrencyService';
import { Currency, ExchangeRate } from '../../../types';
import { isApiError } from '../../../utils/errors';
import Select from '../../form/Select';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  exchangeRate: ExchangeRate;
}

export default function EditExchangeRateModal({ isOpen, onClose, onSuccess, exchangeRate }: Props) {
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [formData, setFormData] = useState({
    base_currency_id: 0,
    target_currency_id: 0,
    rate: 0,
    effective_date: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchCurrencies();
    }
  }, [isOpen]);

  useEffect(() => {
    if (exchangeRate) {
      setFormData({
        base_currency_id: exchangeRate.base_currency?.id ?? 0,
        target_currency_id: exchangeRate.target_currency?.id ?? 0,
        rate: exchangeRate.rate,
        effective_date: exchangeRate.effective_date,
      });
    }
  }, [exchangeRate]);

  const fetchCurrencies = async () => {
    try {
      const resp = await getCurrencies({ unpaginated: true, trashed: 'with' });
      setCurrencies(resp.data);
    } catch (error) {
      console.error('Error fetching currencies:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await updateExchangeRate(exchangeRate.id, formData);
      onSuccess();
      toast.success('Exchange rate updated successfully');
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
        toast.error('Failed to update exchange rate');
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
      title="Edit Exchange Rate"
      description="Update the details of the exchange rate."
      isSubmitting={isSubmitting}
    >
      <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
        <div>
          <Label>
            Base Currency <span className="text-red-500">*</span>
          </Label>
          <Select
            options={currencies
              .filter((c) => !c.deleted_at || c.id === exchangeRate?.base_currency?.id)
              .map((c) => ({
                value: String(c.id),
                label: c.deleted_at ? `${c.code} - ${c.name} (Deleted)` : `${c.code} - ${c.name}`,
                variant: (c.deleted_at ? 'danger' : 'default') as 'danger' | 'default',
              }))}
            value={String(formData.base_currency_id)}
            onChange={(val) => setFormData({ ...formData, base_currency_id: Number(val) })}
            error={!!errors.base_currency_id}
          />
          {errors.base_currency_id && (
            <p className="mt-1 text-xs text-red-500">{errors.base_currency_id}</p>
          )}
        </div>

        <div>
          <Label>
            Target Currency <span className="text-red-500">*</span>
          </Label>
          <Select
            options={currencies
              .filter((c) => !c.deleted_at || c.id === exchangeRate?.target_currency?.id)
              .map((c) => ({
                value: String(c.id),
                label: c.deleted_at ? `${c.code} - ${c.name} (Deleted)` : `${c.code} - ${c.name}`,
                variant: (c.deleted_at ? 'danger' : 'default') as 'danger' | 'default',
              }))}
            value={String(formData.target_currency_id)}
            onChange={(val) => setFormData({ ...formData, target_currency_id: Number(val) })}
            error={!!errors.target_currency_id}
          />
          {errors.target_currency_id && (
            <p className="mt-1 text-xs text-red-500">{errors.target_currency_id}</p>
          )}
        </div>

        <div>
          <Label>
            Rate <span className="text-red-500">*</span>
          </Label>
          <Input
            type="number"
            step={0.000001}
            placeholder="e.g. 1.25"
            value={formData.rate}
            onChange={(e) => setFormData({ ...formData, rate: parseFloat(e.target.value) || 0 })}
            error={!!errors.rate}
            hint={errors.rate}
          />
        </div>

        <div>
          <Label>
            Effective Date <span className="text-red-500">*</span>
          </Label>
          <Input
            type="date"
            value={formData.effective_date}
            onChange={(e) => setFormData({ ...formData, effective_date: e.target.value })}
            error={!!errors.effective_date}
            hint={errors.effective_date}
          />
        </div>
      </div>
    </FormModal>
  );
}
