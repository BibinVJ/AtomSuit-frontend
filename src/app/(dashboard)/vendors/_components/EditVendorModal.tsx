'use client';

import { useState, useEffect } from 'react';
import FormModal from '@/components/common/FormModal';
import Input from '@/components/form/input/InputField';
import Label from '@/components/form/Label';
import Select from '@/components/form/Select';
import { toast } from 'sonner';
import { updateVendor } from '@/services/VendorService';
import { getCurrencies } from '@/services/CurrencyService';
import { getChartOfAccounts } from '@/services/ChartOfAccountService';
import { getTaxGroups } from '@/services/TaxService';
import { getPriceLists } from '@/services/PriceListService';
import { isApiError } from '@/utils/errors';
import { Vendor, VendorInput, Currency, ChartOfAccount, TaxGroup } from '@/types';
import { PriceList } from '@/types/PriceList';

import CollapsibleSection from '@/components/common/CollapsibleSection';
import Button from '@/components/ui/button/Button';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  vendor: Vendor;
}

export default function EditVendorModal({ isOpen, onClose, onSuccess, vendor }: Props) {
  const [formData, setFormData] = useState<VendorInput>({
    name: '',
    email: '',
    phone: '',
    currency_id: undefined,
    payables_account_id: undefined,
    purchase_account_id: undefined,
    purchase_discount_account_id: undefined,
    purchase_return_account_id: undefined,
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
    price_list_id: undefined,
  });

  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [priceLists, setPriceLists] = useState<PriceList[]>([]);
  const [chartOfAccounts, setChartOfAccounts] = useState<ChartOfAccount[]>([]);
  const [taxGroups, setTaxGroups] = useState<TaxGroup[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (vendor) {
      setFormData({
        name: vendor.name || '',
        email: vendor.email || '',
        phone: vendor.phone || '',
        currency_id: vendor.currency?.id,
        payables_account_id: vendor.payables_account?.id,
        purchase_account_id: vendor.purchase_account?.id,
        purchase_discount_account_id: vendor.purchase_discount_account?.id,
        purchase_return_account_id: vendor.purchase_return_account?.id,
        billing_address_line_1: vendor.billing_address_line_1 || '',
        billing_address_line_2: vendor.billing_address_line_2 || '',
        billing_city: vendor.billing_city || '',
        billing_state: vendor.billing_state || '',
        billing_country: vendor.billing_country || '',
        billing_zip_code: vendor.billing_zip_code || '',
        shipping_address_line_1: vendor.shipping_address_line_1 || '',
        shipping_address_line_2: vendor.shipping_address_line_2 || '',
        shipping_city: vendor.shipping_city || '',
        shipping_state: vendor.shipping_state || '',
        shipping_country: vendor.shipping_country || '',
        shipping_zip_code: vendor.shipping_zip_code || '',
        tax_group_id: vendor.tax_group_id,
        price_list_id: vendor.price_list_id ?? undefined,
      });
    }
  }, [vendor]);

  useEffect(() => {
    if (isOpen) {
      fetchData();
    }
  }, [isOpen]);

  const fetchData = async () => {
    try {
      const [currencyRes, coaRes, taxGroupRes, priceListRes] = await Promise.all([
        getCurrencies({ unpaginated: true, trashed: 'with' }),
        getChartOfAccounts({ unpaginated: true, trashed: 'with' }),
        getTaxGroups({ unpaginated: true }),
        getPriceLists({ unpaginated: true, type: 'purchase' }),
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await updateVendor(vendor.id, formData);
      onSuccess();
      toast.success('Vendor updated successfully');
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
        toast.error('Failed to update vendor');
      }
    } finally {
      setIsSubmitting(false);
    }
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

  const getFilteredAccounts = (selectedId?: number | undefined) => {
    return chartOfAccounts
      .filter((c) => !c.deleted_at || c.id === selectedId)
      .map((c) => ({
        value: String(c.id),
        label: c.deleted_at ? `${c.code} - ${c.name} (Deleted)` : `${c.code} - ${c.name}`,
        variant: (c.deleted_at ? 'danger' : 'default') as 'danger' | 'default',
      }));
  };

  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={handleSubmit}
      title="Edit Vendor"
      description="Update the details of the vendor."
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
            <Label>Currency</Label>
            <Select
              options={currencies
                .filter((c) => !c.deleted_at || c.id === formData.currency_id)
                .map((c) => ({
                  value: String(c.id),
                  label: c.deleted_at ? `${c.code} - ${c.name} (Deleted)` : `${c.code} - ${c.name}`,
                  variant: (c.deleted_at ? 'danger' : 'default') as 'danger' | 'default',
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
                Payables Account <span className="text-red-500">*</span>
              </Label>
              <Select
                options={getFilteredAccounts(formData.payables_account_id)}
                value={formData.payables_account_id ? String(formData.payables_account_id) : ''}
                onChange={(val) => setFormData({ ...formData, payables_account_id: Number(val) })}
                placeholder="Select Payables Account"
                error={!!errors.payables_account_id}
              />
              {errors.payables_account_id && (
                <p className="mt-1 text-xs text-red-500">{errors.payables_account_id}</p>
              )}
            </div>
            <div>
              <Label>
                Purchase Account <span className="text-red-500">*</span>
              </Label>
              <Select
                options={getFilteredAccounts(formData.purchase_account_id)}
                value={formData.purchase_account_id ? String(formData.purchase_account_id) : ''}
                onChange={(val) => setFormData({ ...formData, purchase_account_id: Number(val) })}
                placeholder="Select Purchase Account"
                error={!!errors.purchase_account_id}
              />
              {errors.purchase_account_id && (
                <p className="mt-1 text-xs text-red-500">{errors.purchase_account_id}</p>
              )}
            </div>
            <div>
              <Label>
                Purchase Discount Account <span className="text-red-500">*</span>
              </Label>
              <Select
                options={getFilteredAccounts(formData.purchase_discount_account_id)}
                value={
                  formData.purchase_discount_account_id
                    ? String(formData.purchase_discount_account_id)
                    : ''
                }
                onChange={(val) =>
                  setFormData({ ...formData, purchase_discount_account_id: Number(val) })
                }
                placeholder="Select Discount Account"
                error={!!errors.purchase_discount_account_id}
              />
              {errors.purchase_discount_account_id && (
                <p className="mt-1 text-xs text-red-500">{errors.purchase_discount_account_id}</p>
              )}
            </div>
            <div>
              <Label>
                Purchase Return Account <span className="text-red-500">*</span>
              </Label>
              <Select
                options={getFilteredAccounts(formData.purchase_return_account_id)}
                value={
                  formData.purchase_return_account_id
                    ? String(formData.purchase_return_account_id)
                    : ''
                }
                onChange={(val) =>
                  setFormData({ ...formData, purchase_return_account_id: Number(val) })
                }
                placeholder="Select Return Account"
                error={!!errors.purchase_return_account_id}
              />
              {errors.purchase_return_account_id && (
                <p className="mt-1 text-xs text-red-500">{errors.purchase_return_account_id}</p>
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
