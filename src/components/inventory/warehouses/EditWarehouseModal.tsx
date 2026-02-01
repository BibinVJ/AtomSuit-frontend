'use client';

import { useState, useEffect } from 'react';
import FormModal from '../../common/FormModal';
import Input from '../../form/input/InputField';
import Label from '../../form/Label';
import { toast } from 'sonner';
import { updateWarehouse } from '@/services/WarehouseService';
import { isApiError } from '@/utils/errors';
import TextArea from '../../form/input/TextArea';
import { Warehouse } from '@/types/Warehouse';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onWarehouseUpdated: () => void;
  warehouse: Warehouse;
}

export default function EditWarehouseModal({
  isOpen,
  onClose,
  onWarehouseUpdated,
  warehouse,
}: Props) {
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

  useEffect(() => {
    if (warehouse) {
      setFormData({
        name: warehouse.name,
        code: warehouse.code || '',
        description: warehouse.description || '',
        address_line_1: warehouse.address_line_1 || '',
        address_line_2: warehouse.address_line_2 || '',
        city: warehouse.city || '',
        state: warehouse.state || '',
        country: warehouse.country || '',
        zip_code: warehouse.zip_code || '',
        phone: warehouse.phone || '',
        email: warehouse.email || '',
      });
    }
  }, [warehouse]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});

    try {
      await updateWarehouse(warehouse.id, formData);
      onWarehouseUpdated();
      toast.success('Warehouse updated successfully');
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
        console.error('Error updating warehouse:', error);
        toast.error('Failed to update warehouse');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

  const handleDescriptionChange = (value: string) => {
    setFormData((prev) => ({ ...prev, description: value }));
    if (errors.description) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.description;
        return newErrors;
      });
    }
  };

  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={handleSubmit}
      title="Edit Warehouse"
      description="Update warehouse details."
      isSubmitting={isSubmitting}
      size="2xl"
    >
      <div className="flex flex-col gap-6">
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
            value={formData.description}
            onChange={handleDescriptionChange}
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
      </div>
    </FormModal>
  );
}
