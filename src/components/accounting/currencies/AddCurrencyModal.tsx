'use client';

import { useState } from 'react';
import FormModal from '../../common/FormModal';
import Input from '../../form/input/InputField';
import Label from '../../form/Label';
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
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetForm = () => {
    setFormData({
      code: '',
      name: '',
      symbol: '',
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
      </div>
    </FormModal>
  );
}
