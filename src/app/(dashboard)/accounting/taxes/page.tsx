'use client';

import { useState } from 'react';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import PageMeta from '@/components/common/PageMeta';
import TaxGroupList from '@/app/(dashboard)/accounting/_components/tax-groups/TaxGroupList';
import TaxRateList from '@/app/(dashboard)/accounting/_components/tax-rates/TaxRateList';

export default function Taxes() {
  const [activeTab, setActiveTab] = useState<'groups' | 'rates'>('groups');

  return (
    <>
      <PageMeta title="Taxes" description="Manage system tax rates and tax groups" />
      <PageBreadcrumb pageTitle="Taxes" />

      <div className="mb-6">
        <div className="inline-flex p-1 bg-gray-100 rounded-lg dark:bg-gray-800">
          <button
            onClick={() => setActiveTab('groups')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
              activeTab === 'groups'
                ? 'bg-brand-600 text-white shadow-sm'
                : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
            }`}
          >
            Tax Groups
          </button>
          <button
            onClick={() => setActiveTab('rates')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
              activeTab === 'rates'
                ? 'bg-brand-600 text-white shadow-sm'
                : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
            }`}
          >
            Tax Rates
          </button>
        </div>
      </div>

      {activeTab === 'groups' ? <TaxGroupList /> : <TaxRateList />}
    </>
  );
}
