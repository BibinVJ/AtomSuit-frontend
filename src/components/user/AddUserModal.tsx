"use client";


import { useState, useEffect } from 'react';
import { Modal } from '../ui/modal';
import Input from '../form/input/InputField';
import Label from '../form/Label';
import Button from '../ui/button/Button';
import { toast } from 'sonner';
import { createUser } from '../../services/UserService';
import { getRoles } from '../../services/RoleService';
import Select from '../form/Select';
import { formatKebabCase } from '../../utils/string';
import { Role } from '../../types/Role';
import { isApiError } from '../../utils/errors';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onUserAdded: () => void;
}

export default function AddUserModal({ isOpen, onClose, onUserAdded }: Props) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [roleId, setRoleId] = useState<number | undefined>(undefined);
  const [roles, setRoles] = useState<Role[]>([]);
  const [errors, setErrors] = useState({ name: '', email: '', phone: '', password: '', role_id: '' });

  useEffect(() => {
    if (isOpen) {
      const fetchRoles = async () => {
        try {
          const rolesData = await getRoles(1, 10, 'created_at', 'desc', true);
          if (rolesData && Array.isArray(rolesData.data)) {
            setRoles(rolesData.data);
          } else {
            setRoles([]);
          }
        } catch (error) {
          console.error('Error fetching roles:', error);
          toast.error('Failed to fetch roles');
          setRoles([]);
        }
      };
      fetchRoles();
    }
  }, [isOpen]);

  const resetForm = () => {
    setName('');
    setEmail('');
    setPhone('');
    setPassword('');
    setRoleId(undefined);
    setErrors({ name: '', email: '', phone: '', password: '', role_id: '' });
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors = { name: '', email: '', phone: '', password: '', role_id: '' };
    let hasError = false;

    if (!name) {
      newErrors.name = 'Name is required';
      hasError = true;
    }

    if (email && !/^\S+@\S+\.\S+$/.test(email)) {
      newErrors.email = 'Please enter a valid email address';
      hasError = true;
    }

    if (!password) {
      newErrors.password = 'Password is required';
      hasError = true;
    } else if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
      hasError = true;
    }

    if (!roleId) {
      newErrors.role_id = 'Role is required';
      hasError = true;
    }

    if (hasError) {
      setErrors(newErrors);
      return;
    }

    try {
      await createUser({ name, email, phone, password, role_id: roleId, profile_image: null, alternate_email: null, alternate_phone: null, id_proof_type: null, id_proof_number: null, dob: null, gender: null, addresses: [], social_links: [] });
      onUserAdded();
      toast.success('User added successfully');
      handleClose();
    } catch (error: unknown) {
      if (isApiError(error) && error.response?.status === 422) {
        const apiErrors = error.response.data.errors;
        const newErrors = {
          name: apiErrors?.name?.[0] || '',
          email: apiErrors?.email?.[0] || '',
          phone: apiErrors?.phone?.[0] || '',
          password: apiErrors?.password?.[0] || '',
          role_id: apiErrors?.role_id?.[0] || '',
        };
        setErrors(newErrors);
        toast.error('Please correct the errors in the form');
      } else {
        console.error('Error adding user:', error);
        toast.error('Failed to add user');
      }
    }
  };

  const roleOptions = roles.map(r => ({ value: String(r.id), label: formatKebabCase(r.name) }));

  return (
    <Modal isOpen={isOpen} onClose={handleClose} className="max-w-[700px] lg:p-11">
      <div className="relative w-full p-4 overflow-y-auto bg-white no-scrollbar rounded-3xl dark:bg-gray-900">
        <div className="px-2 pr-14">
          <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
            Add New User
          </h4>
          <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
            Fill in the details to add a new user.
          </p>
        </div>
        <form className="flex flex-col" onSubmit={handleSubmit}>
          <div className="px-2 overflow-y-auto custom-scrollbar">
            <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
              <div>
                <Label>Name <span className="text-red-500">*</span></Label>
                <Input type="text" value={name} onChange={(e) => { setName(e.target.value); setErrors({ ...errors, name: '' }) }} error={!!errors.name} hint={errors.name} autoComplete="off" />
              </div>
              <div>
                <Label>Email</Label>
                <Input type="email" value={email} onChange={(e) => { setEmail(e.target.value); setErrors({ ...errors, email: '' }) }} error={!!errors.email} hint={errors.email} autoComplete="off" />
              </div>
              <div>
                <Label>Phone</Label>
                <Input type="text" value={phone} onChange={(e) => { setPhone(e.target.value); setErrors({ ...errors, phone: '' }) }} error={!!errors.phone} hint={errors.phone} />
              </div>
              <div>
                <Label>Password <span className="text-red-500">*</span></Label>
                <Input type="password" value={password} onChange={(e) => { setPassword(e.target.value); setErrors({ ...errors, password: '' }) }} error={!!errors.password} hint={errors.password} autoComplete="new-password" />
              </div>
              <div>
                <Label>Role <span className="text-red-500">*</span></Label>
                <Select options={roleOptions} onChange={(value) => { setRoleId(Number(value)); setErrors({ ...errors, role_id: '' }) }} error={!!errors.role_id} hint={errors.role_id} />
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
            <Button
              type="button"
              variant='outline'
              onClick={handleClose}
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
