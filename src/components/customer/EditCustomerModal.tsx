import { useState, useEffect } from 'react';
import FormModal from '../common/FormModal';
import Input from '../form/input/InputField';
import Label from '../form/Label';
import Select from '../form/Select';
import TextArea from '../form/input/TextArea';
import { toast } from 'sonner';
import { updateCustomer } from '../../services/CustomerService';
import { getCurrencies } from '../../services/CurrencyService';
import { getChartOfAccounts } from '../../services/ChartOfAccountService';
import { isApiError } from '../../utils/errors';
import { Customer, CustomerInput, Currency, ChartOfAccount } from '../../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  customer: Customer;
}

export default function EditCustomerModal({ isOpen, onClose, onSuccess, customer }: Props) {
  const [formData, setFormData] = useState<CustomerInput>({
    name: '',
    email: '',
    phone: '',
    currency_id: undefined,
    sales_account_id: undefined,
    sales_discount_account_id: undefined,
    receivables_account_id: undefined,
    sales_return_account_id: undefined,
    billing_address_line_1: '',
    billing_address_line_2: '',
    billing_city: '',
    billing_state: '',
    billing_country: '',
    billing_zip_code: '',
    shipping_address_line_1: '',
    shipping_address_line_2: '',
    shipping_city: '',
    shipping_state: '',
    shipping_country: '',
    shipping_zip_code: '',
  });

  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [chartOfAccounts, setChartOfAccounts] = useState<ChartOfAccount[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (customer) {
      setFormData({
        name: customer.name || '',
        email: customer.email || '',
        phone: customer.phone || '',
        currency_id: customer.currency?.id,
        sales_account_id: customer.sales_account?.id,
        sales_discount_account_id: customer.sales_discount_account?.id,
        receivables_account_id: customer.receivables_account?.id,
        sales_return_account_id: customer.sales_return_account?.id,
        billing_address_line_1: customer.billing_address_line_1 || '',
        billing_address_line_2: customer.billing_address_line_2 || '',
        billing_city: customer.billing_city || '',
        billing_state: customer.billing_state || '',
        billing_country: customer.billing_country || '',
        billing_zip_code: customer.billing_zip_code || '',
        shipping_address_line_1: customer.shipping_address_line_1 || '',
        shipping_address_line_2: customer.shipping_address_line_2 || '',
        shipping_city: customer.shipping_city || '',
        shipping_state: customer.shipping_state || '',
        shipping_country: customer.shipping_country || '',
        shipping_zip_code: customer.shipping_zip_code || '',
      });
    }
  }, [customer]);

  useEffect(() => {
    if (isOpen) {
      fetchData();
    }
  }, [isOpen]);

  const fetchData = async () => {
    try {
      const [currencyRes, coaRes] = await Promise.all([
        getCurrencies({ unpaginated: true, trashed: 'with' }),
        getChartOfAccounts({ unpaginated: true, trashed: 'with' }),
      ]);
      setCurrencies(currencyRes.data);
      setChartOfAccounts(coaRes.data);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      toast.error('Failed to load form data');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await updateCustomer(customer.id, formData);
      onSuccess();
      toast.success('Customer updated successfully');
      onClose();
    } catch (error: unknown) {
      if (isApiError(error) && error.response?.status === 422) {
        const apiErrors = error.response.data.errors;
        if (apiErrors) {
          setErrors(
            Object.keys(apiErrors).reduce(
              (acc, key) => {
                acc[key] = apiErrors[key][0];
                return acc;
              },
              {} as Record<string, string>
            )
          );
        }
        toast.error('Please correct the errors in the form');
      } else {
        toast.error('Failed to update customer');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const getFilteredAccounts = (selectedId?: number | undefined) => {
    return chartOfAccounts
      .filter((c) => !c.deleted_at || c.id === selectedId)
      .map((c) => ({
        value: String(c.id),
        label: c.deleted_at ? `${c.code} - ${c.name} (Deleted)` : `${c.code} - ${c.name}`,
        className: c.deleted_at ? 'text-red-500' : '',
      }));
  };

  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={handleSubmit}
      title="Edit Customer"
      description="Update the details of the customer."
      isSubmitting={isSubmitting}
      size="2xl"
    >
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
          <div>
            <Label>
              Name <span className="text-red-500">*</span>
            </Label>
            <Input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              error={!!errors.name}
              hint={errors.name}
            />
          </div>
          <div>
            <Label>Email</Label>
            <Input
              type="email"
              value={formData.email || ''}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              error={!!errors.email}
              hint={errors.email}
            />
          </div>
          <div>
            <Label>Phone</Label>
            <Input
              type="text"
              value={formData.phone || ''}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              error={!!errors.phone}
              hint={errors.phone}
            />
          </div>
          <div>
            <Label>
              Currency <span className="text-red-500">*</span>
            </Label>
            <Select
              options={currencies
                .filter((c) => !c.deleted_at || c.id === formData.currency_id)
                .map((c) => ({
                  value: String(c.id),
                  label: c.deleted_at ? `${c.code} - ${c.name} (Deleted)` : `${c.code} - ${c.name}`,
                  className: c.deleted_at ? 'text-red-500' : '',
                }))}
              value={formData.currency_id ? String(formData.currency_id) : ''}
              onChange={(val) => setFormData({ ...formData, currency_id: Number(val) })}
              placeholder="Select Currency"
              error={!!errors.currency_id}
            />
            {errors.currency_id && (
              <p className="mt-1 text-xs text-red-500">{errors.currency_id}</p>
            )}
          </div>
        </div>

        <div>
          <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-4 border-b pb-2 border-gray-200 dark:border-gray-700">
            Accounting Details
          </h4>
          <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
            <div>
              <Label>
                Sales Account <span className="text-red-500">*</span>
              </Label>
              <Select
                options={getFilteredAccounts(formData.sales_account_id)}
                value={formData.sales_account_id ? String(formData.sales_account_id) : ''}
                onChange={(val) => setFormData({ ...formData, sales_account_id: Number(val) })}
                placeholder="Select Sales Account"
                error={!!errors.sales_account_id}
              />
              {errors.sales_account_id && (
                <p className="mt-1 text-xs text-red-500">{errors.sales_account_id}</p>
              )}
            </div>
            <div>
              <Label>
                Sales Discount Account <span className="text-red-500">*</span>
              </Label>
              <Select
                options={getFilteredAccounts(formData.sales_discount_account_id)}
                value={
                  formData.sales_discount_account_id
                    ? String(formData.sales_discount_account_id)
                    : ''
                }
                onChange={(val) =>
                  setFormData({ ...formData, sales_discount_account_id: Number(val) })
                }
                placeholder="Select Discount Account"
                error={!!errors.sales_discount_account_id}
              />
              {errors.sales_discount_account_id && (
                <p className="mt-1 text-xs text-red-500">{errors.sales_discount_account_id}</p>
              )}
            </div>
            <div>
              <Label>
                Receivables Account <span className="text-red-500">*</span>
              </Label>
              <Select
                options={getFilteredAccounts(formData.receivables_account_id)}
                value={
                  formData.receivables_account_id ? String(formData.receivables_account_id) : ''
                }
                onChange={(val) =>
                  setFormData({ ...formData, receivables_account_id: Number(val) })
                }
                placeholder="Select Receivables Account"
                error={!!errors.receivables_account_id}
              />
              {errors.receivables_account_id && (
                <p className="mt-1 text-xs text-red-500">{errors.receivables_account_id}</p>
              )}
            </div>
            <div>
              <Label>
                Sales Return Account <span className="text-red-500">*</span>
              </Label>
              <Select
                options={getFilteredAccounts(formData.sales_return_account_id)}
                value={
                  formData.sales_return_account_id ? String(formData.sales_return_account_id) : ''
                }
                onChange={(val) =>
                  setFormData({ ...formData, sales_return_account_id: Number(val) })
                }
                placeholder="Select Return Account"
                error={!!errors.sales_return_account_id}
              />
              {errors.sales_return_account_id && (
                <p className="mt-1 text-xs text-red-500">{errors.sales_return_account_id}</p>
              )}
            </div>
          </div>
        </div>

        <div className="mt-6">
          <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-4 border-b pb-2 border-gray-200 dark:border-gray-700">
            Billing Address
          </h4>
          <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
            <div>
              <Label>Address Line 1</Label>
              <Input
                type="text"
                value={formData.billing_address_line_1 || ''}
                onChange={(e) =>
                  setFormData({ ...formData, billing_address_line_1: e.target.value })
                }
              />
            </div>
            <div>
              <Label>Address Line 2</Label>
              <Input
                type="text"
                value={formData.billing_address_line_2 || ''}
                onChange={(e) =>
                  setFormData({ ...formData, billing_address_line_2: e.target.value })
                }
              />
            </div>
            <div>
              <Label>City</Label>
              <Input
                type="text"
                value={formData.billing_city || ''}
                onChange={(e) => setFormData({ ...formData, billing_city: e.target.value })}
              />
            </div>
            <div>
              <Label>State</Label>
              <Input
                type="text"
                value={formData.billing_state || ''}
                onChange={(e) => setFormData({ ...formData, billing_state: e.target.value })}
              />
            </div>
            <div>
              <Label>Country</Label>
              <Input
                type="text"
                value={formData.billing_country || ''}
                onChange={(e) => setFormData({ ...formData, billing_country: e.target.value })}
              />
            </div>
            <div>
              <Label>Zip Code</Label>
              <Input
                type="text"
                value={formData.billing_zip_code || ''}
                onChange={(e) => setFormData({ ...formData, billing_zip_code: e.target.value })}
              />
            </div>
          </div>
        </div>

        <div className="mt-6">
          <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-4 border-b pb-2 border-gray-200 dark:border-gray-700">
            Shipping Address
          </h4>
          <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
            <div>
              <Label>Address Line 1</Label>
              <Input
                type="text"
                value={formData.shipping_address_line_1 || ''}
                onChange={(e) =>
                  setFormData({ ...formData, shipping_address_line_1: e.target.value })
                }
              />
            </div>
            <div>
              <Label>Address Line 2</Label>
              <Input
                type="text"
                value={formData.shipping_address_line_2 || ''}
                onChange={(e) =>
                  setFormData({ ...formData, shipping_address_line_2: e.target.value })
                }
              />
            </div>
            <div>
              <Label>City</Label>
              <Input
                type="text"
                value={formData.shipping_city || ''}
                onChange={(e) => setFormData({ ...formData, shipping_city: e.target.value })}
              />
            </div>
            <div>
              <Label>State</Label>
              <Input
                type="text"
                value={formData.shipping_state || ''}
                onChange={(e) => setFormData({ ...formData, shipping_state: e.target.value })}
              />
            </div>
            <div>
              <Label>Country</Label>
              <Input
                type="text"
                value={formData.shipping_country || ''}
                onChange={(e) => setFormData({ ...formData, shipping_country: e.target.value })}
              />
            </div>
            <div>
              <Label>Zip Code</Label>
              <Input
                type="text"
                value={formData.shipping_zip_code || ''}
                onChange={(e) => setFormData({ ...formData, shipping_zip_code: e.target.value })}
              />
            </div>
          </div>
        </div>
      </div>
    </FormModal>
  );
}
