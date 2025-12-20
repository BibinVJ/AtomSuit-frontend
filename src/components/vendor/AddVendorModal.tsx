import { useState, useEffect } from 'react';
import { Modal } from '../ui/modal';
import Input from '../form/input/InputField';
import Label from '../form/Label';
import Select from '../form/Select';
import TextArea from '../form/input/TextArea';
import { Button } from '../ui/button/Button';
import { toast } from 'sonner';
import { addVendor } from '../../services/VendorService';
import { getCurrencies } from '../../services/CurrencyService';
import { isApiError } from '../../utils/errors';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onVendorAdded: () => void;
}

export default function AddVendorModal({ isOpen, onClose, onVendorAdded }: Props) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [currencyId, setCurrencyId] = useState<string>('');
  const [currencyOptions, setCurrencyOptions] = useState<{ value: string; label: string }[]>([]);
  const [errors, setErrors] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    currency_id: '',
  });

  useEffect(() => {
    if (isOpen) {
      fetchCurrencyOptions();
    }
  }, [isOpen]);

  const fetchCurrencyOptions = async () => {
    try {
      const response = await getCurrencies(1, 100, '', false);
      const options = response.data.map((currency: any) => ({
        value: currency.id.toString(),
        label: `${currency.code} - ${currency.name}`,
      }));
      setCurrencyOptions(options);
    } catch (error) {
      console.error('Failed to fetch currencies:', error);
      toast.error('Failed to load currencies');
    }
  };

  const resetForm = () => {
    setName('');
    setEmail('');
    setPhone('');
    setAddress('');
    setCurrencyId('');
    setErrors({ name: '', email: '', phone: '', address: '', currency_id: '' });
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors = { name: '', email: '', phone: '', address: '', currency_id: '' };
    let hasError = false;

    if (!name) {
      newErrors.name = 'Name is required';
      hasError = true;
    }

    if (email && !/^\S+@\S+\.\S+$/.test(email)) {
      newErrors.email = 'Please enter a valid email address';
      hasError = true;
    }

    if (hasError) {
      setErrors(newErrors);
      return;
    }

    try {
      await addVendor({
        name,
        email,
        phone,
        address,
        currency_id: currencyId ? parseInt(currencyId) : undefined,
      });
      onVendorAdded();
      toast.success('Vendor added successfully');
      handleClose();
    } catch (error: unknown) {
      if (isApiError(error) && error.response?.status === 422) {
        const apiErrors = error.response.data.errors;
        const newErrors = {
          name: apiErrors?.name?.[0] || '',
          email: apiErrors?.email?.[0] || '',
          phone: apiErrors?.phone?.[0] || '',
          address: apiErrors?.address?.[0] || '',
          currency_id: apiErrors?.currency_id?.[0] || '',
        };
        setErrors(newErrors);
        toast.error('Please correct the errors in the form');
      } else {
        console.error('Error adding vendor:', error);
        toast.error('Failed to add vendor');
      }
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} className="max-w-[700px] p-6 md:p-10">
      <div className="relative w-full">
        <div className="px-2 pr-14">
          <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
            Add New Vendor
          </h4>
          <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
            Fill in the details to add a new vendor.
          </p>
        </div>
        <form className="flex flex-col" onSubmit={handleSubmit}>
          <div className="px-2 overflow-y-auto custom-scrollbar">
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
                <Label>Email</Label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setErrors({ ...errors, email: '' });
                  }}
                  error={!!errors.email}
                  hint={errors.email}
                />
              </div>
              <div>
                <Label>Phone</Label>
                <Input
                  type="text"
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value);
                    setErrors({ ...errors, phone: '' });
                  }}
                  error={!!errors.phone}
                  hint={errors.phone}
                />
              </div>
              <div>
                <Label>Currency</Label>
                <Select
                  options={currencyOptions}
                  onChange={(value) => {
                    setCurrencyId(value);
                    setErrors({ ...errors, currency_id: '' });
                  }}
                  placeholder="Select Currency"
                  defaultValue={currencyId}
                  error={!!errors.currency_id}
                  hint={errors.currency_id}
                />
              </div>
              <div className="lg:col-span-2">
                <Label>Address</Label>
                <TextArea
                  placeholder="Enter address"
                  value={address}
                  onChange={(value) => {
                    setAddress(value);
                    setErrors({ ...errors, address: '' });
                  }}
                  error={!!errors.address}
                  hint={errors.address}
                />
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
            <Button type="button" variant="outline" onClick={handleClose}>
              Close
            </Button>
            <Button type="submit">Save Changes</Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
