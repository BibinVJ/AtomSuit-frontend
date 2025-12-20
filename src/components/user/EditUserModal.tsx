"use client";


import { useState, useEffect } from 'react';
import { Modal } from '../ui/modal';
import Input from '../form/input/InputField';
import Label from '../form/Label';
import Button from '../ui/button/Button';
import { toast } from 'sonner';
import { updateUser } from '../../services/UserService';
import { getRoles } from '../../services/RoleService';
import Select from '../form/Select';
import Switch from '../form/switch/Switch';
import { formatKebabCase } from '../../utils/string';
import { User } from '../../types/User';
import { Role } from '../../types/Role';
import { isApiError } from '../../utils/errors';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onUserUpdated: () => void;
  user: User;
}

export default function EditUserModal({ isOpen, onClose, onUserUpdated, user }: Props) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [roleId, setRoleId] = useState<number | undefined>(undefined);
  const [status, setStatus] = useState('active');
  const [roles, setRoles] = useState<Role[]>([]);
  const [errors, setErrors] = useState({ name: '', email: '', phone: '', role_id: '' });

  useEffect(() => {
    if (isOpen) {
      const fetchRoles = async () => {
        try {
          const rolesData = await getRoles({ page: 1, limit: 10, sortCol: 'created_at', sortDir: 'desc', unpaginated: true });
          setRoles(rolesData.data);
        } catch (error) {
          console.error('Error fetching roles:', error);
          toast.error('Failed to fetch roles');
        }
      };
      fetchRoles();
    }
  }, [isOpen]);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
      setPhone(user.phone || '');
      setRoleId(user.role.id);
      setStatus(user.status);
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors = { name: '', email: '', phone: '', role_id: '' };
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
      await updateUser(user.id, { name, email, phone, role_id: roleId, status });
      onUserUpdated();
      toast.success('User updated successfully');
      onClose();
    } catch (error: unknown) {
      if (isApiError(error) && error.response?.status === 422) {
        const apiErrors = error.response.data.errors;
        const newErrors = {
          name: apiErrors?.name?.[0] || '',
          email: apiErrors?.email?.[0] || '',
          phone: apiErrors?.phone?.[0] || '',
          role_id: apiErrors?.role_id?.[0] || '',
        };
        setErrors(newErrors);
        toast.error('Please correct the errors in the form');
      } else {
        console.error('Error updating user:', error);
        toast.error('Failed to update user');
      }
    }
  };

  const roleOptions = roles.map(r => ({ value: String(r.id), label: formatKebabCase(r.name) }));

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-[700px] p-6 md:p-10">
      <div className="relative w-full">
        <div className="px-2 pr-14">
          <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
            Edit User
          </h4>
          <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
            Update the details of the user.
          </p>
        </div>
        <form className="flex flex-col" onSubmit={handleSubmit}>
          <div className="px-2 overflow-y-auto custom-scrollbar">
            <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
              <div>
                <Label>Name <span className="text-red-500">*</span></Label>
                <Input type="text" value={name} onChange={(e) => { setName(e.target.value); setErrors({ ...errors, name: '' }) }} error={!!errors.name} hint={errors.name} />
              </div>
              <div>
                <Label>Email</Label>
                <Input type="email" value={email} onChange={(e) => { setEmail(e.target.value); setErrors({ ...errors, email: '' }) }} error={!!errors.email} hint={errors.email} />
              </div>
              <div>
                <Label>Phone</Label>
                <Input type="text" value={phone} onChange={(e) => { setPhone(e.target.value); setErrors({ ...errors, phone: '' }) }} error={!!errors.phone} hint={errors.phone} />
              </div>
              <div>
                <Label>Role</Label>
                <Select options={roleOptions} defaultValue={String(roleId)} onChange={(value) => { setRoleId(Number(value)); setErrors({ ...errors, role_id: '' }) }} error={!!errors.role_id} hint={errors.role_id} />
              </div>
              <div>
                <Label>Status</Label>
                <Switch label={status === 'active' ? 'Active' : 'Inactive'} checked={status === 'active'} onChange={(checked) => setStatus(checked ? 'active' : 'inactive')} />
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
            <Button
              type="button"
              variant='outline'
              onClick={onClose}
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
