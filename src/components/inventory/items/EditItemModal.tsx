'use client';

import { useState, useEffect } from 'react';
import FormModal from '../../common/FormModal';
import Input from '../../form/input/InputField';
import Label from '../../form/Label';
import TextArea from '../../form/input/TextArea';
import Select from '../../form/Select';
import { toast } from 'sonner';
import { updateItem } from '../../../services/ItemService';
import { getCategories } from '../../../services/CategoryService';
import { getUnits } from '../../../services/UnitService';
import { Category, Item, Unit, ItemInput } from '../../../types';
import { isApiError } from '../../../utils/errors';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  item: Item;
}

export default function EditItemModal({ isOpen, onClose, onSuccess, item }: Props) {
  const [formData, setFormData] = useState<ItemInput>({
    sku: '',
    name: '',
    category_id: '',
    unit_id: '',
    description: '',
    type: 'product',
    selling_price: 0,
  });

  const [categories, setCategories] = useState<Category[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (item) {
      setFormData({
        sku: item.sku,
        name: item.name,
        category_id: String(item.category?.id || ''),
        unit_id: String(item.unit?.id || ''),
        description: item.description || '',
        type: item.type,
        selling_price: item.selling_price,
      });
    }
  }, [item]);

  useEffect(() => {
    if (isOpen) {
      fetchCategories();
      fetchUnits();
    }
  }, [isOpen]);

  const fetchCategories = async () => {
    try {
      const response = await getCategories({ unpaginated: true });
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchUnits = async () => {
    try {
      const response = await getUnits({ unpaginated: true });
      setUnits(response.data);
    } catch (error) {
      console.error('Error fetching units:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await updateItem(item.id, formData);
      onSuccess();
      toast.success('Item updated successfully');
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
        toast.error('Failed to update item');
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
      title="Edit Item"
      description="Update the details of the item."
      isSubmitting={isSubmitting}
      size="lg"
    >
      <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
        <div>
          <Label>
            SKU <span className="text-red-500">*</span>
          </Label>
          <Input
            type="text"
            value={formData.sku}
            onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
            error={!!errors.sku}
            hint={errors.sku}
          />
        </div>
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
          <Label>
            Category <span className="text-red-500">*</span>
          </Label>
          <Select
            options={categories.map((cat) => ({ value: String(cat.id), label: cat.name }))}
            value={String(formData.category_id)}
            onChange={(val) => setFormData({ ...formData, category_id: val })}
            placeholder="Select a category"
            error={!!errors.category_id}
          />
          {errors.category_id && <p className="mt-1 text-xs text-red-500">{errors.category_id}</p>}
        </div>
        <div>
          <Label>
            Unit <span className="text-red-500">*</span>
          </Label>
          <Select
            options={units.map((unit) => ({
              value: String(unit.id),
              label: `${unit.name} (${unit.code})`,
            }))}
            value={String(formData.unit_id)}
            onChange={(val) => setFormData({ ...formData, unit_id: val })}
            placeholder="Select a unit"
            error={!!errors.unit_id}
          />
          {errors.unit_id && <p className="mt-1 text-xs text-red-500">{errors.unit_id}</p>}
        </div>
        <div>
          <Label>
            Selling Price <span className="text-red-500">*</span>
          </Label>
          <Input
            type="number"
            value={formData.selling_price}
            onChange={(e) => setFormData({ ...formData, selling_price: Number(e.target.value) })}
            error={!!errors.selling_price}
            hint={errors.selling_price}
          />
        </div>
        <div>
          <Label>
            Type <span className="text-red-500">*</span>
          </Label>
          <Select
            options={[
              { value: 'product', label: 'Product' },
              { value: 'service', label: 'Service' },
            ]}
            value={formData.type}
            onChange={(val) => setFormData({ ...formData, type: val })}
            error={!!errors.type}
          />
          {errors.type && <p className="mt-1 text-xs text-red-500">{errors.type}</p>}
        </div>
        <div className="lg:col-span-2">
          <Label>Description</Label>
          <TextArea
            placeholder="Enter description"
            value={formData.description}
            onChange={(val) => setFormData({ ...formData, description: val })}
          />
        </div>
      </div>
    </FormModal>
  );
}
