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
import { DebitNoteService } from '@/services/DebitNoteService';
import { useSettings } from '@/hooks/useSettings';
import { DebitNote, DebitNoteStatus } from '@/types/DebitNote';
import { toast } from 'sonner';

export default function ViewDebitNote() {
  const params = useParams<{ id: string }>();
  const id = params?.id;
  const router = useRouter();
  const { formatCurrency, formatQuantity, formatDate } = useSettings();
  const [debitNote, setDebitNote] = useState<DebitNote | null>(null);

  const fetchDebitNoteDetails = useCallback(async () => {
    try {
      if (id) {
        const response = await DebitNoteService.get(id as string);
        setDebitNote(response);
      }
    } catch (error) {
      console.error('Error fetching debit note details:', error);
      toast.error('Failed to load debit note details');
      router.push('/debit-notes');
    }
  }, [id, router]);

  useEffect(() => {
    fetchDebitNoteDetails();
  }, [fetchDebitNoteDetails]);

  const taxBreakdown = useMemo(() => {
    if (!debitNote?.items) return [];
    const taxMap: Record<string, number> = {};
    debitNote.items.forEach((item) => {
      // Assuming similar tax structure as Purchase Invoice
      // Usually, backend resources provide the tax meta
      // But for simplicity let's stick to total tax if meta is complex
    });
    return [];
  }, [debitNote?.items]);

  const handlePrint = () => {
    window.print();
  };

  const getStatusColor = (status: DebitNoteStatus) => {
    switch (status) {
      case DebitNoteStatus.POSTED:
        return 'success';
      case DebitNoteStatus.VOIDED:
        return 'error';
      default:
        return 'secondary';
    }
  };

  if (!debitNote) {
    return (
      <div className="p-6">
        <PageBreadcrumb
          pageTitle="Debit Note Details"
          breadcrumbs={[{ label: 'Debit Notes', path: '/debit-notes' }]}
          backButton={true}
        />
        <SkeletonDetail columns={3} />
      </div>
    );
  }

  return (
    <>
      <PageMeta
        title={`Debit Note #${debitNote.debit_note_number}`}
        description="View debit note details"
      />
      <PageBreadcrumb
        pageTitle="Debit Note Details"
        breadcrumbs={[{ label: 'Debit Notes', path: '/debit-notes' }]}
        backButton={true}
      />

      <div className="flex justify-end gap-2 mb-4">
        <Button variant="outline" size="sm" onClick={handlePrint}>
          Print
        </Button>
      </div>

      <ComponentCard title={`Debit Note #${debitNote.debit_note_number}`}>
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h3 className="text-lg font-semibold mb-2 dark:text-gray-400">Vendor Details</h3>
              <p className="dark:text-gray-400">
                <strong>Name:</strong> {debitNote.vendor?.name}
              </p>
              <p className="dark:text-gray-400">
                <strong>Email:</strong> {debitNote.vendor?.email}
              </p>
              <p className="dark:text-gray-400">
                <strong>Phone:</strong> {debitNote.vendor?.phone}
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2 dark:text-gray-400">Debit Note Details</h3>
              <p className="dark:text-gray-400">
                <strong>Debit Note #:</strong> {debitNote.debit_note_number}
              </p>
              {debitNote.reference_number && (
                <p className="dark:text-gray-400">
                  <strong>Reference #:</strong> {debitNote.reference_number}
                </p>
              )}
              <p className="dark:text-gray-400">
                <strong>Date:</strong> {formatDate(debitNote.date)}
              </p>
              <p className="dark:text-gray-400">
                <strong>Status:</strong>
                <Badge size="sm" color={getStatusColor(debitNote.status)}>
                  {debitNote.status}
                </Badge>
              </p>
              {debitNote.purchase_invoice && (
                <p className="dark:text-gray-400">
                  <strong>Purchase Invoice:</strong> {debitNote.purchase_invoice.invoice_number}
                </p>
              )}
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2 dark:text-gray-400">Additional Info</h3>
              {debitNote.cost_center && (
                <p className="dark:text-gray-400">
                  <strong>Cost Center:</strong> {debitNote.cost_center.name}
                </p>
              )}
              {debitNote.warehouse && (
                <p className="dark:text-gray-400">
                  <strong>Warehouse:</strong> {debitNote.warehouse.name}
                </p>
              )}
              {debitNote.notes && (
                <div className="mt-2">
                  <strong>Notes:</strong>
                  <p className="text-sm dark:text-gray-400 mt-1 whitespace-pre-wrap border p-2 rounded bg-gray-50 dark:bg-gray-800">
                    {debitNote.notes}
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
                  {debitNote.items.map((item, index) => (
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
                  {formatCurrency(debitNote.sub_total)}
                </span>
              </div>
              <div className="flex justify-between items-center px-4">
                <span className="text-gray-500 font-bold uppercase text-theme-xs">Discount</span>
                <span className="font-bold text-gray-900 dark:text-white">
                  -{formatCurrency(debitNote.discount_total)}
                </span>
              </div>
              <div className="flex justify-between items-center px-4">
                <span className="text-gray-500 font-bold uppercase text-theme-xs">Total Tax</span>
                <span className="font-bold text-gray-900 dark:text-white">
                  +{formatCurrency(debitNote.tax_total)}
                </span>
              </div>
              <div className="flex justify-between items-center p-4 bg-brand-50 dark:bg-brand-500/10 rounded-xl">
                <span className="text-brand-600 dark:text-brand-400 font-bold uppercase text-theme-sm">
                  Total Amount
                </span>
                <span className="text-xl font-black text-brand-700 dark:text-brand-400">
                  {formatCurrency(debitNote.total_amount)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </ComponentCard>
    </>
  );
}
