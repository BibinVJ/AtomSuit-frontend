'use client';

import { useState, useMemo } from 'react';
import { Modal } from '../ui/modal';
import { User, UserLoginDetail } from '../../types/User';
import Button from '../ui/button/Button';
import Badge from '../ui/badge/Badge';
import { formatKebabCase } from '../../utils/string';
import UserLogsTable from './UserLogsTable';
import { useDataTable } from '../../hooks/useDataTable';
import { getUserLoginHistory } from '../../services/UserService';
import Pagination from '../common/Pagination';

interface ViewUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
}

export default function ViewUserModal({ isOpen, onClose, user }: ViewUserModalProps) {
  const [activeTab, setActiveTab] = useState<'profile' | 'logs'>('profile');

  // Logs Data
  const logsExtraParams = useMemo(() => ({ user_id: user.id }), [user.id]);

  const {
    data: logs,
    loading: logsLoading,
    currentPage: logsPage,
    totalPages: logsTotalPages,
    total: logsTotal,
    from: logsFrom,
    to: logsTo,
    sortBy: logsSortBy,
    sortDirection: logsSortDir,
    handlePageChange: handleLogsPageChange,
    handleSort: handleLogsSort,
  } = useDataTable<UserLoginDetail>({
    fetchData: getUserLoginHistory,
    extraParams: logsExtraParams,
    initialSortBy: 'login_at',
    initialSortDirection: 'desc',
    initialPerPage: 5,
  });

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-4xl p-6 md:p-10">
      <div className="relative w-full mb-6">
        <div className="px-2 pr-14">
          <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
            User Details
          </h4>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            View user profile and login history.
          </p>
        </div>
      </div>
      <div className="flex border-b border-gray-200 dark:border-gray-700 mb-6">
        <button
          className={`py-2 px-4 text-sm font-medium ${
            activeTab === 'profile'
              ? 'border-b-2 border-brand-500 text-brand-600 dark:text-brand-400'
              : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
          }`}
          onClick={() => setActiveTab('profile')}
        >
          Profile
        </button>
        <button
          className={`py-2 px-4 text-sm font-medium ${
            activeTab === 'logs'
              ? 'border-b-2 border-brand-500 text-brand-600 dark:text-brand-400'
              : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
          }`}
          onClick={() => setActiveTab('logs')}
        >
          Login History
        </button>
      </div>

      {activeTab === 'profile' ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                Name
              </label>
              <div className="text-gray-900 dark:text-white font-medium">{user.name}</div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                Email
              </label>
              <div className="text-gray-900 dark:text-white font-medium">{user.email}</div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                Phone
              </label>
              <div className="text-gray-900 dark:text-white font-medium">{user.phone || 'N/A'}</div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                Role
              </label>
              <div>
                {user.role ? (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                    {formatKebabCase(user.role.name)}
                  </span>
                ) : (
                  <span className="text-gray-500 italic">No Role</span>
                )}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                Status
              </label>
              <div>
                <Badge size="sm" color={user.status === 'active' ? 'success' : 'error'}>
                  {user.status}
                </Badge>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                Joined At
              </label>
              <div className="text-gray-900 dark:text-white font-medium">
                {new Date(user.created_at).toLocaleDateString()}
              </div>
            </div>
          </div>

          {user.addresses && user.addresses.length > 0 && (
            <div className="mt-6 border-t border-gray-100 dark:border-gray-800 pt-4">
              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Address</h4>
              <div className="bg-gray-50 dark:bg-white/[0.03] p-4 rounded-lg text-sm text-gray-600 dark:text-gray-300">
                <p>{user.addresses[0].address_line_1}</p>
                {user.addresses[0].address_line_2 && <p>{user.addresses[0].address_line_2}</p>}
                <p>
                  {user.addresses[0].city}, {user.addresses[0].state}{' '}
                  {user.addresses[0].postal_code}
                </p>
                <p>{user.addresses[0].country}</p>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <UserLogsTable
            data={logs}
            loading={logsLoading}
            onSort={handleLogsSort}
            sortBy={logsSortBy}
            sortDirection={logsSortDir}
            showUserColumn={false}
          />
          <Pagination
            currentPage={logsPage}
            totalPages={logsTotalPages}
            onPageChange={handleLogsPageChange}
            from={logsFrom}
            to={logsTo}
            total={logsTotal}
          />
        </div>
      )}

      <div className="flex justify-end gap-3 mt-6">
        <Button onClick={onClose} variant="outline">
          Close
        </Button>
      </div>
    </Modal>
  );
}
