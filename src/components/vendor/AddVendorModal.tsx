'use client';

import { useState, useEffect } from 'react';
import FormModal from '../common/FormModal';
import Input from '../form/input/InputField';
import Label from '../form/Label';
import Select from '../form/Select';
import TextArea from '../form/input/TextArea';
import { toast } from 'sonner';
import { addVendor } from '../../services/VendorService';
import { getCurrencies } from '../../services/CurrencyService';
import { isApiError } from '../../utils/errors';
import { VendorInput, Currency } from '../../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddVendorModal({ isOpen, onClose, onSuccess }: Props) {
  const [formData, setFormData] = useState<VendorInput>({
    name: '',
    email: '',
    phone: '',
    address: '',
    currency_id: undefined,
  });

  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchCurrencies();
    }
  }, [isOpen]);

  const fetchCurrencies = async () => {
    try {
      const response = await getCurrencies({ unpaginated: true });
      setCurrencies(response.data);
    } catch (error) {
      console.error('Failed to fetch currencies:', error);
      toast.error('Failed to load currencies');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      address: '',
      currency_id: undefined,
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
      await addVendor(formData);
      onSuccess();
      toast.success('Vendor added successfully');
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
        toast.error('Failed to add vendor');
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
      title="Add New Vendor"
      description="Fill in the details to add a new vendor."
      isSubmitting={isSubmitting}
      size="lg"
    >
      <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
        <div>
          <Label>
            Name <span className="text-red-500">*</span>
          </Label>
          <Input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            error={!!errors.name}
            hint={errors.name}
          />
        </div>
        <div>
          <Label>Email</Label>
          <Input
            type="email"
            value={formData.email || ''}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            error={!!errors.email}
            hint={errors.email}
          />
        </div>
        <div>
          <Label>Phone</Label>
          <Input
            type="text"
            value={formData.phone || ''}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            error={!!errors.phone}
            hint={errors.phone}
          />
        </div>
        <div>
          <Label>Currency</Label>
          <Select
            options={currencies.map((c) => ({
              value: String(c.id),
              label: `${c.code} - ${c.name}`,
            }))}
            value={formData.currency_id ? String(formData.currency_id) : ''}
            onChange={(val) => setFormData({ ...formData, currency_id: Number(val) })}
            placeholder="Select Currency"
            error={!!errors.currency_id}
          />
          {errors.currency_id && <p className="mt-1 text-xs text-red-500">{errors.currency_id}</p>}
        </div>
        <div className="lg:col-span-2">
          <Label>Address</Label>
          <TextArea
            placeholder="Enter address"
            value={formData.address || ''}
            onChange={(val) => setFormData({ ...formData, address: val })}
            error={!!errors.address}
            hint={errors.address}
          />
        </div>
      </div>
    </FormModal>
  );
}
