'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { toast } from 'sonner';
import { getRole, updateRole } from '@/services/RoleService';
import { getPermissions } from '@/services/PermissionService';
import PageMeta from '@/components/common/PageMeta';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import ComponentCard from '@/components/common/ComponentCard';
import Label from '@/components/form/Label';
import Input from '@/components/form/input/InputField';
import { Table, TableBody, TableCell, TableHeader, TableRow } from '@/components/ui/table';
import Checkbox from '@/components/form/input/Checkbox';
import Button from '@/components/ui/button/Button';

import { formatKebabCase } from '@/utils/string';
import { Permission } from '@/types/Permission';
import { Role } from '@/types/Role';
import { isApiError } from '@/utils/errors';

export default function EditRole() {
  const params = useParams<{ id: string }>();
  const id = params?.id;
  const router = useRouter();
  const [role, setRole] = useState<Role | null>(null);
  const [name, setName] = useState('');
  const [selectedPermissions, setSelectedPermissions] = useState<number[]>([]);
  const [availablePermissions, setAvailablePermissions] = useState<Permission[]>([]);
  const [errors, setErrors] = useState({ name: '', permissions: '' });

  const fetchRoleAndPermissions = useCallback(async () => {
    try {
      const [roleData, perms] = await Promise.all([getRole(id!), getPermissions()]);
      setRole(roleData);
      setName(roleData.name);
      setSelectedPermissions(roleData.permissions.map((p: Permission) => p.id));
      setAvailablePermissions(perms.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to fetch role or permissions');
    }
  }, [id]);

  useEffect(() => {
    fetchRoleAndPermissions();
  }, [fetchRoleAndPermissions]);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const sanitizedValue = value.replace(/[^a-zA-Z0-9\s-]/g, '');
    setName(sanitizedValue);
    if (errors.name) {
      setErrors({ ...errors, name: '' });
    }
  };

  const { groupedPermissions, allActions } = useMemo(() => {
    const actionsOrder = ['view', 'create', 'update', 'delete', 'manage'];
    const newAllActions: string[] = [];

    const newGroupedPermissions = availablePermissions.reduce(
      (acc, permission) => {
        const parts = permission.name.split('-');
        const action = parts[0];
        const resource = parts.slice(1).join('-');

        if (!acc[resource]) {
          acc[resource] = {};
        }
        acc[resource][action] = permission;
        if (!newAllActions.includes(action)) {
          newAllActions.push(action);
        }
        return acc;
      },
      {} as Record<string, Record<string, Permission>>
    );

    newAllActions.sort((a, b) => {
      const indexA = actionsOrder.indexOf(a);
      const indexB = actionsOrder.indexOf(b);
      if (indexA !== -1 && indexB !== -1) return indexA - indexB;
      if (indexA !== -1) return -1;
      if (indexB !== -1) return 1;
      return a.localeCompare(b);
    });

    return { groupedPermissions: newGroupedPermissions, allActions: newAllActions };
  }, [availablePermissions]);

  const handlePermissionChange = (permissionId: number, checked: boolean) => {
    setSelectedPermissions((prev) =>
      checked ? [...prev, permissionId] : prev.filter((id) => id !== permissionId)
    );
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedPermissions(availablePermissions.map((p) => p.id));
    } else {
      setSelectedPermissions([]);
    }
  };

  const handleSelectRow = (resource: string, checked: boolean) => {
    const resourcePermissions = Object.values(groupedPermissions[resource]).map((p) => p.id);
    if (checked) {
      setSelectedPermissions((prev) => [...new Set([...prev, ...resourcePermissions])]);
    } else {
      setSelectedPermissions((prev) => prev.filter((id) => !resourcePermissions.includes(id)));
    }
  };

  const handleSelectColumn = (action: string, checked: boolean) => {
    const actionPermissions = Object.values(groupedPermissions)
      .map((res) => res[action]?.id)
      .filter(Boolean);
    if (checked) {
      setSelectedPermissions((prev) => [...new Set([...prev, ...actionPermissions])]);
    } else {
      setSelectedPermissions((prev) => prev.filter((id) => !actionPermissions.includes(id)));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Validation logic...
    try {
      await updateRole(role!.id, { name, permissions: selectedPermissions });
      toast.success('Role updated successfully');
      router.push('/roles');
    } catch (error: unknown) {
      if (isApiError(error) && error.response?.status === 422) {
        const apiErrors = error.response.data.errors;
        const newErrors = {
          name: apiErrors?.name?.[0] || '',
          permissions: apiErrors?.permissions?.[0] || '',
        };
        setErrors(newErrors);
        toast.error('Please correct the errors in the form');
      } else {
        console.error('Error updating role:', error);
        toast.error('Failed to update role');
      }
    }
  };

  if (!role) {
    return <div>Loading...</div>;
  }

  const allSelected =
    availablePermissions.length > 0 && selectedPermissions.length === availablePermissions.length;

  return (
    <>
      <PageMeta title="Edit Role" description="Edit an existing role" />
      <PageBreadcrumb
        pageTitle="Edit Role"
        breadcrumbs={[{ label: 'Roles', path: '/roles' }]}
        backButton
      />
      <ComponentCard>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <Label>
                  Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  type="text"
                  value={name}
                  onChange={handleNameChange}
                  error={!!errors.name}
                  hint={errors.name}
                />
              </div>
            </div>
            <div>
              <Label>
                Permissions <span className="text-red-500">*</span>
              </Label>
              <div className="overflow-hidden rounded-xl border border-gray-200 custom-card-bg dark:border-white/[0.05]">
                <div className="max-w-full overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableCell isHeader className="p-4 text-base font-semibold capitalize">
                          <Checkbox
                            id="select-all"
                            label="Resource"
                            checked={allSelected}
                            onChange={handleSelectAll}
                          />
                        </TableCell>
                        {allActions.map((action) => {
                          const actionPermissions = Object.values(groupedPermissions)
                            .map((res) => res[action]?.id)
                            .filter(Boolean);
                          const isAllChecked =
                            actionPermissions.length > 0 &&
                            actionPermissions.every((id) => selectedPermissions.includes(id));
                          return (
                            <TableCell
                              isHeader
                              key={action}
                              className="p-4 text-base font-semibold capitalize"
                            >
                              <Checkbox
                                id={`select-col-${action}`}
                                label={formatKebabCase(action)}
                                checked={isAllChecked}
                                onChange={(c) => handleSelectColumn(action, c)}
                              />
                            </TableCell>
                          );
                        })}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {Object.entries(groupedPermissions).map(([resource, actions], index) => {
                        const resourcePermissions = Object.values(actions).map((p) => p.id);
                        const isAllChecked =
                          resourcePermissions.length > 0 &&
                          resourcePermissions.every((id) => selectedPermissions.includes(id));
                        return (
                          <TableRow
                            key={resource}
                            className={index % 2 === 0 ? 'custom-table-row-alt' : ''}
                          >
                            <TableCell className="p-4">
                              <Checkbox
                                id={`select-row-${resource}`}
                                label={formatKebabCase(resource)}
                                checked={isAllChecked}
                                onChange={(c) => handleSelectRow(resource, c)}
                                className="font-medium capitalize"
                              />
                            </TableCell>
                            {allActions.map((action) => (
                              <TableCell key={action} className="p-4">
                                {actions[action] ? (
                                  <Checkbox
                                    id={`perm-${actions[action].id}`}
                                    label=""
                                    checked={selectedPermissions.includes(actions[action].id)}
                                    onChange={(c) => handlePermissionChange(actions[action].id, c)}
                                  />
                                ) : null}
                              </TableCell>
                            ))}
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </div>
              {errors.permissions && (
                <p className="mt-2 text-sm text-red-600">{errors.permissions}</p>
              )}
            </div>
          </div>
          <div className="flex justify-end mt-6">
            <Button type="submit">Save Changes</Button>
          </div>
        </form>
      </ComponentCard>
    </>
  );
}
