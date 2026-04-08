'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import PageMeta from '@/components/common/PageMeta';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import ComponentCard from '@/components/common/ComponentCard';
import SkeletonDetail from '@/components/common/SkeletonDetail';
import Button from '@/components/ui/button/Button';
import Badge from '@/components/ui/badge/Badge';
import { Table, TableBody, TableCell, TableHeader, TableRow } from '@/components/ui/table';
import { getPurchaseOrder, updatePurchaseOrderStatus } from '@/services/PurchaseOrderService';
import { useSettings } from '@/hooks/useSettings';
import { PurchaseOrder, PurchaseOrderStatus } from '@/types/PurchaseOrder';
import ConfirmModal from '@/components/common/ConfirmModal';
import { toast } from 'sonner';
import { isApiError } from '@/utils/errors';

export default function ViewPurchaseOrder() {
  const params = useParams<{ id: string }>();
  const id = params?.id;
  const router = useRouter();
  const { formatCurrency, formatQuantity, formatDate } = useSettings();
  const [purchaseOrder, setPurchaseOrder] = useState<PurchaseOrder | null>(null);

  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [confirmCancelOpen, setConfirmCancelOpen] = useState(false);

  const fetchPurchaseDetails = useCallback(async () => {
    try {
      if (id) {
        const response = await getPurchaseOrder(Number(id));
        setPurchaseOrder(response);
      }
    } catch (error) {
      console.error('Error fetching purchase order details:', error);
      toast.error('Failed to load purchase order details');
      router.push('/purchase-orders');
    }
  }, [id, router]);

  useEffect(() => {
    fetchPurchaseDetails();
  }, [fetchPurchaseDetails]);

  const handlePrint = () => {
    window.print();
  };

  const handleUpdateStatus = async (newStatus: PurchaseOrderStatus) => {
    if (!purchaseOrder) return;

    try {
      setIsUpdatingStatus(true);
      await updatePurchaseOrderStatus(purchaseOrder.id, newStatus);
      toast.success(`Purchase Order marked as ${newStatus}`);
      fetchPurchaseDetails(); // refresh data
    } catch (error: unknown) {
      let message = 'Failed to update status';
      if (isApiError(error)) {
        message = error.response?.data?.message || message;
      }
      toast.error(message);
    } finally {
      setIsUpdatingStatus(false);
      if (newStatus === PurchaseOrderStatus.CANCELLED) {
        setConfirmCancelOpen(false);
      }
    }
  };

  const getStatusColor = (status: PurchaseOrderStatus) => {
    switch (status) {
      case PurchaseOrderStatus.DRAFT:
        return 'warning';
      case PurchaseOrderStatus.SENT:
        return 'info';
      case PurchaseOrderStatus.CONFIRMED:
        return 'success';
      case PurchaseOrderStatus.COMPLETED:
        return 'success';
      case PurchaseOrderStatus.CANCELLED:
        return 'error';
      default:
        return 'secondary';
    }
  };

  if (!purchaseOrder) {
    return (
      <>
        <PageBreadcrumb
          pageTitle="Purchase Order Details"
          breadcrumbs={[{ label: 'Purchase Orders', path: '/purchase-orders' }]}
          backButton={true}
        />
        <SkeletonDetail columns={3} />
      </>
    );
  }

  return (
    <>
      <PageMeta
        title={`Purchase Order #${purchaseOrder.order_number}`}
        description="View purchase order details"
      />
      <PageBreadcrumb
        pageTitle="Purchase Order Details"
        breadcrumbs={[{ label: 'Purchase Orders', path: '/purchase-orders' }]}
        backButton={true}
      />

      <div className="flex flex-wrap justify-end gap-2 mb-4">
        {/* Manual Status Transitions */}
        {purchaseOrder.status === PurchaseOrderStatus.DRAFT && (
          <>
            <Button variant="outline" size="sm" href={`/purchase-orders/${id}/edit`}>
              Edit
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={isUpdatingStatus}
              onClick={() => handleUpdateStatus(PurchaseOrderStatus.SENT)}
            >
              Mark as Sent
            </Button>
            <Button
              variant="primary"
              size="sm"
              disabled={isUpdatingStatus}
              onClick={() => handleUpdateStatus(PurchaseOrderStatus.CONFIRMED)}
            >
              Confirm Order
            </Button>
            <Button
              variant="danger"
              size="sm"
              disabled={isUpdatingStatus}
              onClick={() => setConfirmCancelOpen(true)}
            >
              Cancel Order
            </Button>
          </>
        )}

        {purchaseOrder.status === PurchaseOrderStatus.SENT && (
          <>
            <Button variant="outline" size="sm" href={`/purchase-orders/${id}/edit`}>
              Edit
            </Button>
            <Button
              variant="primary"
              size="sm"
              disabled={isUpdatingStatus}
              onClick={() => handleUpdateStatus(PurchaseOrderStatus.CONFIRMED)}
            >
              Confirm Order
            </Button>
            <Button
              variant="danger"
              size="sm"
              disabled={isUpdatingStatus}
              onClick={() => setConfirmCancelOpen(true)}
            >
              Cancel Order
            </Button>
          </>
        )}

        {purchaseOrder.status === PurchaseOrderStatus.CONFIRMED && (
          <>
            <Button
              variant="danger"
              size="sm"
              disabled={isUpdatingStatus}
              onClick={() => setConfirmCancelOpen(true)}
            >
              Cancel Order
            </Button>
          </>
        )}

        {/* Downstream Converts */}
        {[PurchaseOrderStatus.CONFIRMED, PurchaseOrderStatus.PARTIALLY_RECEIVED].includes(
          purchaseOrder.status
        ) && (
          <Button
            variant="primary"
            size="sm"
            href={`/goods-received-notes/create?purchase_order_id=${id}`}
          >
            Convert to GRN
          </Button>
        )}

        {[
          PurchaseOrderStatus.CONFIRMED,
          PurchaseOrderStatus.PARTIALLY_RECEIVED,
          PurchaseOrderStatus.RECEIVED,
        ].includes(purchaseOrder.status) && (
          <Button
            variant="primary"
            size="sm"
            href={`/purchase-invoices/create?purchase_order_id=${id}`}
          >
            Convert to PI
          </Button>
        )}

        <Button variant="outline" size="sm" onClick={handlePrint}>
          Print
        </Button>
      </div>

      <ComponentCard title={`Purchase Order #${purchaseOrder.order_number}`}>
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h3 className="text-lg font-semibold mb-2 dark:text-gray-400">Vendor Details</h3>
              <p className="dark:text-gray-400">
                <strong>Name:</strong> {purchaseOrder.vendor.name}
              </p>
              <p className="dark:text-gray-400">
                <strong>Email:</strong> {purchaseOrder.vendor.email}
              </p>
              <p className="dark:text-gray-400">
                <strong>Phone:</strong> {purchaseOrder.vendor.phone}
              </p>
              {purchaseOrder.vendor.billing_address_line_1 && (
                <p className="dark:text-gray-400">
                  <strong>Address:</strong>
                  <span className="block">
                    {purchaseOrder.vendor.billing_address_line_1}
                    {purchaseOrder.vendor.billing_city && `, ${purchaseOrder.vendor.billing_city}`}
                    {purchaseOrder.vendor.billing_state &&
                      `, ${purchaseOrder.vendor.billing_state}`}
                    {purchaseOrder.vendor.billing_country &&
                      `, ${purchaseOrder.vendor.billing_country}`}
                    {purchaseOrder.vendor.billing_zip_code &&
                      ` - ${purchaseOrder.vendor.billing_zip_code}`}
                  </span>
                </p>
              )}
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2 dark:text-gray-400">Order Details</h3>
              <p className="dark:text-gray-400">
                <strong>Order #:</strong> {purchaseOrder.order_number}
              </p>
              {purchaseOrder.reference_number && (
                <p className="dark:text-gray-400">
                  <strong>Reference #:</strong> {purchaseOrder.reference_number}
                </p>
              )}
              <p className="dark:text-gray-400">
                <strong>Order Date:</strong> {formatDate(purchaseOrder.order_date)}
              </p>
              {purchaseOrder.expected_delivery_date && (
                <p className="dark:text-gray-400">
                  <strong>Expected Delivery:</strong>{' '}
                  {formatDate(purchaseOrder.expected_delivery_date)}
                </p>
              )}
              <p className="dark:text-gray-400">
                <strong>Status:</strong>
                <Badge size="sm" color={getStatusColor(purchaseOrder.status)}>
                  {purchaseOrder.status}
                </Badge>
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2 dark:text-gray-400">Additional Info</h3>
              {purchaseOrder.cost_center && (
                <p className="dark:text-gray-400">
                  <strong>Cost Center:</strong> {purchaseOrder.cost_center.name}
                </p>
              )}
              {purchaseOrder.warehouse && (
                <p className="dark:text-gray-400">
                  <strong>Warehouse:</strong> {purchaseOrder.warehouse.name}
                </p>
              )}
              {purchaseOrder.notes && (
                <div className="mt-2">
                  <strong>Notes:</strong>
                  <p className="text-sm dark:text-gray-400 mt-1 whitespace-pre-wrap border p-2 rounded bg-gray-50 dark:bg-gray-800">
                    {purchaseOrder.notes}
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="overflow-hidden rounded-xl border border-gray-200 custom-card-bg dark:border-white/[0.05]">
            <div className="max-w-full overflow-x-auto">
              <Table>
                <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                  <TableRow>
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      Item
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      Description
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-end text-theme-xs dark:text-gray-400"
                    >
                      Quantity
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-end text-theme-xs dark:text-gray-400"
                    >
                      Unit Price
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-end text-theme-xs dark:text-gray-400"
                    >
                      Total Amount
                    </TableCell>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                  {purchaseOrder.items.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell className="px-5 py-4 text-gray-800 text-start text-theme-sm dark:text-gray-400">
                        {item.item.name}
                      </TableCell>
                      <TableCell className="px-5 py-4 text-gray-800 text-start text-theme-sm dark:text-gray-400">
                        {item.description || '-'}
                      </TableCell>
                      <TableCell className="px-5 py-4 text-gray-800 text-end text-theme-sm dark:text-gray-400">
                        {formatQuantity(item.quantity)} {item.item.unit?.code}
                      </TableCell>
                      <TableCell className="px-5 py-4 text-gray-800 text-end text-theme-sm dark:text-gray-400">
                        {formatCurrency(item.unit_price)}
                      </TableCell>
                      <TableCell className="px-5 py-4 text-gray-800 text-end text-theme-sm dark:text-gray-400">
                        {formatCurrency(item.quantity * item.unit_price)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
                <tfoot className="border-t border-gray-100 dark:border-white/[0.05]">
                  <TableRow className="font-semibold">
                    <TableCell
                      colSpan={4}
                      className="px-5 py-4 text-end text-gray-800 dark:text-white/90"
                    >
                      Total Amount:
                    </TableCell>
                    <TableCell className="px-5 py-4 text-end text-gray-800 dark:text-white/90">
                      {formatCurrency(purchaseOrder.total_amount)}
                    </TableCell>
                  </TableRow>
                </tfoot>
              </Table>
            </div>
          </div>
        </div>
      </ComponentCard>

      <ConfirmModal
        isOpen={confirmCancelOpen}
        onClose={() => setConfirmCancelOpen(false)}
        onConfirm={() => handleUpdateStatus(PurchaseOrderStatus.CANCELLED)}
        isLoading={isUpdatingStatus}
        title="Cancel Purchase Order"
        message="Are you sure you want to cancel this purchase order? This action cannot be undone."
        confirmLabel="Cancel Order"
        variant="danger"
      />
    </>
  );
}
