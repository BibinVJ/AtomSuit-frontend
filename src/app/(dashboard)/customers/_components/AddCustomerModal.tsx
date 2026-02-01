import { useState, useEffect } from 'react';
import FormModal from '@/components/common/FormModal';
import Input from '@/components/form/input/InputField';
import Label from '@/components/form/Label';
import Select from '@/components/form/Select';
import { toast } from 'sonner';
import { addCustomer } from '@/services/CustomerService';
import { getCurrencies } from '@/services/CurrencyService';
import { getChartOfAccounts } from '@/services/ChartOfAccountService';
import { getTaxGroups } from '@/services/TaxService';
import { getPriceLists } from '@/services/PriceListService';
import { isApiError } from '@/utils/errors';
import { CustomerInput, Currency, ChartOfAccount, TaxGroup } from '@/types';
import { PriceList } from '@/types/PriceList';
import { useSettings } from '@/hooks/useSettings';

import CollapsibleSection from '@/components/common/CollapsibleSection';
import Button from '@/components/ui/button/Button';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddCustomerModal({ isOpen, onClose, onSuccess }: Props) {
  const { getSetting } = useSettings();
  const [formData, setFormData] = useState<CustomerInput>({
    name: '',
    email: '',
    phone: '',
    currency_id: undefined,
    price_list_id: undefined,
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
    tax_group_id: undefined,
  });

  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [priceLists, setPriceLists] = useState<PriceList[]>([]);
  const [chartOfAccounts, setChartOfAccounts] = useState<ChartOfAccount[]>([]);
  const [taxGroups, setTaxGroups] = useState<TaxGroup[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchData();
      // Set default accounts if not already set
      setFormData((prev) => ({
        ...prev,
        currency_id: prev.currency_id || getSetting('currency'),
        sales_account_id: prev.sales_account_id || getSetting('default_sales_account'),
        sales_discount_account_id:
          prev.sales_discount_account_id || getSetting('default_sales_discount_account'),
        receivables_account_id:
          prev.receivables_account_id || getSetting('default_receivable_account'),
        sales_return_account_id:
          prev.sales_return_account_id || getSetting('default_sales_return_account'),
      }));
    }
  }, [isOpen, getSetting]);

  const fetchData = async () => {
    try {
      const [currencyRes, coaRes, taxGroupRes, priceListRes] = await Promise.all([
        getCurrencies({ unpaginated: true }),
        getChartOfAccounts({ unpaginated: true }),
        getTaxGroups({ unpaginated: true }),
        getPriceLists({ unpaginated: true, type: 'sales' }),
      ]);
      setCurrencies(currencyRes.data);
      setChartOfAccounts(coaRes.data);
      setTaxGroups(taxGroupRes.data);
      setPriceLists(priceListRes.data);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      toast.error('Failed to load form data');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      currency_id: undefined,
      price_list_id: undefined,
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
      tax_group_id: undefined,
    });
    setErrors({});
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const copyBillingToShipping = () => {
    setFormData((prev) => ({
      ...prev,
      shipping_address_line_1: prev.billing_address_line_1,
      shipping_address_line_2: prev.billing_address_line_2,
      shipping_city: prev.billing_city,
      shipping_state: prev.billing_state,
      shipping_country: prev.billing_country,
      shipping_zip_code: prev.billing_zip_code,
    }));
    toast.info('Copied Billing Address to Shipping Address');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await addCustomer(formData);
      onSuccess();
      toast.success('Customer added successfully');
      handleClose();
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
        toast.error('Failed to add customer');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <FormModal
      isOpen={isOpen}
      onClose={handleClose}
      onSubmit={handleSubmit}
      title="Add New Customer"
      description="Fill in the details to add a new customer."
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
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              error={!!errors.email}
              hint={errors.email}
            />
          </div>
          <div>
            <Label>Phone</Label>
            <Input
              type="text"
              value={formData.phone}
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
              options={currencies.map((c) => ({
                value: String(c.id),
                label: `${c.code} - ${c.name}`,
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

          <div>
            <Label>
              Price List <span className="text-red-500">*</span>
            </Label>
            <Select
              options={priceLists.map((pl) => ({ value: String(pl.id), label: pl.name }))}
              value={formData.price_list_id ? String(formData.price_list_id) : ''}
              onChange={(val) => setFormData({ ...formData, price_list_id: Number(val) })}
              placeholder="Select Price List"
              error={!!errors.price_list_id}
            />
            {errors.price_list_id && (
              <p className="mt-1 text-xs text-red-500">{errors.price_list_id}</p>
            )}
          </div>

          <div>
            <Label>Tax Group</Label>
            <Select
              options={taxGroups.map((tg) => ({ value: String(tg.id), label: tg.name }))}
              value={String(formData.tax_group_id || '')}
              onChange={(val) => setFormData({ ...formData, tax_group_id: Number(val) })}
              placeholder="Select Default Tax Group"
              error={!!errors.tax_group_id}
            />
            {errors.tax_group_id && (
              <p className="mt-1 text-xs text-red-500">{errors.tax_group_id}</p>
            )}
          </div>
        </div>

        <CollapsibleSection title="Accounting Details">
          <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
            <div>
              <Label>
                Sales Account <span className="text-red-500">*</span>
              </Label>
              <Select
                options={chartOfAccounts.map((c) => ({
                  value: String(c.id),
                  label: `${c.code} - ${c.name}`,
                }))}
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
                options={chartOfAccounts.map((c) => ({
                  value: String(c.id),
                  label: `${c.code} - ${c.name}`,
                }))}
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
                options={chartOfAccounts.map((c) => ({
                  value: String(c.id),
                  label: `${c.code} - ${c.name}`,
                }))}
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
                options={chartOfAccounts.map((c) => ({
                  value: String(c.id),
                  label: `${c.code} - ${c.name}`,
                }))}
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
        </CollapsibleSection>

        <CollapsibleSection title="Billing Address">
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
        </CollapsibleSection>

        <CollapsibleSection
          title="Shipping Address"
          rightElement={
            <Button size="sm" variant="outline" type="button" onClick={copyBillingToShipping}>
              Copy from Billing
            </Button>
          }
        >
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
        </CollapsibleSection>
      </div>
    </FormModal>
  );
}
