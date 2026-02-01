'use client';

import { useState } from 'react';
import FormModal from '../../common/FormModal';
import Input from '../../form/input/InputField';
import Label from '../../form/Label';
import TextArea from '../../form/input/TextArea';
import { toast } from 'sonner';
import { addUnit } from '@/services/UnitService';
import { isApiError } from '@/utils/errors';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddUnitModal({ isOpen, onClose, onSuccess }: Props) {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [errors, setErrors] = useState({ name: '', code: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetForm = () => {
    setName('');
    setCode('');
    setDescription('');
    setErrors({ name: '', code: '' });
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await addUnit({ name, code, description });
      onSuccess();
      toast.success('Unit added successfully');
      handleClose();
    } catch (error: unknown) {
      if (isApiError(error) && error.response?.status === 422) {
        const apiErrors = error.response.data.errors;
        setErrors({
          name: apiErrors?.name?.[0] || '',
          code: apiErrors?.code?.[0] || apiErrors?.short_name?.[0] || '',
        });
        toast.error('Please correct the errors in the form');
      } else {
        toast.error('Failed to add unit');
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
      title="Add New Unit"
      description="Fill in the details to add a new unit of measurement."
      isSubmitting={isSubmitting}
    >
      <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
        <div>
          <Label>
            Name <span className="text-red-500">*</span>
          </Label>
          <Input
            type="text"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setErrors({ ...errors, name: '' });
            }}
            error={!!errors.name}
            hint={errors.name}
          />
        </div>
        <div>
          <Label>
            Short Name / Symbol <span className="text-red-500">*</span>
          </Label>
          <Input
            type="text"
            value={code}
            onChange={(e) => {
              setCode(e.target.value);
              setErrors({ ...errors, code: '' });
            }}
            error={!!errors.code}
            hint={errors.code}
          />
        </div>
        <div className="lg:col-span-2">
          <Label>Description</Label>
          <TextArea
            placeholder="Enter description (optional)"
            value={description}
            onChange={setDescription}
          />
        </div>
      </div>
    </FormModal>
  );
}
