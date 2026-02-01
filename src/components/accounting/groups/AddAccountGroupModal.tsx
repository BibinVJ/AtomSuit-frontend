'use client';

import { useEffect, useState } from 'react';
import FormModal from '../../common/FormModal';
import Input from '../../form/input/InputField';
import Label from '../../form/Label';
import Select from '../../form/Select';
import TextArea from '../../form/input/TextArea';
import { toast } from 'sonner';
import { addAccountGroup, getAccountGroups } from '@/services/AccountGroupService';
import { getAccountTypes } from '@/services/AccountTypeService';
import { isApiError } from '@/utils/errors';
import { AccountType, AccountGroup } from '@/types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddAccountGroupModal({ isOpen, onClose, onSuccess }: Props) {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [accountTypeId, setAccountTypeId] = useState<string>('');
  const [parentId, setParentId] = useState<string>('');
  const [description, setDescription] = useState('');

  const [accountTypes, setAccountTypes] = useState<AccountType[]>([]);
  const [parentGroups, setParentGroups] = useState<AccountGroup[]>([]);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const [typesResponse, groupsResponse] = await Promise.all([
          getAccountTypes(),
          getAccountGroups({ perPage: 1000 }), // Fetch all for dropdown
        ]);
        setAccountTypes(typesResponse.data);
        setParentGroups(groupsResponse.data);
      } catch (error) {
        console.error('Failed to fetch options', error);
        toast.error('Failed to load form options');
      }
    };

    if (isOpen) {
      fetchOptions();
    }
  }, [isOpen]);

  const resetForm = () => {
    setName('');
    setCode('');
    setAccountTypeId('');
    setParentId('');
    setDescription('');
    setErrors({});
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await addAccountGroup({
        name,
        code: code || undefined,
        account_type_id: parseInt(accountTypeId),
        parent_id: parentId ? parseInt(parentId) : undefined,
        description,
      });

      onSuccess();
      toast.success('Account Group added successfully');
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
        toast.error('Failed to add account group');
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
      title="Add New Account Group"
      description="Fill in the details to add a new account group."
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
          <Label>Code</Label>
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
            Account Type <span className="text-red-500">*</span>
          </Label>
          <Select
            value={accountTypeId}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
              setAccountTypeId(e.target.value);
              setErrors((prev) => ({ ...prev, account_type_id: '' }));
            }}
            options={[
              { value: '', label: 'Select Type' },
              ...accountTypes.map((type) => ({ value: type.id.toString(), label: type.name })),
            ]}
            error={!!errors.account_type_id}
          />
          {errors.account_type_id && (
            <p className="mt-1 text-xs text-red-500">{errors.account_type_id}</p>
          )}
        </div>

        <div>
          <Label>Parent Group</Label>
          <Select
            value={parentId}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setParentId(e.target.value)}
            options={[
              { value: '', label: 'None' },
              ...parentGroups.map((group) => ({ value: group.id.toString(), label: group.name })),
            ]}
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
