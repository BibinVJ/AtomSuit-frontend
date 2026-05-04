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
import { PurchaseInvoiceService } from '@/services/PurchaseInvoiceService';
import { useSettings } from '@/hooks/useSettings';
import { PurchaseInvoice, PurchaseInvoiceStatus } from '@/types/PurchaseInvoice';
import { toast } from 'sonner';

export default function ViewPurchaseInvoice() {
  const params = useParams<{ id: string }>();
  const id = params?.id;
  const router = useRouter();
  const { formatCurrency, formatQuantity, formatDate } = useSettings();
  const [invoice, setInvoice] = useState<PurchaseInvoice | null>(null);

  const fetchInvoiceDetails = useCallback(async () => {
    try {
      if (id) {
        const response = await PurchaseInvoiceService.get(id as string);
        setInvoice(response);
      }
    } catch (error) {
      console.error('Error fetching purchase invoice details:', error);
      toast.error('Failed to load purchase invoice details');
      router.push('/purchase-invoices');
    }
  }, [id, router]);

  useEffect(() => {
    fetchInvoiceDetails();
  }, [fetchInvoiceDetails]);

  const taxBreakdown = useMemo(() => {
    if (!invoice?.items) return [];
    const taxMap: Record<string, number> = {};
    invoice.items.forEach((item) => {
      if (item.tax_meta?.rates) {
        const taxableAmount = (item.sub_total || 0) - (item.discount_amount || 0);
        item.tax_meta.rates.forEach((rate) => {
          let amount = 0;
          if (rate.type === 'percentage') {
            amount = taxableAmount * (Number(rate.rate) / 100);
          } else {
            amount = Number(rate.rate) * (item.quantity || 0);
          }
          taxMap[rate.name] = (taxMap[rate.name] || 0) + amount;
        });
      }
    });
    return Object.entries(taxMap).map(([name, amount]) => ({ name, amount }));
  }, [invoice?.items]);

  const handlePrint = () => {
    window.print();
  };

  const getStatusColor = (status: PurchaseInvoiceStatus) => {
    switch (status) {
      case PurchaseInvoiceStatus.PAID:
        return 'success';
      case PurchaseInvoiceStatus.POSTED:
      case PurchaseInvoiceStatus.PARTIALLY_PAID:
        return 'warning';
      case PurchaseInvoiceStatus.VOIDED:
        return 'error';
      default:
        return 'secondary';
    }
  };

  if (!invoice) {
    return (
      <div className="p-6">
        <PageBreadcrumb
          pageTitle="Purchase Invoice Details"
          breadcrumbs={[{ label: 'Purchase Invoices', path: '/purchase-invoices' }]}
          backButton={true}
        />
        <SkeletonDetail columns={3} />
      </div>
    );
  }

  return (
    <>
      <PageMeta
        title={`Purchase Invoice #${invoice.invoice_number}`}
        description="View purchase invoice details"
      />
      <PageBreadcrumb
        pageTitle="Purchase Invoice Details"
        breadcrumbs={[{ label: 'Purchase Invoices', path: '/purchase-invoices' }]}
        backButton={true}
      />

      <div className="flex justify-end gap-2 mb-4">
        <Button variant="outline" size="sm" onClick={handlePrint}>
          Print
        </Button>
      </div>

      <ComponentCard title={`Purchase Invoice #${invoice.invoice_number}`}>
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h3 className="text-lg font-semibold mb-2 dark:text-gray-400">Vendor Details</h3>
              <p className="dark:text-gray-400">
                <strong>Name:</strong> {invoice.vendor?.name}
              </p>
              <p className="dark:text-gray-400">
                <strong>Email:</strong> {invoice.vendor?.email}
              </p>
              <p className="dark:text-gray-400">
                <strong>Phone:</strong> {invoice.vendor?.phone}
              </p>
              {invoice.vendor?.billing_address_line_1 && (
                <p className="dark:text-gray-400">
                  <strong>Address:</strong>
                  <span className="block">
                    {invoice.vendor.billing_address_line_1}
                    {invoice.vendor.billing_city && `, ${invoice.vendor.billing_city}`}
                    {invoice.vendor.billing_state && `, ${invoice.vendor.billing_state}`}
                    {invoice.vendor.billing_country && `, ${invoice.vendor.billing_country}`}
                    {invoice.vendor.billing_zip_code && ` - ${invoice.vendor.billing_zip_code}`}
                  </span>
                </p>
              )}
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2 dark:text-gray-400">Invoice Details</h3>
              <p className="dark:text-gray-400">
                <strong>Invoice #:</strong> {invoice.invoice_number}
              </p>
              {invoice.reference_number && (
                <p className="dark:text-gray-400">
                  <strong>Reference #:</strong> {invoice.reference_number}
                </p>
              )}
              <p className="dark:text-gray-400">
                <strong>Posting Date:</strong> {formatDate(invoice.posting_date)}
              </p>
              <p className="dark:text-gray-400">
                <strong>Due Date:</strong> {formatDate(invoice.due_date)}
              </p>
              <p className="dark:text-gray-400">
                <strong>Status:</strong>
                <Badge size="sm" color={getStatusColor(invoice.status)}>
                  {invoice.status}
                </Badge>
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2 dark:text-gray-400">Additional Info</h3>
              {invoice.cost_center && (
                <p className="dark:text-gray-400">
                  <strong>Cost Center:</strong> {invoice.cost_center.name}
                </p>
              )}
              {invoice.warehouse && (
                <p className="dark:text-gray-400">
                  <strong>Warehouse:</strong> {invoice.warehouse.name}
                </p>
              )}
              {invoice.notes && (
                <div className="mt-2">
                  <strong>Notes:</strong>
                  <p className="text-sm dark:text-gray-400 mt-1 whitespace-pre-wrap border p-2 rounded bg-gray-50 dark:bg-gray-800">
                    {invoice.notes}
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
                  {invoice.items.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell className="px-5 py-4 text-gray-800 text-start text-theme-sm dark:text-gray-400">
                        {item.item?.name}
                      </TableCell>
                      <TableCell className="px-5 py-4 text-gray-800 text-start text-theme-sm dark:text-gray-400">
                        {item.description || '-'}
                      </TableCell>
                      <TableCell className="px-5 py-4 text-gray-800 text-end text-theme-sm dark:text-gray-400">
                        {formatQuantity(item.quantity ?? 0)} {item.item?.unit?.code}
                      </TableCell>
                      <TableCell className="px-5 py-4 text-gray-800 text-end text-theme-sm dark:text-gray-400">
                        {formatCurrency(item.unit_price ?? 0)}
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
                        {formatCurrency(item.total_amount ?? 0)}
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
                  {formatCurrency(invoice.sub_total)}
                </span>
              </div>
              <div className="flex justify-between items-center px-4">
                <span className="text-gray-500 font-bold uppercase text-theme-xs">Discount</span>
                <span className="font-bold text-gray-900 dark:text-white">
                  -{formatCurrency(invoice.discount_total)}
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
                  +{formatCurrency(invoice.tax_total)}
                </span>
              </div>
              <div className="flex justify-between items-center p-4 bg-brand-50 dark:bg-brand-500/10 rounded-xl">
                <span className="text-brand-600 dark:text-brand-400 font-bold uppercase text-theme-sm">
                  Total Amount
                </span>
                <span className="text-xl font-black text-brand-700 dark:text-brand-400">
                  {formatCurrency(invoice.total_amount)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </ComponentCard>
    </>
  );
}
