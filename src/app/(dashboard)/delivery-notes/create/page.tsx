'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import PageMeta from '@/components/common/PageMeta';
import SkeletonForm from '@/components/common/SkeletonForm';
import { toast } from 'sonner';
import { getCustomers } from '@/services/CustomerService';
import { getItems } from '@/services/ItemService';
import { DeliveryNoteService } from '@/services/DeliveryNoteService';
import { getSalesOrder } from '@/services/SalesOrderService';
import { getCostCenters } from '@/services/CostCenterService';
import { getWarehouses } from '@/services/WarehouseService';
import { getTaxGroups } from '@/services/TaxService';
import { isApiError } from '@/utils/errors';
import { remapItemErrorIndices, selectedRowIndices } from '@/utils/conversionSelection';
import { Item, Customer, DiscountType, CostCenter, Warehouse, TaxGroup } from '@/types';
import { usePermissions } from '@/hooks/usePermissions';
import { useSettings } from '@/hooks/useSettings';
import Button from '@/components/ui/button/Button';
import Checkbox from '@/components/form/input/Checkbox';
import Input from '@/components/form/input/InputField';
import Label from '@/components/form/Label';
import Select from '@/components/form/Select';
import TextArea from '@/components/form/input/TextArea';
import DatePicker from '@/components/form/date-picker';
import { Plus } from 'lucide-react';
import NProgress from 'nprogress';

interface DeliveryNoteItemInput {
  item_id: string;
  description: string;
  dispatched_quantity: number;
  unit_price: number;
  discount_type: DiscountType;
  discount_value: number;
  tax_group_id: string;
  sales_order_item_id?: number;
  // SO conversion tracking (read-only display)
  ordered_quantity?: number;
  already_delivered?: number;
  // Conversion screens only: unchecked lines are left out of the document entirely.
  selected: boolean;
}

export default function CreateDeliveryNote() {
  const { hasPermission } = usePermissions();
  const router = useRouter();
  const searchParams = useSearchParams();
  const salesOrderId = searchParams.get('sales_order_id');
  const isConverting = !!salesOrderId;
  const { getSetting, formatCurrency, formatNumber } = useSettings();

  // Form State
  const [customerId, setCustomerId] = useState('');
  const [dnNumber, setDnNumber] = useState('');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [dispatchDate, setDispatchDate] = useState(new Date().toISOString().split('T')[0]);
  const [costCenterId, setCostCenterId] = useState('');
  const [warehouseId, setWarehouseId] = useState('');
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState<DeliveryNoteItemInput[]>([
    {
      item_id: '',
      description: '',
      dispatched_quantity: 1,
      unit_price: 0,
      discount_type: 'percentage',
      discount_value: 0,
      tax_group_id: '',
      selected: true,
    },
  ]);

  // Data State
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [availableItems, setAvailableItems] = useState<Item[]>([]);
  const [costCenters, setCostCenters] = useState<CostCenter[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [taxGroups, setTaxGroups] = useState<TaxGroup[]>([]);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [salesOrderNumber, setSalesOrderNumber] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const promises: Promise<unknown>[] = [
          getCustomers({ unpaginated: true }),
          getItems({ unpaginated: true }),
          getCostCenters({ unpaginated: true }),
          getWarehouses({ unpaginated: true }),
          DeliveryNoteService.getNextDeliveryNoteNumber(),
          getTaxGroups({ unpaginated: true }),
        ];

        // Fetch SO data if converting
        if (salesOrderId) {
          promises.push(getSalesOrder(Number(salesOrderId)));
        }

        const results = await Promise.all(promises);
        const [cData, iData, ccData, wData, nextNumData, tgData] = results as [
          { data: Customer[] },
          { data: Item[] },
          { data: CostCenter[] },
          { data: Warehouse[] },
          Record<string, unknown>,
          { data: TaxGroup[] },
          ...unknown[],
        ];

        setCustomers(cData.data || []);
        setAvailableItems(iData.data || []);
        setCostCenters(ccData.data || []);
        setWarehouses(wData.data || []);
        setDnNumber(
          (nextNumData as Record<string, string>)?.dn_number ||
            (nextNumData as { data?: { dn_number?: string } })?.data?.dn_number ||
            ''
        );
        setTaxGroups(tgData.data || []);

        // Auto-fill from SO data
        if (salesOrderId && results[6]) {
          const so = results[6] as {
            order_number: string;
            customer_id: number;
            warehouse_id?: number;
            cost_center_id?: number;
            notes?: string;
            reference_number?: string;
            items: Array<{
              id: number;
              item_id: number;
              description: string;
              quantity: number;
              unit_price: number;
              discount_type: DiscountType;
              discount_value: number;
              tax_group_id?: number;
              delivered_quantity: number;
            }>;
          };

          setSalesOrderNumber(so.order_number);
          setCustomerId(String(so.customer_id));
          if (so.warehouse_id) setWarehouseId(String(so.warehouse_id));
          if (so.cost_center_id) setCostCenterId(String(so.cost_center_id));
          if (so.notes) setNotes(so.notes);
          if (so.reference_number) setReferenceNumber(so.reference_number);

          if (so.items && so.items.length > 0) {
            const soItems = so.items
              .filter((soItem) => soItem.quantity - soItem.delivered_quantity > 0)
              .map((soItem) => {
                const remaining = soItem.quantity - soItem.delivered_quantity;
                const ratio = soItem.quantity > 0 ? remaining / soItem.quantity : 1;
                const scaledDiscount =
                  soItem.discount_type === 'fixed'
                    ? soItem.discount_value * ratio
                    : soItem.discount_value;

                return {
                  item_id: String(soItem.item_id),
                  description: soItem.description || '',
                  dispatched_quantity: remaining,
                  unit_price: soItem.unit_price,
                  discount_type: soItem.discount_type || ('percentage' as DiscountType),
                  discount_value: scaledDiscount || 0,
                  tax_group_id: soItem.tax_group_id ? String(soItem.tax_group_id) : '',
                  selected: true,
                  sales_order_item_id: soItem.id,
                  ordered_quantity: soItem.quantity,
                  already_delivered: soItem.delivered_quantity,
                };
              });
            if (soItems.length > 0) {
              setItems(soItems);
            } else {
              toast.warning('All items on this SO have already been fully delivered.');
            }
          }
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
        toast.error('Failed to load form data');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [salesOrderId]);

  // Keep the top progress bar running while page data is loading
  useEffect(() => {
    if (isLoading) {
      NProgress.start();
    } else {
      NProgress.done();
    }
    return () => {
      NProgress.done();
    };
  }, [isLoading]);

  const selectedCustomer = useMemo(
    () => customers.find((c) => String(c.id) === customerId),
    [customers, customerId]
  );

  const handleAddItem = () => {
    setItems([
      ...items,
      {
        item_id: '',
        description: '',
        dispatched_quantity: 1,
        unit_price: 0,
        discount_type: 'percentage',
        discount_value: 0,
        tax_group_id: '',
        selected: true,
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
    field: keyof DeliveryNoteItemInput,
    value: string | number
  ) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };

    // Auto-populate price when item is selected
    if (field === 'item_id' && value) {
      if (!customerId) {
        toast.warning('Please select a customer first.');
        newItems[index].item_id = '';
        setItems(newItems);
        return;
      }

      const item = availableItems.find((i) => String(i.id) === String(value));

      if (item) {
        newItems[index].description = item.description || '';
        newItems[index].tax_group_id = item.tax_group?.id ? String(item.tax_group.id) : '';

        let priceFound = false;

        // 1. Check if selected customer has a specific price list
        if (selectedCustomer?.price_list?.id) {
          const prices = (item.item_prices || []) as Array<{
            price_list?: { id: number | string };
            price: number | string;
          }>;
          const specificPrice = prices.find((ip) => {
            return String(ip.price_list?.id) === String(selectedCustomer.price_list?.id);
          });
          if (specificPrice) {
            newItems[index].unit_price = Number(specificPrice.price) || 0;
            priceFound = true;
          }
        }

        // 2. Fallback: Use sales price list
        if (!priceFound) {
          const prices = (item.item_prices || []) as Array<{
            price_list?: { type: string };
            price: number | string;
          }>;
          const fallbackPrice = prices.find((ip) => {
            return ip.price_list?.type === 'sales';
          });

          if (fallbackPrice) {
            newItems[index].unit_price = Number(fallbackPrice.price) || 0;
            priceFound = true;
          }
        }

        if (!priceFound) {
          toast.warning('Sales price not set for this item.');
          newItems[index].unit_price = 0;
        }
      }
    }

    setItems(newItems);
  };

  const calculateItemTotals = useCallback(
    (item: DeliveryNoteItemInput) => {
      const quantity = Number(item.dispatched_quantity) || 0;
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
    },
    [taxGroups]
  );

  // Only the checked lines become document lines. A line the user leaves out is
  // omitted from the payload rather than sent with quantity 0 — the API rejects a
  // zero-quantity line, and one would otherwise be snapshotted into the document.
  const selectedItems = useMemo(() => items.filter((item) => item.selected), [items]);
  const submittedRowIndices = useMemo(() => selectedRowIndices(items), [items]);
  const allItemsSelected = items.length > 0 && items.every((item) => item.selected);

  const handleToggleItem = (index: number, checked: boolean) => {
    setItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, selected: checked } : item))
    );
  };

  const handleToggleAllItems = (checked: boolean) => {
    setItems((prev) => prev.map((item) => ({ ...item, selected: checked })));
  };

  const orderTotals = useMemo(() => {
    return selectedItems.reduce(
      (acc, item) => {
        const totals = calculateItemTotals(item);
        acc.subtotal += totals.subtotal;
        acc.discountTotal += totals.discountAmount;
        acc.taxTotal += totals.taxAmount;
        acc.total += totals.total;

        totals.taxBreakdown.forEach((tb: { name: string; rate: number; amount: number }) => {
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
  }, [selectedItems, calculateItemTotals]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});

    if (selectedItems.length === 0) {
      toast.error('Select at least one item to include in this delivery note.');
      setIsSubmitting(false);
      return;
    }

    const payload = {
      customer_id: Number(customerId),
      dn_number: dnNumber,
      reference_number: referenceNumber,
      dispatch_date: dispatchDate,
      cost_center_id: Number(costCenterId),
      warehouse_id: Number(warehouseId),
      notes: notes,
      ...(salesOrderId ? { sales_order_id: Number(salesOrderId) } : {}),
      items: selectedItems.map((item) => ({
        item_id: Number(item.item_id),
        description: item.description,
        dispatched_quantity: Number(item.dispatched_quantity),
        unit_price: Number(item.unit_price),
        discount_type: item.discount_type,
        discount_value: Number(item.discount_value),
        tax_group_id: item.tax_group_id ? Number(item.tax_group_id) : undefined,
        ...(item.sales_order_item_id ? { sales_order_item_id: item.sales_order_item_id } : {}),
      })),
    };

    try {
      await DeliveryNoteService.create(payload);
      toast.success('Delivery Note created successfully');
      router.push('/delivery-notes');
    } catch (error: unknown) {
      let message = 'Failed to create Delivery Note';
      if (isApiError(error)) {
        const data = error.response?.data;
        const formErrors = remapItemErrorIndices(data?.errors || {}, submittedRowIndices);
        setErrors(formErrors);

        const firstErrorKey = Object.keys(formErrors)[0];
        if (firstErrorKey && formErrors[firstErrorKey]?.[0]) {
          message = formErrors[firstErrorKey][0];
        } else {
          message = data?.message || message;
        }
      }
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!hasPermission('create-delivery-note')) {
    return <div className="p-6 text-center">Access Denied</div>;
  }

  const getErrorMessage = (field: string) => errors[field]?.[0];
  const currencySymbol = getSetting('currency_symbol', '$');

  return (
    <>
      <PageMeta title="Create Delivery Note" description="Create a new delivery note" />
      <PageBreadcrumb pageTitle="Create Delivery Note" />

      {salesOrderNumber && (
        <div className="mb-4 flex items-center gap-3 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-300">
          <svg className="h-5 w-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
              clipRule="evenodd"
            />
          </svg>
          <span>
            Converting from Sales Order <strong>#{salesOrderNumber}</strong> — details have been
            auto-filled. You can adjust quantities, and untick any line you don&apos;t want to
            include, before saving.
          </span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {isLoading ? (
          <SkeletonForm rows={3} columns={4} />
        ) : (
          <>
            <div className="p-6 border border-gray-200 rounded-2xl bg-white dark:bg-gray-900 dark:border-gray-800 shadow-sm">
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-x-6 gap-y-4">
                {/* Row 1, Column 1: Customer Select */}
                <div className="lg:col-span-1">
                  <Label required>Customer</Label>
                  <Select
                    options={customers.map((c) => ({ value: String(c.id), label: c.name }))}
                    onChange={(val) => {
                      setCustomerId(val);
                      setErrors((prev) => {
                        const newErrors = { ...prev };
                        delete newErrors.customer_id;
                        return newErrors;
                      });
                    }}
                    defaultValue={customerId}
                    placeholder="Select Customer"
                    error={!!getErrorMessage('customer_id')}
                    hint={getErrorMessage('customer_id')}
                    disabled={!!salesOrderId}
                  />
                </div>

                {/* Row 1, Column 2: DN Number */}
                <div className="lg:col-span-1">
                  <Label required>DN #</Label>
                  <Input
                    required
                    value={dnNumber}
                    onChange={(e) => {
                      setDnNumber(e.target.value);
                      setErrors((prev) => {
                        const newErrors = { ...prev };
                        delete newErrors.dn_number;
                        return newErrors;
                      });
                    }}
                    error={!!getErrorMessage('dn_number')}
                    hint={getErrorMessage('dn_number')}
                  />
                </div>

                {/* Row 1, Column 3: Dispatch Date */}
                <div className="lg:col-span-1">
                  <Label required>Dispatch Date</Label>
                  <DatePicker
                    id="dispatch_date"
                    required
                    onChange={(_, dateStr) => {
                      setDispatchDate(dateStr);
                      setErrors((prev) => {
                        const newErrors = { ...prev };
                        delete newErrors.dispatch_date;
                        return newErrors;
                      });
                    }}
                    defaultDate={dispatchDate}
                    error={!!getErrorMessage('dispatch_date')}
                    hint={getErrorMessage('dispatch_date')}
                  />
                </div>

                {/* Row 1, Column 4: Reference Number */}
                <div className="lg:col-span-1">
                  <Label>Reference #</Label>
                  <Input
                    value={referenceNumber}
                    onChange={(e) => {
                      setReferenceNumber(e.target.value);
                    }}
                    placeholder="e.g. Sales Order #"
                    error={!!getErrorMessage('reference_number')}
                    hint={getErrorMessage('reference_number')}
                  />
                </div>

                {/* Row 2 & 3, Column 1: Customer Details */}
                <div className="lg:col-span-1 lg:row-span-2 min-h-[100px]">
                  {selectedCustomer && (
                    <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700 text-xs animate-in fade-in duration-300 h-full">
                      <h4 className="font-bold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wider text-[10px]">
                        Customer Info
                      </h4>
                      <div className="space-y-1 text-gray-600 dark:text-gray-400">
                        <p className="flex items-center gap-2">
                          <span className="font-semibold w-10 underline decoration-gray-300 dark:decoration-gray-600">
                            Email:
                          </span>{' '}
                          {selectedCustomer.email || 'N/A'}
                        </p>
                        <p className="flex items-center gap-2">
                          <span className="font-semibold w-10 underline decoration-gray-300 dark:decoration-gray-600">
                            Phone:
                          </span>{' '}
                          {selectedCustomer.phone || 'N/A'}
                        </p>
                        <div className="flex gap-2 mt-2 pt-2 border-t border-gray-200 dark:border-gray-700 text-[11px]">
                          <span className="font-semibold w-10 flex-shrink-0 underline decoration-gray-300 dark:decoration-gray-600">
                            Addr:
                          </span>
                          <p className="italic leading-tight">
                            {[
                              selectedCustomer.billing_address_line_1,
                              selectedCustomer.billing_address_line_2,
                              selectedCustomer.billing_city,
                              selectedCustomer.billing_state,
                              selectedCustomer.billing_zip_code,
                              selectedCustomer.billing_country,
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
                    disabled={!!salesOrderId}
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
                    disabled={!!salesOrderId}
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
                <h3 className="text-xl font-bold dark:text-white">
                  Items
                  {isConverting && (
                    <span className="ml-2 text-sm font-medium text-gray-500 dark:text-gray-400">
                      {selectedItems.length} of {items.length} selected
                    </span>
                  )}
                </h3>
                {!salesOrderId && (
                  <Button type="button" variant="outline" onClick={handleAddItem} className="gap-2">
                    <Plus className="w-4 h-4" />
                    Add Item
                  </Button>
                )}
              </div>

              <div className="space-y-4">
                {/* Table Headers - SO Conversion Mode */}
                {salesOrderId ? (
                  <div className="grid grid-cols-[auto_2fr_0.7fr_0.7fr_0.8fr_1.2fr_1.2fr_0.7fr_0.9fr] gap-x-3 px-4 py-3 mb-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg items-end">
                    <div className="flex items-center justify-center">
                      <Checkbox
                        checked={allItemsSelected}
                        onChange={handleToggleAllItems}
                        ariaLabel="Select all items"
                      />
                    </div>
                    <div className="uppercase text-theme-xs font-bold tracking-wider text-gray-500">
                      Item
                    </div>
                    <div className="text-center uppercase text-theme-xs font-bold tracking-wider text-gray-500">
                      Ordered
                    </div>
                    <div className="text-center uppercase text-theme-xs font-bold tracking-wider text-gray-500">
                      Previously Delivered
                    </div>
                    <div className="text-center uppercase text-theme-xs font-bold tracking-wider text-gray-500">
                      Qty to Dispatch <span className="text-red-500">*</span>
                    </div>
                    <div className="text-center uppercase text-theme-xs font-bold tracking-wider text-gray-500">
                      Price <span className="text-red-500">*</span>
                    </div>
                    <div className="text-center uppercase text-theme-xs font-bold tracking-wider text-gray-500">
                      Discount
                    </div>
                    <div className="text-center uppercase text-theme-xs font-bold tracking-wider text-gray-500">
                      Tax
                    </div>
                    <div className="text-end uppercase text-theme-xs font-bold tracking-wider text-gray-500">
                      Amount
                    </div>
                  </div>
                ) : (
                  /* Table Headers - Direct DN Mode */
                  <div className="grid grid-cols-[2.5fr_1fr_1.5fr_1.5fr_0.8fr_1fr] gap-x-4 px-4 py-3 mb-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg items-end">
                    <div className="uppercase text-theme-xs font-bold tracking-wider text-gray-500">
                      Items *
                    </div>
                    <div className="text-center uppercase text-theme-xs font-bold tracking-wider text-gray-500">
                      Dispatched Qty *
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
                    </div>
                  </div>
                )}

                {items.map((item, index) => {
                  const selectedItem = availableItems.find(
                    (i) => String(i.id) === String(item.item_id)
                  );
                  const totals = calculateItemTotals(item);
                  const isSOItem = !!item.sales_order_item_id;

                  return (
                    <div
                      key={index}
                      className="group relative rounded-xl border border-gray-100 p-4 transition-all hover:border-brand-200 dark:border-gray-800 dark:hover:border-brand-500/30"
                    >
                      {/* Remove button - only in direct mode */}
                      {!salesOrderId && (
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(index)}
                          className="absolute p-1 text-red-500 bg-red-50 dark:bg-red-500/10 rounded-full -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-100 dark:hover:bg-red-500/20"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M6 18L18 6M6 6l12 12"
                            ></path>
                          </svg>
                        </button>
                      )}

                      {/* SO Conversion Mode Grid */}
                      {salesOrderId ? (
                        <div
                          className={`grid grid-cols-[auto_2fr_0.7fr_0.7fr_0.8fr_1.2fr_1.2fr_0.7fr_0.9fr] gap-x-3 items-center ${
                            item.selected
                              ? ''
                              : '[&>*:not(:first-child)]:pointer-events-none [&>*:not(:first-child)]:opacity-40'
                          }`}
                        >
                          <div className="flex items-center justify-center">
                            <Checkbox
                              checked={item.selected}
                              onChange={(checked) => handleToggleItem(index, checked)}
                              ariaLabel={`Include ${selectedItem?.name ?? `line ${index + 1}`} in this document`}
                            />
                          </div>
                          {/* Item Name (read-only) */}
                          <div>
                            <Select
                              options={availableItems.map((i) => ({
                                value: String(i.id),
                                label: i.name,
                              }))}
                              onChange={() => {}}
                              defaultValue={item.item_id}
                              placeholder="Item"
                              disabled={isSOItem}
                            />
                          </div>

                          {/* Ordered Qty (read-only) */}
                          <div className="text-center">
                            <div className="h-11 flex items-center justify-center rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
                              <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                                {formatNumber(item.ordered_quantity || 0)}
                              </span>
                            </div>
                          </div>

                          {/* Already Delivered (read-only) */}
                          <div className="text-center">
                            <div className="h-11 flex items-center justify-center rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
                              <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                                {formatNumber(item.already_delivered || 0)}
                              </span>
                            </div>
                          </div>

                          {/* Qty to Dispatch (editable) */}
                          <div className="min-w-0 overflow-hidden">
                            <Input
                              type="number"
                              value={item.dispatched_quantity}
                              onChange={(e) => {
                                const val = Number(e.target.value);
                                const newItems = [...items];
                                newItems[index] = {
                                  ...newItems[index],
                                  dispatched_quantity: val,
                                };
                                setItems(newItems);
                              }}
                              className="text-center px-1"
                              placeholder="Qty"
                              decimalPlaces={parseInt(getSetting('quantity_decimal_places', '3'))}
                              error={!!getErrorMessage(`items.${index}.dispatched_quantity`)}
                              hint={getErrorMessage(`items.${index}.dispatched_quantity`)}
                            />
                          </div>

                          {/* Price (editable) */}
                          <div className="min-w-0 overflow-hidden">
                            <Input
                              type="number"
                              value={item.unit_price}
                              onChange={(e) =>
                                handleItemChange(index, 'unit_price', Number(e.target.value))
                              }
                              className="px-1"
                              placeholder="Price"
                              suffix={currencySymbol}
                              decimalPlaces={parseInt(getSetting('decimal_places', '2'))}
                              error={!!getErrorMessage(`items.${index}.unit_price`)}
                              hint={getErrorMessage(`items.${index}.unit_price`)}
                            />
                          </div>

                          {/* Discount (editable) */}
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
                                decimalPlaces={parseInt(
                                  getSetting('general_number_decimal_places', '2')
                                )}
                                error={!!getErrorMessage(`items.${index}.discount_value`)}
                                hint={getErrorMessage(`items.${index}.discount_value`)}
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
                                className="flex-shrink-0 flex items-center gap-1.5 px-2.5 border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 rounded-r-lg text-theme-xs font-bold text-blue-600 dark:text-blue-400 justify-center hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all cursor-pointer h-11 min-w-[40px] shadow-sm active:scale-95"
                                title={`Switch to ${item.discount_type === 'percentage' ? 'fixed' : 'percentage'} discount`}
                              >
                                {item.discount_type === 'percentage' ? '%' : currencySymbol}
                              </button>
                            </div>
                          </div>

                          {/* Tax (read-only) */}
                          <div className="flex items-center justify-center">
                            {totals.taxBreakdown.length > 0 ? (
                              <div className="text-center space-y-0.5">
                                {totals.taxBreakdown.map((tb, ti) => (
                                  <div
                                    key={ti}
                                    className="text-xs font-medium text-gray-600 dark:text-gray-400 whitespace-nowrap"
                                  >
                                    {formatNumber(tb.rate)}%
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <span className="text-xs text-gray-400">—</span>
                            )}
                          </div>

                          {/* Amount */}
                          <div className="text-end">
                            <p className="text-lg font-bold text-gray-800 dark:text-white">
                              {formatCurrency(totals.total)}
                            </p>
                          </div>
                        </div>
                      ) : (
                        /* Direct DN Mode Grid */
                        <div className="grid grid-cols-[2.5fr_1fr_1.5fr_1.5fr_0.8fr_1fr] gap-x-4 items-center">
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

                          {/* Dispatched Quantity */}
                          <div className="min-w-0 overflow-hidden">
                            <Input
                              type="number"
                              value={item.dispatched_quantity}
                              onChange={(e) =>
                                handleItemChange(
                                  index,
                                  'dispatched_quantity',
                                  Number(e.target.value)
                                )
                              }
                              className="text-center px-1"
                              placeholder="Qty"
                              suffix={selectedItem?.unit?.code || '-'}
                              decimalPlaces={parseInt(getSetting('quantity_decimal_places', '3'))}
                              error={!!getErrorMessage(`items.${index}.dispatched_quantity`)}
                              hint={getErrorMessage(`items.${index}.dispatched_quantity`)}
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
                              placeholder="Price"
                              suffix={currencySymbol}
                              decimalPlaces={parseInt(getSetting('decimal_places', '2'))}
                              error={!!getErrorMessage(`items.${index}.unit_price`)}
                              hint={getErrorMessage(`items.${index}.unit_price`)}
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
                                decimalPlaces={parseInt(
                                  getSetting('general_number_decimal_places', '2')
                                )}
                                error={!!getErrorMessage(`items.${index}.discount_value`)}
                                hint={getErrorMessage(`items.${index}.discount_value`)}
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
                              </button>
                            </div>
                          </div>

                          {/* Tax Group */}
                          <div className="flex items-center justify-center">
                            {totals.taxBreakdown.length > 0 ? (
                              <div className="text-center space-y-0.5">
                                {totals.taxBreakdown.map((tb, ti) => (
                                  <div
                                    key={ti}
                                    className="text-xs font-medium text-gray-600 dark:text-gray-400 whitespace-nowrap"
                                  >
                                    {tb.name}{' '}
                                    <span className="font-bold text-gray-700 dark:text-gray-300">
                                      {formatNumber(tb.rate)}%
                                    </span>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <span className="text-xs text-gray-400">—</span>
                            )}
                          </div>

                          {/* Result Amount */}
                          <div className="text-end">
                            <p className="text-lg font-bold text-gray-800 dark:text-white">
                              {formatCurrency(totals.total)}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Description Row */}
                      <div className="mt-4 max-w-[40%]">
                        <TextArea
                          value={item.description}
                          onChange={(val) => handleItemChange(index, 'description', val)}
                          placeholder="Line description..."
                          className="min-h-[40px] py-2"
                        />
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
                    <span className="text-gray-500 font-bold uppercase text-theme-xs">
                      Discount
                    </span>
                    <span className="font-bold text-gray-900 dark:text-white">
                      -{formatCurrency(orderTotals.discountTotal)}
                    </span>
                  </div>
                  {orderTotals.taxBreakdown.map((tb, idx) => (
                    <div key={idx} className="flex justify-between items-center px-4">
                      <span className="text-gray-500 font-bold uppercase text-theme-xs">
                        {tb.name}
                      </span>
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
              <Button type="submit" isLoading={isSubmitting}>
                {isSubmitting ? 'Creating...' : 'Create Delivery Note'}
              </Button>
            </div>
          </>
        )}
      </form>
    </>
  );
}
