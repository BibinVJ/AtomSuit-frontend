"use client";

import { useState } from 'react';
import { Subscription } from '../../types';
import Button from '../ui/button/Button';
import { Calendar, CreditCard, AlertTriangle, CheckCircle } from 'lucide-react';

interface Props {
  subscription: Subscription;
}

export default function SubscriptionCard({ subscription }: Props) {
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  const formatAmount = (amount: number | string) => {
    return `$${amount}`;
  };

  const getStatusColor = () => {
    if (subscription.is_canceled) return 'text-orange-600 bg-orange-50';
    if (subscription.is_on_trial) return 'text-blue-600 bg-blue-50';
    if (subscription.is_active) return 'text-green-600 bg-green-50';
    return 'text-gray-600 bg-gray-50';
  };

  const getStatusText = () => {
    if (subscription.is_canceled) return 'Cancelled';
    if (subscription.is_on_trial) return 'Trial';
    if (subscription.is_active) return 'Active';
    return 'Inactive';
  };

  const getStatusIcon = () => {
    if (subscription.is_canceled) return <AlertTriangle className="w-4 h-4" />;
    if (subscription.is_active || subscription.is_on_trial) return <CheckCircle className="w-4 h-4" />;
    return <CreditCard className="w-4 h-4" />;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Current Subscription
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Subscription ID: {subscription.stripe_id}
          </p>
        </div>
        <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor()}`}>
          {getStatusIcon()}
          {getStatusText()}
        </div>
      </div>

      {subscription.plan && (
        <div className="mb-4">
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold text-gray-900 dark:text-white">
              {formatAmount(subscription.plan.price)}
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              per {subscription.plan.interval}
            </span>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {subscription.plan.name}
          </p>
        </div>
      )}

      <div className="space-y-3 mb-6">
        {subscription.trial_ends_at && subscription.is_on_trial && (
          <div className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400">
            <Calendar className="w-4 h-4" />
            <span>Trial ends: {formatDate(subscription.trial_ends_at)}</span>
          </div>
        )}

        {subscription.ends_at && subscription.is_canceled && (
          <div className="flex items-center gap-2 text-sm text-orange-600 dark:text-orange-400">
            <AlertTriangle className="w-4 h-4" />
            <span>Cancels on: {formatDate(subscription.ends_at)}</span>
          </div>
        )}

        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
          <Calendar className="w-4 h-4" />
          <span>Created: {formatDate(subscription.created_at)}</span>
        </div>
      </div>


    </div>
  );
}