'use client';

import { Table, TableBody, TableCell, TableHeader, TableRow } from '@/components/ui/table';
import { useState } from 'react';
import Badge from '@/components/ui/badge/Badge';
import ConfirmModal from '@/components/common/ConfirmModal';
import { ChevronsUpDown, ArrowUpWideNarrow, ArrowDownNarrowWide } from 'lucide-react';
import { TableActions } from '@/components/common/TableActions';
import SkeletonTable from '@/components/common/SkeletonTable';

import { Tenant } from '@/types';
import { usePermissions } from '@/hooks/usePermissions';
import { deleteTenant } from '@/services/TenantService';
import { toast } from 'sonner';
import { isApiError } from '@/utils/errors';

interface Props {
  data: Tenant[];
  onAction: () => void;
  onSort: (column: string) => void;
  sortBy: string;
  sortDirection: string;
  currentPage: number;
  perPage: number;
  startIndex?: number;
  loading?: boolean;
}

export default function TenantTable({
  data,
  onAction,
  onSort,
  sortBy,
  sortDirection,
  currentPage,
  perPage,
  startIndex,
  loading,
}: Props) {
  const { hasPermission } = usePermissions();
  const [confirmTarget, setConfirmTarget] = useState<Tenant | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = (tenant: Tenant) => {
    setConfirmTarget(tenant);
  };

  const handleDeleteConfirm = async () => {
    if (!confirmTarget) return;
    setIsDeleting(true);
    try {
      await deleteTenant(confirmTarget.id);
      toast.success('Tenant deleted successfully');
      onAction();
    } catch (error: unknown) {
      let message = 'Failed to delete tenant';
      if (isApiError(error)) {
        message = error.response?.data?.message || message;
      }
      toast.error(message);
    } finally {
      setIsDeleting(false);
      setConfirmTarget(null);
    }
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

  const formatDate = (date?: string) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusBadge = (status: string) => {
    const statusMap: {
      [key: string]: { color: 'success' | 'error' | 'warning' | 'secondary'; label: string };
    } = {
      active: { color: 'success', label: 'Active' },
      suspended: { color: 'error', label: 'Suspended' },
      trial: { color: 'warning', label: 'Trial' },
    };

    const statusInfo = statusMap[status] || { color: 'secondary', label: status };
    return (
      <Badge size="sm" color={statusInfo.color}>
        {statusInfo.label}
      </Badge>
    );
  };

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 custom-card-bg dark:border-white/[0.05]">
      <div className="max-w-full overflow-x-auto">
        <Table>
          <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
            <TableRow>
              <TableCell
                isHeader
                className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                #
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-3 font-medium text-gray-500 cursor-pointer text-start text-theme-xs dark:text-gray-400"
                onClick={() => onSort('name')}
              >
                Name {renderSortIcon('name')}
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-3 font-medium text-gray-500 cursor-pointer text-start text-theme-xs dark:text-gray-400"
                onClick={() => onSort('email')}
              >
                Email {renderSortIcon('email')}
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                Domain
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                Plan
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-3 font-medium text-gray-500 cursor-pointer text-start text-theme-xs dark:text-gray-400"
                onClick={() => onSort('status')}
              >
                Status {renderSortIcon('status')}
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-3 font-medium text-gray-500 cursor-pointer text-start text-theme-xs dark:text-gray-400"
                onClick={() => onSort('created_at')}
              >
                Created {renderSortIcon('created_at')}
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                Actions
              </TableCell>
            </TableRow>
          </TableHeader>

          <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} className="p-0">
                  <SkeletonTable rows={perPage} columns={8} />
                </TableCell>
              </TableRow>
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="px-5 py-10 text-center text-gray-500">
                  No tenants found.
                </TableCell>
              </TableRow>
            ) : (
              data.map((tenant, index) => (
                <TableRow key={tenant.id}>
                  <TableCell className="px-5 py-4 sm:px-6 text-start">
                    <p className="font-medium text-gray-800 text-theme-sm dark:text-white/90">
                      {startIndex !== undefined
                        ? startIndex + index
                        : (currentPage - 1) * perPage + index + 1}
                    </p>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-start">
                    <p className="font-medium text-gray-800 text-theme-sm dark:text-white/90">
                      {tenant.name}
                    </p>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-800 text-start text-theme-sm dark:text-gray-400">
                    {tenant.email}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-800 text-start text-theme-sm dark:text-gray-400">
                    <span className="font-mono text-xs">
                      {typeof tenant.domain_name === 'object'
                        ? tenant.domain_name?.domain
                        : tenant.domain_name || 'N/A'}
                    </span>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-800 text-start text-theme-sm dark:text-gray-400">
                    {tenant.current_plan?.name || 'N/A'}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    {getStatusBadge(tenant.status)}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-800 text-start text-theme-sm dark:text-gray-400">
                    {formatDate(tenant.created_at)}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-end text-theme-sm dark:text-gray-400">
                    <TableActions
                      onDelete={
                        hasPermission('delete-tenant') ? () => handleDelete(tenant) : undefined
                      }
                    />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      <ConfirmModal
        isOpen={!!confirmTarget}
        onClose={() => setConfirmTarget(null)}
        onConfirm={handleDeleteConfirm}
        isLoading={isDeleting}
        title="Delete Tenant"
        message={`Are you sure you want to delete "${confirmTarget?.name}"?`}
        confirmLabel="Delete Tenant"
        variant="danger"
      />
    </div>
  );
}
