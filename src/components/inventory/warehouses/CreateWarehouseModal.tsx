'use client';

import { useState } from 'react';
import { Modal } from '../../ui/modal';
import Input from '../../form/input/InputField';
import Label from '../../form/Label';
import Button from '../../ui/button/Button';
import { toast } from 'sonner';
import { createWarehouse } from '../../../services/WarehouseService';
import { isApiError } from '../../../utils/errors';
import TextArea from '../../form/input/TextArea';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onWarehouseCreated: () => void;
}

export default function CreateWarehouseModal({ isOpen, onClose, onWarehouseCreated }: Props) {
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    address_line_1: '',
    address_line_2: '',
    city: '',
    state: '',
    country: '',
    zip_code: '',
    phone: '',
    email: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});

    try {
      await createWarehouse(formData);
      onWarehouseCreated();
      toast.success('Warehouse created successfully');
      setFormData({
        name: '',
        code: '',
        description: '',
        address_line_1: '',
        address_line_2: '',
        city: '',
        state: '',
        country: '',
        zip_code: '',
        phone: '',
        email: '',
      });
      onClose();
    } catch (error: unknown) {
      if (isApiError(error) && error.response?.status === 422) {
        const apiErrors = error.response.data.errors;
        if (apiErrors) {
          const newErrors: Record<string, string> = {};
          Object.keys(apiErrors).forEach((key) => {
            newErrors[key] = apiErrors[key][0];
          });
          setErrors(newErrors);
        }
        toast.error('Please correct the errors in the form');
      } else {
        console.error('Error creating warehouse:', error);
        toast.error('Failed to create warehouse');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-[800px] p-6 md:p-10">
      <div className="relative w-full">
        <div className="px-2 pr-14 mb-6">
          <h4 className="text-2xl font-semibold text-gray-800 dark:text-white/90">
            Add New Warehouse
          </h4>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Create a new warehouse to manage your inventory.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <Label>
                Name <span className="text-red-500">*</span>
              </Label>
              <Input
                name="name"
                value={formData.name}
                onChange={handleChange}
                error={!!errors.name}
                hint={errors.name}
                placeholder="Main Warehouse"
              />
            </div>
            <div>
              <Label>Code</Label>
              <Input
                name="code"
                value={formData.code}
                onChange={handleChange}
                error={!!errors.code}
                hint={errors.code}
                placeholder="WH-001"
              />
            </div>
          </div>

          <div>
            <Label>Description</Label>
            <TextArea
              name="description"
              value={formData.description}
              onChange={handleChange}
              error={!!errors.description}
              hint={errors.description}
              placeholder="Main storage facility for electronics..."
              rows={3}
            />
          </div>

          <div className="space-y-4">
            <h5 className="font-medium text-gray-700 dark:text-gray-300 border-b pb-2 border-gray-100 dark:border-gray-800">
              Address Details
            </h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="col-span-1 md:col-span-2">
                <Label>Address Line 1</Label>
                <Input
                  name="address_line_1"
                  value={formData.address_line_1}
                  onChange={handleChange}
                  error={!!errors.address_line_1}
                  hint={errors.address_line_1}
                />
              </div>
              <div className="col-span-1 md:col-span-2">
                <Label>Address Line 2</Label>
                <Input
                  name="address_line_2"
                  value={formData.address_line_2}
                  onChange={handleChange}
                  error={!!errors.address_line_2}
                  hint={errors.address_line_2}
                />
              </div>
              <div>
                <Label>City</Label>
                <Input
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  error={!!errors.city}
                  hint={errors.city}
                />
              </div>
              <div>
                <Label>State</Label>
                <Input
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  error={!!errors.state}
                  hint={errors.state}
                />
              </div>
              <div>
                <Label>Country</Label>
                <Input
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  error={!!errors.country}
                  hint={errors.country}
                />
              </div>
              <div>
                <Label>Zip Code</Label>
                <Input
                  name="zip_code"
                  value={formData.zip_code}
                  onChange={handleChange}
                  error={!!errors.zip_code}
                  hint={errors.zip_code}
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h5 className="font-medium text-gray-700 dark:text-gray-300 border-b pb-2 border-gray-100 dark:border-gray-800">
              Contact Information
            </h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <Label>Phone</Label>
                <Input
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  error={!!errors.phone}
                  hint={errors.phone}
                />
              </div>
              <div>
                <Label>Email</Label>
                <Input
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  error={!!errors.email}
                  hint={errors.email}
                />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 justify-end pt-4 border-t border-gray-100 dark:border-gray-800">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} isLoading={isSubmitting}>
              Create Warehouse
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
