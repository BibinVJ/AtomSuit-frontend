'use client';

import { useState, useEffect } from 'react';
import { Modal } from '../ui/modal';
import Button from '../ui/button/Button';
import Input from '../form/input/InputField';
import Label from '../form/Label';
import { User } from '@/types';
import { updateProfile } from '@/services/ProfileService';
import { useAuth } from '@/hooks/useAuth';
import Select from '../form/Select';
import { toast } from 'sonner';
import { isApiError } from '@/utils/errors';
import DatePicker from '../form/date-picker';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
}

const genderOptions = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' },
];

export default function EditProfileModal({ isOpen, onClose, user }: EditProfileModalProps) {
  const { fetchProfile } = useAuth();
  const [formData, setFormData] = useState<Partial<User>>({});

  useEffect(() => {
    if (user) {
      setFormData(user);
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (value: string) => {
    setFormData((prev) => ({ ...prev, gender: value }));
  };

  const handleDateChange = (selectedDates: Date[]) => {
    if (selectedDates.length > 0) {
      setFormData((prev) => ({ ...prev, dob: selectedDates[0].toISOString() }));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const response = await updateProfile(formData);
      toast.success(response.message);
      fetchProfile();
      onClose();
    } catch (error) {
      if (isApiError(error)) {
        toast.error(error.response?.data?.message);
      } else {
        toast.error('An unexpected error occurred.');
      }
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-[700px] m-4">
      <div className="relative w-full p-4 overflow-y-auto bg-white no-scrollbar rounded-3xl dark:bg-gray-900 lg:p-11">
        <div className="px-2 pr-14">
          <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
            Edit Personal Information
          </h4>
          <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
            Update your details to keep your profile up-to-date.
          </p>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col">
          <div className="px-2 overflow-y-auto custom-scrollbar">
            <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
              <div>
                <Label>Full Name</Label>
                <Input name="name" value={formData.name || ''} onChange={handleChange} />
              </div>
              <div>
                <Label>Alternate Email</Label>
                <Input
                  name="alternate_email"
                  value={formData.alternate_email || ''}
                  onChange={handleChange}
                />
              </div>
              <div>
                <Label>Alternate Phone</Label>
                <Input
                  name="alternate_phone"
                  value={formData.alternate_phone || ''}
                  onChange={handleChange}
                />
              </div>
              <div>
                <Label>ID Proof Type</Label>
                <Input
                  name="id_proof_type"
                  value={formData.id_proof_type || ''}
                  onChange={handleChange}
                />
              </div>
              <div>
                <Label>ID Proof Number</Label>
                <Input
                  name="id_proof_number"
                  value={formData.id_proof_number || ''}
                  onChange={handleChange}
                />
              </div>
              <div>
                <DatePicker
                  id="dob"
                  label="Date of Birth"
                  onChange={handleDateChange}
                  defaultDate={formData.dob ? new Date(formData.dob) : undefined}
                />
              </div>
              <div>
                <Label>Gender</Label>
                <Select
                  options={genderOptions}
                  onChange={handleSelectChange}
                  defaultValue={formData.gender ?? undefined}
                />
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
            <Button size="sm" variant="outline" onClick={onClose}>
              Close
            </Button>
            <Button size="sm" type="submit">
              Save Changes
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
