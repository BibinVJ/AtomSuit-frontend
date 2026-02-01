'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import * as TenantSubscriptionService from '@/services/TenantSubscriptionService';
import { Subscription } from '@/types';
import Button from '@/components/ui/button/Button';
import { CreditCard, AlertTriangle, CheckCircle, Calendar } from 'lucide-react';

export default function SubscriptionWidget() {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    loadSubscription();
  }, []);

  const loadSubscription = async () => {
    try {
      const data = await TenantSubscriptionService.getCurrentSubscription();
      setSubscription(data);
    } catch {
      // Subscription not found or error - handle gracefully
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusInfo = () => {
    if (!subscription) return { color: 'text-gray-500', icon: CreditCard, text: 'No Subscription' };

    if (subscription.stripe_status === 'past_due')
      return {
        color: 'text-red-600',
        icon: AlertTriangle,
        text: 'Payment Overdue',
      };
    if (subscription.is_canceled)
      return {
        color: 'text-orange-600',
        icon: AlertTriangle,
        text: 'Cancelled',
      };
    if (subscription.is_on_trial)
      return {
        color: 'text-blue-600',
        icon: CheckCircle,
        text: 'Free Trial',
      };
    return {
      color: 'text-green-600',
      icon: CheckCircle,
      text: 'Active',
    };

    return { color: 'text-gray-500', icon: CreditCard, text: 'Inactive' };
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
          <div className="h-6 bg-gray-200 rounded w-3/4"></div>
        </div>
      </div>
    );
  }

  const statusInfo = getStatusInfo();
  const StatusIcon = statusInfo.icon;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
          Subscription Status
        </h3>
        <div className={`flex items-center gap-1 ${statusInfo.color}`}>
          <StatusIcon className="w-4 h-4" />
          <span className="text-xs font-medium">{statusInfo.text}</span>
        </div>
      </div>

      {subscription ? (
        <div className="space-y-2">
          {subscription.plan && (
            <div className="flex items-baseline gap-1">
              <span className="text-lg font-semibold text-gray-900 dark:text-white">
                ${subscription.plan.price}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                /{subscription.plan.interval}
              </span>
            </div>
          )}

          {subscription.ends_at && (
            <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
              <Calendar className="w-3 h-3" />
              <span>Ends {formatDate(subscription.ends_at)}</span>
            </div>
          )}

          {subscription.trial_ends_at && subscription.is_on_trial && (
            <div className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400">
              <Calendar className="w-3 h-3" />
              <span>Trial ends {formatDate(subscription.trial_ends_at)}</span>
            </div>
          )}

          {subscription.ends_at && subscription.is_canceled && (
            <div className="flex items-center gap-1 text-xs text-orange-600 dark:text-orange-400">
              <AlertTriangle className="w-3 h-3" />
              <span>Ends {formatDate(subscription.ends_at)}</span>
            </div>
          )}
        </div>
      ) : (
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
          No active subscription found
        </p>
      )}

      <Button
        onClick={() => router.push('/subscription')}
        size="xs"
        className="w-full mt-3 bg-blue-600 hover:bg-blue-700 text-white"
      >
        Manage Subscription
      </Button>
    </div>
  );
}
