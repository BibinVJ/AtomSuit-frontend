'use client';

import { useState } from 'react';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import PageMeta from '@/components/common/PageMeta';
import ExchangeRatesList from '@/app/(dashboard)/accounting/_components/exchange-rates/ExchangeRatesList';
import CurrencyList from '@/app/(dashboard)/accounting/_components/currencies/CurrencyList';

export default function Currencies() {
  const [activeTab, setActiveTab] = useState<'currencies' | 'rates'>('currencies');

  return (
    <>
      <PageMeta
        title="Currencies & Rates"
        description="Manage system currencies and exchange rates"
      />
      <PageBreadcrumb pageTitle="Currencies" />

      <div className="mb-6">
        <div className="inline-flex p-1 bg-gray-100 rounded-lg dark:bg-gray-800">
          <button
            onClick={() => setActiveTab('currencies')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
              activeTab === 'currencies'
                ? 'bg-brand-600 text-white shadow-sm'
                : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
            }`}
          >
            Currencies
          </button>
          <button
            onClick={() => setActiveTab('rates')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
              activeTab === 'rates'
                ? 'bg-brand-600 text-white shadow-sm'
                : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
            }`}
          >
            Exchange Rates
          </button>
        </div>
      </div>

      {activeTab === 'currencies' ? <CurrencyList /> : <ExchangeRatesList />}
    </>
  );
}
