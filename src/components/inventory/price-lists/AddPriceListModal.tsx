'use client';

import { useState, useEffect } from 'react';
import { Modal } from '../../ui/modal';
import Input from '../../form/input/InputField';
import Label from '../../form/Label';
import Button from '../../ui/button/Button';
import { toast } from 'sonner';
import { createPriceList } from '@/services/PriceListService';
import { getCurrencies } from '@/services/CurrencyService';
import Select from '../../form/Select';
import { isApiError } from '@/utils/errors';
import Switch from '../../form/switch/Switch';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddPriceListModal({ isOpen, onClose, onSuccess }: Props) {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [type, setType] = useState('sales');
  const [currencyId, setCurrencyId] = useState<number | undefined>(undefined);
  const [isTaxInclusive, setIsTaxInclusive] = useState(false);
  const [description, setDescription] = useState('');

  const [currencies, setCurrencies] = useState<{ value: string; label: string }[]>([]);
  const [errors, setErrors] = useState({
    name: '',
    code: '',
    type: '',
    currency_id: '',
    description: '',
  });

  useEffect(() => {
    if (isOpen) {
      const fetchCurrencies = async () => {
        try {
          const res = await getCurrencies({ unpaginated: true });
          if (res && res.data) {
            setCurrencies(
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              res.data.map((c: any) => ({ value: String(c.id), label: `${c.name} (${c.code})` }))
            );
          }
        } catch (error) {
          console.error('Error fetching currencies:', error);
          toast.error('Failed to fetch currencies');
        }
      };
      fetchCurrencies();
      resetForm();
    }
  }, [isOpen]);

  const resetForm = () => {
    setName('');
    setCode('');
    setType('sales');
    setCurrencyId(undefined);
    setIsTaxInclusive(false);
    setDescription('');
    setErrors({ name: '', code: '', type: '', currency_id: '', description: '' });
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors = { name: '', code: '', type: '', currency_id: '', description: '' };
    let hasError = false;

    if (!name) {
      newErrors.name = 'Name is required';
      hasError = true;
    }
    if (!code) {
      newErrors.code = 'Code is required';
      hasError = true;
    }
    if (!currencyId) {
      newErrors.currency_id = 'Currency is required';
      hasError = true;
    }

    if (hasError) {
      setErrors(newErrors);
      return;
    }

    try {
      const payload = {
        name,
        code,
        type: type as 'sales' | 'purchase',
        currency_id: currencyId,
        is_tax_inclusive: isTaxInclusive,
        description,
      };

      await createPriceList(payload);
      toast.success('Price list created successfully');

      onSuccess();
      handleClose();
    } catch (error: unknown) {
      if (isApiError(error) && error.response?.status === 422) {
        const apiErrors = error.response.data.errors;
        const newErrors = {
          name: apiErrors?.name?.[0] || '',
          code: apiErrors?.code?.[0] || '',
          type: apiErrors?.type?.[0] || '',
          currency_id: apiErrors?.currency_id?.[0] || '',
          description: apiErrors?.description?.[0] || '',
        };
        setErrors(newErrors);
        toast.error('Please correct the errors in the form');
      } else {
        console.error('Error saving price list:', error);
        toast.error('Failed to save price list');
      }
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} className="max-w-[700px] p-6 md:p-10">
      <div className="relative w-full">
        <div className="px-2 pr-14">
          <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
            Add New Price List
          </h4>
          <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
            Fill in the details for the price list.
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
                  autoComplete="off"
                />
              </div>
              <div>
                <Label>
                  Code <span className="text-red-500">*</span>
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
                  autoComplete="off"
                />
              </div>
              <div>
                <Label>Type</Label>
                <Select
                  options={[
                    { value: 'sales', label: 'Sales' },
                    { value: 'purchase', label: 'Purchase' },
                  ]}
                  onChange={(value) => setType(value)}
                  defaultValue={type}
                  error={!!errors.type}
                  hint={errors.type}
                />
              </div>
              <div>
                <Label>
                  Currency <span className="text-red-500">*</span>
                </Label>
                <Select
                  options={currencies}
                  onChange={(value) => {
                    setCurrencyId(Number(value));
                    setErrors({ ...errors, currency_id: '' });
                  }}
                  defaultValue={currencyId ? String(currencyId) : ''}
                  error={!!errors.currency_id}
                  hint={errors.currency_id}
                  searchable
                />
              </div>
              <div className="lg:col-span-2">
                <Label>Description</Label>
                <Input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  error={!!errors.description}
                  hint={errors.description}
                />
              </div>
              <div className="lg:col-span-2">
                <Switch
                  checked={isTaxInclusive}
                  onChange={(checked) => setIsTaxInclusive(checked)}
                  label="Is Tax Inclusive?"
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
