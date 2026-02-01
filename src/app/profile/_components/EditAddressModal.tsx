'use client';

import { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/modal';
import Button from '@/components/ui/button/Button';
import Input from '@/components/form/input/InputField';
import Label from '@/components/form/Label';
import { Address, User } from '@/types';
import { updateAddress } from '@/services/ProfileService';
import { useAuth } from '@/hooks/useAuth';
import Select from '@/components/form/Select';
import { toast } from 'sonner';
import { isApiError } from '@/utils/errors';

interface EditAddressModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  addressType: string | null;
}

const addressTypes = [
  { value: 'primary', label: 'Primary' },
  { value: 'secondary', label: 'Secondary' },
  { value: 'billing', label: 'Billing' },
  { value: 'shipping', label: 'Shipping' },
];

export default function EditAddressModal({
  isOpen,
  onClose,
  user,
  addressType,
}: EditAddressModalProps) {
  const { fetchProfile } = useAuth();
  const [formData, setFormData] = useState<Partial<Address>>({});

  useEffect(() => {
    if (
      user &&
      user.addresses &&
      Array.isArray(user.addresses) &&
      addressType &&
      addressType !== 'new'
    ) {
      const address = user.addresses.find((a) => a.type === addressType);
      if (address) {
        setFormData(address);
      } else {
        // Address type not found, set default values
        setFormData({
          type: addressType,
          address_line_1: '',
          address_line_2: '',
          city: '',
          state: '',
          country: '',
          postal_code: '',
        });
      }
    } else {
      setFormData({
        type: addressType === 'new' ? 'primary' : addressType || 'primary',
        address_line_1: '',
        address_line_2: '',
        city: '',
        state: '',
        country: '',
        postal_code: '',
      });
    }
  }, [user, addressType]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (value: string) => {
    setFormData((prev) => ({ ...prev, type: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const response = await updateAddress(formData);
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
            {addressType === 'new' ? 'Add New Address' : 'Edit Address'}
          </h4>
          <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
            Update your details to keep your profile up-to-date.
          </p>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col">
          <div className="px-2 overflow-y-auto custom-scrollbar">
            <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
              <div>
                <Label>Type</Label>
                <Select
                  options={addressTypes}
                  onChange={handleSelectChange}
                  defaultValue={formData.type}
                  className={addressType !== 'new' ? 'pointer-events-none' : ''}
                />
              </div>
              <div>
                <Label>Address Line 1</Label>
                <Input
                  name="address_line_1"
                  value={formData.address_line_1 || ''}
                  onChange={handleChange}
                />
              </div>
              <div>
                <Label>Address Line 2</Label>
                <Input
                  name="address_line_2"
                  value={formData.address_line_2 || ''}
                  onChange={handleChange}
                />
              </div>
              <div>
                <Label>City</Label>
                <Input name="city" value={formData.city || ''} onChange={handleChange} />
              </div>
              <div>
                <Label>State</Label>
                <Input name="state" value={formData.state || ''} onChange={handleChange} />
              </div>
              <div>
                <Label>Country</Label>
                <Input name="country" value={formData.country || ''} onChange={handleChange} />
              </div>
              <div>
                <Label>Postal Code</Label>
                <Input
                  name="postal_code"
                  value={formData.postal_code || ''}
                  onChange={handleChange}
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
