"use client";

import { useState } from 'react';
import { Modal } from '../../ui/modal';
import Input from '../../form/input/InputField';
import Label from '../../form/Label';
import Switch from '../../form/switch/Switch';
import TextArea from '../../form/input/TextArea';
import Button from '../../ui/button/Button';
import { toast } from 'sonner';
import { addUnit } from '../../../services/UnitService';
import { isApiError } from '../../../utils/errors';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onUnitAdded: () => void;
}

export default function AddUnitModal({ isOpen, onClose, onUnitAdded }: Props) {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [errors, setErrors] = useState({ name: '', code: '' });

  const resetForm = () => {
    setName('');
    setCode('');
    setDescription('');
    setIsActive(true);
    setErrors({ name: '', code: '' });
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) {
      setErrors({ ...errors, name: 'Name is required' });
      return;
    }
    if (!code) {
      setErrors({ ...errors, code: 'Code is required' });
      return;
    }

    try {
      await addUnit({ name, code, description, is_active: isActive });
      onUnitAdded();
      toast.success('Unit added successfully');
      handleClose();
    } catch (error: unknown) {
      if (isApiError(error) && error.response?.status === 422) {
        const apiErrors = error.response.data.errors;
        const newErrors = {
          name: apiErrors?.name?.[0] || '',
          code: apiErrors?.code?.[0] || '',
        };
        setErrors(newErrors);
        toast.error('Please correct the errors in the form');
      } else {
        console.error('Error adding category:', error);
        toast.error('Failed to add unit');
      }
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} className="max-w-[700px] lg:p-11">
      <div className="relative w-full p-4 overflow-y-auto bg-white no-scrollbar rounded-3xl dark:bg-gray-900">
          <div className="px-2 pr-14">
            <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
              Add New Unit
            </h4>
            <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
              Fill in the details to add a new unit.
            </p>
          </div>
          <form className="flex flex-col" onSubmit={handleSubmit}>
            <div className="px-2 overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                <div>
                  <Label>Name <span className="text-red-500">*</span></Label>
                  <Input
                    type="text"
                    id="name"
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
                  <Label>Code <span className="text-red-500">*</span></Label>
                  <Input
                    type="text"
                    id="code"
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
                    placeholder="Enter description"
                    value={description}
                    onChange={setDescription}
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  />
                </div>
                <div>
                  <Label>Status</Label>
                  <Switch
                    label={isActive ? 'Active' : 'Inactive'}
                    checked={isActive}
                    onChange={setIsActive}
                  />
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
                <Button
                    type="button"
                    variant='outline'
                    onClick={handleClose}
                >
                    Close
                </Button>
                <Button
                    type="submit"
                >
                    Save Changes
                </Button>
            </div>
          </form>
        </div>
    </Modal>
  );
}
