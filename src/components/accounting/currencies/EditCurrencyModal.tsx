'use client';

import { useState, useEffect } from 'react';
import { Modal } from '../../ui/modal';
import Input from '../../form/input/InputField';
import Label from '../../form/Label';
import Switch from '../../form/switch/Switch';
import Button from '../../ui/button/Button';
import { toast } from 'sonner';
import { updateCurrency } from '../../../services/CurrencyService';
import { Currency } from '../../../types/Currency';
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
    is_default: false,
    thousand_separator: '',
    decimal_separator: '',
    precision: 2,
    symbol_position: 'before' as 'before' | 'after',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (currency) {
      setFormData({
        code: currency.code,
        name: currency.name,
        symbol: currency.symbol || '',
        is_default: currency.is_default,
        thousand_separator: currency.thousand_separator || '',
        decimal_separator: currency.decimal_separator || '',
        precision: currency.precision ?? 2,
        symbol_position: currency.symbol_position || 'before',
      });
    }
  }, [currency]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.code || !formData.name) {
      setErrors({
        code: !formData.code ? 'Code is required' : '',
        name: !formData.name ? 'Name is required' : '',
      });
      return;
    }

    try {
      await updateCurrency(currency.id, formData);
      onSuccess();
      toast.success('Currency updated successfully');
      onClose();
    } catch (error: unknown) {
      if (isApiError(error)) {
        if (error.response?.status === 422) {
          const apiErrors = error.response.data.errors;
          setErrors(
            Object.keys(apiErrors).reduce(
              (acc, key) => {
                acc[key] = apiErrors[key][0];
                return acc;
              },
              {} as Record<string, string>
            )
          );
          toast.error('Please correct the errors in the form');
        } else {
          toast.error(error.response?.data?.message || 'Failed to update currency');
        }
      } else {
        console.error('Error updating currency:', error);
        toast.error('Failed to update currency');
      }
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-[700px] p-6 md:p-10">
      <div className="relative w-full">
        <div className="px-2 pr-14">
          <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
            Edit Currency
          </h4>
          <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
            Update the details of the currency.
          </p>
        </div>
        <form className="flex flex-col" onSubmit={handleSubmit}>
          <div className="px-2 overflow-y-auto custom-scrollbar max-h-[60vh]">
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

              <div>
                <Label>Precision</Label>
                <Input
                  type="number"
                  value={formData.precision}
                  onChange={(e) =>
                    setFormData({ ...formData, precision: parseInt(e.target.value) })
                  }
                />
              </div>

              <div>
                <Label>Thousand Separator</Label>
                <Input
                  type="text"
                  placeholder="e.g. ,"
                  value={formData.thousand_separator}
                  onChange={(e) => setFormData({ ...formData, thousand_separator: e.target.value })}
                />
              </div>

              <div>
                <Label>Decimal Separator</Label>
                <Input
                  type="text"
                  placeholder="e.g. ."
                  value={formData.decimal_separator}
                  onChange={(e) => setFormData({ ...formData, decimal_separator: e.target.value })}
                />
              </div>

              <div>
                <Label>Symbol Position</Label>
                <div className="flex gap-4 mt-2">
                  <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                    <input
                      type="radio"
                      name="symbol_position"
                      value="before"
                      checked={formData.symbol_position === 'before'}
                      onChange={() => setFormData({ ...formData, symbol_position: 'before' })}
                    />
                    Before Number
                  </label>
                  <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                    <input
                      type="radio"
                      name="symbol_position"
                      value="after"
                      checked={formData.symbol_position === 'after'}
                      onChange={() => setFormData({ ...formData, symbol_position: 'after' })}
                    />
                    After Number
                  </label>
                </div>
              </div>

              <div className="lg:col-span-2">
                <Switch
                  label="Default Currency"
                  checked={formData.is_default}
                  onChange={(checked) => setFormData({ ...formData, is_default: checked })}
                />
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
            <Button type="button" variant="outline" onClick={onClose}>
              Close
            </Button>
            <Button type="submit">Save Changes</Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
