'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import PageMeta from '@/components/common/PageMeta';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import ComponentCard from '@/components/common/ComponentCard';
import SkeletonDetail from '@/components/common/SkeletonDetail';
import Button from '@/components/ui/button/Button';
import Badge from '@/components/ui/badge/Badge';
import { Table, TableBody, TableCell, TableHeader, TableRow } from '@/components/ui/table';
import { getSalesOrder, updateSalesOrderStatus } from '@/services/SalesOrderService';
import { useSettings } from '@/hooks/useSettings';
import { SalesOrder, SalesOrderStatus } from '@/types/SalesOrder';
import ConfirmModal from '@/components/common/ConfirmModal';
import { toast } from 'sonner';
import { isApiError } from '@/utils/errors';

export default function ViewSalesOrder() {
  const params = useParams<{ id: string }>();
  const id = params?.id;
  const router = useRouter();
  const { formatCurrency, formatQuantity, formatDate } = useSettings();
  const [salesOrder, setSalesOrder] = useState<SalesOrder | null>(null);

  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [confirmCancelOpen, setConfirmCancelOpen] = useState(false);

  const fetchSalesDetails = useCallback(async () => {
    try {
      if (id) {
        const response = await getSalesOrder(Number(id));
        setSalesOrder(response);
      }
    } catch (error) {
      console.error('Error fetching sales order details:', error);
      toast.error('Failed to load sales order details');
      router.push('/sales-orders');
    }
  }, [id, router]);

  useEffect(() => {
    fetchSalesDetails();
  }, [fetchSalesDetails]);

  const taxBreakdown = useMemo(() => {
    if (!salesOrder?.items) return [];
    const taxMap: Record<string, number> = {};
    salesOrder.items.forEach((item) => {
      if (item.tax_meta?.rates) {
        const taxableAmount = (item.sub_total || 0) - (item.discount_amount || 0);
        item.tax_meta.rates.forEach((rate) => {
          let amount = 0;
          if (rate.type === 'percentage') {
            amount = taxableAmount * (Number(rate.rate) / 100);
          } else {
            amount = Number(rate.rate) * item.quantity;
          }
          taxMap[rate.name] = (taxMap[rate.name] || 0) + amount;
        });
      }
    });
    return Object.entries(taxMap).map(([name, amount]) => ({ name, amount }));
  }, [salesOrder?.items]);

  const handlePrint = () => {
    window.print();
  };

  const handleUpdateStatus = async (newStatus: SalesOrderStatus) => {
    if (!salesOrder) return;

    try {
      setIsUpdatingStatus(true);
      await updateSalesOrderStatus(salesOrder.id, newStatus);
      toast.success(`Sales Order marked as ${newStatus}`);
      fetchSalesDetails(); // refresh data
    } catch (error: unknown) {
      let message = 'Failed to update status';
      if (isApiError(error)) {
        message = error.response?.data?.message || message;
      }
      toast.error(message);
    } finally {
      setIsUpdatingStatus(false);
      if (newStatus === SalesOrderStatus.CANCELLED) {
        setConfirmCancelOpen(false);
      }
    }
  };

  const getStatusColor = (status: SalesOrderStatus) => {
    switch (status) {
      case SalesOrderStatus.DRAFT:
        return 'warning';
      case SalesOrderStatus.SENT:
        return 'info';
      case SalesOrderStatus.CONFIRMED:
        return 'success';
      case SalesOrderStatus.COMPLETED:
        return 'success';
      case SalesOrderStatus.CANCELLED:
        return 'error';
      default:
        return 'secondary';
    }
  };

  if (!salesOrder) {
    return (
      <>
        <PageBreadcrumb
          pageTitle="Sales Order Details"
          breadcrumbs={[{ label: 'Sales Orders', path: '/sales-orders' }]}
          backButton={true}
        />
        <SkeletonDetail columns={3} />
      </>
    );
  }

  return (
    <>
      <PageMeta
        title={`Sales Order #${salesOrder.order_number}`}
        description="View sales order details"
      />
      <PageBreadcrumb
        pageTitle="Sales Order Details"
        breadcrumbs={[{ label: 'Sales Orders', path: '/sales-orders' }]}
        backButton={true}
      />

      <div className="flex flex-wrap justify-end gap-2 mb-4">
        {/* Manual Status Transitions */}
        {salesOrder.status === SalesOrderStatus.DRAFT && (
          <>
            <Button variant="outline" size="sm" href={`/sales-orders/${id}/edit`}>
              Edit
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={isUpdatingStatus}
              onClick={() => handleUpdateStatus(SalesOrderStatus.SENT)}
            >
              Mark as Sent
            </Button>
            <Button
              variant="primary"
              size="sm"
              disabled={isUpdatingStatus}
              onClick={() => handleUpdateStatus(SalesOrderStatus.CONFIRMED)}
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

        {salesOrder.status === SalesOrderStatus.SENT && (
          <>
            <Button variant="outline" size="sm" href={`/sales-orders/${id}/edit`}>
              Edit
            </Button>
            <Button
              variant="primary"
              size="sm"
              disabled={isUpdatingStatus}
              onClick={() => handleUpdateStatus(SalesOrderStatus.CONFIRMED)}
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

        {salesOrder.status === SalesOrderStatus.CONFIRMED && (
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
        {[SalesOrderStatus.CONFIRMED, SalesOrderStatus.PARTIALLY_DELIVERED].includes(
          salesOrder.status
        ) && (
          <Button variant="primary" size="sm" href={`/delivery-notes/create?sales_order_id=${id}`}>
            Convert to Delivery Note
          </Button>
        )}

        {[
          SalesOrderStatus.CONFIRMED,
          SalesOrderStatus.PARTIALLY_DELIVERED,
          SalesOrderStatus.DELIVERED,
        ].includes(salesOrder.status) && (
          <Button variant="primary" size="sm" href={`/sales-invoices/create?sales_order_id=${id}`}>
            Convert to Invoice
          </Button>
        )}

        <Button variant="outline" size="sm" onClick={handlePrint}>
          Print
        </Button>
      </div>

      <ComponentCard title={`Sales Order #${salesOrder.order_number}`}>
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h3 className="text-lg font-semibold mb-2 dark:text-gray-400">Customer Details</h3>
              <p className="dark:text-gray-400">
                <strong>Name:</strong> {salesOrder.customer.name}
              </p>
              <p className="dark:text-gray-400">
                <strong>Email:</strong> {salesOrder.customer.email}
              </p>
              <p className="dark:text-gray-400">
                <strong>Phone:</strong> {salesOrder.customer.phone}
              </p>
              {salesOrder.customer.billing_address_line_1 && (
                <p className="dark:text-gray-400">
                  <strong>Address:</strong>
                  <span className="block">
                    {salesOrder.customer.billing_address_line_1}
                    {salesOrder.customer.billing_city && `, ${salesOrder.customer.billing_city}`}
                    {salesOrder.customer.billing_state && `, ${salesOrder.customer.billing_state}`}
                    {salesOrder.customer.billing_country &&
                      `, ${salesOrder.customer.billing_country}`}
                    {salesOrder.customer.billing_zip_code &&
                      ` - ${salesOrder.customer.billing_zip_code}`}
                  </span>
                </p>
              )}
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2 dark:text-gray-400">Order Details</h3>
              <p className="dark:text-gray-400">
                <strong>Order #:</strong> {salesOrder.order_number}
              </p>
              {salesOrder.reference_number && (
                <p className="dark:text-gray-400">
                  <strong>Reference #:</strong> {salesOrder.reference_number}
                </p>
              )}
              <p className="dark:text-gray-400">
                <strong>Order Date:</strong> {formatDate(salesOrder.order_date)}
              </p>
              {salesOrder.expected_delivery_date && (
                <p className="dark:text-gray-400">
                  <strong>Expected Delivery:</strong>{' '}
                  {formatDate(salesOrder.expected_delivery_date)}
                </p>
              )}
              <p className="dark:text-gray-400">
                <strong>Status:</strong>
                <Badge size="sm" color={getStatusColor(salesOrder.status)}>
                  {salesOrder.status}
                </Badge>
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2 dark:text-gray-400">Additional Info</h3>
              {salesOrder.cost_center && (
                <p className="dark:text-gray-400">
                  <strong>Cost Center:</strong> {salesOrder.cost_center.name}
                </p>
              )}
              {salesOrder.warehouse && (
                <p className="dark:text-gray-400">
                  <strong>Warehouse:</strong> {salesOrder.warehouse.name}
                </p>
              )}
              {salesOrder.notes && (
                <div className="mt-2">
                  <strong>Notes:</strong>
                  <p className="text-sm dark:text-gray-400 mt-1 whitespace-pre-wrap border p-2 rounded bg-gray-50 dark:bg-gray-800">
                    {salesOrder.notes}
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
                      Tax
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
                  {salesOrder.items.map((item, index) => (
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
                        {item.tax_meta?.rates?.length ? (
                          <div className="flex flex-col items-end space-y-0.5">
                            {item.tax_meta.rates.map((rate, i) => (
                              <div key={i} className="text-xs whitespace-nowrap">
                                {rate.name}{' '}
                                <span className="font-medium text-gray-500">
                                  ({rate.rate}
                                  {rate.type === 'percentage' ? '%' : ''})
                                </span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </TableCell>
                      <TableCell className="px-5 py-4 text-gray-800 text-end text-theme-sm dark:text-gray-400">
                        {formatCurrency(item.total_amount)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          <div className="flex justify-end mt-8">
            <div className="w-full max-w-sm space-y-3">
              <div className="flex justify-between items-center px-4">
                <span className="text-gray-500 font-bold uppercase text-theme-xs">Sub Total</span>
                <span className="font-bold text-gray-900 dark:text-white">
                  {formatCurrency(salesOrder.sub_total)}
                </span>
              </div>
              <div className="flex justify-between items-center px-4">
                <span className="text-gray-500 font-bold uppercase text-theme-xs">Discount</span>
                <span className="font-bold text-gray-900 dark:text-white">
                  -{formatCurrency(salesOrder.discount_total)}
                </span>
              </div>
              {taxBreakdown.map((tb, idx) => (
                <div key={idx} className="flex justify-between items-center px-4">
                  <span className="text-gray-500 font-bold uppercase text-theme-xs">{tb.name}</span>
                  <span className="font-bold text-gray-900 dark:text-white">
                    +{formatCurrency(tb.amount)}
                  </span>
                </div>
              ))}
              <div className="flex justify-between items-center px-4">
                <span className="text-gray-500 font-bold uppercase text-theme-xs">Total Tax</span>
                <span className="font-bold text-gray-900 dark:text-white">
                  +{formatCurrency(salesOrder.tax_total)}
                </span>
              </div>
              <div className="flex justify-between items-center p-4 bg-brand-50 dark:bg-brand-500/10 rounded-xl">
                <span className="text-brand-600 dark:text-brand-400 font-bold uppercase text-theme-sm">
                  Total Amount
                </span>
                <span className="text-xl font-black text-brand-700 dark:text-brand-400">
                  {formatCurrency(salesOrder.total_amount)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </ComponentCard>

      <ConfirmModal
        isOpen={confirmCancelOpen}
        onClose={() => setConfirmCancelOpen(false)}
        onConfirm={() => handleUpdateStatus(SalesOrderStatus.CANCELLED)}
        isLoading={isUpdatingStatus}
        title="Cancel Sales Order"
        message="Are you sure you want to cancel this sales order? This action cannot be undone."
        confirmLabel="Cancel Order"
        variant="danger"
      />
    </>
  );
}
