'use client';

import { Table, TableBody, TableCell, TableHeader, TableRow } from '@/components/ui/table';
import { useState } from 'react';
import EditPlanModal from './EditPlanModal';
import ConfirmModal from '@/components/common/ConfirmModal';
import { ChevronsUpDown, ArrowUpWideNarrow, ArrowDownNarrowWide } from 'lucide-react';
import { TableActions } from '@/components/common/TableActions';
import SkeletonTable from '@/components/common/SkeletonTable';

import { Plan } from '@/types';
import { usePermissions } from '@/hooks/usePermissions';
import { useSettings } from '@/hooks/useSettings';
import { getPlan, deletePlan } from '@/services/PlanService';
import { toast } from 'sonner';
import { isApiError } from '@/utils/errors';

interface Props {
  data: Plan[];
  onAction: () => void | Promise<any>;
  onSort: (column: string) => void;
  sortBy: string;
  sortDirection: string;
  currentPage: number;
  perPage: number;
  loading?: boolean;
}

export default function PlanTable({
  data,
  onAction,
  onSort,
  sortBy,
  sortDirection,
  currentPage,
  perPage,
  loading,
}: Props) {
  const { hasPermission } = usePermissions();
  const { formatCurrency } = useSettings();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [confirmTarget, setConfirmTarget] = useState<Plan | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleEdit = async (plan: Plan) => {
    try {
      // Fetch full plan details with features
      const response = await getPlan(plan.id);
      setSelectedPlan(response);
      setIsEditModalOpen(true);
    } catch (error) {
      console.error('Error fetching plan details:', error);
      toast.error('Failed to load plan details');
    }
  };

  const handleDelete = (plan: Plan) => {
    setConfirmTarget(plan);
  };

  const handleDeleteConfirm = async () => {
    if (!confirmTarget) return;
    setIsDeleting(true);
    try {
      await deletePlan(confirmTarget.id);
      toast.success('Plan deleted successfully');
      onAction();
    } catch (error: unknown) {
      let message = 'Failed to delete plan';
      if (isApiError(error)) {
        message = error.response?.data?.message || message;
      }
      toast.error(message);
    } finally {
      setIsDeleting(false);
      setConfirmTarget(null);
    }
  };

  const handleCloseModals = () => {
    setIsEditModalOpen(false);
    setSelectedPlan(null);
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
                onClick={() => onSort('price')}
              >
                Price {renderSortIcon('price')}
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                Interval
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                Trial
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                Tenants
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
                <TableCell colSpan={7} className="p-0">
                  <SkeletonTable rows={perPage} columns={7} />
                </TableCell>
              </TableRow>
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="px-5 py-10 text-center text-gray-500">
                  No plans found.
                </TableCell>
              </TableRow>
            ) : (
              data.map((plan, index) => (
                <TableRow key={plan.id}>
                  <TableCell className="px-5 py-4 sm:px-6 text-start">
                    <p className="font-medium text-gray-800 text-theme-sm dark:text-white/90">
                      {(currentPage - 1) * perPage + index + 1}
                    </p>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-start">
                    <p className="font-medium text-gray-800 text-theme-sm dark:text-white/90">
                      {plan.name}
                    </p>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-800 text-start text-theme-sm dark:text-gray-400">
                    {formatCurrency(plan.price)}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-800 text-start text-theme-sm dark:text-gray-400">
                    <span className="capitalize">
                      {plan.interval_count} {plan.interval}
                      {plan.interval_count > 1 ? 's' : ''}
                    </span>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-800 text-start text-theme-sm dark:text-gray-400">
                    {plan.is_trial_plan ? `${plan.trial_duration_in_days} days` : 'No'}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-800 text-start text-theme-sm dark:text-gray-400">
                    {plan.subscribed_tenants?.length || 0}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-end text-theme-sm dark:text-gray-400">
                    <TableActions
                      onEdit={hasPermission('update-plan') ? () => handleEdit(plan) : undefined}
                      onDelete={hasPermission('delete-plan') ? () => handleDelete(plan) : undefined}
                    />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      {selectedPlan && (
        <>
          <EditPlanModal
            isOpen={isEditModalOpen}
            onClose={handleCloseModals}
            onPlanUpdated={onAction}
            plan={selectedPlan}
          />
        </>
      )}

      <ConfirmModal
        isOpen={!!confirmTarget}
        onClose={() => setConfirmTarget(null)}
        onConfirm={handleDeleteConfirm}
        isLoading={isDeleting}
        title="Delete Plan"
        message={`Are you sure you want to delete "${confirmTarget?.name}"?`}
        confirmLabel="Delete Plan"
        variant="danger"
      />
    </div>
  );
}
