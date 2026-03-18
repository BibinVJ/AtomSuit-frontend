'use client';

import { useState } from 'react';
import { Modal } from '@/components/ui/modal';
import Input from '@/components/form/input/InputField';
import Label from '@/components/form/Label';
import Switch from '@/components/form/switch/Switch';
import Button from '@/components/ui/button/Button';
import Select from '@/components/form/Select';
import { toast } from 'sonner';
import { createPlan } from '@/services/PlanService';
import { isApiError } from '@/utils/errors';
import { Plan, PlanFeature } from '@/types/Plan';
import { Plus, Trash2 } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onPlanAdded: (plan: Plan) => void;
}

export default function AddPlanModal({ isOpen, onClose, onPlanAdded }: Props) {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [interval, setInterval] = useState<'day' | 'week' | 'month' | 'year' | 'lifetime'>('month');
  const [intervalCount, setIntervalCount] = useState('1');
  const [isTrial, setIsTrial] = useState(false);
  const [trialDays, setTrialDays] = useState('14');
  const [isExpiredUserPlan, setIsExpiredUserPlan] = useState(false);
  const [features, setFeatures] = useState<Omit<PlanFeature, 'id'>[]>([]);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const resetForm = () => {
    setName('');
    setPrice('');
    setInterval('month');
    setIntervalCount('1');
    setIsTrial(false);
    setTrialDays('14');
    setIsExpiredUserPlan(false);
    setFeatures([]);
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

    if (!price || isNaN(Number(price))) {
      newErrors.price = 'Valid price is required';
      hasError = true;
    }

    if (isTrial && (!trialDays || isNaN(Number(trialDays)))) {
      newErrors.trialDays = 'Valid trial days required';
      hasError = true;
    }

    // Validate features
    features.forEach((feature, index) => {
      if (!feature.key) {
        newErrors[`feature_${index}_key`] = 'Feature key is required';
        hasError = true;
      }
      if (!feature.display_name) {
        newErrors[`feature_${index}_display_name`] = 'Display name is required';
        hasError = true;
      }
      if (feature.value === '' || feature.value === undefined || feature.value === null) {
        newErrors[`feature_${index}_value`] = 'Value is required';
        hasError = true;
      }
    });

    if (hasError) {
      setErrors(newErrors);
      toast.error('Please fill all required fields');
      return;
    }

    try {
      const payload: Record<string, unknown> = {
        name,
        price: Number(price),
        interval,
        interval_count: Number(intervalCount),
        is_trial_plan: isTrial,
        trial_duration_in_days: isTrial ? Number(trialDays) : undefined,
        is_expired_user_plan: isExpiredUserPlan,
        features: features.map((f, index) => ({
          key: f.key,
          value: f.value,
          type: f.type,
          display_name: f.display_name,
          description: f.description,
          display_order: index,
        })),
      };

      const response = await createPlan(payload);
      onPlanAdded(response);
      toast.success('Plan added successfully');
      handleClose();
    } catch (error: unknown) {
      if (isApiError(error)) {
        if (error.response?.status === 422) {
          const apiErrors = error.response.data.errors || {};
          const newErrors: { [key: string]: string } = {
            name: apiErrors?.name?.[0] || '',
            price: apiErrors?.price?.[0] || '',
            interval: apiErrors?.interval?.[0] || '',
            intervalCount: apiErrors?.interval_count?.[0] || '',
            trialDays: apiErrors?.trial_duration_in_days?.[0] || '',
          };
          setErrors(newErrors);
          toast.error('Please correct the errors in the form');
        } else {
          // Show the error message from API response
          const errorMessage = error.response?.data?.message || 'Failed to add plan';
          console.error('Error adding plan:', error);
          toast.error(errorMessage);
        }
      } else {
        console.error('Error adding plan:', error);
        toast.error('Failed to add plan');
      }
    }
  };

  const addFeature = () => {
    setFeatures([
      ...features,
      {
        key: '',
        value: '',
        type: 'string',
        display_name: '',
        description: '',
        display_order: features.length,
      },
    ]);
  };

  const removeFeature = (index: number) => {
    setFeatures(features.filter((_, i) => i !== index));
  };

  const updateFeature = (index: number, field: keyof Omit<PlanFeature, 'id'>, value: unknown) => {
    const updated = [...features];
    updated[index] = { ...updated[index], [field]: value };
    setFeatures(updated);
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} className="max-w-[700px] lg:p-11">
      <div className="relative w-full max-h-[85vh] p-4 overflow-y-auto bg-white custom-scrollbar rounded-3xl dark:bg-gray-900">
        <div className="px-2 pr-14">
          <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
            Add New Plan
          </h4>
          <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
            Fill in the details to add a new plan.
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
                  Price <span className="text-red-500">*</span>
                </Label>
                <Input
                  type="number"
                  value={price}
                  onChange={(e) => {
                    setPrice(e.target.value);
                    setErrors({ ...errors, price: '' });
                  }}
                  error={!!errors.price}
                  hint={errors.price}
                />
              </div>
              <div>
                <Label>
                  Interval <span className="text-red-500">*</span>
                </Label>
                <Select
                  options={[
                    { value: 'day', label: 'Day' },
                    { value: 'week', label: 'Week' },
                    { value: 'month', label: 'Month' },
                    { value: 'year', label: 'Year' },
                    { value: 'lifetime', label: 'Lifetime' },
                  ]}
                  onChange={(value) =>
                    setInterval(value as 'day' | 'week' | 'month' | 'year' | 'lifetime')
                  }
                  defaultValue={interval}
                />
              </div>
              <div>
                <Label>
                  Interval Count <span className="text-red-500">*</span>
                </Label>
                <Input
                  type="number"
                  value={intervalCount}
                  onChange={(e) => {
                    setIntervalCount(e.target.value);
                    setErrors({ ...errors, intervalCount: '' });
                  }}
                  error={!!errors.intervalCount}
                  hint={errors.intervalCount}
                  min="1"
                />
              </div>
              <div>
                <Label>Trial Plan?</Label>
                <Switch label={isTrial ? 'Yes' : 'No'} checked={isTrial} onChange={setIsTrial} />
              </div>
              {isTrial && (
                <div>
                  <Label>Trial Days</Label>
                  <Input
                    type="number"
                    value={trialDays}
                    onChange={(e) => {
                      setTrialDays(e.target.value);
                      setErrors({ ...errors, trialDays: '' });
                    }}
                    error={!!errors.trialDays}
                    hint={errors.trialDays}
                  />
                </div>
              )}
              <div>
                <Label>Expired User Plan?</Label>
                <Switch
                  label={isExpiredUserPlan ? 'Yes' : 'No'}
                  checked={isExpiredUserPlan}
                  onChange={setIsExpiredUserPlan}
                />
              </div>
            </div>

            {/* Features Section */}
            <div className="mt-6">
              <div className="flex items-center justify-between mb-4">
                <Label>Features</Label>
                <Button type="button" size="xs" onClick={addFeature}>
                  <Plus className="w-4 h-4 mr-1" /> Add Feature
                </Button>
              </div>
              {features.map((feature, index) => (
                <div key={index} className="p-4 mb-4 border rounded dark:border-gray-700">
                  <div className="flex items-start justify-between mb-3">
                    <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Feature {index + 1}
                    </h5>
                    <Button
                      type="button"
                      size="xs"
                      variant="outline"
                      onClick={() => removeFeature(index)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                    <div>
                      <Label>
                        Key <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        type="text"
                        value={feature.key}
                        onChange={(e) => {
                          updateFeature(index, 'key', e.target.value);
                          setErrors({ ...errors, [`feature_${index}_key`]: '' });
                        }}
                        placeholder="e.g., storage_gb"
                        error={!!errors[`feature_${index}_key`]}
                        hint={errors[`feature_${index}_key`]}
                      />
                    </div>
                    <div>
                      <Label>
                        Display Name <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        type="text"
                        value={feature.display_name}
                        onChange={(e) => {
                          updateFeature(index, 'display_name', e.target.value);
                          setErrors({ ...errors, [`feature_${index}_display_name`]: '' });
                        }}
                        placeholder="e.g., Storage"
                        error={!!errors[`feature_${index}_display_name`]}
                        hint={errors[`feature_${index}_display_name`]}
                      />
                    </div>
                    <div>
                      <Label>
                        Type <span className="text-red-500">*</span>
                      </Label>
                      <Select
                        options={[
                          { value: 'string', label: 'String' },
                          { value: 'integer', label: 'Integer' },
                          { value: 'boolean', label: 'Boolean' },
                        ]}
                        onChange={(value) =>
                          updateFeature(index, 'type', value as 'string' | 'integer' | 'boolean')
                        }
                        defaultValue={feature.type}
                      />
                    </div>
                    <div>
                      <Label>
                        Value <span className="text-red-500">*</span>
                      </Label>
                      {feature.type === 'boolean' ? (
                        <Select
                          options={[
                            { value: 'true', label: 'True' },
                            { value: 'false', label: 'False' },
                          ]}
                          onChange={(value) => updateFeature(index, 'value', value === 'true')}
                          defaultValue={String(feature.value)}
                          error={!!errors[`feature_${index}_value`]}
                          hint={errors[`feature_${index}_value`]}
                        />
                      ) : (
                        <Input
                          type={feature.type === 'integer' ? 'number' : 'text'}
                          value={String(feature.value)}
                          onChange={(e) =>
                            updateFeature(
                              index,
                              'value',
                              feature.type === 'integer' ? Number(e.target.value) : e.target.value
                            )
                          }
                          placeholder="Feature value"
                          error={!!errors[`feature_${index}_value`]}
                          hint={errors[`feature_${index}_value`]}
                        />
                      )}
                    </div>
                    <div className="lg:col-span-2">
                      <Label>Description</Label>
                      <Input
                        type="text"
                        value={feature.description || ''}
                        onChange={(e) => updateFeature(index, 'description', e.target.value)}
                        placeholder="Optional description"
                      />
                    </div>
                  </div>
                </div>
              ))}
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
