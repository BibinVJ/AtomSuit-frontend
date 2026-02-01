'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import PageMeta from '@/components/common/PageMeta';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import ComponentCard from '@/components/common/ComponentCard';
import { getVendor } from '@/services/VendorService';
import { Vendor } from '@/types';

export default function ViewVendor() {
  const params = useParams<{ id: string }>();
  const id = params?.id ? Number(params.id) : null;
  const [vendor, setVendor] = useState<Vendor | null>(null);

  const fetchVendorDetails = useCallback(async () => {
    try {
      if (id) {
        const response = await getVendor(id);
        setVendor(response);
      }
    } catch (error) {
      console.error('Error fetching vendor details:', error);
    }
  }, [id]);

  useEffect(() => {
    fetchVendorDetails();
  }, [fetchVendorDetails]);

  if (!vendor) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <PageMeta title={`Vendor: ${vendor.name}`} description="View vendor details" />
      <PageBreadcrumb
        pageTitle="Vendor Details"
        breadcrumbs={[{ label: 'Vendors', path: '/vendors' }]}
        backButton={true}
      />

      <div className="flex justify-end gap-2 mb-4">{/* Edit button could go here */}</div>

      <ComponentCard title={vendor.name}>
        <div className="space-y-8">
          {/* Basic Info */}
          <div>
            <h3 className="text-lg font-semibold mb-3 dark:text-gray-300 border-b pb-2 border-gray-100 dark:border-gray-700">
              Basic Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
              <div>
                <span className="block text-sm text-gray-500 dark:text-gray-400">Email</span>
                <p className="font-medium text-gray-800 dark:text-gray-200">{vendor.email}</p>
              </div>
              <div>
                <span className="block text-sm text-gray-500 dark:text-gray-400">Phone</span>
                <p className="font-medium text-gray-800 dark:text-gray-200">{vendor.phone}</p>
              </div>
              <div>
                <span className="block text-sm text-gray-500 dark:text-gray-400">Currency</span>
                <p className="font-medium text-gray-800 dark:text-gray-200">
                  {vendor.currency?.code} {vendor.currency?.deleted_at ? '(Deleted)' : ''}
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
                <p>{vendor.billing_address_line_1}</p>
                {vendor.billing_address_line_2 && <p>{vendor.billing_address_line_2}</p>}
                <p>
                  {[vendor.billing_city, vendor.billing_state, vendor.billing_zip_code]
                    .filter(Boolean)
                    .join(', ')}
                </p>
                <p>{vendor.billing_country}</p>
                {![vendor.billing_address_line_1, vendor.billing_city].some(Boolean) && (
                  <p className="text-gray-400 italic">No billing address provided</p>
                )}
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-3 dark:text-gray-300 border-b pb-2 border-gray-100 dark:border-gray-700">
                Shipping Address
              </h3>
              <div className="text-gray-800 dark:text-gray-200 space-y-1">
                <p>{vendor.shipping_address_line_1}</p>
                {vendor.shipping_address_line_2 && <p>{vendor.shipping_address_line_2}</p>}
                <p>
                  {[vendor.shipping_city, vendor.shipping_state, vendor.shipping_zip_code]
                    .filter(Boolean)
                    .join(', ')}
                </p>
                <p>{vendor.shipping_country}</p>
                {![vendor.shipping_address_line_1, vendor.shipping_city].some(Boolean) && (
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
                  Payables Account
                </span>
                <p className="font-medium text-gray-800 dark:text-gray-200">
                  {vendor.payables_account?.name || '-'}
                </p>
              </div>
              <div>
                <span className="block text-sm text-gray-500 dark:text-gray-400">
                  Purchase Account
                </span>
                <p className="font-medium text-gray-800 dark:text-gray-200">
                  {vendor.purchase_account?.name || '-'}
                </p>
              </div>
              <div>
                <span className="block text-sm text-gray-500 dark:text-gray-400">
                  Purchase Discount Account
                </span>
                <p className="font-medium text-gray-800 dark:text-gray-200">
                  {vendor.purchase_discount_account?.name || '-'}
                </p>
              </div>
              <div>
                <span className="block text-sm text-gray-500 dark:text-gray-400">
                  Purchase Return Account
                </span>
                <p className="font-medium text-gray-800 dark:text-gray-200">
                  {vendor.purchase_return_account?.name || '-'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </ComponentCard>
    </>
  );
}
