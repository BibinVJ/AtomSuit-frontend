'use client';

import { useState, useEffect, useCallback } from 'react';
import PageBreadcrumb from '../../../components/common/PageBreadCrumb';
import ComponentCard from '../../../components/common/ComponentCard';
import PageMeta from '../../../components/common/PageMeta';
import Button from '../../../components/ui/button/Button';
import Select from '../../../components/form/Select';
import Input from '../../../components/form/input/InputField';
import Label from '../../../components/form/Label';
import TextArea from '../../../components/form/input/TextArea';
import { useRouter, useParams } from 'next/navigation';
import DatePicker from '../../../components/form/date-picker';
import { toast } from 'sonner';
import { getVendors } from '../../../services/VendorService';
import { getItems } from '../../../services/ItemService';
import { Item, Vendor } from '../../../types';
import { getPurchase, updatePurchase } from '../../../services/PurchaseService';
import { isApiError } from '../../../utils/errors';

interface PurchaseItem {
  id?: number;
  item_id: string;
  description: string;
  batch_number: string;
  expiry_date: string;
  manufacture_date: string;
  quantity: number;
  unit_cost: number;
}

interface ApiError {
  [key: string]: string[];
}

export default function EditPurchase() {
  const params = useParams<{ id: string }>();
  const id = params?.id;
  const router = useRouter();
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [vendorId, setVendorId] = useState('');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [purchaseDate, setPurchaseDate] = useState('');
  const [purchaseItems, setPurchaseItems] = useState<PurchaseItem[]>([]);
  const [errors, setErrors] = useState<ApiError>({});

  const fetchInitialData = useCallback(async () => {
    try {
      const [vendorResponse, itemResponse, purchase] = await Promise.all([
        getVendors({
          page: 1,
          limit: 10,
          sortCol: 'created_at',
          sortDir: 'desc',
          unpaginated: true,
        }),
        getItems({
          page: 1,
          limit: 10,
          sortCol: 'created_at',
          sortDir: 'desc',
          unpaginated: true,
        }),
        getPurchase(id!),
      ]);
      setVendors(vendorResponse.data);
      setItems(itemResponse.data);

      const { vendor, invoice_number, purchase_date, items } = purchase;
      setVendorId(String(vendor.id));
      setInvoiceNumber(invoice_number);
      setPurchaseDate(purchase_date);
      setPurchaseItems(
        items.map(
          (item: {
            id: number;
            item: { id: number };
            description: string;
            batch: { batch_number: string; expiry_date: string; manufacture_date: string };
            quantity: number;
            unit_cost: number;
          }) => ({
            id: item.id,
            item_id: String(item.item.id),
            description: item.description || '',
            batch_number: item.batch.batch_number,
            expiry_date: item.batch.expiry_date,
            manufacture_date: item.batch.manufacture_date,
            quantity: item.quantity,
            unit_cost: item.unit_cost,
          })
        )
      );
    } catch (error) {
      console.error('Error fetching initial data:', error);
    }
  }, [id]);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  const handleAddItem = () => {
    setPurchaseItems([
      ...purchaseItems,
      {
        item_id: '',
        description: '',
        batch_number: '',
        expiry_date: '',
        manufacture_date: '',
        quantity: 1,
        unit_cost: 0,
      },
    ]);
  };

  const handleItemChange = (index: number, field: keyof PurchaseItem, value: string | number) => {
    const newItems = purchaseItems.map((item, i) => {
      if (i === index) {
        return { ...item, [field]: value };
      }
      return item;
    });
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
    if (!invoiceNumber.trim()) newErrors.invoice_number = ['Invoice number is required.'];
    if (!purchaseDate) newErrors.purchase_date = ['Purchase date is required.'];
    if (purchaseItems.length === 0) newErrors.items = ['At least one item is required.'];

    purchaseItems.forEach((item, index) => {
      const selectedItem = items.find((i) => i.id === Number(item.item_id));
      if (!item.item_id) newErrors[`items.${index}.item_id`] = ['Item is required.'];
      if (!item.batch_number.trim())
        newErrors[`items.${index}.batch_number`] = ['Batch number is required.'];
      if (item.quantity <= 0)
        newErrors[`items.${index}.quantity`] = ['Quantity must be greater than 0.'];
      if (item.unit_cost < 0)
        newErrors[`items.${index}.unit_cost`] = ['Unit cost cannot be negative.'];
      if (selectedItem && selectedItem.type === 'product') {
        if (!item.manufacture_date)
          newErrors[`items.${index}.manufacture_date`] = ['MFG date is required.'];
        if (!item.expiry_date)
          newErrors[`items.${index}.expiry_date`] = ['Expiry date is required.'];
      }
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

    const payload = {
      vendor_id: vendorId,
      invoice_number: invoiceNumber,
      purchase_date: purchaseDate,
      payment_status: 'pending',
      items: purchaseItems.map((item) => ({ ...item, unit_price: item.unit_cost })),
    };

    try {
      await updatePurchase(id!, payload);
      toast.success('Purchase updated successfully');
      router.push('/purchases');
    } catch (error: unknown) {
      if (isApiError(error) && error.response?.status === 422) {
        setErrors(error.response.data.errors || {});
        toast.error('Please correct the errors in the form');
      } else {
        console.error('Error updating purchase:', error);
        toast.error('Failed to update purchase');
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

  const isProduct = (itemId: string) => {
    const item = items.find((i) => i.id === Number(itemId));
    return item?.type === 'product';
  };

  return (
    <>
      <PageMeta title="Edit Purchase" description="Edit an existing purchase" />
      <PageBreadcrumb
        pageTitle="Edit Purchase"
        breadcrumbs={[{ label: 'Purchases', path: '/purchases' }]}
        backButton={true}
      />

      <ComponentCard>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
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
              <Label>Invoice Number</Label>
              <Input
                type="text"
                value={invoiceNumber}
                onChange={(e) => {
                  setInvoiceNumber(e.target.value);
                  clearError('invoice_number');
                }}
                error={!!getErrorMessage('invoice_number')}
                hint={getErrorMessage('invoice_number')}
              />
            </div>
            <div>
              <DatePicker
                id="purchase_date"
                label="Purchase Date"
                onChange={(_, dateStr) => {
                  setPurchaseDate(dateStr);
                  clearError('purchase_date');
                }}
                defaultDate={purchaseDate}
                error={!!getErrorMessage('purchase_date')}
                hint={getErrorMessage('purchase_date')}
              />
            </div>
          </div>

          <div className="flex items-center justify-between mt-6 mb-4">
            <h3 className="text-lg font-semibold dark:text-gray-400">Items</h3>
            <Button type="button" variant="outline" onClick={handleAddItem}>
              Add Item
            </Button>
          </div>
          {getErrorMessage('items') && (
            <p className="text-sm text-red-500 mb-4">{getErrorMessage('items')}</p>
          )}

          {purchaseItems.map((item, index) => (
            <div key={index} className="relative p-4 mb-4 border rounded-lg">
              <button
                type="button"
                onClick={() => handleRemoveItem(index)}
                className="absolute p-1 text-red-500 bg-red-100 rounded-full -top-2 -right-2 hover:bg-red-300"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  ></path>
                </svg>
              </button>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
                <div className="md:col-span-2">
                  <Label>Item</Label>
                  <Select
                    options={items.map((i) => ({ value: String(i.id), label: i.name }))}
                    onChange={(value) => {
                      handleItemChange(index, 'item_id', value);
                      clearError(`items.${index}.item_id`);
                    }}
                    defaultValue={item.item_id}
                    placeholder="Select an item"
                    error={!!getErrorMessage(`items.${index}.item_id`)}
                    hint={getErrorMessage(`items.${index}.item_id`)}
                  />
                </div>
                <div>
                  <Label>Batch #</Label>
                  <Input
                    type="text"
                    value={item.batch_number}
                    onChange={(e) => {
                      handleItemChange(index, 'batch_number', e.target.value);
                      clearError(`items.${index}.batch_number`);
                    }}
                    error={!!getErrorMessage(`items.${index}.batch_number`)}
                    hint={getErrorMessage(`items.${index}.batch_number`)}
                  />
                </div>
                <div>
                  <Label>Quantity</Label>
                  <div className="relative">
                    <Input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => {
                        handleItemChange(index, 'quantity', Number(e.target.value));
                        clearError(`items.${index}.quantity`);
                      }}
                      error={!!getErrorMessage(`items.${index}.quantity`)}
                      hint={getErrorMessage(`items.${index}.quantity`)}
                    />
                    {item.item_id && (
                      <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500">
                        {items.find((i) => i.id === Number(item.item_id))?.unit.code}
                      </span>
                    )}
                  </div>
                </div>
                <div>
                  <Label>Unit Cost</Label>
                  <Input
                    type="number"
                    value={item.unit_cost}
                    onChange={(e) => {
                      handleItemChange(index, 'unit_cost', Number(e.target.value));
                      clearError(`items.${index}.unit_cost`);
                    }}
                    error={!!getErrorMessage(`items.${index}.unit_cost`)}
                    hint={getErrorMessage(`items.${index}.unit_cost`)}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4 mt-4 md:grid-cols-3">
                <div>
                  <Label>Description</Label>
                  <TextArea
                    value={item.description}
                    onChange={(value) => handleItemChange(index, 'description', value)}
                  />
                </div>
                <div>
                  <DatePicker
                    id={`manufacture_date_${index}`}
                    label={
                      <>
                        MFG Date{' '}
                        {isProduct(item.item_id) && <span className="text-red-500">*</span>}
                      </>
                    }
                    onChange={(_, dateStr) => {
                      handleItemChange(index, 'manufacture_date', dateStr);
                      clearError(`items.${index}.manufacture_date`);
                    }}
                    defaultDate={item.manufacture_date}
                    error={!!getErrorMessage(`items.${index}.manufacture_date`)}
                    hint={getErrorMessage(`items.${index}.manufacture_date`)}
                  />
                </div>
                <div>
                  <DatePicker
                    id={`expiry_date_${index}`}
                    label={
                      <>
                        Expiry Date{' '}
                        {isProduct(item.item_id) && <span className="text-red-500">*</span>}
                      </>
                    }
                    onChange={(_, dateStr) => {
                      handleItemChange(index, 'expiry_date', dateStr);
                      clearError(`items.${index}.expiry_date`);
                    }}
                    defaultDate={item.expiry_date}
                    error={!!getErrorMessage(`items.${index}.expiry_date`)}
                    hint={getErrorMessage(`items.${index}.expiry_date`)}
                  />
                </div>
              </div>
              <div className="flex justify-end mt-4">
                <div className="flex items-center space-x-4">
                  <span className="font-semibold dark:text-gray-400">Total:</span>
                  <span className="font-bold dark:text-white">
                    {(item.quantity * item.unit_cost).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          ))}

          <div className="flex justify-end mt-6">
            <div className="flex items-center space-x-4">
              <span className="text-lg font-semibold dark:text-gray-400">Net Total:</span>
              <span className="text-lg font-bold dark:text-white">
                {purchaseItems
                  .reduce((acc, item) => acc + item.quantity * item.unit_cost, 0)
                  .toFixed(2)}
              </span>
            </div>
          </div>

          <div className="flex justify-end mt-6">
            <Button type="submit">Update Purchase</Button>
          </div>
        </form>
      </ComponentCard>
    </>
  );
}
