"use client";

import { useState, useEffect } from 'react';
import { Modal } from '../../ui/modal';
import Input from '../../form/input/InputField';
import Label from '../../form/Label';
import Switch from '../../form/switch/Switch';
import TextArea from '../../form/input/TextArea';
import Button from '../../ui/button/Button';
import Select from '../../form/Select';
import { toast } from 'sonner';
import { addItem } from '../../../services/ItemService';
import { getCategories } from '../../../services/CategoryService';
import { getUnits } from '../../../services/UnitService';
import { Category, Unit } from '../../../types';
import { isApiError } from '../../../utils/errors';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onItemAdded: () => void;
}

export default function AddItemModal({ isOpen, onClose, onItemAdded }: Props) {
  const [sku, setSku] = useState('');
  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [unitId, setUnitId] = useState('');
  const [description, setDescription] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [type, setType] = useState('product');
  const [selling_price, setSellingPrice] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [errors, setErrors] = useState({ sku: '', name: '', category_id: '', unit_id: '', type: '', selling_price: '' });

  useEffect(() => {
    if (isOpen) {
      fetchCategories();
      fetchUnits();
    }
  }, [isOpen]);

  const fetchCategories = async () => {
    try {
      const response = await getCategories(1, 10, 'created_at', 'desc', true);
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchUnits = async () => {
    try {
      const response = await getUnits(1, 10, 'created_at', 'desc', true);
      setUnits(response.data);
    } catch (error) {
      console.error('Error fetching units:', error);
    }
  };

  const resetForm = () => {
    setSku('');
    setName('');
    setCategoryId('');
    setUnitId('');
    setDescription('');
    setIsActive(true);
    setType('product');
    setSellingPrice('');
    setErrors({ sku: '', name: '', category_id: '', unit_id: '', type: '', selling_price: '' });
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors = { sku: '', name: '', category_id: '', unit_id: '', type: '', selling_price: '' };
    let hasError = false;

    if (!sku) {
      newErrors.sku = 'SKU is required';
      hasError = true;
    }
    if (!name) {
      newErrors.name = 'Name is required';
      hasError = true;
    }
    if (!categoryId) {
      newErrors.category_id = 'Category is required';
      hasError = true;
    }
    if (!unitId) {
      newErrors.unit_id = 'Unit is required';
      hasError = true;
    }

    if (hasError) {
      setErrors(newErrors);
      return;
    }

    try {
      await addItem({
        sku,
        name,
        category_id: categoryId,
        unit_id: unitId,
        description,
        is_active: isActive,
        type,
        selling_price: Number(selling_price)
      });
      onItemAdded();
      toast.success('Item added successfully');
      handleClose();
    } catch (error: unknown) {
      if (isApiError(error) && error.response?.status === 422) {
        const apiErrors = error.response.data.errors;
        const newErrors = {
          sku: apiErrors?.sku?.[0] || '',
          name: apiErrors?.name?.[0] || '',
          category_id: apiErrors?.category_id?.[0] || '',
          unit_id: apiErrors?.unit_id?.[0] || '',
          selling_price: apiErrors?.selling_price?.[0] || '',
          type: apiErrors?.type?.[0] || '',
        };
        setErrors(newErrors);
        toast.error('Please correct the errors in the form');
      } else {
        console.error('Error adding item:', error);
        toast.error('Failed to add item');
      }
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} className="max-w-[700px] lg:p-11">
      <div className="relative w-full p-4 overflow-y-auto bg-white no-scrollbar rounded-3xl dark:bg-gray-900">
        <div className="px-2 pr-14">
          <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
            Add New Item
          </h4>
          <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
            Fill in the details to add a new item.
          </p>
        </div>
        <form className="flex flex-col" onSubmit={handleSubmit}>
          <div className="px-2 overflow-y-auto custom-scrollbar">
            <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
              <div>
                <Label>SKU <span className="text-red-500">*</span></Label>
                <Input type="text" value={sku} onChange={(e) => {setSku(e.target.value); setErrors({...errors, sku: ''})}} error={!!errors.sku} hint={errors.sku} />
              </div>
              <div>
                <Label>Name <span className="text-red-500">*</span></Label>
                <Input type="text" value={name} onChange={(e) => {setName(e.target.value); setErrors({...errors, name: ''})}} error={!!errors.name} hint={errors.name} />
              </div>
              <div>
                <Label>Category <span className="text-red-500">*</span></Label>
                <Select
                  options={categories.map(cat => ({ value: String(cat.id), label: cat.name }))}
                  onChange={(value) => {setCategoryId(value); setErrors({...errors, category_id: ''})}}
                  defaultValue={categoryId}
                  placeholder="Select a category"
                  error={!!errors.category_id}
                  hint={errors.category_id}
                />
              </div>
              <div>
                <Label>Unit <span className="text-red-500">*</span></Label>
                <Select
                  options={units.map(unit => ({ value: String(unit.id), label: `${unit.name} (${unit.code})` }))}
                  onChange={(value) => {setUnitId(value); setErrors({...errors, unit_id: ''})}}
                  defaultValue={unitId}
                  placeholder="Select a unit"
                  error={!!errors.unit_id}
                  hint={errors.unit_id}
                />
              </div>
              <div>
                <Label>Selling Price <span className="text-red-500">*</span></Label>
                <Input type="number" value={selling_price} onChange={(e) => { setSellingPrice(e.target.value); setErrors({ ...errors, selling_price: '' }) }} error={!!errors.selling_price} hint={errors.selling_price} />
              </div>
              <div className="lg:col-span-2">
                <Label>Description</Label>
                <TextArea placeholder="Enter description" value={description} onChange={setDescription} />
              </div>
              <div>
                <Label>Type <span className="text-red-500">*</span></Label>
                <Select
                  options={[{ value: 'product', label: 'Product' }, { value: 'service', label: 'Service' }]}
                  onChange={setType}
                  defaultValue={type}
                  error={!!errors.type}
                  hint={errors.type}
                />
              </div>
              <div>
                <Label>Status</Label>
                <Switch label={isActive ? 'Active' : 'Inactive'} checked={isActive} onChange={setIsActive} />
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
            <Button type="button" variant="outline" onClick={handleClose}>
              Close
            </Button>
            <Button type="submit">
              Save Changes
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
