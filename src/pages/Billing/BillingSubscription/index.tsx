'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import {
  getCurrentSubscription,
  changePlan,
  cancelSubscription,
} from '../../../services/TenantSubscriptionService';
import { getPlans } from '../../../services/PlanService';
import { RefreshCw, Calendar, CreditCard, AlertTriangle, CheckCircle } from 'lucide-react';
import { Plan, Subscription } from '@/types';
import { useSettings } from '../../../hooks/useSettings';

export default function BillingSubscription() {
  const { formatCurrency, formatDate: globalFormatDate } = useSettings();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [showPlansModal, setShowPlansModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [subscriptionData, plansResponse] = await Promise.all([
        getCurrentSubscription().catch(() => null),
        getPlans({ unpaginated: true }),
      ]);
      setSubscription(subscriptionData);
      setPlans(plansResponse.data as Plan[]);
    } catch {
      toast.error('Failed to load subscription data');
    } finally {
      setLoading(false);
    }
  };

  const handlePlanChange = async (planId: string) => {
    try {
      setActionLoading(true);
      await changePlan(planId);
      toast.success('Plan changed successfully!');
      await loadData();
      setShowPlansModal(false);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to change plan';
      toast.error(message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    try {
      setActionLoading(true);
      await cancelSubscription();
      await loadData();
      setShowCancelModal(false);
      toast.success('Subscription cancelled. Access will continue until end of billing period.');
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to cancel subscription';
      toast.error(message);
    } finally {
      setActionLoading(false);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return globalFormatDate(dateString);
  };

  const getStatusColor = () => {
    if (subscription?.is_canceled) return 'text-orange-600 bg-orange-50';
    if (subscription?.is_on_trial) return 'text-blue-600 bg-blue-50';
    return 'text-green-600 bg-green-50';
    return 'text-gray-600 bg-gray-50';
  };

  const getStatusText = () => {
    if (subscription?.is_canceled) return 'Cancelled';
    if (subscription?.is_on_trial) return 'Trial';
    return 'Active';
    return 'Inactive';
  };

  const getStatusIcon = () => {
    if (subscription?.is_canceled) return <AlertTriangle className="w-4 h-4" />;
    if (subscription?.is_on_trial) return <CheckCircle className="w-4 h-4" />;
    return <CheckCircle className="w-4 h-4" />;
    return <CreditCard className="w-4 h-4" />;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Loading subscription...</span>
      </div>
    );
  }

  if (!subscription) {
    return (
      <div className="text-center p-8">
        <AlertTriangle className="w-12 h-12 text-orange-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          No Active Subscription
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          You don&apos;t have an active subscription.
        </p>
        <button
          onClick={() => setShowPlansModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
        >
          View Plans
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Subscription</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your current subscription and billing
          </p>
        </div>
        <button
          onClick={loadData}
          className="flex items-center gap-2 px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {/* Subscription Card */}
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
              <div
                className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor()}`}
              >
                {getStatusIcon()}
                {getStatusText()}
              </div>
            </div>

            {subscription.plan && (
              <div className="mb-4">
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-gray-900 dark:text-white">
                    {formatCurrency(subscription.plan.price)}
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
        </div>

        <div className="space-y-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Quick Actions</h3>
            <div className="space-y-2">
              {!subscription.is_canceled && (
                <button
                  onClick={() => setShowCancelModal(true)}
                  className="w-full bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg text-sm"
                >
                  Cancel Subscription
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Plans Modal */}
      {showPlansModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Choose Your Plan</h2>
              <button
                onClick={() => setShowPlansModal(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                ✕
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {plans.map((plan) => {
                const isCurrentPlan = subscription?.plan?.id === plan.id;

                return (
                  <div key={plan.id} className="border rounded-lg p-4 bg-white dark:bg-gray-800">
                    <h3 className="text-lg font-semibold mb-2">{plan.name}</h3>
                    <p className="text-2xl font-bold mb-4">{formatCurrency(plan.price)}</p>
                    <p className="text-sm text-gray-600 mb-4">per {plan.interval}</p>
                    <button
                      onClick={() => handlePlanChange(plan.id.toString())}
                      disabled={isCurrentPlan || actionLoading}
                      className={`w-full py-2 px-4 rounded ${
                        isCurrentPlan
                          ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                          : 'bg-blue-600 hover:bg-blue-700 text-white'
                      }`}
                    >
                      {isCurrentPlan
                        ? 'Current Plan'
                        : actionLoading
                          ? 'Changing...'
                          : 'Select Plan'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Cancel Confirmation Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Cancel Subscription
            </h2>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-6 h-6 text-orange-500 mt-1" />
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                    Are you sure you want to cancel?
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">
                    Your subscription will remain active until the end of your current billing
                    period. You can resume your subscription at any time before it expires.
                  </p>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowCancelModal(false)}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded-lg"
                >
                  Keep Subscription
                </button>
                <button
                  onClick={handleCancelSubscription}
                  disabled={actionLoading}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg"
                >
                  {actionLoading ? 'Cancelling...' : 'Cancel Subscription'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
