"use client";


import { useState, useEffect } from 'react';
import PageBreadcrumb from '../../components/common/PageBreadCrumb';
import ComponentCard from '../../components/common/ComponentCard';
import PageMeta from '../../components/common/PageMeta';
import Button from '../../components/ui/button/Button';
import Select from '../../components/form/Select';
import Input from '../../components/form/input/InputField';
import Label from '../../components/form/Label';
import { useRouter } from 'next/navigation';
import DatePicker from '../../components/form/date-picker';
import { useSettings } from '../../hooks/useSettings';
import { toast } from 'sonner';
import TextArea from '../../components/form/input/TextArea';
import { getCustomers } from '../../services/CustomerService';
import { getItems, getItem } from '../../services/ItemService';
import { getNextInvoiceNumber, addSale } from '../../services/SaleService';

import AddCustomerModal from '../../components/customer/AddCustomerModal';
import { useModal } from '../../hooks/useModal';
import { Customer, Item } from '../../types';
import { Plus } from 'lucide-react';
import { isApiError } from '../../utils/errors';

interface SaleItem {
  item_id: string;
  quantity: number;
  unit_price: number;
  description: string;
  stock_on_hand: number;
}

interface ApiError {
  [key: string]: string[];
}

export default function AddSale() {
  const { formatDate } = useSettings();
  const { isOpen: isCustomerModalOpen, openModal: openCustomerModal, closeModal: closeCustomerModal } = useModal();
  const router = useRouter();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [customerId, setCustomerId] = useState('');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [saleDate, setSaleDate] = useState(new Date().toISOString().split('T')[0]);
  const [saleItems, setSaleItems] = useState<SaleItem[]>([
    { item_id: '', quantity: 1, unit_price: 0, description: '', stock_on_hand: 0 }
  ]);
  const [errors, setErrors] = useState<ApiError>({});

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const [customerResponse, itemResponse, invoiceResponse] = await Promise.all([
        getCustomers(1, 10, 'created_at', 'desc', true),
        getItems(1, 10, 'created_at', 'desc', true),
        getNextInvoiceNumber()
      ]);
      setCustomers(customerResponse.data || customerResponse);
      setItems(itemResponse.data || itemResponse);
      if (invoiceResponse) {
        setInvoiceNumber(invoiceResponse.data.invoice_number);
      }
    } catch (error) {
      console.error('Error fetching initial data:', error);
    }
  };

  const handleAddItem = () => {
    setSaleItems([...saleItems, { item_id: '', quantity: 1, unit_price: 0, description: '', stock_on_hand: 0 }]);
  };

  const handleItemChange = async (index: number, field: keyof SaleItem, value: string | number) => {
    const newItems = [...saleItems];
    newItems[index] = { ...newItems[index], [field]: value };

    if (field === 'item_id' && value) {
      try {
        const itemDetails = await getItem(String(value));
        newItems[index].stock_on_hand = (itemDetails.is_expired_sale_enabled
          ? itemDetails.stock_on_hand
          : itemDetails.non_expired_stock) || 0;
      } catch (error) {
        console.error('Error fetching item details:', error);
        newItems[index].stock_on_hand = 0;
      }
    }

    setSaleItems(newItems);
  };

  const handleRemoveItem = (index: number) => {
    const newItems = [...saleItems];
    newItems.splice(index, 1);
    setSaleItems(newItems);
  };

  const validateForm = () => {
    const newErrors: ApiError = {};

    if (!customerId) newErrors.customer_id = ['Customer is required.'];
    if (!invoiceNumber.trim()) newErrors.invoice_number = ['Invoice number is required.'];
    if (!saleDate) newErrors.sale_date = ['Sale date is required.'];
    if (saleItems.length === 0) newErrors.items = ['At least one item is required.'];

    saleItems.forEach((item, index) => {
      if (!item.item_id) newErrors[`items.${index}.item_id`] = ['Item is required.'];
      if (item.quantity <= 0) newErrors[`items.${index}.quantity`] = ['Quantity must be greater than 0.'];
      if (item.quantity > item.stock_on_hand) newErrors[`items.${index}.quantity`] = [`Quantity cannot exceed available stock of ${item.stock_on_hand}.`];
      if (item.unit_price < 0) newErrors[`items.${index}.unit_price`] = ['Unit price cannot be negative.'];
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
      await addSale({
        customer_id: customerId,
        invoice_number: invoiceNumber,
        sale_date: saleDate,
        items: saleItems.map(({ ...item }) => item),
      });
      toast.success('Sale created successfully');
      router.push('/sales');
    } catch (error: unknown) {
      if (isApiError(error) && error.response?.status === 422) {
        setErrors(error.response.data.errors || {});
        toast.error('Please correct the errors in the form');
      } else {
        console.error('Error creating sale:', error);
        toast.error('Failed to create sale');
      }
    }
  };

  const clearError = (field: string) => {
    if (errors[field]) {
      setErrors(prev => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const getErrorMessage = (field: string) => errors[field]?.[0] || '';

  const handleCustomerAdded = (newCustomer: Customer) => {
    setCustomers(prev => [...prev, newCustomer]);
    setCustomerId(String(newCustomer.id));
    closeCustomerModal();
  };

  return (
    <>
      <PageMeta
        title="Add Sale"
        description="Add a new sale"
      />
      <PageBreadcrumb pageTitle="Add Sale" breadcrumbs={[{ label: 'Sales', path: '/sales' }]} backButton={true}/>
      <ComponentCard>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <Label>Customer</Label>
              <div className="flex items-center gap-2">
                <Select
                  options={customers.map(c => ({ value: String(c.id), label: c.name }))}
                  onChange={(value) => { setCustomerId(value); clearError('customer_id'); }}
                  defaultValue={customerId}
                  placeholder="Select a customer"
                  error={!!getErrorMessage('customer_id')}
                  hint={getErrorMessage('customer_id')}
                  className="flex-grow"
                />
                <Button type="button" onClick={openCustomerModal} className="p-1" size='xs'>
                  <Plus></Plus>
                </Button>
              </div>
            </div>
            <div>
              <Label>Invoice Number</Label>
              <Input
                type="text"
                value={invoiceNumber}
                onChange={(e) => { setInvoiceNumber(e.target.value); clearError('invoice_number'); }}
                error={!!getErrorMessage('invoice_number')}
                hint={getErrorMessage('invoice_number')}
              />
            </div>
            <div>
              <DatePicker
                id="sale_date"
                label="Sale Date"
                onChange={(_, dateStr: string) => { setSaleDate(dateStr); clearError('sale_date'); }}
                defaultDate={saleDate}
                error={!!getErrorMessage('sale_date')}
                hint={getErrorMessage('sale_date')}
              />
            </div>
          </div>

          <div className="flex items-center justify-between mt-6 mb-4">
            <h3 className="text-lg font-semibold dark:text-gray-400">Items</h3>
            
            <Button type="button" variant="outline" onClick={handleAddItem}>
              Add Item
            </Button>
          </div>
          {getErrorMessage('items') && <p className="text-sm text-red-500 mb-4">{getErrorMessage('items')}</p>}

          {saleItems.map((item, index) => (
            <div key={index} className="relative p-4 mb-4 border rounded-lg">
              <button
                type="button"
                onClick={() => handleRemoveItem(index)}
                className="absolute p-1 text-red-500 bg-red-100 rounded-full -top-2 -right-2 hover:bg-red-300"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
                <div className="md:col-span-2">
                  <Label>Item</Label>
                  <Select
                    options={items.map(i => ({ value: String(i.id), label: i.name }))}
                    onChange={(value) => { handleItemChange(index, 'item_id', value); clearError(`items.${index}.item_id`); }}
                    defaultValue={item.item_id}
                    placeholder="Select an item"
                    error={!!getErrorMessage(`items.${index}.item_id`)}
                    hint={getErrorMessage(`items.${index}.item_id`)}
                  />
                </div>
                <div>
                  <Label>Quantity</Label>
                  <div className="relative">
                    <Input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => { handleItemChange(index, 'quantity', Number(e.target.value)); clearError(`items.${index}.quantity`); }}
                      error={!!getErrorMessage(`items.${index}.quantity`)}
                      hint={getErrorMessage(`items.${index}.quantity`)}
                    />
                    {item.item_id && (
                      <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500">
                        {items.find(i => i.id === Number(item.item_id))?.unit.code}
                      </span>
                    )}
                  </div>
                   {item.item_id && (
                    <p className={`text-sm mt-1 ${
                        item.stock_on_hand === 0 ? 'text-red-500' :
                        item.stock_on_hand < 10 ? 'text-orange-500' :
                        'text-gray-500'
                    }`}>
                        Available: {item.stock_on_hand}
                    </p>
                  )}
                </div>
                <div>
                  <Label>Unit Price</Label>
                  <Input
                    type="number"
                    value={item.unit_price}
                    onChange={(e) => { handleItemChange(index, 'unit_price', Number(e.target.value)); clearError(`items.${index}.unit_price`); }}
                    error={!!getErrorMessage(`items.${index}.unit_price`)}
                    hint={getErrorMessage(`items.${index}.unit_price`)}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4 mt-4">
                <div>
                    <Label>Description</Label>
                    <TextArea
                        value={item.description}
                        className="bg-gray-100 dark:bg-gray-800"
                    />
                </div>
              </div>
              <div className="flex justify-end mt-4">
                <div className="flex items-center space-x-4">
                  <span className="font-semibold dark:text-gray-400">Total:</span>
                  <span className="font-bold dark:text-white">
                    {(item.quantity * item.unit_price).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          ))}

          <div className="flex justify-end mt-6">
            <div className="flex items-center space-x-4">
                <span className="text-lg font-semibold dark:text-gray-400">Net Total:</span>
                <span className="text-lg font-bold dark:text-white">
                    {saleItems.reduce((acc, item) => acc + (item.quantity * item.unit_price), 0).toFixed(2)}
                </span>
            </div>
          </div>

          <div className="flex justify-end mt-6">
            <Button type="submit">
              Save Sale
            </Button>
          </div>
        </form>
      </ComponentCard>
      <AddCustomerModal isOpen={isCustomerModalOpen} onClose={closeCustomerModal} onCustomerAdded={handleCustomerAdded} />
    </>
  );
}
