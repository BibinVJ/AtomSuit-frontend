'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import PageMeta from '@/components/common/PageMeta';
import SkeletonForm from '@/components/common/SkeletonForm';
import { toast } from 'sonner';
import { getVendors } from '@/services/VendorService';
import { VendorPaymentService } from '@/services/VendorPaymentService';
import { PurchaseInvoiceService } from '@/services/PurchaseInvoiceService';
import { getCostCenters } from '@/services/CostCenterService';
import { getChartOfAccounts } from '@/services/ChartOfAccountService';
import { isApiError } from '@/utils/errors';
import { Vendor, CostCenter, ChartOfAccount, PurchaseInvoice } from '@/types';
import { usePermissions } from '@/hooks/usePermissions';
import { useSettings } from '@/hooks/useSettings';
import Button from '@/components/ui/button/Button';
import Input from '@/components/form/input/InputField';
import Label from '@/components/form/Label';
import Select from '@/components/form/Select';
import TextArea from '@/components/form/input/TextArea';
import DatePicker from '@/components/form/date-picker';

interface AllocationInput {
  purchase_invoice_id: number;
  invoice_number: string;
  total_amount: number;
  paid_amount: number;
  outstanding_amount: number;
  allocated_amount: number;
}

export default function CreateVendorPayment() {
  const { hasPermission } = usePermissions();
  const router = useRouter();
  const { getSetting, formatCurrency } = useSettings();

  // Form State
  const [vendorId, setVendorId] = useState('');
  const [accountId, setAccountId] = useState('');
  const [paymentNumber, setPaymentNumber] = useState('');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [costCenterId, setCostCenterId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Bank Transfer');
  const [notes, setNotes] = useState('');
  const [allocations, setAllocations] = useState<AllocationInput[]>([]);

  // Data State
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [accounts, setAccounts] = useState<ChartOfAccount[]>([]);
  const [costCenters, setCostCenters] = useState<CostCenter[]>([]);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetchingInvoices, setIsFetchingInvoices] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [vData, aData, ccData, nextNumData] = await Promise.all([
          getVendors({ unpaginated: true }),
          getChartOfAccounts({ unpaginated: true, type: 'Asset' }), // Usually bank/cash
          getCostCenters({ unpaginated: true }),
          VendorPaymentService.getNextPaymentNumber(),
        ]);

        setVendors(vData.data || []);
        setAccounts(aData.data || []);
        setCostCenters(ccData.data || []);
        setPaymentNumber(
          (nextNumData as any)?.payment_number || (nextNumData as any)?.data?.payment_number || ''
        );
      } catch (error) {
        console.error('Failed to fetch data:', error);
        toast.error('Failed to load form data');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const fetchUnpaidInvoices = useCallback(async (vId: string) => {
    if (!vId) {
      setAllocations([]);
      return;
    }
    setIsFetchingInvoices(true);
    try {
      const response = await PurchaseInvoiceService.list({
        unpaginated: true,
        vendor_id: vId,
        exclude_status: 'PAID',
      });
      const invoices = response.data as PurchaseInvoice[];
      setAllocations(
        invoices.map((inv) => ({
          purchase_invoice_id: inv.id,
          invoice_number: inv.invoice_number,
          total_amount: inv.total_amount,
          paid_amount: inv.paid_amount || 0,
          outstanding_amount: inv.total_amount - (inv.paid_amount || 0),
          allocated_amount: 0,
        }))
      );
    } catch (error) {
      console.error('Failed to fetch invoices:', error);
      toast.error('Failed to load unpaid invoices');
    } finally {
      setIsFetchingInvoices(false);
    }
  }, []);

  useEffect(() => {
    if (vendorId) {
      fetchUnpaidInvoices(vendorId);
    }
  }, [vendorId, fetchUnpaidInvoices]);

  const totalAllocated = useMemo(() => {
    return allocations.reduce((sum, alloc) => sum + (Number(alloc.allocated_amount) || 0), 0);
  }, [allocations]);

  const handleAllocationChange = (index: number, value: number) => {
    const newAllocations = [...allocations];
    // Prevent allocating more than outstanding
    const max = newAllocations[index].outstanding_amount;
    const val = Math.min(Math.max(0, value), max);
    newAllocations[index].allocated_amount = val;
    setAllocations(newAllocations);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (totalAllocated <= 0) {
      toast.error('Please allocate at least some amount to an invoice');
      return;
    }
    setIsSubmitting(true);
    setErrors({});

    const payload = {
      vendor_id: Number(vendorId),
      account_id: Number(accountId),
      cost_center_id: Number(costCenterId),
      payment_method: paymentMethod,
      reference_number: referenceNumber,
      amount: totalAllocated,
      payment_date: paymentDate,
      notes: notes,
      allocations: allocations
        .filter((a) => a.allocated_amount > 0)
        .map((a) => ({
          purchase_invoice_id: a.purchase_invoice_id,
          allocated_amount: a.allocated_amount,
        })),
    };

    try {
      await VendorPaymentService.create(payload);
      toast.success('Vendor Payment recorded successfully');
      router.push('/vendor-payments');
    } catch (error: any) {
      if (isApiError(error)) {
        setErrors(error.response?.data?.errors || {});
        toast.error(error.response?.data?.message || 'Failed to create payment');
      } else {
        toast.error('Failed to create payment');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!hasPermission('create-vendor-payment')) return <div className="p-6">Access Denied</div>;

  return (
    <>
      <PageMeta title="Record Vendor Payment" description="Record a new vendor payment" />
      <PageBreadcrumb pageTitle="Record Vendor Payment" />

      <form onSubmit={handleSubmit} className="space-y-6">
        {isLoading ? (
          <SkeletonForm rows={3} columns={4} />
        ) : (
          <div className="p-6 border border-gray-200 rounded-2xl bg-white dark:bg-gray-900 dark:border-gray-800 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div>
                <Label required>Vendor</Label>
                <Select
                  options={vendors.map((v) => ({ value: String(v.id), label: v.name }))}
                  onChange={setVendorId}
                  defaultValue={vendorId}
                  placeholder="Select Vendor"
                  error={!!errors.vendor_id}
                  hint={errors.vendor_id?.[0]}
                />
              </div>
              <div>
                <Label required>Paid From (Account)</Label>
                <Select
                  options={accounts.map((a) => ({
                    value: String(a.id),
                    label: `${a.name} (${a.code})`,
                  }))}
                  onChange={setAccountId}
                  defaultValue={accountId}
                  placeholder="Select Account"
                  error={!!errors.account_id}
                  hint={errors.account_id?.[0]}
                />
              </div>
              <div>
                <Label required>Payment #</Label>
                <Input
                  required
                  value={paymentNumber}
                  onChange={(e) => setPaymentNumber(e.target.value)}
                  error={!!errors.payment_number}
                  hint={errors.payment_number?.[0]}
                />
              </div>
              <div>
                <Label required>Date</Label>
                <DatePicker
                  id="payment_date"
                  required
                  onChange={(_, dateStr) => setPaymentDate(dateStr)}
                  defaultDate={paymentDate}
                  error={!!errors.payment_date}
                  hint={errors.payment_date?.[0]}
                />
              </div>
              <div>
                <Label required>Payment Method</Label>
                <Select
                  options={[
                    { value: 'Bank Transfer', label: 'Bank Transfer' },
                    { value: 'Cash', label: 'Cash' },
                    { value: 'Cheque', label: 'Cheque' },
                    { value: 'Credit Card', label: 'Credit Card' },
                  ]}
                  onChange={setPaymentMethod}
                  defaultValue={paymentMethod}
                />
              </div>
              <div>
                <Label>Reference #</Label>
                <Input
                  value={referenceNumber}
                  onChange={(e) => setReferenceNumber(e.target.value)}
                  placeholder="e.g. Transaction ID"
                />
              </div>
              <div>
                <Label required>Cost Center</Label>
                <Select
                  options={costCenters.map((c) => ({ value: String(c.id), label: c.name }))}
                  onChange={setCostCenterId}
                  defaultValue={costCenterId}
                  placeholder="Select Cost Center"
                  error={!!errors.cost_center_id}
                  hint={errors.cost_center_id?.[0]}
                />
              </div>
            </div>

            <div className="mt-8">
              <Label>Notes</Label>
              <TextArea value={notes} onChange={setNotes} placeholder="Payment remarks..." />
            </div>

            <div className="mt-8">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                Invoice Allocations
                {isFetchingInvoices && (
                  <span className="text-xs font-normal text-gray-500 animate-pulse">
                    (Fetching...)
                  </span>
                )}
              </h3>

              <div className="overflow-x-auto border rounded-xl">
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-50 dark:bg-gray-800 border-b">
                    <tr>
                      <th className="px-4 py-3">Invoice #</th>
                      <th className="px-4 py-3 text-right">Total Amount</th>
                      <th className="px-4 py-3 text-right">Paid</th>
                      <th className="px-4 py-3 text-right">Outstanding</th>
                      <th className="px-4 py-3 text-right w-40">Amount to Pay</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {allocations.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-4 py-10 text-center text-gray-500 italic">
                          {vendorId
                            ? 'No outstanding invoices found for this vendor.'
                            : 'Select a vendor to see outstanding invoices.'}
                        </td>
                      </tr>
                    ) : (
                      allocations.map((alloc, idx) => (
                        <tr key={idx}>
                          <td className="px-4 py-4">{alloc.invoice_number}</td>
                          <td className="px-4 py-4 text-right">
                            {formatCurrency(alloc.total_amount)}
                          </td>
                          <td className="px-4 py-4 text-right text-gray-500">
                            {formatCurrency(alloc.paid_amount)}
                          </td>
                          <td className="px-4 py-4 text-right font-medium">
                            {formatCurrency(alloc.outstanding_amount)}
                          </td>
                          <td className="px-4 py-4 text-right">
                            <Input
                              type="number"
                              className="text-right font-bold text-brand-600"
                              value={alloc.allocated_amount}
                              onChange={(e) => handleAllocationChange(idx, Number(e.target.value))}
                              max={alloc.outstanding_amount}
                            />
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                  {allocations.length > 0 && (
                    <tfoot className="bg-gray-50 dark:bg-gray-800 font-bold">
                      <tr>
                        <td
                          colSpan={4}
                          className="px-4 py-4 text-right uppercase tracking-wider text-gray-500"
                        >
                          Total Payment
                        </td>
                        <td className="px-4 py-4 text-right text-lg text-brand-600 dark:text-brand-400">
                          {formatCurrency(totalAllocated)}
                        </td>
                      </tr>
                    </tfoot>
                  )}
                </table>
              </div>
            </div>

            <div className="mt-10 flex justify-end gap-3 border-t pt-6">
              <Button type="button" variant="outline" onClick={() => router.back()}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || totalAllocated <= 0}
                isLoading={isSubmitting}
              >
                Post Payment
              </Button>
            </div>
          </div>
        )}
      </form>
    </>
  );
}
