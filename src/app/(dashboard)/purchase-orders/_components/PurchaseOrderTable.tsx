'use client';

import { Table, TableBody, TableCell, TableHeader, TableRow } from '@/components/ui/table';
import Badge from '@/components/ui/badge/Badge';
import { ChevronsUpDown, ArrowUpWideNarrow, ArrowDownNarrowWide } from 'lucide-react';
import { TableActions } from '@/components/common/TableActions';
import { useRouter } from 'next/navigation';

import { PurchaseOrder } from '@/types/PurchaseOrder';

interface Props {
  data: PurchaseOrder[];
  onAction: () => void;
  onSort: (column: string) => void;
  sortBy: string;
  sortDirection: string;
  currentPage: number;
  perPage: number;
  startIndex?: number;
  loading?: boolean;
}

import { usePermissions } from '@/hooks/usePermissions';
import { useSettings } from '@/hooks/useSettings';

export default function PurchaseOrderTable({
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
  const { formatCurrency, formatDate } = useSettings();
  const router = useRouter();
  // const [isVoidModalOpen, setIsVoidModalOpen] = useState(false); // Using standard delete for now
  // const [selectedPurchase, setSelectedPurchase] = useState<PurchaseOrder | null>(null);

  const handleView = (id: number) => {
    router.push(`/purchase-orders/${id}`);
  };

  const handleEdit = (id: number) => {
    router.push(`/purchase-orders/${id}/edit`);
  };

  const handleDelete = async (purchase: PurchaseOrder) => {
    // Use a standard confirmation dialog or toast here.
    // For now, assuming standard delete action structure or using the passed onAction(void)
    // But typically we trigger a modal or call deleteService directly.
    // Since this table is pure UI, we should probably emit 'onDelete' or similar.
    // But the previous code opened a specialized VoidModal.
    // I'll skip implementation of Delete for a moment or use a simple confirm.
    if (confirm('Are you sure you want to delete this Purchase Order?')) {
      const { deletePurchaseOrder } = await import('@/services/PurchaseOrderService');
      try {
        await deletePurchaseOrder(purchase.id);
        onAction(); // Refresh
      } catch (error) {
        console.error(error);
        alert('Failed to delete');
      }
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
                onClick={() => onSort('order_number')}
              >
                Order # {renderSortIcon('order_number')}
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-3 font-medium text-gray-500 cursor-pointer text-start text-theme-xs dark:text-gray-400"
                onClick={() => onSort('order_date')}
              >
                Order Date {renderSortIcon('order_date')}
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-3 font-medium text-gray-500 cursor-pointer text-start text-theme-xs dark:text-gray-400"
                onClick={() => onSort('vendor_id')}
              >
                Vendor {renderSortIcon('vendor_id')}
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                Total Amount
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
                className="px-5 py-3 font-medium text-gray-500 text-end text-theme-xs dark:text-gray-400"
              >
                Actions
              </TableCell>
            </TableRow>
          </TableHeader>

          <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="px-5 py-10 text-center">
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-gray-500">Loading purchase orders...</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="px-5 py-10 text-center text-gray-500">
                  No purchase orders found.
                </TableCell>
              </TableRow>
            ) : (
              data.map((purchase, index) => (
                <TableRow key={purchase.id}>
                  <TableCell className="px-5 py-4 sm:px-6 text-start">
                    <p className="font-medium text-gray-800 text-theme-sm dark:text-white/90">
                      {startIndex !== undefined
                        ? startIndex + index
                        : (currentPage - 1) * perPage + index + 1}
                    </p>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-800 text-start text-theme-sm dark:text-gray-400">
                    {purchase.order_number}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-800 text-start text-theme-sm dark:text-gray-400">
                    {formatDate(purchase.order_date)}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-800 text-start text-theme-sm dark:text-gray-400">
                    {purchase.vendor?.name}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-800 text-start text-theme-sm dark:text-gray-400">
                    {formatCurrency(purchase.total_amount || 0)}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    <Badge
                      size="sm"
                      color={
                        purchase.status === 'CONFIRMED' || purchase.status === 'COMPLETED'
                          ? 'success'
                          : purchase.status === 'DRAFT'
                            ? 'warning'
                            : 'error'
                      }
                    >
                      {purchase.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-end text-theme-sm dark:text-gray-400">
                    <TableActions
                      onView={
                        hasPermission('view-purchase-order')
                          ? () => handleView(purchase.id)
                          : undefined
                      }
                      onEdit={
                        hasPermission('update-purchase-order')
                          ? () => handleEdit(purchase.id)
                          : undefined
                      }
                      onDelete={
                        hasPermission('delete-purchase-order')
                          ? () => handleDelete(purchase)
                          : undefined
                      }
                    />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
