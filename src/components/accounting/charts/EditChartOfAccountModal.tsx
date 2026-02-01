'use client';

import { useEffect, useState } from 'react';
import FormModal from '../../common/FormModal';
import Input from '../../form/input/InputField';
import Label from '../../form/Label';
import Select from '../../form/Select';
import TextArea from '../../form/input/TextArea';
import { toast } from 'sonner';
import { updateChartOfAccount } from '@/services/ChartOfAccountService';
import { getAccountGroups } from '@/services/AccountGroupService';
import { isApiError } from '@/utils/errors';
import { AccountGroup, ChartOfAccount } from '@/types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  chartOfAccount: ChartOfAccount;
}

export default function EditChartOfAccountModal({
  isOpen,
  onClose,
  onSuccess,
  chartOfAccount,
}: Props) {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [accountGroupId, setAccountGroupId] = useState<string>('');
  const [description, setDescription] = useState('');
  const [openingBalance, setOpeningBalance] = useState<string>('0');

  const [accountGroups, setAccountGroups] = useState<AccountGroup[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const response = await getAccountGroups({ perPage: 1000, trashed: 'with' });
        setAccountGroups(response.data);
      } catch (error) {
        console.error('Failed to fetch account groups', error);
        toast.error('Failed to load account groups');
      }
    };

    if (isOpen && chartOfAccount) {
      setName(chartOfAccount.name);
      setCode(chartOfAccount.code);
      setAccountGroupId(chartOfAccount.account_group?.id.toString() ?? '');
      setDescription(chartOfAccount.description || '');
      setOpeningBalance((chartOfAccount.opening_balance ?? 0).toString());
      setErrors({});

      fetchOptions();
    }
  }, [isOpen, chartOfAccount]);

  const handleClose = () => {
    setErrors({});
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await updateChartOfAccount(chartOfAccount.id, {
        name,
        code,
        account_group_id: parseInt(accountGroupId),
        description,
        opening_balance: parseFloat(openingBalance),
      });

      onSuccess();
      toast.success('Account updated successfully');
      handleClose();
    } catch (error: unknown) {
      if (isApiError(error) && error.response?.status === 422) {
        const apiErrors = error.response.data.errors;
        const formattedErrors: Record<string, string> = {};
        if (apiErrors) {
          Object.keys(apiErrors).forEach((key) => {
            formattedErrors[key] = apiErrors[key][0];
          });
        }
        setErrors(formattedErrors);
        toast.error('Please correct the errors in the form');
      } else {
        toast.error('Failed to update account');
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
      title="Edit Account"
      description="Update the details of the chart of account."
      isSubmitting={isSubmitting}
    >
      <div className="grid grid-cols-1 gap-x-6 gap-y-5">
        <div>
          <Label>
            Name <span className="text-red-500">*</span>
          </Label>
          <Input
            type="text"
            value={name}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              setName(e.target.value);
              setErrors((prev) => ({ ...prev, name: '' }));
            }}
            error={!!errors.name}
            hint={errors.name}
          />
        </div>

        <div>
          <Label>
            Code <span className="text-red-500">*</span>
          </Label>
          <Input
            type="text"
            value={code}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              setCode(e.target.value);
              setErrors((prev) => ({ ...prev, code: '' }));
            }}
            error={!!errors.code}
            hint={errors.code}
          />
        </div>

        <div>
          <Label>
            Account Group <span className="text-red-500">*</span>
          </Label>
          <Select
            value={accountGroupId}
            onChange={(value: string) => {
              setAccountGroupId(value);
              setErrors((prev) => ({ ...prev, account_group_id: '' }));
            }}
            options={[
              ...accountGroups
                .filter((group) => !group.deleted_at || group.id.toString() === accountGroupId)
                .map((group) => ({
                  value: group.id.toString(),
                  label: group.deleted_at ? `${group.name} (Deleted)` : group.name,
                  variant: (group.deleted_at ? 'danger' : 'default') as 'danger' | 'default',
                })),
            ]}
            error={!!errors.account_group_id}
          />
          {errors.account_group_id && (
            <p className="mt-1 text-xs text-red-500">{errors.account_group_id}</p>
          )}
        </div>

        <div>
          <Label>Opening Balance</Label>
          <Input
            type="number"
            step={0.01}
            value={openingBalance}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setOpeningBalance(e.target.value)}
          />
        </div>

        <div>
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
