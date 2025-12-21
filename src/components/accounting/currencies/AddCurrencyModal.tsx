'use client';

import { useState } from 'react';
import FormModal from '../../common/FormModal';
import Input from '../../form/input/InputField';
import Label from '../../form/Label';
import Switch from '../../form/switch/Switch';
import { toast } from 'sonner';
import { addCurrency } from '../../../services/CurrencyService';
import { isApiError } from '../../../utils/errors';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddCurrencyModal({ isOpen, onClose, onSuccess }: Props) {
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
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetForm = () => {
    setFormData({
      code: '',
      name: '',
      symbol: '',
      is_default: false,
      thousand_separator: '',
      decimal_separator: '',
      precision: 2,
      symbol_position: 'before',
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
      await addCurrency(formData);
      onSuccess();
      toast.success('Currency added successfully');
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
        toast.error('Failed to add currency');
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
      title="Add New Currency"
      description="Fill in the details to add a new currency."
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

        <div>
          <Label>Precision</Label>
          <Input
            type="number"
            value={formData.precision}
            onChange={(e) => setFormData({ ...formData, precision: parseInt(e.target.value) })}
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
    </FormModal>
  );
}
