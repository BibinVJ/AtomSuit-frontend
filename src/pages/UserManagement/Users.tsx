'use client';

import { useEffect, useState } from 'react';
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
import { useDebounce } from '../../hooks/useDebounce';

import { Plus } from 'lucide-react';
import TableToolbar from '../../components/common/TableToolbar';
import ViewModeTabs from '../../components/common/ViewModeTabs';

export default function Users() {
  const [users, setUsers] = useState<User[]>([]);
  const { isOpen, openModal, closeModal } = useModal();
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [from, setFrom] = useState(0);
  const [to, setTo] = useState(0);
  const [total, setTotal] = useState(0);
  const [sortBy, setSortBy] = useState('created_at');
  const [sortDirection, setSortDirection] = useState('desc');
  const [viewMode, setViewMode] = useState<'active' | 'trashed'>('active');

  /* State for Range Fetching */
  const [rangeFrom, setRangeFrom] = useState<number | ''>('');
  const [rangeTo, setRangeTo] = useState<number | ''>('');
  const [searchTerm, setSearchTerm] = useState('');

  const debouncedSearchTerm = useDebounce(searchTerm, 1000); // 1 second delay
  const debouncedRangeFrom = useDebounce(rangeFrom, 1000);
  const debouncedRangeTo = useDebounce(rangeTo, 1000);

  /* State for Advanced Filters */
  const [roles, setRoles] = useState<Role[]>([]);
  const [selectedRole, setSelectedRole] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  const fetchUsers = async (page = 1, limit = 10, sortCol = 'created_at', sortDir = 'desc') => {
    try {
      const response = await getUsers({
        page,
        limit,
        sortCol,
        sortDir,
        from: debouncedRangeFrom !== '' ? Number(debouncedRangeFrom) : undefined,
        to: debouncedRangeTo !== '' ? Number(debouncedRangeTo) : undefined,
        search: debouncedSearchTerm,
        role: selectedRole,
        status: selectedStatus,
        trashed: viewMode === 'trashed' ? 'only' : undefined,
      });

      setUsers(response.data);

      // Cast meta to any to handle potential missing fields in range-fetch mode
      const meta = response.meta as any;

      if (meta) {
        setTotalPages(meta.last_page || 1);
        setCurrentPage(meta.current_page || 1);

        // Use meta values if available, otherwise fallback to range values
        setFrom(
          meta.from !== undefined
            ? meta.from
            : debouncedRangeFrom !== ''
              ? Number(debouncedRangeFrom)
              : 0
        );
        setTo(
          meta.to !== undefined ? meta.to : debouncedRangeTo !== '' ? Number(debouncedRangeTo) : 0
        );
        setTotal(meta.total || 0);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchRoles = async () => {
    try {
      const fetchedRoles = await getRoles({ unpaginated: true, sortCol: 'name', sortDir: 'asc' });
      setRoles(fetchedRoles.data);
    } catch (error) {
      console.error('Error fetching roles:', error);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  useEffect(() => {
    fetchUsers(currentPage, perPage, sortBy, sortDirection);
  }, [
    currentPage,
    perPage,
    sortBy,
    sortDirection,
    selectedRole,
    selectedStatus,
    debouncedSearchTerm,
    debouncedRangeFrom,
    debouncedRangeTo,
    viewMode,
  ]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePerPageChange = (value: string) => {
    setPerPage(parseInt(value, 10));
    setCurrentPage(1);
  };

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortDirection('asc');
    }
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
            onReset={() => {
              setSearchTerm('');
              setSelectedRole('');
              setSelectedStatus('');
              setRangeFrom('');
              setRangeTo('');
            }}
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
            onAction={() => fetchUsers(currentPage, perPage, sortBy, sortDirection)}
            onSort={handleSort}
            sortBy={sortBy}
            sortDirection={sortDirection}
            currentPage={currentPage}
            perPage={perPage}
            startIndex={debouncedRangeFrom !== '' ? Number(debouncedRangeFrom) : undefined}
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
      <AddUserModal
        isOpen={isOpen}
        onClose={closeModal}
        onUserAdded={() => fetchUsers(1, perPage)}
      />
    </>
  );
}
