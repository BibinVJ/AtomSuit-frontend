'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import PageMeta from '../../../components/common/PageMeta';
import PageBreadcrumb from '../../../components/common/PageBreadCrumb';
import ComponentCard from '../../../components/common/ComponentCard';
import { getCustomer } from '../../../services/CustomerService';
import { Customer } from '../../../types';

export default function ViewCustomer() {
  const params = useParams<{ id: string }>();
  const id = params?.id ? Number(params.id) : null;
  const [customer, setCustomer] = useState<Customer | null>(null);

  const fetchCustomerDetails = useCallback(async () => {
    try {
      if (id) {
        const response = await getCustomer(id);
        setCustomer(response);
      }
    } catch (error) {
      console.error('Error fetching customer details:', error);
    }
  }, [id]);

  useEffect(() => {
    fetchCustomerDetails();
  }, [fetchCustomerDetails]);

  if (!customer) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <PageMeta title={`Customer: ${customer.name}`} description="View customer details" />
      <PageBreadcrumb
        pageTitle="Customer Details"
        breadcrumbs={[{ label: 'Customers', path: '/customers' }]}
        backButton={true}
      />

      <div className="flex justify-end gap-2 mb-4">
        {/* Add edit button if needed? The table has edit, but good to have here too */}
      </div>

      <ComponentCard title={customer.name}>
        <div className="space-y-8">
          {/* Basic Info */}
          <div>
            <h3 className="text-lg font-semibold mb-3 dark:text-gray-300 border-b pb-2 border-gray-100 dark:border-gray-700">
              Basic Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
              <div>
                <span className="block text-sm text-gray-500 dark:text-gray-400">Email</span>
                <p className="font-medium text-gray-800 dark:text-gray-200">{customer.email}</p>
              </div>
              <div>
                <span className="block text-sm text-gray-500 dark:text-gray-400">Phone</span>
                <p className="font-medium text-gray-800 dark:text-gray-200">{customer.phone}</p>
              </div>
              <div>
                <span className="block text-sm text-gray-500 dark:text-gray-400">Currency</span>
                <p className="font-medium text-gray-800 dark:text-gray-200">
                  {customer.currency?.code} {customer.currency?.deleted_at ? '(Deleted)' : ''}
                </p>
              </div>
            </div>
          </div>

          {/* Addresses */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold mb-3 dark:text-gray-300 border-b pb-2 border-gray-100 dark:border-gray-700">
                Billing Address
              </h3>
              <div className="text-gray-800 dark:text-gray-200 space-y-1">
                <p>{customer.billing_address_line_1}</p>
                {customer.billing_address_line_2 && <p>{customer.billing_address_line_2}</p>}
                <p>
                  {[customer.billing_city, customer.billing_state, customer.billing_zip_code]
                    .filter(Boolean)
                    .join(', ')}
                </p>
                <p>{customer.billing_country}</p>
                {![customer.billing_address_line_1, customer.billing_city].some(Boolean) && (
                  <p className="text-gray-400 italic">No billing address provided</p>
                )}
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-3 dark:text-gray-300 border-b pb-2 border-gray-100 dark:border-gray-700">
                Shipping Address
              </h3>
              <div className="text-gray-800 dark:text-gray-200 space-y-1">
                <p>{customer.shipping_address_line_1}</p>
                {customer.shipping_address_line_2 && <p>{customer.shipping_address_line_2}</p>}
                <p>
                  {[customer.shipping_city, customer.shipping_state, customer.shipping_zip_code]
                    .filter(Boolean)
                    .join(', ')}
                </p>
                <p>{customer.shipping_country}</p>
                {![customer.shipping_address_line_1, customer.shipping_city].some(Boolean) && (
                  <p className="text-gray-400 italic">No shipping address provided</p>
                )}
              </div>
            </div>
          </div>

          {/* Accounting Details */}
          <div>
            <h3 className="text-lg font-semibold mb-3 dark:text-gray-300 border-b pb-2 border-gray-100 dark:border-gray-700">
              Accounting Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
              <div>
                <span className="block text-sm text-gray-500 dark:text-gray-400">
                  Sales Account
                </span>
                <p className="font-medium text-gray-800 dark:text-gray-200">
                  {customer.sales_account?.name || '-'}
                </p>
              </div>
              <div>
                <span className="block text-sm text-gray-500 dark:text-gray-400">
                  Sales Discount Account
                </span>
                <p className="font-medium text-gray-800 dark:text-gray-200">
                  {customer.sales_discount_account?.name || '-'}
                </p>
              </div>
              <div>
                <span className="block text-sm text-gray-500 dark:text-gray-400">
                  Receivables Account
                </span>
                <p className="font-medium text-gray-800 dark:text-gray-200">
                  {customer.receivables_account?.name || '-'}
                </p>
              </div>
              <div>
                <span className="block text-sm text-gray-500 dark:text-gray-400">
                  Sales Return Account
                </span>
                <p className="font-medium text-gray-800 dark:text-gray-200">
                  {customer.sales_return_account?.name || '-'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </ComponentCard>
    </>
  );
}
