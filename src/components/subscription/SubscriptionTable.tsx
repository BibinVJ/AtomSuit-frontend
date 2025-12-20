"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import { useState } from "react";
import Badge from "../ui/badge/Badge";
import ViewSubscriptionModal from "./ViewSubscriptionModal";
import CancelSubscriptionModal from "./CancelSubscriptionModal";
import { ChevronsUpDown, ArrowUpWideNarrow, ArrowDownNarrowWide, Eye, XCircle } from 'lucide-react';
import Button from "../ui/button/Button";
import Tooltip from "../ui/tooltip/Tooltip";

import { Subscription } from '../../types';
import { usePermissions } from "../../hooks/usePermissions";
import { useSettings } from "../../hooks/useSettings";
import { getSubscription } from '../../services/SubscriptionService';
import { toast } from 'sonner';

interface Props {
  data: Subscription[];
  onAction: () => void;
  onSort: (column: string) => void;
  sortBy: string;
  sortDirection: string;
  currentPage: number;
  perPage: number;
}

export default function SubscriptionTable({ data, onAction, onSort, sortBy, sortDirection, currentPage, perPage }: Props) {
  const { hasPermission } = usePermissions();
  const { formatCurrency, formatDate: globalFormatDate } = useSettings();
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [selectedSubscription, setSelectedSubscription] = useState<Subscription | null>(null);

  const handleView = async (subscription: Subscription) => {
    try {
      // Fetch full subscription details with relations
      const response = await getSubscription(subscription.id);
      setSelectedSubscription(response.data as Subscription);
      setIsViewModalOpen(true);
    } catch (error) {
      console.error('Error fetching subscription details:', error);
      toast.error('Failed to load subscription details');
    }
  };

  const handleCancel = (subscription: Subscription) => {
    setSelectedSubscription(subscription);
    setIsCancelModalOpen(true);
  };

  const handleCloseModals = () => {
    setIsViewModalOpen(false);
    setIsCancelModalOpen(false);
    setSelectedSubscription(null);
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
    return globalFormatDate(date);
  };

  const getStatusBadge = (subscription: Subscription) => {
    if (subscription.is_canceled) {
      return <Badge size="sm" color="error">Canceled</Badge>;
    }
    if (subscription.is_on_trial) {
      return <Badge size="sm" color="warning">Trial</Badge>;
    }
    return <Badge size="sm" color="success">Active</Badge>;
    return <Badge size="sm" color="secondary">Inactive</Badge>;
  };

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 custom-card-bg dark:border-white/[0.05]">
      <div className="max-w-full overflow-x-auto">
        <Table>
          <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
            <TableRow>
              <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">#</TableCell>
              <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 cursor-pointer text-start text-theme-xs dark:text-gray-400" onClick={() => onSort('name')}>Subscription {renderSortIcon('name')}</TableCell>
              <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Tenant</TableCell>
              <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Plan</TableCell>
              <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Price</TableCell>
              <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 cursor-pointer text-start text-theme-xs dark:text-gray-400" onClick={() => onSort('created_at')}>Start Date {renderSortIcon('created_at')}</TableCell>
              <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Status</TableCell>
              <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Actions</TableCell>
            </TableRow>
          </TableHeader>

          <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
            {data.map((subscription, index) => (
              <TableRow key={subscription.id}>
                <TableCell className="px-5 py-4 sm:px-6 text-start">
                  <p className="font-medium text-gray-800 text-theme-sm dark:text-white/90">
                    {(currentPage - 1) * perPage + index + 1}
                  </p>
                </TableCell>
                <TableCell className="px-4 py-3 text-start">
                  <p className="font-medium text-gray-800 text-theme-sm dark:text-white/90">{subscription.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{subscription.stripe_id}</p>
                </TableCell>
                <TableCell className="px-4 py-3 text-gray-800 text-start text-theme-sm dark:text-gray-400">
                  {subscription.tenant?.name || 'N/A'}
                </TableCell>
                <TableCell className="px-4 py-3 text-gray-800 text-start text-theme-sm dark:text-gray-400">
                  {subscription.plan?.name || 'N/A'}
                </TableCell>
                <TableCell className="px-4 py-3 text-gray-800 text-start text-theme-sm dark:text-gray-400">
                  {formatCurrency(subscription.stripe_price)} x {subscription.quantity}
                </TableCell>
                <TableCell className="px-4 py-3 text-gray-800 text-start text-theme-sm dark:text-gray-400">
                  {formatDate(subscription.created_at)}
                </TableCell>
                <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                  {getStatusBadge(subscription)}
                </TableCell>
                <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                  <div className="flex items-center gap-2">
                    <Tooltip text="View">
                      <Button
                        size="xs"
                        onClick={() => handleView(subscription)}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </Tooltip>
                    {hasPermission("delete-subscription") && !subscription.is_canceled && (
                      <Tooltip text="Cancel">
                        <Button
                          size="xs"
                          onClick={() => handleCancel(subscription)}
                          className="bg-red-600 hover:bg-red-700 text-white"
                        >
                          <XCircle className="w-4 h-4" />
                        </Button>
                      </Tooltip>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      {selectedSubscription && (
        <>
          <ViewSubscriptionModal
            isOpen={isViewModalOpen}
            onClose={handleCloseModals}
            subscription={selectedSubscription}
          />
          <CancelSubscriptionModal
            isOpen={isCancelModalOpen}
            onClose={handleCloseModals}
            onSubscriptionCanceled={onAction}
            subscription={selectedSubscription}
          />
        </>
      )}
    </div>
  );
}
