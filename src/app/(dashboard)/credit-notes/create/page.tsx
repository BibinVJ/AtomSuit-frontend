'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import PageMeta from '@/components/common/PageMeta';
import SkeletonForm from '@/components/common/SkeletonForm';
import { toast } from 'sonner';
import { getCustomers } from '@/services/CustomerService';
import { getItems } from '@/services/ItemService';
import { CreditNoteService } from '@/services/CreditNoteService';
import SalesInvoiceService from '@/services/SalesInvoiceService';
import { getCostCenters } from '@/services/CostCenterService';
import { getWarehouses } from '@/services/WarehouseService';
import { getTaxGroups } from '@/services/TaxService';
import { isApiError } from '@/utils/errors';
import {
  Item,
  Customer,
  DiscountType,
  CostCenter,
  Warehouse,
  TaxGroup,
  SalesInvoice,
  SalesInvoiceItem,
} from '@/types';
import { usePermissions } from '@/hooks/usePermissions';
import { useSettings } from '@/hooks/useSettings';
import Button from '@/components/ui/button/Button';
import Input from '@/components/form/input/InputField';
import Label from '@/components/form/Label';
import Select from '@/components/form/Select';
import TextArea from '@/components/form/input/TextArea';
import DatePicker from '@/components/form/date-picker';
import { Plus, Trash2 } from 'lucide-react';

interface CreditNoteItemInput {
  item_id: string;
  description: string;
  returned_quantity: number;
  unit_price: number;
  discount_type: DiscountType;
  discount_value: number;
  tax_group_id: string;
  sales_invoice_item_id?: number;
  is_stock_returned: boolean;
}

interface InvoiceOption {
  id: number;
  invoice_number: string;
}

const blankItem = (): CreditNoteItemInput => ({
  item_id: '',
  description: '',
  returned_quantity: 1,
  unit_price: 0,
  discount_type: 'percentage',
  discount_value: 0,
  tax_group_id: '',
  is_stock_returned: true,
});

export default function CreateCreditNote() {
  const { hasPermission } = usePermissions();
  const router = useRouter();
  const searchParams = useSearchParams();
  // When launched from a specific SI ("Create Credit Note" action) the invoice is fixed.
  const paramInvoiceId = searchParams.get('sales_invoice_id');
  const { formatCurrency } = useSettings();

  // Form State
  const [customerId, setCustomerId] = useState('');
  const [selectedInvoiceId, setSelectedInvoiceId] = useState(paramInvoiceId ?? '');
  const [creditNoteNumber, setCreditNoteNumber] = useState('');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [creditNoteDate, setCreditNoteDate] = useState(new Date().toISOString().split('T')[0]);
  const [costCenterId, setCostCenterId] = useState('');
  const [warehouseId, setWarehouseId] = useState('');
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState<CreditNoteItemInput[]>([blankItem()]);

  // Data State
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [availableItems, setAvailableItems] = useState<Item[]>([]);
  const [costCenters, setCostCenters] = useState<CostCenter[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [taxGroups, setTaxGroups] = useState<TaxGroup[]>([]);
  const [customerInvoices, setCustomerInvoices] = useState<InvoiceOption[]>([]);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingInvoice, setIsLoadingInvoice] = useState(false);

  // The credit note is invoice-driven once an invoice is chosen (via dropdown or URL param).
  const isInvoiceDriven = !!selectedInvoiceId;
  // When arriving from a specific SI, the customer + invoice are fixed and cannot be changed.
  const isParamLocked = !!paramInvoiceId;

  // Map a fetched Sales Invoice into the credit-note form (items + locked cost center).
  const applyInvoice = useCallback((invoice: SalesInvoice) => {
    setSelectedInvoiceId(String(invoice.id));
    setCustomerId(String(invoice.customer_id));
    setCostCenterId(invoice.cost_center_id ? String(invoice.cost_center_id) : '');
    setItems(
      (invoice.items ?? []).map((siItem: SalesInvoiceItem) => ({
        item_id: String(siItem.item_id),
        description: siItem.description || '',
        returned_quantity: siItem.quantity,
        unit_price: siItem.unit_price,
        discount_type: siItem.discount_type,
        discount_value: siItem.discount_value,
        tax_group_id: siItem.tax_group_id ? String(siItem.tax_group_id) : '',
        sales_invoice_item_id: siItem.id,
        is_stock_returned: true,
      }))
    );
  }, []);

  const fetchCustomerInvoices = useCallback(async (cId: string) => {
    if (!cId) {
      setCustomerInvoices([]);
      return;
    }
    try {
      const res = await SalesInvoiceService.list({
        unpaginated: true,
        customer_id: cId,
        exclude_status: 'VOIDED',
      });
      setCustomerInvoices((res.data as InvoiceOption[]) || []);
    } catch (error) {
      console.error('Failed to fetch customer invoices:', error);
      toast.error('Failed to load invoices for this customer');
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [cData, iData, ccData, wData, nextNumData, tgData] = await Promise.all([
          getCustomers({ unpaginated: true }),
          getItems({ unpaginated: true }),
          getCostCenters({ unpaginated: true }),
          getWarehouses({ unpaginated: true }),
          CreditNoteService.getNextCreditNoteNumber(),
          getTaxGroups({ unpaginated: true }),
        ]);

        setCustomers(cData.data || []);
        setAvailableItems(iData.data || []);
        setCostCenters(ccData.data || []);
        setWarehouses(wData.data || []);
        setCreditNoteNumber(
          (nextNumData as Record<string, string>)?.credit_note_number ||
            (nextNumData as { data?: { credit_note_number?: string } })?.data?.credit_note_number ||
            ''
        );
        setTaxGroups(tgData.data || []);

        // Launched against a specific SI: load it, populate, and load the customer's invoice list.
        if (paramInvoiceId) {
          const invoice = await SalesInvoiceService.get(paramInvoiceId);
          applyInvoice(invoice);
          await fetchCustomerInvoices(String(invoice.customer_id));
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
        toast.error('Failed to load form data');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [paramInvoiceId, applyInvoice, fetchCustomerInvoices]);

  const handleCustomerChange = (newCustomerId: string) => {
    setCustomerId(newCustomerId);
    // Reset the invoice-driven selection when the customer changes.
    setSelectedInvoiceId('');
    setCostCenterId('');
    setItems([blankItem()]);
    setCustomerInvoices([]);
    if (newCustomerId) fetchCustomerInvoices(newCustomerId);
  };

  const handleInvoiceChange = async (invoiceId: string) => {
    if (!invoiceId) {
      setSelectedInvoiceId('');
      setCostCenterId('');
      setItems([blankItem()]);
      return;
    }
    setIsLoadingInvoice(true);
    try {
      const invoice = await SalesInvoiceService.get(invoiceId);
      applyInvoice(invoice);
    } catch (error) {
      console.error('Failed to load invoice:', error);
      toast.error('Failed to load the selected invoice');
    } finally {
      setIsLoadingInvoice(false);
    }
  };

  const handleAddItem = () => setItems([...items, blankItem()]);

  const handleRemoveItem = (index: number) => {
    if (items.length > 1) setItems(items.filter((_, i) => i !== index));
  };

  const handleItemChange = (
    index: number,
    field: keyof CreditNoteItemInput,
    value: string | number | boolean
  ) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value } as CreditNoteItemInput;

    if (field === 'item_id' && value) {
      const item = availableItems.find((i) => String(i.id) === String(value));
      if (item) {
        newItems[index].description = item.description || '';
        newItems[index].tax_group_id = item.tax_group?.id ? String(item.tax_group.id) : '';

        const prices = (item.item_prices || []) as {
          price: number;
          price_list?: { type?: string };
        }[];
        const salesPrice = prices.find((p) => p.price_list?.type === 'sales');
        if (salesPrice) {
          newItems[index].unit_price = Number(salesPrice.price);
        }
      }
    }
    setItems(newItems);
  };

  const calculateItemTotals = (item: CreditNoteItemInput) => {
    const quantity = Number(item.returned_quantity) || 0;
    const price = Number(item.unit_price) || 0;
    const subtotal = quantity * price;

    let discountAmount = 0;
    if (item.discount_type === 'percentage') {
      discountAmount = subtotal * (Number(item.discount_value) / 100);
    } else {
      discountAmount = Number(item.discount_value);
    }

    const taxableAmount = subtotal - discountAmount;
    const taxGroup = taxGroups.find((tg) => String(tg.id) === item.tax_group_id);

    let taxAmount = 0;
    const taxBreakdown: { name: string; rate: number; amount: number }[] = [];
    if (taxGroup?.tax_rates) {
      taxGroup.tax_rates.forEach((rate) => {
        const amount = taxableAmount * (Number(rate.rate) / 100);
        taxAmount += amount;
        taxBreakdown.push({ name: rate.name, rate: Number(rate.rate), amount });
      });
    }

    return { subtotal, discountAmount, taxAmount, taxBreakdown, total: taxableAmount + taxAmount };
  };

  const orderTotals = useMemo(() => {
    return items.reduce(
      (acc, item) => {
        const totals = calculateItemTotals(item);
        acc.subtotal += totals.subtotal;
        acc.discountTotal += totals.discountAmount;
        acc.taxTotal += totals.taxAmount;
        acc.total += totals.total;
        return acc;
      },
      { subtotal: 0, discountTotal: 0, taxTotal: 0, total: 0 }
    );
  }, [items, taxGroups]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});

    const payload = {
      customer_id: Number(customerId),
      sales_invoice_id: selectedInvoiceId ? Number(selectedInvoiceId) : undefined,
      credit_note_number: creditNoteNumber,
      reference_number: referenceNumber,
      credit_note_date: creditNoteDate,
      cost_center_id: Number(costCenterId),
      // Omit rather than send 0 when unset, so the backend answers "required" (it is, once a
      // line returns stock) instead of "the selected warehouse is invalid".
      warehouse_id: warehouseId ? Number(warehouseId) : undefined,
      notes: notes,
      items: items.map((item) => ({
        item_id: Number(item.item_id),
        sales_invoice_item_id: item.sales_invoice_item_id,
        description: item.description,
        returned_quantity: Number(item.returned_quantity),
        unit_price: Number(item.unit_price),
        discount_type: item.discount_type,
        discount_value: Number(item.discount_value),
        tax_group_id: item.tax_group_id ? Number(item.tax_group_id) : undefined,
        is_stock_returned: item.is_stock_returned,
      })),
    };

    try {
      await CreditNoteService.create(payload);
      toast.success('Credit Note created successfully');
      router.push('/credit-notes');
    } catch (error: unknown) {
      if (isApiError(error)) {
        setErrors(error.response?.data?.errors || {});
        toast.error(error.response?.data?.message || 'Failed to create Credit Note');
      } else {
        toast.error('Failed to create Credit Note');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!hasPermission('create-credit-note')) return <div className="p-6">Access Denied</div>;

  return (
    <>
      <PageMeta title="Create Credit Note" description="Create a new credit note" />
      <PageBreadcrumb pageTitle="Create Credit Note" />

      <form onSubmit={handleSubmit} className="space-y-6">
        {isLoading ? (
          <SkeletonForm rows={3} columns={4} />
        ) : (
          <div className="p-6 border border-gray-200 rounded-2xl bg-white dark:bg-gray-900 dark:border-gray-800 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div>
                <Label required>Customer</Label>
                <Select
                  options={customers.map((c) => ({ value: String(c.id), label: c.name }))}
                  onChange={handleCustomerChange}
                  value={customerId}
                  placeholder="Select Customer"
                  disabled={isParamLocked}
                  error={!!errors.customer_id}
                  hint={errors.customer_id?.[0]}
                />
              </div>
              <div>
                <Label required>Against Invoice</Label>
                <Select
                  options={customerInvoices.map((inv) => ({
                    value: String(inv.id),
                    label: inv.invoice_number,
                  }))}
                  onChange={handleInvoiceChange}
                  value={selectedInvoiceId}
                  placeholder={customerId ? 'Select Invoice' : 'Select a customer first'}
                  disabled={isParamLocked || !customerId}
                  error={!!errors.sales_invoice_id}
                  hint={errors.sales_invoice_id?.[0]}
                />
              </div>
              <div>
                <Label required>Credit Note #</Label>
                <Input
                  required
                  value={creditNoteNumber}
                  onChange={(e) => setCreditNoteNumber(e.target.value)}
                  error={!!errors.credit_note_number}
                  hint={errors.credit_note_number?.[0]}
                />
              </div>
              <div>
                <Label required>Date</Label>
                <DatePicker
                  id="credit_note_date"
                  required
                  onChange={(_, dateStr) => setCreditNoteDate(dateStr)}
                  defaultDate={creditNoteDate}
                  error={!!errors.credit_note_date}
                  hint={errors.credit_note_date?.[0]}
                />
              </div>
              <div>
                <Label>Reference #</Label>
                <Input
                  value={referenceNumber}
                  onChange={(e) => setReferenceNumber(e.target.value)}
                  placeholder="e.g. Return ID"
                />
              </div>
              <div>
                <Label required>Warehouse</Label>
                <Select
                  options={warehouses.map((w) => ({ value: String(w.id), label: w.name }))}
                  onChange={setWarehouseId}
                  value={warehouseId}
                  placeholder="Select Warehouse"
                  error={!!errors.warehouse_id}
                  hint={errors.warehouse_id?.[0]}
                />
              </div>
              <div>
                <Label required>Cost Center</Label>
                <Select
                  options={costCenters.map((c) => ({ value: String(c.id), label: c.name }))}
                  onChange={setCostCenterId}
                  value={costCenterId}
                  placeholder="Select Cost Center"
                  disabled={isInvoiceDriven}
                  error={!!errors.cost_center_id}
                  hint={errors.cost_center_id?.[0]}
                />
              </div>
              <div className="md:col-span-2">
                <Label>Notes</Label>
                <TextArea value={notes} onChange={setNotes} placeholder="Reason for return..." />
              </div>
            </div>

            <div className="mt-8 flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold flex items-center gap-2">
                Items
                {isLoadingInvoice && (
                  <span className="text-xs font-normal text-gray-500 animate-pulse">
                    (Loading invoice…)
                  </span>
                )}
              </h3>
              {!isInvoiceDriven && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddItem}
                  startIcon={<Plus className="w-4 h-4" />}
                >
                  Add Item
                </Button>
              )}
            </div>

            {isInvoiceDriven && (
              <p className="mb-3 text-xs text-gray-500">
                Items and cost center are taken from the selected invoice. Choose a return warehouse
                and adjust the return quantity as needed.
              </p>
            )}

            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                    <th className="px-4 py-3 font-bold text-gray-700 dark:text-gray-300">Item *</th>
                    <th className="px-4 py-3 font-bold text-gray-700 dark:text-gray-300">Qty *</th>
                    <th className="px-4 py-3 font-bold text-gray-700 dark:text-gray-300">
                      Price *
                    </th>
                    <th className="px-4 py-3 font-bold text-gray-700 dark:text-gray-300">Tax</th>
                    <th className="px-4 py-3 font-bold text-gray-700 dark:text-gray-300 text-center">
                      Return Stock
                    </th>
                    <th className="px-4 py-3 font-bold text-gray-700 dark:text-gray-300 text-right">
                      Total
                    </th>
                    <th className="px-4 py-3 text-center"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {items.map((item, idx) => {
                    const totals = calculateItemTotals(item);
                    return (
                      <tr key={idx} className="group">
                        <td className="px-4 py-4 min-w-[200px]">
                          <Select
                            options={availableItems.map((i) => ({
                              value: String(i.id),
                              label: i.name,
                            }))}
                            onChange={(val) => handleItemChange(idx, 'item_id', val)}
                            value={item.item_id}
                            placeholder="Select Item"
                            disabled={isInvoiceDriven}
                          />
                        </td>
                        <td className="px-4 py-4 w-24 align-top">
                          <Input
                            type="number"
                            value={item.returned_quantity}
                            onChange={(e) =>
                              handleItemChange(idx, 'returned_quantity', Number(e.target.value))
                            }
                            error={!!errors[`items.${idx}.returned_quantity`]}
                            hint={errors[`items.${idx}.returned_quantity`]?.[0]}
                          />
                        </td>
                        <td className="px-4 py-4 w-32 align-top">
                          <Input
                            type="number"
                            value={item.unit_price}
                            onChange={(e) =>
                              handleItemChange(idx, 'unit_price', Number(e.target.value))
                            }
                            error={!!errors[`items.${idx}.unit_price`]}
                            hint={errors[`items.${idx}.unit_price`]?.[0]}
                          />
                        </td>
                        <td className="px-4 py-4 w-40 align-top">
                          {/* Tax is derived from the item / invoice line — read-only, like the SI screen. */}
                          {totals.taxBreakdown.length > 0 ? (
                            <div className="space-y-0.5">
                              {totals.taxBreakdown.map((tb, ti) => (
                                <div
                                  key={ti}
                                  className="flex justify-between gap-2 text-xs text-gray-600 dark:text-gray-400 whitespace-nowrap"
                                >
                                  <span>{tb.name}</span>
                                  <span>{tb.rate}%</span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <span className="text-xs text-gray-400">—</span>
                          )}
                        </td>
                        <td className="px-4 py-4 text-center">
                          <input
                            type="checkbox"
                            checked={item.is_stock_returned}
                            onChange={(e) =>
                              handleItemChange(idx, 'is_stock_returned', e.target.checked)
                            }
                            className="w-4 h-4 text-brand-600 bg-gray-100 border-gray-300 rounded focus:ring-brand-500 dark:focus:ring-brand-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                          />
                        </td>
                        <td className="px-4 py-4 text-right font-medium">
                          {formatCurrency(totals.total)}
                        </td>
                        <td className="px-4 py-4 text-center">
                          {!isInvoiceDriven && (
                            <button
                              type="button"
                              onClick={() => handleRemoveItem(idx)}
                              className="text-gray-400 hover:text-red-500 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {errors.items && <p className="mt-2 text-sm text-red-500">{errors.items[0]}</p>}

            <div className="mt-8 flex justify-end">
              <div className="w-full max-w-sm space-y-3">
                <div className="flex justify-between px-4 py-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <span className="font-bold text-gray-500">TOTAL</span>
                  <span className="text-xl font-black text-brand-600 dark:text-brand-400">
                    {formatCurrency(orderTotals.total)}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-10 flex justify-end gap-3 border-t pt-6">
              <Button type="button" variant="outline" onClick={() => router.back()}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting} isLoading={isSubmitting}>
                Save Credit Note
              </Button>
            </div>
          </div>
        )}
      </form>
    </>
  );
}
