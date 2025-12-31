'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import PageBreadcrumb from '../../components/common/PageBreadCrumb';
import ComponentCard from '../../components/common/ComponentCard';
import PageMeta from '../../components/common/PageMeta';
import UserTable from '../../components/user/UserTable';
import AddUserModal from '../../components/user/AddUserModal';
import { useModal } from '../../hooks/useModal';
import Pagination from '../../components/common/Pagination';
import Button from '../../components/ui/button/Button';
import Tooltip from '../../components/ui/tooltip/Tooltip';
import Select from '../../components/form/Select';
import { getUsers } from '../../services/UserService';
import { getRoles } from '../../services/RoleService';
import { User } from '../../types/User';
import { Role } from '../../types/Role';
import { useDataTable } from '../../hooks/useDataTable';

import { Plus } from 'lucide-react';
import TableToolbar from '../../components/common/TableToolbar';
import ViewModeTabs from '../../components/common/ViewModeTabs';

export default function Users() {
  const { isOpen, openModal, closeModal } = useModal();
  const [roles, setRoles] = useState<Role[]>([]);
  const [selectedRole, setSelectedRole] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  const extraParams = useMemo(
    () => ({
      role: selectedRole,
      status: selectedStatus,
    }),
    [selectedRole, selectedStatus]
  );

  const {
    data: users,
    loading,
    currentPage,
    perPage,
    totalPages,
    total,
    from,
    to,
    sortBy,
    sortDirection,
    searchTerm,
    setSearchTerm,
    rangeFrom,
    setRangeFrom,
    rangeTo,
    setRangeTo,
    viewMode,
    setViewMode,
    handlePageChange,
    handlePerPageChange,
    handleSort,
    resetFilters,
    refresh,
  } = useDataTable<User>({
    fetchData: getUsers,
    extraParams,
  });

  const fetchRoles = useCallback(async () => {
    try {
      const fetchedRoles = await getRoles({ unpaginated: true, sortCol: 'name', sortDir: 'asc' });
      setRoles(fetchedRoles.data);
    } catch (error) {
      console.error('Error fetching roles:', error);
    }
  }, []);

  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

  const handleReset = () => {
    resetFilters();
    setSelectedRole('');
    setSelectedStatus('');
  };

  return (
    <>
      <PageMeta title="Users" description="List of users" />
      <PageBreadcrumb pageTitle="Users" />

      <div className="space-y-6">
        <div className="p-5 border border-gray-200 rounded-2xl bg-gray-50 dark:bg-white/[0.03] dark:border-gray-800 shadow-sm">
          <TableToolbar
            className="mb-0"
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            rangeFrom={rangeFrom}
            onRangeFromChange={(val) => setRangeFrom(val as number | '')}
            rangeTo={rangeTo}
            onRangeToChange={(val) => setRangeTo(val as number | '')}
            perPage={perPage}
            onPerPageChange={handlePerPageChange}
            onReset={handleReset}
            extraFilters={
              <>
                <div className="w-full md:w-44">
                  <Select
                    options={[
                      { value: '', label: 'All Roles' },
                      ...roles.map((role) => ({ value: role.name, label: role.name })),
                    ]}
                    onChange={(value) => setSelectedRole(value)}
                    defaultValue={selectedRole}
                    showPlaceholder={true}
                    placeholder="Role"
                    className="w-full"
                    searchable={true}
                  />
                </div>
                <div className="w-full md:w-36">
                  <Select
                    options={[
                      { value: '', label: 'All Status' },
                      { value: 'active', label: 'Active' },
                      { value: 'inactive', label: 'Inactive' },
                      { value: 'suspended', label: 'Suspended' },
                    ]}
                    onChange={(value) => setSelectedStatus(value)}
                    defaultValue={selectedStatus}
                    showPlaceholder={true}
                    placeholder="Status"
                    className="w-full"
                    searchable={false}
                  />
                </div>
              </>
            }
          />
        </div>

        <ComponentCard
          title={`Users (${viewMode})`}
          action={
            <div className="flex flex-wrap items-center gap-2">
              <ViewModeTabs viewMode={viewMode} setViewMode={setViewMode} />
              <Tooltip text="Add New User">
                <Button onClick={openModal} className="h-[38px] text-sm px-4">
                  <Plus className="w-4 h-4 mr-1.5" />
                  Add User
                </Button>
              </Tooltip>
            </div>
          }
        >
          <UserTable
            data={users}
            loading={loading}
            onAction={refresh}
            onSort={handleSort}
            sortBy={sortBy}
            sortDirection={sortDirection}
            currentPage={currentPage}
            perPage={perPage}
            startIndex={rangeFrom !== '' ? Number(rangeFrom) : undefined}
            viewMode={viewMode}
          />
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            from={from}
            to={to}
            total={total}
          />
        </ComponentCard>
      </div>
      <AddUserModal isOpen={isOpen} onClose={closeModal} onSuccess={refresh} />
    </>
  );
}
