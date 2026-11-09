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
import { CustomerPaymentService } from '@/services/CustomerPaymentService';
import { useSettings } from '@/hooks/useSettings';
import { CustomerPayment, CustomerPaymentStatus } from '@/types/CustomerPayment';
import { toast } from 'sonner';

export default function ViewCustomerPayment() {
  const params = useParams<{ id: string }>();
  const id = params?.id;
  const router = useRouter();
  const { formatCurrency, formatDate } = useSettings();
  const [payment, setPayment] = useState<CustomerPayment | null>(null);

  const fetchPaymentDetails = useCallback(async () => {
    try {
      if (id) {
        const response = await CustomerPaymentService.get(id as string);
        setPayment(response);
      }
    } catch (error) {
      console.error('Error fetching payment details:', error);
      toast.error('Failed to load payment details');
      router.push('/customer-payments');
    }
  }, [id, router]);

  useEffect(() => {
    fetchPaymentDetails();
  }, [fetchPaymentDetails]);

  const handlePrint = () => {
    window.print();
  };

  const getStatusColor = (status: CustomerPaymentStatus) => {
    switch (status) {
      case CustomerPaymentStatus.POSTED:
        return 'success';
      case CustomerPaymentStatus.VOIDED:
        return 'error';
      default:
        return 'secondary';
    }
  };

  if (!payment) {
    return (
      <div className="p-6">
        <PageBreadcrumb
          pageTitle="Customer Payment Details"
          breadcrumbs={[{ label: 'Customer Payments', path: '/customer-payments' }]}
          backButton={true}
        />
        <SkeletonDetail columns={3} />
      </div>
    );
  }

  return (
    <>
      <PageMeta
        title={`Customer Payment #${payment.payment_number}`}
        description="View customer payment details"
      />
      <PageBreadcrumb
        pageTitle="Customer Payment Details"
        breadcrumbs={[{ label: 'Customer Payments', path: '/customer-payments' }]}
        backButton={true}
      />

      <div className="flex justify-end gap-2 mb-4">
        <Button variant="outline" size="sm" onClick={handlePrint}>
          Print
        </Button>
      </div>

      <ComponentCard title={`Customer Payment #${payment.payment_number}`}>
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h3 className="text-lg font-semibold mb-2 dark:text-gray-400">Customer Details</h3>
              <p className="dark:text-gray-400">
                <strong>Name:</strong> {payment.customer?.name}
              </p>
              <p className="dark:text-gray-400">
                <strong>Email:</strong> {payment.customer?.email}
              </p>
              <p className="dark:text-gray-400">
                <strong>Phone:</strong> {payment.customer?.phone}
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2 dark:text-gray-400">Payment Details</h3>
              <p className="dark:text-gray-400">
                <strong>Payment #:</strong> {payment.payment_number}
              </p>
              <p className="dark:text-gray-400">
                <strong>Date:</strong> {formatDate(payment.payment_date)}
              </p>
              <p className="dark:text-gray-400">
                <strong>Amount:</strong> {formatCurrency(payment.amount)}
              </p>
              <p className="dark:text-gray-400">
                <strong>Method:</strong> {payment.payment_method || 'N/A'}
              </p>
              {payment.reference_number && (
                <p className="dark:text-gray-400">
                  <strong>Ref #:</strong> {payment.reference_number}
                </p>
              )}
              <p className="dark:text-gray-400 mt-2">
                <strong>Status:</strong>
                <Badge size="sm" color={getStatusColor(payment.status)}>
                  {payment.status}
                </Badge>
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2 dark:text-gray-400">Additional Info</h3>
              <p className="dark:text-gray-400">
                <strong>Paid From:</strong> {payment.account?.name} ({payment.account?.code})
              </p>
              {payment.cost_center && (
                <p className="dark:text-gray-400">
                  <strong>Cost Center:</strong> {payment.cost_center.name}
                </p>
              )}
              {payment.notes && (
                <div className="mt-2">
                  <strong>Notes:</strong>
                  <p className="text-sm dark:text-gray-400 mt-1 whitespace-pre-wrap border p-2 rounded bg-gray-50 dark:bg-gray-800">
                    {payment.notes}
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="mt-8">
            <h3 className="text-lg font-bold mb-4">Allocations</h3>
            <div className="overflow-hidden rounded-xl border border-gray-200 custom-card-bg dark:border-white/[0.05]">
              <Table>
                <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                  <TableRow>
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      Invoice #
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      Invoice Date
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-end text-theme-xs dark:text-gray-400"
                    >
                      Total Amount
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-end text-theme-xs dark:text-gray-400"
                    >
                      Allocated Amount
                    </TableCell>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                  {payment.allocations.map((allocation, index) => (
                    <TableRow key={index}>
                      <TableCell className="px-5 py-4 text-gray-800 text-start text-theme-sm dark:text-gray-400">
                        {allocation.sales_invoice?.invoice_number}
                      </TableCell>
                      <TableCell className="px-5 py-4 text-gray-800 text-start text-theme-sm dark:text-gray-400">
                        {allocation.sales_invoice?.invoice_date
                          ? formatDate(allocation.sales_invoice.invoice_date)
                          : '-'}
                      </TableCell>
                      <TableCell className="px-5 py-4 text-gray-800 text-end text-theme-sm dark:text-gray-400">
                        {formatCurrency(allocation.sales_invoice?.total_amount || 0)}
                      </TableCell>
                      <TableCell className="px-5 py-4 text-gray-800 text-end font-bold text-theme-sm dark:text-gray-400">
                        {formatCurrency(allocation.allocated_amount)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </ComponentCard>
    </>
  );
}
