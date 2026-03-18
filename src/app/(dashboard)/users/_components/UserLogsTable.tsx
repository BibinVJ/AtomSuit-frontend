import { useState } from 'react';
import { UserLoginDetail } from '@/types/User';
import { Table, TableBody, TableCell, TableHeader, TableRow } from '@/components/ui/table';
import { ChevronsUpDown, ArrowUpWideNarrow, ArrowDownNarrowWide, Eye } from 'lucide-react';
import Badge from '@/components/ui/badge/Badge';
import { formatKebabCase } from '@/utils/string';
import ViewLogModal from './ViewLogModal';

interface Props {
  data: UserLoginDetail[];
  onSort: (column: string) => void;
  sortBy: string;
  sortDirection: string;
  loading?: boolean;
  showUserColumn?: boolean;
}

export default function UserLogsTable({
  data,
  onSort,
  sortBy,
  sortDirection,
  loading,
  showUserColumn = true,
}: Props) {
  const [selectedLog, setSelectedLog] = useState<UserLoginDetail | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  const handleView = (log: UserLoginDetail) => {
    setSelectedLog(log);
    setIsViewModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsViewModalOpen(false);
    setSelectedLog(null);
  };

  const renderSortIcon = (column: string) => {
    if (sortBy !== column) {
      return <ChevronsUpDown className="inline-block w-4 h-4 ml-1 text-gray-400" />;
    }
    return sortDirection === 'asc' ? (
      <ArrowUpWideNarrow className="inline-block w-4 h-4 ml-1" />
    ) : (
      <ArrowDownNarrowWide className="inline-block w-4 h-4 ml-1" />
    );
  };

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 custom-card-bg dark:border-white/[0.05]">
      <div className="max-w-full overflow-x-auto">
        <Table>
          <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
            <TableRow>
              {showUserColumn && (
                <>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 cursor-pointer text-start text-theme-xs dark:text-gray-400"
                    onClick={() => onSort('user_id')}
                  >
                    User {renderSortIcon('user_id')}
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                  >
                    Role
                  </TableCell>
                </>
              )}
              <TableCell
                isHeader
                className="px-5 py-3 font-medium text-gray-500 cursor-pointer text-start text-theme-xs dark:text-gray-400"
                onClick={() => onSort('ip_address')}
              >
                IP Address {renderSortIcon('ip_address')}
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-3 font-medium text-gray-500 cursor-pointer text-start text-theme-xs dark:text-gray-400"
                onClick={() => onSort('city')}
              >
                Location {renderSortIcon('city')}
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-3 font-medium text-gray-500 cursor-pointer text-start text-theme-xs dark:text-gray-400"
                onClick={() => onSort('device_type')}
              >
                Device {renderSortIcon('device_type')}
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-3 font-medium text-gray-500 cursor-pointer text-start text-theme-xs dark:text-gray-400"
                onClick={() => onSort('login_at')}
              >
                Login Time {renderSortIcon('login_at')}
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                Status
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-3 font-medium text-gray-500 text-end text-theme-xs dark:text-gray-400"
              >
                Actions
              </TableCell>
            </TableRow>
          </TableHeader>

          <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
            {loading ? (
              <TableRow>
                <TableCell colSpan={showUserColumn ? 8 : 6} className="px-5 py-10 text-center">
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-gray-500">Loading logs...</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={showUserColumn ? 8 : 6}
                  className="px-5 py-10 text-center text-gray-500 font-medium"
                >
                  No login logs found
                </TableCell>
              </TableRow>
            ) : (
              data.map((log) => (
                <TableRow key={log.id}>
                  {showUserColumn && (
                    <>
                      <TableCell className="px-5 py-4 text-start text-theme-sm text-gray-800 dark:text-white/90">
                        {log.user?.name || 'Unknown'}
                      </TableCell>
                      <TableCell className="px-5 py-4 text-start text-theme-sm text-gray-800 dark:text-white/90">
                        {log.user?.role ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 dark:bg-white/10 dark:text-white">
                            {formatKebabCase(log.user.role.name)}
                          </span>
                        ) : (
                          <span className="text-gray-400 italic">No Role</span>
                        )}
                      </TableCell>
                    </>
                  )}
                  <TableCell className="px-5 py-4 text-start text-theme-sm text-gray-500 dark:text-gray-400">
                    {log.ip_address}
                  </TableCell>
                  <TableCell className="px-5 py-4 text-start text-theme-sm text-gray-500 dark:text-gray-400">
                    {log.city ? (
                      <span>
                        {log.city}, {log.country}
                        {log.iso_code && (
                          <span className="ml-1 text-xs text-gray-400">({log.iso_code})</span>
                        )}
                      </span>
                    ) : (
                      'Unknown'
                    )}
                  </TableCell>
                  <TableCell className="px-5 py-4 text-start text-theme-sm text-gray-500 dark:text-gray-400">
                    <div className="flex flex-col">
                      <span>
                        {log.os || 'Unknown OS'} - {log.browser || 'Unknown Browser'}
                      </span>
                      <span className="text-xs text-gray-400 capitalize">
                        {log.device_type || 'Unknown Device'}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="px-5 py-4 text-start text-theme-sm text-gray-500 dark:text-gray-400">
                    {new Date(log.login_at).toLocaleString()}
                  </TableCell>
                  <TableCell className="px-5 py-4 text-start text-theme-sm">
                    {!log.logout_at ? (
                      <Badge size="sm" color="success">
                        Active Session
                      </Badge>
                    ) : (
                      <Badge size="sm" color="light">
                        Logged Out
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="px-5 py-4 text-end text-theme-sm">
                    <button
                      onClick={() => handleView(log)}
                      className="text-gray-500 hover:text-brand-600 dark:hover:text-brand-400"
                      title="View Details"
                    >
                      <Eye size={18} />
                    </button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      {selectedLog && (
        <ViewLogModal isOpen={isViewModalOpen} onClose={handleCloseModal} log={selectedLog} />
      )}
    </div>
  );
}
