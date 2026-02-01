'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import ComponentCard from '@/components/common/ComponentCard';
import PageMeta from '@/components/common/PageMeta';
import UserTable from '@/app/(dashboard)/users/_components/UserTable';
import UserLogsTable from '@/app/(dashboard)/users/_components/UserLogsTable';
import AddUserModal from '@/app/(dashboard)/users/_components/AddUserModal';
import { useModal } from '@/hooks/useModal';
import Pagination from '@/components/common/Pagination';
import Button from '@/components/ui/button/Button';
import Tooltip from '@/components/ui/tooltip/Tooltip';
import Select from '@/components/form/Select';
import { getUsers, getUserLoginHistory } from '@/services/UserService';
import { getRoles } from '@/services/RoleService';
import { User, UserLoginDetail } from '@/types/User';
import { Role } from '@/types/Role';
import { useDataTable } from '@/hooks/useDataTable';

import { Plus } from 'lucide-react';
import TableToolbar from '@/components/common/TableToolbar';
import ViewModeTabs from '@/components/common/ViewModeTabs';

export default function Users() {
  const [activeTab, setActiveTab] = useState<'users' | 'logs'>('users');
  const { isOpen, openModal, closeModal } = useModal();
  const [roles, setRoles] = useState<Role[]>([]);
  const [selectedRole, setSelectedRole] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  // --- Users Data ---
  const userExtraParams = useMemo(
    () => ({
      role: selectedRole,
      status: selectedStatus,
    }),
    [selectedRole, selectedStatus]
  );

  const {
    data: users,
    loading: usersLoading,
    currentPage: usersPage,
    perPage: usersPerPage,
    totalPages: usersTotalPages,
    total: usersTotal,
    from: usersFrom,
    to: usersTo,
    sortBy: usersSortBy,
    sortDirection: usersSortDir,
    searchTerm: usersSearch,
    setSearchTerm: setUsersSearch,
    rangeFrom: usersRangeFrom,
    setRangeFrom: setUsersRangeFrom,
    rangeTo: usersRangeTo,
    setRangeTo: setUsersRangeTo,
    viewMode: usersViewMode,
    setViewMode: setUsersViewMode,
    handlePageChange: handleUsersPageChange,
    handlePerPageChange: handleUsersPerPageChange,
    handleSort: handleUsersSort,
    resetFilters: resetUsersFilters,
    refresh: refreshUsers,
  } = useDataTable<User>({
    fetchData: getUsers,
    extraParams: userExtraParams,
    initialSortBy: 'created_at',
  });

  // --- User Logs Data ---
  const [logsRole, setLogsRole] = useState('');

  const logsExtraParams = useMemo(
    () => ({
      role: logsRole,
    }),
    [logsRole]
  );

  const {
    data: logs,
    loading: logsLoading,
    currentPage: logsPage,
    perPage: logsPerPage,
    totalPages: logsTotalPages,
    total: logsTotal,
    from: logsFrom,
    to: logsTo,
    sortBy: logsSortBy,
    sortDirection: logsSortDir,
    searchTerm: logsSearch,
    setSearchTerm: setLogsSearch,
    rangeFrom: logsRangeFrom,
    setRangeFrom: setLogsRangeFrom,
    rangeTo: logsRangeTo,
    setRangeTo: setLogsRangeTo,
    handlePageChange: handleLogsPageChange,
    handlePerPageChange: handleLogsPerPageChange,
    handleSort: handleLogsSort,
    resetFilters: resetLogsFilters,
    refresh: refreshLogs,
  } = useDataTable<UserLoginDetail>({
    fetchData: getUserLoginHistory,
    extraParams: logsExtraParams,
    initialSortBy: 'login_at',
    initialSortDirection: 'desc',
  });

  // Refetch data when tab changes
  useEffect(() => {
    if (activeTab === 'users') {
      refreshUsers();
    } else {
      refreshLogs();
    }
  }, [activeTab, refreshUsers, refreshLogs]);

  const handleResetLogs = () => {
    resetLogsFilters();
    setLogsRole('');
  };

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

  const handleResetUsers = () => {
    resetUsersFilters();
    setSelectedRole('');
    setSelectedStatus('');
  };

  return (
    <>
      <PageMeta title="Users" description="List of users and login history" />
      <PageBreadcrumb pageTitle="Users" />

      <div className="mb-6">
        <div className="inline-flex p-1 bg-gray-100 rounded-lg dark:bg-gray-800">
          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
              activeTab === 'users'
                ? 'bg-brand-600 text-white shadow-sm'
                : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
            }`}
          >
            All Users
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
              activeTab === 'logs'
                ? 'bg-brand-600 text-white shadow-sm'
                : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
            }`}
          >
            User Logs
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {activeTab === 'users' ? (
          <>
            <div className="p-5 border border-gray-200 rounded-2xl bg-gray-50 dark:bg-white/[0.03] dark:border-gray-800 shadow-sm">
              <TableToolbar
                className="mb-0"
                searchTerm={usersSearch}
                onSearchChange={setUsersSearch}
                rangeFrom={usersRangeFrom}
                onRangeFromChange={(val) => setUsersRangeFrom(val as number | '')}
                rangeTo={usersRangeTo}
                onRangeToChange={(val) => setUsersRangeTo(val as number | '')}
                perPage={usersPerPage}
                onPerPageChange={handleUsersPerPageChange}
                onReset={handleResetUsers}
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
              title={`Users (${usersViewMode})`}
              action={
                <div className="flex flex-wrap items-center gap-2">
                  <ViewModeTabs viewMode={usersViewMode} setViewMode={setUsersViewMode} />
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
                loading={usersLoading}
                onAction={refreshUsers}
                onSort={handleUsersSort}
                sortBy={usersSortBy}
                sortDirection={usersSortDir}
                currentPage={usersPage}
                perPage={usersPerPage}
                startIndex={usersRangeFrom !== '' ? Number(usersRangeFrom) : undefined}
                viewMode={usersViewMode}
              />
              <Pagination
                currentPage={usersPage}
                totalPages={usersTotalPages}
                onPageChange={handleUsersPageChange}
                from={usersFrom}
                to={usersTo}
                total={usersTotal}
              />
            </ComponentCard>
            <AddUserModal isOpen={isOpen} onClose={closeModal} onSuccess={refreshUsers} />
          </>
        ) : (
          <>
            <div className="p-5 border border-gray-200 rounded-2xl bg-gray-50 dark:bg-white/[0.03] dark:border-gray-800 shadow-sm">
              <TableToolbar
                className="mb-0"
                searchTerm={logsSearch}
                onSearchChange={setLogsSearch}
                searchPlaceholder="Search by user name or email..."
                rangeFrom={logsRangeFrom}
                onRangeFromChange={(val) => setLogsRangeFrom(val as number | '')}
                rangeTo={logsRangeTo}
                onRangeToChange={(val) => setLogsRangeTo(val as number | '')}
                perPage={logsPerPage}
                onPerPageChange={handleLogsPerPageChange}
                onReset={handleResetLogs}
                extraFilters={
                  <div className="w-full md:w-44">
                    <Select
                      options={[
                        { value: '', label: 'All Roles' },
                        ...roles.map((role) => ({ value: role.name, label: role.name })),
                      ]}
                      onChange={(value) => setLogsRole(value)}
                      defaultValue={logsRole}
                      placeholder="Role"
                      className="w-full"
                      searchable={true}
                    />
                  </div>
                }
              />
            </div>

            <ComponentCard title="User Login Logs">
              <UserLogsTable
                data={logs}
                loading={logsLoading}
                onSort={handleLogsSort}
                sortBy={logsSortBy}
                sortDirection={logsSortDir}
              />
              <Pagination
                currentPage={logsPage}
                totalPages={logsTotalPages}
                onPageChange={handleLogsPageChange}
                from={logsFrom}
                to={logsTo}
                total={logsTotal}
              />
            </ComponentCard>
          </>
        )}
      </div>
    </>
  );
}
