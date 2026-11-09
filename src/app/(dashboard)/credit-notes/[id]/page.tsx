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
import { CreditNoteService } from '@/services/CreditNoteService';
import { useSettings } from '@/hooks/useSettings';
import { CreditNote, CreditNoteStatus } from '@/types/CreditNote';
import { toast } from 'sonner';

export default function ViewCreditNote() {
  const params = useParams<{ id: string }>();
  const id = params?.id;
  const router = useRouter();
  const { formatCurrency, formatQuantity, formatDate } = useSettings();
  const [creditNote, setCreditNote] = useState<CreditNote | null>(null);

  const fetchCreditNoteDetails = useCallback(async () => {
    try {
      if (id) {
        const response = await CreditNoteService.get(id as string);
        setCreditNote(response);
      }
    } catch (error) {
      console.error('Error fetching credit note details:', error);
      toast.error('Failed to load credit note details');
      router.push('/credit-notes');
    }
  }, [id, router]);

  useEffect(() => {
    fetchCreditNoteDetails();
  }, [fetchCreditNoteDetails]);

  const handlePrint = () => {
    window.print();
  };

  const getStatusColor = (status: CreditNoteStatus) => {
    switch (status) {
      case CreditNoteStatus.POSTED:
        return 'success';
      case CreditNoteStatus.VOIDED:
        return 'error';
      default:
        return 'secondary';
    }
  };

  if (!creditNote) {
    return (
      <div className="p-6">
        <PageBreadcrumb
          pageTitle="Credit Note Details"
          breadcrumbs={[{ label: 'Credit Notes', path: '/credit-notes' }]}
          backButton={true}
        />
        <SkeletonDetail columns={3} />
      </div>
    );
  }

  return (
    <>
      <PageMeta
        title={`Credit Note #${creditNote.credit_note_number}`}
        description="View credit note details"
      />
      <PageBreadcrumb
        pageTitle="Credit Note Details"
        breadcrumbs={[{ label: 'Credit Notes', path: '/credit-notes' }]}
        backButton={true}
      />

      <div className="flex justify-end gap-2 mb-4">
        <Button variant="outline" size="sm" onClick={handlePrint}>
          Print
        </Button>
      </div>

      <ComponentCard title={`Credit Note #${creditNote.credit_note_number}`}>
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h3 className="text-lg font-semibold mb-2 dark:text-gray-400">Customer Details</h3>
              <p className="dark:text-gray-400">
                <strong>Name:</strong> {creditNote.customer?.name}
              </p>
              <p className="dark:text-gray-400">
                <strong>Email:</strong> {creditNote.customer?.email}
              </p>
              <p className="dark:text-gray-400">
                <strong>Phone:</strong> {creditNote.customer?.phone}
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2 dark:text-gray-400">Credit Note Details</h3>
              <p className="dark:text-gray-400">
                <strong>Credit Note #:</strong> {creditNote.credit_note_number}
              </p>
              {creditNote.reference_number && (
                <p className="dark:text-gray-400">
                  <strong>Reference #:</strong> {creditNote.reference_number}
                </p>
              )}
              <p className="dark:text-gray-400">
                <strong>Date:</strong> {formatDate(creditNote.credit_note_date)}
              </p>
              <p className="dark:text-gray-400">
                <strong>Status:</strong>
                <Badge size="sm" color={getStatusColor(creditNote.status)}>
                  {creditNote.status}
                </Badge>
              </p>
              {creditNote.sales_invoice && (
                <p className="dark:text-gray-400">
                  <strong>Sales Invoice:</strong> {creditNote.sales_invoice.invoice_number}
                </p>
              )}
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2 dark:text-gray-400">Additional Info</h3>
              {creditNote.cost_center && (
                <p className="dark:text-gray-400">
                  <strong>Cost Center:</strong> {creditNote.cost_center.name}
                </p>
              )}
              {creditNote.warehouse && (
                <p className="dark:text-gray-400">
                  <strong>Warehouse:</strong> {creditNote.warehouse.name}
                </p>
              )}
              {creditNote.notes && (
                <div className="mt-2">
                  <strong>Notes:</strong>
                  <p className="text-sm dark:text-gray-400 mt-1 whitespace-pre-wrap border p-2 rounded bg-gray-50 dark:bg-gray-800">
                    {creditNote.notes}
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
                      className="px-5 py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400"
                    >
                      Stock Returned
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
                  {creditNote.items.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell className="px-5 py-4 text-gray-800 text-start text-theme-sm dark:text-gray-400">
                        {item.item?.name}
                      </TableCell>
                      <TableCell className="px-5 py-4 text-gray-800 text-start text-theme-sm dark:text-gray-400">
                        {item.description || '-'}
                      </TableCell>
                      <TableCell className="px-5 py-4 text-gray-800 text-end text-theme-sm dark:text-gray-400">
                        {formatQuantity(item.returned_quantity ?? 0)} {item.item?.unit?.code}
                      </TableCell>
                      <TableCell className="px-5 py-4 text-gray-800 text-end text-theme-sm dark:text-gray-400">
                        {formatCurrency(item.unit_price ?? 0)}
                      </TableCell>
                      <TableCell className="px-5 py-4 text-gray-800 text-center text-theme-sm dark:text-gray-400">
                        {item.is_stock_returned ? 'Yes' : 'No'}
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
                  {formatCurrency(creditNote.sub_total)}
                </span>
              </div>
              <div className="flex justify-between items-center px-4">
                <span className="text-gray-500 font-bold uppercase text-theme-xs">Discount</span>
                <span className="font-bold text-gray-900 dark:text-white">
                  -{formatCurrency(creditNote.discount_total)}
                </span>
              </div>
              <div className="flex justify-between items-center px-4">
                <span className="text-gray-500 font-bold uppercase text-theme-xs">Total Tax</span>
                <span className="font-bold text-gray-900 dark:text-white">
                  +{formatCurrency(creditNote.tax_total)}
                </span>
              </div>
              <div className="flex justify-between items-center p-4 bg-brand-50 dark:bg-brand-500/10 rounded-xl">
                <span className="text-brand-600 dark:text-brand-400 font-bold uppercase text-theme-sm">
                  Total Amount
                </span>
                <span className="text-xl font-black text-brand-700 dark:text-brand-400">
                  {formatCurrency(creditNote.total_amount)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </ComponentCard>
    </>
  );
}
