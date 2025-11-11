"use client";

import { useState, useEffect } from 'react';
import { Modal } from '../ui/modal';
import Input from '../form/input/InputField';
import Label from '../form/Label';
import Button from '../ui/button/Button';
import Select from '../form/Select';
import { toast } from 'sonner';
import { updateTenant } from '../../services/TenantService';
import { getPlans } from '../../services/PlanService';
import { isApiError } from '../../utils/errors';
import { Plan, Tenant } from '../../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onTenantUpdated: () => void;
  tenant: Tenant;
}

export default function EditTenantModal({ isOpen, onClose, onTenantUpdated, tenant }: Props) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'active' | 'suspended' | 'trial'>('active');
  const [planId, setPlanId] = useState<number | undefined>(undefined);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (tenant) {
      setName(tenant.name);
      setEmail(tenant.email);
      setStatus(tenant.status);
      setPlanId(tenant.plan_id);
    }
  }, [tenant]);

  useEffect(() => {
    if (isOpen) {
      fetchPlans();
    }
  }, [isOpen]);

  const fetchPlans = async () => {
    try {
      const response = await getPlans(1, 100, 'name', 'asc', true);
      setPlans(Array.isArray(response.data) ? response.data : [response.data]);
    } catch (error) {
      console.error('Error fetching plans:', error);
      toast.error('Failed to load plans');
    }
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
      const payload = {
        name,
        email,
        status,
        plan_id: planId,
      };

      await updateTenant(tenant.id, payload);
      onTenantUpdated();
      toast.success('Tenant updated successfully');
      onClose();
    } catch (error: unknown) {
      if (isApiError(error)) {
        if (error.response?.status === 422) {
          const apiErrors = error.response.data.errors || {};
          const newErrors: { [key: string]: string } = {
            name: apiErrors?.name?.[0] || '',
            email: apiErrors?.email?.[0] || '',
            plan_id: apiErrors?.plan_id?.[0] || '',
          };
          setErrors(newErrors);
          toast.error('Please correct the errors in the form');
        } else {
          const errorMessage = error.response?.data?.message || 'Failed to update tenant';
          toast.error(errorMessage);
        }
      } else {
        console.error('Error updating tenant:', error);
        toast.error('Failed to update tenant');
      }
    }
  };

  const planOptions = plans.map(p => ({ value: String(p.id), label: p.name }));
  const statusOptions = [
    { value: 'active', label: 'Active' },
    { value: 'suspended', label: 'Suspended' },
    { value: 'trial', label: 'Trial' },
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-[700px] lg:p-11">
      <div className="relative w-full max-h-[85vh] p-4 overflow-y-auto bg-white custom-scrollbar rounded-3xl dark:bg-gray-900">
        <div className="px-2 pr-14">
          <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
            Edit Tenant
          </h4>
          <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
            Update the details of the tenant.
          </p>
        </div>
        <form className="flex flex-col" onSubmit={handleSubmit}>
          <div className="px-2">
            <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
              <div>
                <Label>Name <span className="text-red-500">*</span></Label>
                <Input 
                  type="text" 
                  value={name} 
                  onChange={(e) => {
                    setName(e.target.value);
                    setErrors({...errors, name: ''});
                  }} 
                  error={!!errors.name} 
                  hint={errors.name} 
                />
              </div>
              <div>
                <Label>Email <span className="text-red-500">*</span></Label>
                <Input 
                  type="email" 
                  value={email} 
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setErrors({...errors, email: ''});
                  }} 
                  error={!!errors.email} 
                  hint={errors.email} 
                />
              </div>
              <div>
                <Label>Status <span className="text-red-500">*</span></Label>
                <Select 
                  options={statusOptions} 
                  onChange={(value) => setStatus(value as any)} 
                  defaultValue={status}
                  showPlaceholder={false}
                />
              </div>
              <div>
                <Label>Plan <span className="text-red-500">*</span></Label>
                <Select 
                  options={planOptions} 
                  onChange={(value) => {
                    setPlanId(Number(value));
                    setErrors({...errors, plan_id: ''});
                  }} 
                  defaultValue={String(planId)}
                  error={!!errors.plan_id} 
                  hint={errors.plan_id}
                />
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
            <Button type="button" variant='outline' onClick={onClose}>Close</Button>
            <Button type="submit">Save Changes</Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
