'use client';

import { useState, useEffect, useCallback } from 'react';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import ComponentCard from '@/components/common/ComponentCard';
import PageMeta from '@/components/common/PageMeta';
import Button from '@/components/ui/button/Button';
import Select from '@/components/form/Select';
import Input from '@/components/form/input/InputField';
import Label from '@/components/form/Label';
import TextArea from '@/components/form/input/TextArea';
import { useRouter } from 'next/navigation';
import DatePicker from '@/components/form/date-picker';
import { useSettings } from '@/hooks/useSettings';
import { toast } from 'sonner';
import { getVendors } from '@/services/VendorService';
import { getItems } from '@/services/ItemService';
import { getNextPurchaseOrderNumber, addPurchaseOrder } from '@/services/PurchaseOrderService';
import { getCostCenters } from '@/services/CostCenterService';
import { CostCenter } from '@/types/CostCenter';
import { getWarehouses } from '@/services/WarehouseService';
import { isApiError } from '@/utils/errors';
import { Item, Vendor } from '@/types';

interface PurchaseOrderItemInput {
  item_id: string;
  description: string;
  quantity: number;
  unit_price: number;
  discount_amount: number;
}

interface ApiError {
  [key: string]: string[];
}

export default function AddPurchaseOrder() {
  const { getSetting } = useSettings();
  const router = useRouter();
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [costCenters, setCostCenters] = useState<CostCenter[]>([]);
  const [warehouses, setWarehouses] = useState<{ id: number; name: string }[]>([]);

  const [vendorId, setVendorId] = useState('');
  const [orderNumber, setOrderNumber] = useState('');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [costCenterId, setCostCenterId] = useState('');
  const [warehouseId, setWarehouseId] = useState('');
  const [orderDate, setOrderDate] = useState(new Date().toISOString().split('T')[0]);
  const [expectedDeliveryDate, setExpectedDeliveryDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [notes, setNotes] = useState('');

  const [purchaseItems, setPurchaseItems] = useState<PurchaseOrderItemInput[]>([
    {
      item_id: '',
      description: '',
      quantity: 1,
      unit_price: 0,
      discount_amount: 0,
    },
  ]);
  const [errors, setErrors] = useState<ApiError>({});

  const fetchInitialData = useCallback(async () => {
    try {
      const [vendorResponse, itemResponse, orderNumberResponse, ccResponse, whResponse] =
        await Promise.all([
          getVendors({
            page: 1,
            limit: 1000,
            sortCol: 'created_at',
            sortDir: 'desc',
            unpaginated: true,
            include: 'currency',
          }),
          getItems({
            page: 1,
            limit: 1000,
            sortCol: 'created_at',
            sortDir: 'desc',
            unpaginated: true,
            include: 'unit,tax_group,item_prices',
          }),
          getNextPurchaseOrderNumber(),
          getCostCenters({ page: 1, limit: 100, unpaginated: true }),
          getWarehouses({ page: 1, limit: 100, unpaginated: true }),
        ]);

      // Handle Vendor Response
      const vendorsData = Array.isArray(vendorResponse)
        ? vendorResponse
        : vendorResponse.data || [];
      setVendors(vendorsData);

      // Handle Item Response
      const itemsData = Array.isArray(itemResponse) ? itemResponse : itemResponse.data || [];
      setItems(itemsData);

      // Handle Order Number Response
      const orderNum =
        orderNumberResponse?.order_number || orderNumberResponse?.data?.order_number || '';
      if (orderNum) {
        setOrderNumber(orderNum);
      }

      // Handle Cost Center Response
      const ccData = Array.isArray(ccResponse) ? ccResponse : ccResponse.data || [];
      setCostCenters(ccData);

      // Handle Warehouse Response
      const whData = Array.isArray(whResponse) ? whResponse : whResponse.data || [];
      setWarehouses(whData);
    } catch (error) {
      console.error('Error fetching initial data:', error);
    }
  }, []);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  const handleAddItem = () => {
    setPurchaseItems([
      ...purchaseItems,
      {
        item_id: '',
        description: '',
        quantity: 1,
        unit_price: 0,
        discount_amount: 0,
      },
    ]);
  };

  const handleItemChange = (
    index: number,
    field: keyof PurchaseOrderItemInput,
    value: string | number
  ) => {
    const newItems = [...purchaseItems];
    const itemToUpdate = { ...newItems[index], [field]: value };

    // Auto-populate price when item is selected
    if (field === 'item_id' && value) {
      if (!vendorId) {
        toast.warning('Please select a vendor first.');
        itemToUpdate.item_id = '';
        newItems[index] = itemToUpdate as PurchaseOrderItemInput;
        setPurchaseItems(newItems);
        return;
      }

      const selectedItem = items.find((i) => String(i.id) === String(value));
      const selectedVendor = vendors.find((v) => String(v.id) === String(vendorId));

      if (selectedItem) {
        let priceFound = false;

        // 1. Check if selected vendor has a specific price list
        if (selectedVendor?.price_list?.id) {
          const specificPrice = selectedItem.item_prices?.find((ip: unknown) => {
            const priceIp = ip as { price_list?: { id: string | number } };
            const vendorPriceListId = selectedVendor.price_list?.id;
            return String(priceIp.price_list?.id) === String(vendorPriceListId);
          });
          if (specificPrice) {
            itemToUpdate.unit_price = Number((specificPrice as { price: number }).price) || 0;
            priceFound = true;
          }
        }

        // 2. Fallback: Use purchase price list
        if (!priceFound) {
          const fallbackPrice = selectedItem.item_prices?.find((ip: unknown) => {
            const priceIp = ip as { price_list?: { type?: string } };
            return priceIp.price_list?.type === 'purchase';
          });

          if (fallbackPrice) {
            itemToUpdate.unit_price = Number((fallbackPrice as { price: number }).price) || 0;
            priceFound = true;
          }
        }

        if (!priceFound && vendorId) {
          toast.warning('Purchase price not set for this item.');
          itemToUpdate.unit_price = 0;
        }
      }
    }

    newItems[index] = itemToUpdate as PurchaseOrderItemInput;
    setPurchaseItems(newItems);
  };

  const handleRemoveItem = (index: number) => {
    const newItems = [...purchaseItems];
    newItems.splice(index, 1);
    setPurchaseItems(newItems);
  };

  const validateForm = () => {
    const newErrors: ApiError = {};

    if (!vendorId) newErrors.vendor_id = ['Vendor is required.'];
    if (!orderNumber.trim()) newErrors.order_number = ['Order number is required.'];
    if (!orderDate) newErrors.order_date = ['Order date is required.'];
    if (!costCenterId) newErrors.cost_center_id = ['Cost Center is required.'];
    if (!warehouseId) newErrors.warehouse_id = ['Warehouse is required.'];
    if (purchaseItems.length === 0) newErrors.items = ['At least one item is required.'];

    purchaseItems.forEach((item, index) => {
      if (!item.item_id) newErrors[`items.${index}.item_id`] = ['Item is required.'];
      if (item.quantity <= 0)
        newErrors[`items.${index}.quantity`] = ['Quantity must be greater than 0.'];
      if (item.unit_price < 0)
        newErrors[`items.${index}.unit_price`] = ['Unit price cannot be negative.'];
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error('Please correct the errors in the form');
      return;
    }

    try {
      await addPurchaseOrder({
        vendor_id: Number(vendorId),
        order_number: orderNumber, // Backend expects this if utilizing logic that requires it, but action might not use it if we rely on backend gen. But here we assume backend expects it based on Request class.
        reference_number: referenceNumber,
        order_date: orderDate,
        expected_delivery_date: expectedDeliveryDate || undefined,
        cost_center_id: Number(costCenterId),
        warehouse_id: Number(warehouseId),
        notes: notes,
        items: purchaseItems.map((item) => ({
          item_id: Number(item.item_id),
          quantity: Number(item.quantity),
          unit_price: Number(item.unit_price),
          discount_amount: Number(item.discount_amount),
          description: item.description,
          tax_group_id: items.find((i) => String(i.id) === String(item.item_id))?.tax_group?.id,
        })),
      });
      toast.success('Purchase Order created successfully');
      router.push('/purchase-orders');
    } catch (error: unknown) {
      if (isApiError(error) && error.response?.status === 422) {
        setErrors(error.response.data.errors || {});
        toast.error('Please correct the errors in the form');
      } else {
        console.error('Error creating purchase order:', error);
        toast.error('Failed to create purchase order');
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

  const getItemTaxRate = (selectedItem?: Item) => {
    if (!selectedItem?.tax_group) {
      return 0;
    }

    if (
      selectedItem.tax_group.total_rate !== undefined &&
      selectedItem.tax_group.total_rate !== null
    ) {
      return Number(selectedItem.tax_group.total_rate) || 0;
    }

    return (
      selectedItem.tax_group.tax_rates?.reduce((sum, rate) => sum + (Number(rate.rate) || 0), 0) ||
      0
    );
  };

  const calculateItemTotals = (item: PurchaseOrderItemInput, selectedItem?: Item) => {
    const baseTotal = item.quantity * item.unit_price;
    const discountAmount = Number(item.discount_amount) || 0;
    const discountedTotal = Math.max(0, baseTotal - discountAmount);

    const resolvedItem = selectedItem || getSelectedItem(item.item_id);
    let taxAmount = 0;
    const taxRate = getItemTaxRate(resolvedItem);
    if (taxRate > 0) {
      taxAmount = discountedTotal * (taxRate / 100);
    }

    return {
      baseTotal,
      discountAmount,
      discountedTotal,
      taxAmount,
      taxRate,
      netTotal: discountedTotal + taxAmount,
    };
  };

  const calculateOrderTotals = () => {
    let subTotal = 0;
    let totalTax = 0;
    let totalDiscount = 0;

    purchaseItems.forEach((item) => {
      const totals = calculateItemTotals(item);
      subTotal += totals.baseTotal;
      totalTax += totals.taxAmount;
      totalDiscount += totals.discountAmount;
    });

    return {
      subTotal,
      totalTax,
      totalDiscount,
      grandTotal: subTotal - totalDiscount + totalTax,
    };
  };

  const orderTotals = calculateOrderTotals();

  return (
    <>
      <PageMeta title="Add Purchase Order" description="Add a new purchase order" />
      <PageBreadcrumb
        pageTitle="Add Purchase Order"
        breadcrumbs={[{ label: 'Purchase Orders', path: '/purchase-orders' }]}
        backButton={true}
      />

      <ComponentCard>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            <div>
              <Label>Vendor</Label>
              <Select
                options={vendors.map((v) => ({ value: String(v.id), label: v.name }))}
                onChange={(value) => {
                  setVendorId(value);
                  clearError('vendor_id');
                }}
                defaultValue={vendorId}
                placeholder="Select a vendor"
                error={!!getErrorMessage('vendor_id')}
                hint={getErrorMessage('vendor_id')}
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
                // readOnly // Usuall read-only, but user requested editable
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
                placeholder="e.g. Vendor Quote #"
              />
            </div>
            <div>
              <DatePicker
                id="order_date"
                label="Order Date"
                onChange={(_, dateStr) => {
                  setOrderDate(dateStr);
                  clearError('order_date');
                }}
                defaultDate={orderDate}
                error={!!getErrorMessage('order_date')}
                hint={getErrorMessage('order_date')}
              />
            </div>
            <div>
              <DatePicker
                id="expected_delivery_date"
                label="Expected Delivery Date"
                onChange={(_, dateStr) => {
                  setExpectedDeliveryDate(dateStr);
                  clearError('expected_delivery_date');
                }}
                defaultDate={expectedDeliveryDate}
                error={!!getErrorMessage('expected_delivery_date')}
                hint={getErrorMessage('expected_delivery_date')}
              />
            </div>
            <div>
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
            <div>
              <Label>Warehouse</Label>
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
          </div>

          <div className="mt-6">
            <Label>Notes</Label>
            <TextArea
              value={notes}
              onChange={(value) => setNotes(value)}
              placeholder="Internal notes..."
            />
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

          <div className="overflow-x-auto">
            <div className="min-w-[1250px] space-y-4">
              {/* Table Headers */}
              <div className="grid grid-cols-[minmax(280px,3fr)_minmax(110px,1fr)_minmax(160px,1.5fr)_minmax(160px,1.5fr)_minmax(90px,0.8fr)_minmax(180px,1.4fr)] gap-x-10 px-4 py-3 mb-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg items-end">
                <div className="uppercase text-theme-xs font-bold tracking-wider text-gray-500">
                  Items
                </div>
                <div className="text-center uppercase text-theme-xs font-bold tracking-wider text-gray-500">
                  Quantity
                </div>
                <div className="text-center uppercase text-theme-xs font-bold tracking-wider text-gray-500">
                  Price
                </div>
                <div className="text-center uppercase text-theme-xs font-bold tracking-wider text-gray-500">
                  Discount
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

              {purchaseItems.map((item, index) => {
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
                    <div className="grid grid-cols-[minmax(280px,3fr)_minmax(110px,1fr)_minmax(160px,1.5fr)_minmax(160px,1.5fr)_minmax(90px,0.8fr)_minmax(180px,1.4fr)] gap-x-10 items-center">
                      <div className="min-w-0">
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

                      <div className="min-w-0">
                        <div className="flex min-w-0">
                          <Input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => {
                              handleItemChange(index, 'quantity', Number(e.target.value));
                              clearError(`items.${index}.quantity`);
                            }}
                            className="text-center rounded-r-none border-r-0 px-2"
                            placeholder="Qty"
                          />
                          <div className="flex items-center px-1 border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 rounded-r-lg text-[10px] font-bold text-gray-500 uppercase min-w-[28px] justify-center">
                            {selectedItem?.unit?.code || '-'}
                          </div>
                        </div>
                      </div>

                      <div className="min-w-0">
                        <div className="flex min-w-0">
                          <Input
                            type="number"
                            value={item.unit_price}
                            onChange={(e) => {
                              handleItemChange(index, 'unit_price', Number(e.target.value));
                              clearError(`items.${index}.unit_price`);
                            }}
                            className="rounded-r-none border-r-0 px-2"
                            placeholder="Price"
                          />
                          <div className="flex items-center px-2 border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 rounded-r-lg text-theme-xs font-bold text-gray-500 min-w-[32px] justify-center">
                            {currencySymbol}
                          </div>
                        </div>
                      </div>

                      <div className="min-w-0">
                        <div className="flex min-w-0">
                          <Input
                            type="number"
                            value={item.discount_amount}
                            onChange={(e) =>
                              handleItemChange(index, 'discount_amount', Number(e.target.value))
                            }
                            className="rounded-r-none border-r-0 px-2"
                            placeholder="Discount"
                          />
                          <div className="flex items-center px-2 border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 rounded-r-lg text-theme-xs font-bold text-gray-500 min-w-[32px] justify-center">
                            {currencySymbol}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-center">
                        <span className="font-bold text-gray-700 dark:text-gray-300">
                          {itemTotals.taxRate}%
                        </span>
                      </div>

                      <div className="text-end">
                        <p className="text-lg font-bold text-gray-800 dark:text-white">
                          {itemTotals.netTotal.toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </p>
                      </div>
                    </div>

                    {/* Row 2: Description */}
                    <div className="mt-4">
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
          </div>

          <div className="flex justify-end mt-8">
            <div className="w-full max-w-sm space-y-3">
              <div className="flex justify-between items-center px-4">
                <span className="text-gray-500 font-bold uppercase text-theme-xs">
                  Sub Total ({getSetting<string>('currency_symbol')})
                </span>
                <span className="font-bold text-gray-900 dark:text-white">
                  {orderTotals.subTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between items-center px-4">
                <span className="text-gray-500 font-bold uppercase text-theme-xs">
                  Discount ({getSetting<string>('currency_symbol')})
                </span>
                <span className="font-bold text-gray-900 dark:text-white">
                  -
                  {orderTotals.totalDiscount.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                  })}
                </span>
              </div>
              <div className="flex justify-between items-center px-4">
                <span className="text-gray-500 font-bold uppercase text-theme-xs">
                  Total Tax ({getSetting<string>('currency_symbol')})
                </span>
                <span className="font-bold text-gray-900 dark:text-white">
                  +{orderTotals.totalTax.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between items-center p-4 bg-brand-50 dark:bg-brand-500/10 rounded-xl">
                <span className="text-brand-600 dark:text-brand-400 font-bold uppercase text-theme-sm">
                  Total Amount ({getSetting<string>('currency_symbol')})
                </span>
                <span className="text-xl font-black text-brand-700 dark:text-brand-400">
                  {orderTotals.grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>

          <div className="flex justify-end mt-6">
            <Button type="submit">Create Purchase Order</Button>
          </div>
        </form>
      </ComponentCard>
    </>
  );
}
