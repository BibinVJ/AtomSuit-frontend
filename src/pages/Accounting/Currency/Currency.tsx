'use client';

import { useState } from 'react';
import PageBreadcrumb from '../../../components/common/PageBreadCrumb';
import PageMeta from '../../../components/common/PageMeta';
import ExchangeRatesList from '../../../components/accounting/exchange-rates/ExchangeRatesList';
import CurrencyList from '../../../components/accounting/currencies/CurrencyList';

export default function Currency() {
  const [activeTab, setActiveTab] = useState<'currency' | 'rates'>('currency');

  return (
    <>
      <PageMeta title="Currency & Rates" description="Manage system currency and exchange rates" />
      <PageBreadcrumb pageTitle="Currency" />

      <div className="mb-6">
        <div className="inline-flex p-1 bg-gray-100 rounded-lg dark:bg-gray-800">
          <button
            onClick={() => setActiveTab('currency')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
              activeTab === 'currency'
                ? 'bg-brand-600 text-white shadow-sm'
                : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
            }`}
          >
            Currency
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

      {activeTab === 'currency' ? <CurrencyList /> : <ExchangeRatesList />}
    </>
  );
}
