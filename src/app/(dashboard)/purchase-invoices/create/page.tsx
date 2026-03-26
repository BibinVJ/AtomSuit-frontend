'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import PageMeta from '@/components/common/PageMeta';
import { toast } from 'sonner';
import { getVendors } from '@/services/VendorService';
import { getItems } from '@/services/ItemService';
import { PurchaseInvoiceService } from '@/services/PurchaseInvoiceService';
import { getCostCenters } from '@/services/CostCenterService';
import { getWarehouses } from '@/services/WarehouseService';
import { getTaxGroups } from '@/services/TaxService';
import { isApiError } from '@/utils/errors';
import { Item, Vendor, DiscountType, CostCenter, Warehouse, TaxGroup } from '@/types';
import { usePermissions } from '@/hooks/usePermissions';
import { useSettings } from '@/hooks/useSettings';
import Button from '@/components/ui/button/Button';
import Input from '@/components/form/input/InputField';
import Label from '@/components/form/Label';
import Select from '@/components/form/Select';
import TextArea from '@/components/form/input/TextArea';
import DatePicker from '@/components/form/date-picker';
import { Trash2, Plus } from 'lucide-react';

interface PurchaseInvoiceItemInput {
  item_id: string;
  description: string;
  quantity: number;
  unit_price: number;
  discount_type: DiscountType;
  discount_value: number;
  tax_group_id: string;
}

export default function CreatePurchaseInvoice() {
  const { hasPermission } = usePermissions();
  const router = useRouter();
  const { getSetting, formatCurrency } = useSettings();

  // Form State
  const [vendorId, setVendorId] = useState('');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [postingDate, setPostingDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState(new Date().toISOString().split('T')[0]);
  const [costCenterId, setCostCenterId] = useState('');
  const [warehouseId, setWarehouseId] = useState('');
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState<PurchaseInvoiceItemInput[]>([
    {
      item_id: '',
      description: '',
      quantity: 1,
      unit_price: 0,
      discount_type: 'percentage',
      discount_value: 0,
      tax_group_id: '',
    },
  ]);

  // Data State
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [availableItems, setAvailableItems] = useState<Item[]>([]);
  const [costCenters, setCostCenters] = useState<CostCenter[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [taxGroups, setTaxGroups] = useState<TaxGroup[]>([]);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [vData, iData, ccData, wData, nextNumData, tgData] = await Promise.all([
          getVendors({ unpaginated: true }),
          getItems({ unpaginated: true }),
          getCostCenters({ unpaginated: true }),
          getWarehouses({ unpaginated: true }),
          PurchaseInvoiceService.getNextInvoiceNumber(),
          getTaxGroups({ unpaginated: true }),
        ]);
        setVendors(vData.data || []);
        setAvailableItems(iData.data || []);
        setCostCenters(ccData.data || []);
        setWarehouses(wData.data || []);
        setInvoiceNumber(nextNumData?.invoice_number || '');
        setTaxGroups(tgData.data || []);
      } catch (error) {
        console.error('Failed to fetch data:', error);
        toast.error('Failed to load form data');
      }
    };
    fetchData();
  }, []);

  const selectedVendor = useMemo(
    () => vendors.find((v) => String(v.id) === vendorId),
    [vendors, vendorId]
  );

  const handleAddItem = () => {
    setItems([
      ...items,
      {
        item_id: '',
        description: '',
        quantity: 1,
        unit_price: 0,
        discount_type: 'percentage',
        discount_value: 0,
        tax_group_id: '',
      },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const handleItemChange = (
    index: number,
    field: keyof PurchaseInvoiceItemInput,
    value: string | number
  ) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };

    if (field === 'item_id') {
      const item = availableItems.find((i) => String(i.id) === value);
      if (item) {
        newItems[index].description = item.description || '';
        newItems[index].unit_price = 0;
        newItems[index].tax_group_id = item.tax_group?.id ? String(item.tax_group.id) : '';
      }
    }

    setItems(newItems);
  };

  const calculateItemTotals = (item: PurchaseInvoiceItemInput) => {
    const quantity = Number(item.quantity) || 0;
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

    return {
      subtotal,
      discountAmount,
      taxableAmount,
      taxAmount,
      taxBreakdown,
      total: taxableAmount + taxAmount,
    };
  };

  const orderTotals = useMemo(() => {
    return items.reduce(
      (acc, item) => {
        const totals = calculateItemTotals(item);
        acc.subtotal += totals.subtotal;
        acc.discountTotal += totals.discountAmount;
        acc.taxTotal += totals.taxAmount;
        acc.total += totals.total;

        totals.taxBreakdown.forEach((tb) => {
          const existing = acc.taxBreakdown.find((etc) => etc.name === tb.name);
          if (existing) {
            existing.amount += tb.amount;
          } else {
            acc.taxBreakdown.push({ ...tb });
          }
        });

        return acc;
      },
      {
        subtotal: 0,
        discountTotal: 0,
        taxTotal: 0,
        total: 0,
        taxBreakdown: [] as { name: string; rate: number; amount: number }[],
      }
    );
  }, [items, taxGroups]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});

    const payload = {
      vendor_id: Number(vendorId),
      invoice_number: invoiceNumber,
      reference_number: referenceNumber,
      posting_date: postingDate,
      due_date: dueDate,
      cost_center_id: Number(costCenterId),
      warehouse_id: Number(warehouseId),
      notes: notes,
      items: items.map((item) => ({
        item_id: Number(item.item_id),
        description: item.description,
        quantity: Number(item.quantity),
        unit_price: Number(item.unit_price),
        discount_type: item.discount_type,
        discount_value: Number(item.discount_value),
        tax_group_id: item.tax_group_id ? Number(item.tax_group_id) : undefined,
      })),
    };

    try {
      await PurchaseInvoiceService.create(payload);
      toast.success('Purchase Invoice created successfully');
      router.push('/purchase-invoices');
    } catch (error: unknown) {
      let message = 'Failed to create Purchase Invoice';
      if (isApiError(error)) {
        setErrors(error.response?.data?.errors || {});
        message = error.response?.data?.message || message;
      }
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!hasPermission('create-purchase-invoice')) {
    return <div className="p-6 text-center">Access Denied</div>;
  }

  const getErrorMessage = (field: string) => errors[field]?.[0];
  const currencySymbol = getSetting('currency_symbol', '$');

  return (
    <>
      <PageMeta title="Create Purchase Invoice" description="Create a new purchase invoice" />
      <PageBreadcrumb pageTitle="Create Purchase Invoice" />

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="p-6 border border-gray-200 rounded-2xl bg-white dark:bg-gray-900 dark:border-gray-800 shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-x-6 gap-y-4">
            {/* Row 1, Column 1: Vendor Select */}
            <div className="lg:col-span-1">
              <Label required>Vendor</Label>
              <Select
                options={vendors.map((v) => ({ value: String(v.id), label: v.name }))}
                onChange={(val) => {
                  setVendorId(val);
                  setErrors((prev) => {
                    const newErrors = { ...prev };
                    delete newErrors.vendor_id;
                    return newErrors;
                  });
                }}
                defaultValue={vendorId}
                placeholder="Select Vendor"
                error={!!getErrorMessage('vendor_id')}
                hint={getErrorMessage('vendor_id')}
              />
            </div>

            {/* Row 1, Column 2: Invoice Number */}
            <div className="lg:col-span-1">
              <Label required>Invoice #</Label>
              <Input
                required
                value={invoiceNumber}
                onChange={(e) => {
                  setInvoiceNumber(e.target.value);
                  setErrors((prev) => {
                    const newErrors = { ...prev };
                    delete newErrors.invoice_number;
                    return newErrors;
                  });
                }}
                error={!!getErrorMessage('invoice_number')}
                hint={getErrorMessage('invoice_number')}
              />
            </div>

            {/* Row 1, Column 3: Posting Date */}
            <div className="lg:col-span-1">
              <Label required>Posting Date</Label>
              <DatePicker
                id="posting_date"
                required
                onChange={(_, dateStr) => {
                  setPostingDate(dateStr);
                  setErrors((prev) => {
                    const newErrors = { ...prev };
                    delete newErrors.posting_date;
                    return newErrors;
                  });
                }}
                defaultDate={postingDate}
                error={!!getErrorMessage('posting_date')}
                hint={getErrorMessage('posting_date')}
              />
            </div>

            {/* Row 1, Column 4: Due Date */}
            <div className="lg:col-span-1">
              <Label required>Due Date</Label>
              <DatePicker
                id="due_date"
                required
                onChange={(_, dateStr) => {
                  setDueDate(dateStr);
                  setErrors((prev) => {
                    const newErrors = { ...prev };
                    delete newErrors.due_date;
                    return newErrors;
                  });
                }}
                defaultDate={dueDate}
                error={!!getErrorMessage('due_date')}
                hint={getErrorMessage('due_date')}
              />
            </div>

            {/* Row 2 & 3, Column 1: Vendor Details */}
            <div className="lg:col-span-1 lg:row-span-2 min-h-[100px]">
              {selectedVendor && (
                <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700 text-xs animate-in fade-in duration-300 h-full">
                  <h4 className="font-bold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wider text-[10px]">
                    Vendor Info
                  </h4>
                  <div className="space-y-1 text-gray-600 dark:text-gray-400">
                    <p className="flex items-center gap-2">
                      <span className="font-semibold w-10 underline decoration-gray-300 dark:decoration-gray-600">
                        Email:
                      </span>{' '}
                      {selectedVendor.email || 'N/A'}
                    </p>
                    <p className="flex items-center gap-2">
                      <span className="font-semibold w-10 underline decoration-gray-300 dark:decoration-gray-600">
                        Phone:
                      </span>{' '}
                      {selectedVendor.phone || 'N/A'}
                    </p>
                    <div className="flex gap-2 mt-2 pt-2 border-t border-gray-200 dark:border-gray-700 text-[11px]">
                      <span className="font-semibold w-10 flex-shrink-0 underline decoration-gray-300 dark:decoration-gray-600">
                        Addr:
                      </span>
                      <p className="italic leading-tight">
                        {[
                          selectedVendor.billing_address_line_1,
                          selectedVendor.billing_address_line_2,
                          selectedVendor.billing_city,
                          selectedVendor.billing_state,
                          selectedVendor.billing_zip_code,
                          selectedVendor.billing_country,
                        ]
                          .filter(Boolean)
                          .join(', ') || 'No address provided'}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Row 2, Column 2: Warehouse */}
            <div className="lg:col-span-1">
              <Label required>Warehouse</Label>
              <Select
                options={warehouses.map((w) => ({ value: String(w.id), label: w.name }))}
                onChange={(val) => {
                  setWarehouseId(val);
                  setErrors((prev) => {
                    const newErrors = { ...prev };
                    delete newErrors.warehouse_id;
                    return newErrors;
                  });
                }}
                defaultValue={warehouseId}
                placeholder="Select Warehouse"
                error={!!getErrorMessage('warehouse_id')}
                hint={getErrorMessage('warehouse_id')}
              />
            </div>

            {/* Row 2, Column 3: Cost Center */}
            <div className="lg:col-span-1">
              <Label required>Cost Center</Label>
              <Select
                options={costCenters.map((c) => ({ value: String(c.id), label: c.name }))}
                onChange={(val) => {
                  setCostCenterId(val);
                  setErrors((prev) => {
                    const newErrors = { ...prev };
                    delete newErrors.cost_center_id;
                    return newErrors;
                  });
                }}
                defaultValue={costCenterId}
                placeholder="Select Cost Center"
                error={!!getErrorMessage('cost_center_id')}
                hint={getErrorMessage('cost_center_id')}
              />
            </div>

            {/* Row 2, Column 4: Reference Number */}
            <div className="lg:col-span-1">
              <Label>Reference #</Label>
              <Input
                value={referenceNumber}
                onChange={(e) => {
                  setReferenceNumber(e.target.value);
                }}
                placeholder="e.g. Vendor Invoice #"
                error={!!getErrorMessage('reference_number')}
                hint={getErrorMessage('reference_number')}
              />
            </div>

            {/* Row 3, Columns 2 & 3: Notes (Last Row) */}
            <div className="lg:col-span-2 lg:col-start-2">
              <Label>Notes</Label>
              <TextArea
                value={notes}
                onChange={(val) => setNotes(val)}
                placeholder="Internal notes..."
                className="min-h-[100px]"
              />
            </div>
          </div>

          <div className="flex items-center justify-between mt-8 mb-4">
            <h3 className="text-xl font-bold dark:text-white">Items</h3>
            <Button type="button" variant="outline" onClick={handleAddItem} className="gap-2">
              <Plus className="w-4 h-4" />
              Add Item
            </Button>
          </div>

          <div className="space-y-4">
            {/* Table Headers */}
            <div className="grid grid-cols-[2.5fr_1.5fr_1.5fr_1.5fr_0.8fr_1.2fr] gap-x-4 px-4 py-3 mb-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg items-end">
              <div className="uppercase text-theme-xs font-bold tracking-wider text-gray-500">
                Items *
              </div>
              <div className="text-center uppercase text-theme-xs font-bold tracking-wider text-gray-500">
                Quantity *
              </div>
              <div className="text-center uppercase text-theme-xs font-bold tracking-wider text-gray-500">
                Price *
              </div>
              <div className="text-center uppercase text-theme-xs font-bold tracking-wider text-gray-500">
                Discount (% / Fixed)
              </div>
              <div className="text-center uppercase text-theme-xs font-bold tracking-wider text-gray-500">
                Tax (%)
              </div>
              <div className="text-end">
                <div className="uppercase text-theme-xs font-bold tracking-wider text-gray-500">
                  Amount
                </div>
                <div className="text-[10px] font-bold text-red-500 uppercase tracking-tight leading-none mt-1">
                  After Tax & Discount
                </div>
              </div>
            </div>

            {items.map((item, index) => {
              const totals = calculateItemTotals(item);
              return (
                <div key={index} className="group relative">
                  <div className="grid grid-cols-[2.5fr_1.5fr_1.5fr_1.5fr_0.8fr_1.2fr] gap-x-4 items-start px-1">
                    {/* Item Select */}
                    <div>
                      <Select
                        options={availableItems.map((i) => ({
                          value: String(i.id),
                          label: i.name,
                        }))}
                        onChange={(val) => handleItemChange(index, 'item_id', val)}
                        defaultValue={item.item_id}
                        placeholder="Search item..."
                        error={!!getErrorMessage(`items.${index}.item_id`)}
                      />
                    </div>

                    {/* Quantity */}
                    <div className="min-w-0 overflow-hidden">
                      <Input
                        type="number"
                        value={item.quantity}
                        onChange={(e) =>
                          handleItemChange(index, 'quantity', Number(e.target.value))
                        }
                        className="px-1"
                        placeholder="0"
                      />
                    </div>

                    {/* Price */}
                    <div className="min-w-0 overflow-hidden">
                      <Input
                        type="number"
                        value={item.unit_price}
                        onChange={(e) =>
                          handleItemChange(index, 'unit_price', Number(e.target.value))
                        }
                        className="px-1"
                        placeholder="0.00"
                        suffix={currencySymbol}
                      />
                    </div>

                    {/* Discount */}
                    <div className="min-w-0 overflow-hidden">
                      <div className="flex min-w-0 [&>div]:min-w-0 [&>div]:flex-1">
                        <Input
                          type="number"
                          value={item.discount_value}
                          onChange={(e) =>
                            handleItemChange(index, 'discount_value', Number(e.target.value))
                          }
                          className="rounded-r-none border-r-0 px-1"
                          placeholder="0"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            handleItemChange(
                              index,
                              'discount_type',
                              item.discount_type === 'percentage' ? 'fixed' : 'percentage'
                            )
                          }
                          className="flex-shrink-0 flex items-center gap-1.5 px-2.5 border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 rounded-r-lg text-theme-xs font-bold text-blue-600 dark:text-blue-400 justify-center hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all cursor-pointer h-11 min-w-[45px] shadow-sm active:scale-95 group"
                          title={`Switch to ${item.discount_type === 'percentage' ? 'fixed' : 'percentage'} discount`}
                        >
                          <span className="group-hover:scale-110 transition-transform">
                            {item.discount_type === 'percentage' ? '%' : currencySymbol}
                          </span>
                          <svg
                            className="w-3 h-3 text-gray-400 group-hover:text-blue-500 transition-colors"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2.5"
                              d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>

                    {/* Tax Group */}
                    <div className="flex items-center justify-center">
                      <Select
                        options={taxGroups.map((tg) => ({ value: String(tg.id), label: tg.name }))}
                        onChange={(val) => handleItemChange(index, 'tax_group_id', val)}
                        defaultValue={item.tax_group_id}
                        placeholder="Tax"
                        className="text-xs"
                      />
                    </div>

                    {/* Result Amount */}
                    <div className="text-end self-center">
                      <p className="text-lg font-bold text-gray-800 dark:text-white">
                        {formatCurrency(totals.total)}
                      </p>
                    </div>
                  </div>

                  {/* Description Row */}
                  <div className="mt-4 max-w-[40%] flex gap-4">
                    <TextArea
                      value={item.description}
                      onChange={(val) => handleItemChange(index, 'description', val)}
                      placeholder="Line description..."
                      className="min-h-[40px] py-2"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(index)}
                      className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                      title="Remove Item"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex justify-end mt-8">
            <div className="w-full max-w-sm space-y-3">
              <div className="flex justify-between items-center px-4">
                <span className="text-gray-500 font-bold uppercase text-theme-xs text-start">
                  Sub Total
                </span>
                <span className="font-bold text-gray-900 dark:text-white">
                  {formatCurrency(orderTotals.subtotal)}
                </span>
              </div>
              <div className="flex justify-between items-center px-4">
                <span className="text-gray-500 font-bold uppercase text-theme-xs">Discount</span>
                <span className="font-bold text-gray-900 dark:text-white">
                  -{formatCurrency(orderTotals.discountTotal)}
                </span>
              </div>
              {orderTotals.taxBreakdown.map((tb, idx) => (
                <div key={idx} className="flex justify-between items-center px-4">
                  <span className="text-gray-500 font-bold uppercase text-theme-xs">{tb.name}</span>
                  <span className="font-bold text-gray-900 dark:text-white">
                    +{formatCurrency(tb.amount)}
                  </span>
                </div>
              ))}
              <div className="flex justify-between items-center px-4 pt-3 border-t border-gray-100 dark:border-gray-800">
                <span className="text-gray-900 dark:text-white font-black uppercase text-sm">
                  Net Total
                </span>
                <span className="font-black text-2xl text-brand-600 dark:text-brand-400">
                  {formatCurrency(orderTotals.total)}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3">
          <Button variant="outline" type="button" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Creating...' : 'Create Purchase Invoice'}
          </Button>
        </div>
      </form>
    </>
  );
}
