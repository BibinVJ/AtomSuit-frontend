'use client';

import { useState, useEffect } from 'react';
import { Modal } from '../ui/modal';
import Input from '../form/input/InputField';
import Label from '../form/Label';
import Switch from '../form/switch/Switch';
import Button from '../ui/button/Button';
import Select from '../form/Select';
import { toast } from 'sonner';
import { createTenant } from '@/services/TenantService';
import { getPlans } from '@/services/PlanService';
import { isApiError } from '@/utils/errors';
import { Plan, Tenant, TenantInput } from '@/types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onTenantAdded: (tenant: Tenant) => void;
}

export default function AddTenantModal({ isOpen, onClose, onTenantAdded }: Props) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [domainName, setDomainName] = useState('');
  const [planId, setPlanId] = useState<number | undefined>(undefined);
  const [loadSampleData, setLoadSampleData] = useState(false);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (isOpen) {
      fetchPlans();
    }
  }, [isOpen]);

  const fetchPlans = async () => {
    try {
      const response = await getPlans({ unpaginated: true });
      setPlans(Array.isArray(response.data) ? response.data : [response.data]);
    } catch (error) {
      console.error('Error fetching plans:', error);
      toast.error('Failed to load plans');
    }
  };

  const resetForm = () => {
    setName('');
    setEmail('');
    setPhone('');
    setPassword('');
    setDomainName('');
    setPlanId(undefined);
    setLoadSampleData(false);
    setErrors({});
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: { [key: string]: string } = {};
    let hasError = false;

    if (!name) {
      newErrors.name = 'Name is required';
      hasError = true;
    }

    if (!email) {
      newErrors.email = 'Email is required';
      hasError = true;
    }

    if (!phone) {
      newErrors.phone = 'Phone is required';
      hasError = true;
    }

    if (!password) {
      newErrors.password = 'Password is required';
      hasError = true;
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
      hasError = true;
    }

    if (!domainName) {
      newErrors.domain_name = 'Domain is required';
      hasError = true;
    }

    if (!planId) {
      newErrors.plan_id = 'Plan is required';
      hasError = true;
    }

    if (hasError) {
      setErrors(newErrors);
      toast.error('Please fill all required fields');
      return;
    }

    try {
      const payload: TenantInput = {
        name,
        email,
        phone,
        password,
        domain_name: domainName,
        plan_id: Number(planId),
        load_sample_data: loadSampleData,
      };

      const response = await createTenant(payload);
      onTenantAdded(response);
      toast.success('Tenant created successfully');
      handleClose();
    } catch (error: unknown) {
      if (isApiError(error)) {
        if (error.response?.status === 422) {
          const apiErrors = error.response.data.errors || {};
          const newErrors: { [key: string]: string } = {
            name: apiErrors?.name?.[0] || '',
            email: apiErrors?.email?.[0] || '',
            phone: apiErrors?.phone?.[0] || '',
            password: apiErrors?.password?.[0] || '',
            domain_name: apiErrors?.domain_name?.[0] || '',
            plan_id: apiErrors?.plan_id?.[0] || '',
          };
          setErrors(newErrors);
          toast.error('Please correct the errors in the form');
        } else {
          const errorMessage = error.response?.data?.message || 'Failed to create tenant';
          toast.error(errorMessage);
        }
      } else {
        console.error('Error creating tenant:', error);
        toast.error('Failed to create tenant');
      }
    }
  };

  const planOptions = plans.map((p) => ({ value: String(p.id), label: p.name }));

  return (
    <Modal isOpen={isOpen} onClose={handleClose} className="max-w-[700px] lg:p-11">
      <div className="relative w-full max-h-[85vh] p-4 overflow-y-auto bg-white custom-scrollbar rounded-3xl dark:bg-gray-900">
        <div className="px-2 pr-14">
          <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
            Add New Tenant
          </h4>
          <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
            Fill in the details to add a new tenant.
          </p>
        </div>
        <form className="flex flex-col" onSubmit={handleSubmit}>
          <div className="px-2">
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
                  Email <span className="text-red-500">*</span>
                </Label>
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
                <Label>
                  Phone <span className="text-red-500">*</span>
                </Label>
                <Input
                  type="tel"
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
                <Label>
                  Password <span className="text-red-500">*</span>
                </Label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setErrors({ ...errors, password: '' });
                  }}
                  error={!!errors.password}
                  hint={errors.password}
                />
              </div>
              <div>
                <Label>
                  Domain <span className="text-red-500">*</span>
                </Label>
                <Input
                  type="text"
                  value={domainName}
                  onChange={(e) => {
                    setDomainName(e.target.value);
                    setErrors({ ...errors, domain_name: '' });
                  }}
                  error={!!errors.domain_name}
                  hint={errors.domain_name}
                  placeholder="subdomain"
                />
              </div>
              <div>
                <Label>
                  Plan <span className="text-red-500">*</span>
                </Label>
                <Select
                  options={planOptions}
                  onChange={(value) => {
                    setPlanId(Number(value));
                    setErrors({ ...errors, plan_id: '' });
                  }}
                  error={!!errors.plan_id}
                  hint={errors.plan_id}
                />
              </div>
              <div>
                <Label>Load Sample Data?</Label>
                <Switch
                  label={loadSampleData ? 'Yes' : 'No'}
                  checked={loadSampleData}
                  onChange={setLoadSampleData}
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
