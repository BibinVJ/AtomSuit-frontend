'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import ComponentCard from '@/components/common/ComponentCard';
import SkeletonForm from '@/components/common/SkeletonForm';
import PageMeta from '@/components/common/PageMeta';
import Button from '@/components/ui/button/Button';
import Select from '@/components/form/Select';
import Input from '@/components/form/input/InputField';
import Label from '@/components/form/Label';
import TextArea from '@/components/form/input/TextArea';
import { useRouter, useParams } from 'next/navigation';
import DatePicker from '@/components/form/date-picker';
import { toast } from 'sonner';
import { getCustomers } from '@/services/CustomerService';
import { getItems } from '@/services/ItemService';
import { getCostCenters } from '@/services/CostCenterService';
import { CostCenter } from '@/types/CostCenter';
import { getWarehouses } from '@/services/WarehouseService';
import { Item, Customer, DiscountType, PaginatedResponse } from '@/types';
import { SalesOrderItem, SalesOrderStatus } from '@/types/SalesOrder';
import { getSalesOrder, updateSalesOrder } from '@/services/SalesOrderService';
import { isApiError } from '@/utils/errors';
import { useSettings } from '@/hooks/useSettings';

interface SalesOrderItemInput {
  id?: number;
  item_id: string;
  description: string;
  quantity: number;
  unit_price: number;
  discount_type: DiscountType;
  discount_value: number;
}

interface ApiError {
  [key: string]: string[];
}

export default function EditSalesOrder() {
  const { getSetting, formatCurrency, formatNumber } = useSettings();
  const params = useParams<{ id: string }>();
  const id = params?.id;
  const router = useRouter();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [costCenters, setCostCenters] = useState<CostCenter[]>([]);
  const [warehouses, setWarehouses] = useState<{ id: number; name: string }[]>([]);

  const [customerId, setCustomerId] = useState('');
  const [orderNumber, setOrderNumber] = useState('');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [costCenterId, setCostCenterId] = useState('');
  const [warehouseId, setWarehouseId] = useState('');
  const [orderDate, setOrderDate] = useState('');
  const [expectedDeliveryDate, setExpectedDeliveryDate] = useState('');
  const [status, setStatus] = useState<SalesOrderStatus>(SalesOrderStatus.DRAFT);
  const [notes, setNotes] = useState('');

  const [salesItems, setSalesItems] = useState<SalesOrderItemInput[]>([]);
  const [errors, setErrors] = useState<ApiError>({});
  const [isLoading, setIsLoading] = useState(true);

  const fetchInitialData = useCallback(async () => {
    setIsLoading(true);
    try {
      if (!id) return;
      const [customerResponse, itemResponse, ccResponse, whResponse, soResponse] =
        await Promise.all([
          getCustomers({
            page: 1,
            limit: 10,
            sortCol: 'created_at',
            sortDir: 'desc',
            unpaginated: true,
            include: 'currency',
          }) as Promise<PaginatedResponse<Customer>>,
          getItems({
            page: 1,
            limit: 10,
            sortCol: 'created_at',
            sortDir: 'desc',
            unpaginated: true,
            include: 'unit,tax_group,item_prices',
          }) as Promise<PaginatedResponse<Item>>,
          getCostCenters({ page: 1, limit: 100, unpaginated: true }) as Promise<
            PaginatedResponse<CostCenter>
          >,
          getWarehouses({ page: 1, limit: 100, unpaginated: true }) as Promise<
            PaginatedResponse<{ id: number; name: string }>
          >,
          getSalesOrder(Number(id)),
        ]);
      setCustomers(customerResponse.data);
      setItems(itemResponse.data);
      setCostCenters(ccResponse.data || ccResponse);
      setWarehouses(whResponse.data || whResponse);

      const so = soResponse;
      setCustomerId(String(so.customer_id));
      setOrderNumber(so.order_number);
      setReferenceNumber(so.reference_number || '');
      setOrderDate(so.order_date);
      setExpectedDeliveryDate(so.expected_delivery_date || '');
      setStatus(so.status);
      setNotes(so.notes || '');
      setCostCenterId(String(so.cost_center_id || ''));
      setWarehouseId(String(so.warehouse_id || ''));

      setSalesItems(
        so.items.map((item: SalesOrderItem) => ({
          id: item.id,
          item_id: String(item.item_id),
          description: item.description || '',
          quantity: item.quantity,
          unit_price: item.unit_price,
          discount_type: item.discount_type || 'percentage',
          discount_value: item.discount_value || 0,
        }))
      );
    } catch (error) {
      console.error('Error fetching initial data:', error);
      toast.error('Failed to load sales order data');
      router.push('/sales-orders');
    } finally {
      setIsLoading(false);
    }
  }, [id, router]);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  const handleAddItem = () => {
    setSalesItems([
      ...salesItems,
      {
        item_id: '',
        description: '',
        quantity: 1,
        unit_price: 0,
        discount_type: 'percentage',
        discount_value: 0,
      },
    ]);
  };

  const handleItemChange = (
    index: number,
    field: keyof SalesOrderItemInput,
    value: string | number
  ) => {
    const newItems = [...salesItems];
    const itemToUpdate = { ...newItems[index], [field]: value };

    // Auto-populate price when item is selected
    if (field === 'item_id' && value) {
      if (!customerId) {
        toast.warning('Please select a customer first.');
        itemToUpdate.item_id = '';
        newItems[index] = itemToUpdate as SalesOrderItemInput;
        setSalesItems(newItems);
        return;
      }

      const selectedItem = items.find((i) => String(i.id) === String(value));
      const selectedCustomer = customers.find((c) => String(c.id) === String(customerId));

      if (selectedItem) {
        let priceFound = false;

        // 1. Check if selected customer has a specific price list
        if (selectedCustomer?.price_list?.id) {
          const specificPrice = selectedItem.item_prices?.find((ip: unknown) => {
            const priceIp = ip as { price_list?: { id: string | number } };
            const customerPriceListId = selectedCustomer.price_list?.id;
            return String(priceIp.price_list?.id) === String(customerPriceListId);
          });
          if (specificPrice) {
            itemToUpdate.unit_price = Number((specificPrice as { price: number }).price) || 0;
            priceFound = true;
          }
        }

        // 2. Fallback: Use sales price list
        if (!priceFound) {
          const fallbackPrice = selectedItem.item_prices?.find((ip: unknown) => {
            const priceIp = ip as { price_list?: { type?: string } };
            return priceIp.price_list?.type === 'sales';
          });

          if (fallbackPrice) {
            itemToUpdate.unit_price = Number((fallbackPrice as { price: number }).price) || 0;
            priceFound = true;
          }
        }

        if (!priceFound && customerId) {
          toast.warning('Sales price not set for this item.');
          itemToUpdate.unit_price = 0;
        }
      }
    }

    newItems[index] = itemToUpdate as SalesOrderItemInput;
    setSalesItems(newItems);
  };

  const handleRemoveItem = (index: number) => {
    const newItems = [...salesItems];
    newItems.splice(index, 1);
    setSalesItems(newItems);
  };

  const validateForm = () => {
    const newErrors: ApiError = {};

    if (!customerId) newErrors.customer_id = ['Customer is required.'];
    if (!orderNumber.trim()) newErrors.order_number = ['Order number is required.'];
    if (!orderDate) newErrors.order_date = ['Order date is required.'];
    if (!costCenterId) newErrors.cost_center_id = ['Cost Center is required.'];
    if (!warehouseId) newErrors.warehouse_id = ['Warehouse is required.'];
    if (salesItems.length === 0) newErrors.items = ['At least one item is required.'];

    salesItems.forEach((item, index) => {
      if (!item.item_id) newErrors[`items.${index}.item_id`] = ['Item is required.'];
      if (item.quantity <= 0)
        newErrors[`items.${index}.quantity`] = ['Quantity must be greater than 0.'];
      if (item.unit_price < 0)
        newErrors[`items.${index}.unit_price`] = ['Unit price cannot be negative.'];
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const selectedCustomer = useMemo(() => {
    return customers.find((c) => String(c.id) === customerId);
  }, [customers, customerId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error('Please correct the errors in the form');
      return;
    }

    try {
      await updateSalesOrder(Number(id), {
        customer_id: Number(customerId),
        order_number: orderNumber,
        reference_number: referenceNumber,
        order_date: orderDate,
        expected_delivery_date: expectedDeliveryDate || undefined,
        status: status,
        cost_center_id: Number(costCenterId),
        warehouse_id: Number(warehouseId),
        notes: notes,
        items: salesItems.map((item) => ({
          item_id: Number(item.item_id),
          quantity: Number(item.quantity),
          unit_price: Number(item.unit_price),
          discount_type: item.discount_type,
          discount_value: Number(item.discount_value),
          description: item.description,
          tax_group_id: items.find((i) => String(i.id) === String(item.item_id))?.tax_group?.id,
        })),
      });
      toast.success('Sales Order updated successfully');
      router.push('/sales-orders');
    } catch (error: unknown) {
      if (isApiError(error) && error.response?.status === 422) {
        setErrors(error.response.data.errors || {});
        toast.error('Please correct the errors in the form');
      } else {
        console.error('Error updating sales order:', error);
        toast.error('Failed to update sales order');
      }
    }
  };

  const clearError = (field: string) => {
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const getErrorMessage = (field: string) => errors[field]?.[0] || '';

  const getSelectedItem = (itemId: string) => items.find((i) => String(i.id) === String(itemId));

  const getItemTaxRates = (selectedItem?: Item) => {
    if (!selectedItem?.tax_group?.tax_rates) {
      return [];
    }
    return selectedItem.tax_group.tax_rates.map((rate) => ({
      name: rate.name,
      rate: Number(rate.rate) || 0,
      type: rate.type || 'percentage',
    }));
  };

  const calculateItemTotals = (item: SalesOrderItemInput, selectedItem?: Item) => {
    const baseTotal = item.quantity * item.unit_price;
    const discountValue = Number(item.discount_value) || 0;
    let discountAmount = 0;
    if (item.discount_type === 'percentage') {
      discountAmount = baseTotal * (discountValue / 100);
    } else {
      discountAmount = discountValue;
    }
    const discountedTotal = Math.max(0, baseTotal - discountAmount);

    const resolvedItem = selectedItem || getSelectedItem(item.item_id);
    const rates = getItemTaxRates(resolvedItem);
    let taxAmount = 0;
    const taxBreakdown: { name: string; rate: number; amount: number }[] = [];

    rates.forEach((tr) => {
      let amount = 0;
      if (tr.type === 'percentage') {
        amount = discountedTotal * (tr.rate / 100);
      } else {
        amount = tr.rate * item.quantity;
      }
      taxAmount += amount;
      taxBreakdown.push({ name: tr.name, rate: tr.rate, amount });
    });

    return {
      baseTotal,
      discountAmount,
      discountedTotal,
      taxAmount,
      taxBreakdown,
      netTotal: discountedTotal + taxAmount,
    };
  };

  const calculateOrderTotals = () => {
    let subTotal = 0;
    let totalTax = 0;
    let totalDiscount = 0;
    const taxMap: Record<string, number> = {};

    salesItems.forEach((item) => {
      const totals = calculateItemTotals(item);
      subTotal += totals.baseTotal;
      totalTax += totals.taxAmount;
      totalDiscount += totals.discountAmount;
      totals.taxBreakdown.forEach((tb) => {
        taxMap[tb.name] = (taxMap[tb.name] || 0) + tb.amount;
      });
    });

    return {
      subTotal,
      totalTax,
      totalDiscount,
      taxBreakdown: Object.entries(taxMap).map(([name, amount]) => ({ name, amount })),
      grandTotal: subTotal - totalDiscount + totalTax,
    };
  };

  const orderTotals = calculateOrderTotals();

  return (
    <>
      <PageMeta title="Edit Sales Order" description="Edit an existing sales order" />
      <PageBreadcrumb
        pageTitle="Edit Sales Order"
        breadcrumbs={[{ label: 'Sales Orders', path: '/sales-orders' }]}
        backButton={true}
      />

      <ComponentCard>
        {isLoading ? (
          <SkeletonForm rows={3} columns={4} />
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 gap-x-6 gap-y-4 md:grid-cols-2 lg:grid-cols-4">
              <div>
                <Label required>Customer</Label>
                <Select
                  options={customers.map((c) => ({ value: String(c.id), label: c.name }))}
                  onChange={(value) => {
                    setCustomerId(value);
                    clearError('customer_id');
                  }}
                  defaultValue={customerId}
                  placeholder="Select a customer"
                  error={!!getErrorMessage('customer_id')}
                  hint={getErrorMessage('customer_id')}
                />
              </div>
              <div>
                <Label>Order Number</Label>
                <Input
                  type="text"
                  value={orderNumber}
                  onChange={(e) => {
                    setOrderNumber(e.target.value);
                    clearError('order_number');
                  }}
                  error={!!getErrorMessage('order_number')}
                  hint={getErrorMessage('order_number')}
                  readOnly
                />
              </div>
              <div>
                <Label>Reference Number</Label>
                <Input
                  type="text"
                  value={referenceNumber}
                  onChange={(e) => {
                    setReferenceNumber(e.target.value);
                    clearError('reference_number');
                  }}
                  error={!!getErrorMessage('reference_number')}
                  hint={getErrorMessage('reference_number')}
                  placeholder="e.g. Customer PO #"
                />
              </div>
              <div className="lg:col-span-1">
                <Label>Order Date</Label>
                <DatePicker
                  id="order_date"
                  required
                  onChange={(_, dateStr) => {
                    setOrderDate(dateStr);
                    clearError('order_date');
                  }}
                  defaultDate={orderDate}
                  error={!!getErrorMessage('order_date')}
                  hint={getErrorMessage('order_date')}
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

              <div className="lg:col-span-1">
                <Label>Status</Label>
                <Select
                  options={[
                    { value: SalesOrderStatus.DRAFT, label: 'Draft' },
                    { value: SalesOrderStatus.SENT, label: 'Sent' },
                    { value: SalesOrderStatus.CONFIRMED, label: 'Confirmed' },
                  ]}
                  onChange={(value) => setStatus(value as SalesOrderStatus)}
                  defaultValue={status}
                />
              </div>

              <div className="lg:col-span-1">
                <DatePicker
                  id="expected_delivery_date"
                  label="Expected Delivery Date"
                  required
                  onChange={(_, dateStr) => {
                    setExpectedDeliveryDate(dateStr);
                    clearError('expected_delivery_date');
                  }}
                  defaultDate={expectedDeliveryDate}
                  error={!!getErrorMessage('expected_delivery_date')}
                  hint={getErrorMessage('expected_delivery_date')}
                />
              </div>

              <div className="lg:col-span-1">
                <Label>Cost Center</Label>
                <Select
                  options={costCenters.map((c) => ({ value: String(c.id), label: c.name }))}
                  onChange={(value) => {
                    setCostCenterId(value);
                    clearError('cost_center_id');
                  }}
                  defaultValue={costCenterId}
                  placeholder="Select Cost Center"
                  error={!!getErrorMessage('cost_center_id')}
                  hint={getErrorMessage('cost_center_id')}
                />
              </div>

              <div className="lg:col-span-1">
                <Label required>Warehouse</Label>
                <Select
                  options={warehouses.map((w) => ({ value: String(w.id), label: w.name }))}
                  onChange={(value) => {
                    setWarehouseId(value);
                    clearError('warehouse_id');
                  }}
                  defaultValue={warehouseId}
                  placeholder="Select Warehouse"
                  error={!!getErrorMessage('warehouse_id')}
                  hint={getErrorMessage('warehouse_id')}
                />
              </div>

              {/* Row 3, Columns 3 & 4: Notes (Last Row) */}
              <div className="lg:col-span-2">
                <Label>Notes</Label>
                <TextArea
                  value={notes}
                  onChange={(value) => setNotes(value)}
                  placeholder="Internal notes..."
                  className="min-h-[100px]"
                />
              </div>
            </div>

            <div className="flex items-center justify-between mt-8 mb-4">
              <h3 className="text-xl font-bold dark:text-white">Items</h3>
              <Button type="button" variant="outline" onClick={handleAddItem} className="gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 4v16m8-8H4"
                  ></path>
                </svg>
                Add Item
              </Button>
            </div>

            <div className="space-y-4">
              {/* Table Headers */}
              <div className="grid grid-cols-[2.5fr_1.5fr_1.5fr_1.5fr_0.8fr_1.2fr] gap-x-4 px-4 py-3 mb-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg items-end">
                <div className="min-w-0 uppercase text-theme-xs font-bold tracking-wider text-gray-500">
                  Items <span className="text-red-500">*</span>
                </div>
                <div className="min-w-0 text-center uppercase text-theme-xs font-bold tracking-wider text-gray-500">
                  Quantity <span className="text-red-500">*</span>
                </div>
                <div className="min-w-0 text-center uppercase text-theme-xs font-bold tracking-wider text-gray-500">
                  Price <span className="text-red-500">*</span>
                </div>
                <div className="min-w-0 text-center uppercase text-theme-xs font-bold tracking-wider text-gray-500">
                  Discount (% / Fixed)
                </div>
                <div className="min-w-0 text-center uppercase text-theme-xs font-bold tracking-wider text-gray-500">
                  Tax (%)
                </div>
                <div className="min-w-0 text-end">
                  <div className="uppercase text-theme-xs font-bold tracking-wider text-gray-500">
                    Amount
                  </div>
                  <div className="text-[10px] font-bold text-red-500 uppercase tracking-tight leading-none mt-1">
                    After Tax & Discount
                  </div>
                </div>
              </div>

              {salesItems.map((item, index) => {
                const selectedItem = getSelectedItem(item.item_id);
                const itemTotals = calculateItemTotals(item, selectedItem);
                const currencySymbol = getSetting<string>('currency_symbol');
                return (
                  <div
                    key={index}
                    className="group relative rounded-xl border border-gray-100 p-4 transition-all hover:border-brand-200 dark:border-gray-800 dark:hover:border-brand-500/30"
                  >
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

                    {/* Row 1: Main Inputs */}
                    <div className="grid grid-cols-[2.5fr_1.5fr_1.5fr_1.5fr_0.8fr_1.2fr] gap-x-4 items-center">
                      <div className="min-w-0 overflow-hidden">
                        <Select
                          options={items.map((i) => ({ value: String(i.id), label: i.name }))}
                          onChange={(value) => {
                            handleItemChange(index, 'item_id', value);
                            clearError(`items.${index}.item_id`);
                          }}
                          defaultValue={item.item_id}
                          placeholder="Select an Item"
                          error={!!getErrorMessage(`items.${index}.item_id`)}
                        />
                        {getErrorMessage(`items.${index}.item_id`) && (
                          <p className="mt-1 text-xs text-red-500">
                            {getErrorMessage(`items.${index}.item_id`)}
                          </p>
                        )}
                      </div>

                      <div className="min-w-0 overflow-hidden">
                        <Input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => {
                            handleItemChange(index, 'quantity', Number(e.target.value));
                            clearError(`items.${index}.quantity`);
                          }}
                          className="text-center px-1"
                          placeholder="Qty"
                          suffix={selectedItem?.unit?.code || '-'}
                          decimalPlaces={parseInt(getSetting('quantity_decimal_places', '3'))}
                        />
                      </div>

                      <div className="min-w-0 overflow-hidden">
                        <Input
                          type="number"
                          value={item.unit_price}
                          onChange={(e) => {
                            handleItemChange(index, 'unit_price', Number(e.target.value));
                            clearError(`items.${index}.unit_price`);
                          }}
                          className="px-1"
                          placeholder="Price"
                          suffix={currencySymbol}
                          decimalPlaces={parseInt(getSetting('decimal_places', '2'))}
                        />
                      </div>

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

                      <div className="flex items-center justify-center">
                        {itemTotals.taxBreakdown.length > 0 ? (
                          <div className="text-center space-y-0.5">
                            {itemTotals.taxBreakdown.map((tb, ti) => (
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

                      <div className="text-end">
                        <p className="text-lg font-bold text-gray-800 dark:text-white">
                          {formatCurrency(itemTotals.netTotal)}
                        </p>
                      </div>
                    </div>

                    {/* Row 2: Description */}
                    <div className="mt-4 max-w-[40%]">
                      <TextArea
                        value={item.description}
                        onChange={(value) => handleItemChange(index, 'description', value)}
                        placeholder="Description"
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
                  <span className="text-gray-500 font-bold uppercase text-theme-xs">Sub Total</span>
                  <span className="font-bold text-gray-900 dark:text-white">
                    {formatCurrency(orderTotals.subTotal)}
                  </span>
                </div>
                <div className="flex justify-between items-center px-4">
                  <span className="text-gray-500 font-bold uppercase text-theme-xs">Discount</span>
                  <span className="font-bold text-gray-900 dark:text-white">
                    -{formatCurrency(orderTotals.totalDiscount)}
                  </span>
                </div>
                {orderTotals.taxBreakdown.map((tb) => (
                  <div key={tb.name} className="flex justify-between items-center px-4">
                    <span className="text-gray-500 font-bold uppercase text-theme-xs">
                      {tb.name}
                    </span>
                    <span className="font-bold text-gray-900 dark:text-white">
                      +{formatCurrency(tb.amount)}
                    </span>
                  </div>
                ))}
                <div className="flex justify-between items-center px-4">
                  <span className="text-gray-500 font-bold uppercase text-theme-xs">Total Tax</span>
                  <span className="font-bold text-gray-900 dark:text-white">
                    +{formatCurrency(orderTotals.totalTax)}
                  </span>
                </div>
                <div className="flex justify-between items-center p-4 bg-brand-50 dark:bg-brand-500/10 rounded-xl">
                  <span className="text-brand-600 dark:text-brand-400 font-bold uppercase text-theme-sm">
                    Total Amount
                  </span>
                  <span className="text-xl font-black text-brand-700 dark:text-brand-400">
                    {formatCurrency(orderTotals.grandTotal)}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex justify-end mt-6">
              <Button type="submit">Update Sales Order</Button>
            </div>
          </form>
        )}
      </ComponentCard>
    </>
  );
}
