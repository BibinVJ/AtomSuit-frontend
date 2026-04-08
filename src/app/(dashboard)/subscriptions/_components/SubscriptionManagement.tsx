'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import {
  getCurrentSubscription,
  changePlan,
  cancelSubscription,
} from '@/services/TenantSubscriptionService';
import { getPlans } from '@/services/PlanService';
import { Plan, Subscription } from '@/types';
import SubscriptionCard from './SubscriptionCard';
import Button from '@/components/ui/button/Button';
import { Modal } from '@/components/ui/modal';
import ConfirmModal from '@/components/common/ConfirmModal';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default function SubscriptionManagement() {
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

  const getCurrentPlanId = () => {
    return subscription?.plan?.id;
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

  const handleResumeSubscription = async () => {
    // Resume functionality not available in current API
    toast.info('Resume functionality not yet implemented');
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
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Active Subscription</h3>
        <p className="text-gray-600 mb-4">You don&apos;t have an active subscription.</p>
        <Button
          onClick={() => setShowPlansModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          View Plans
        </Button>
      </div>
    );
  }

  const currentPlanId = getCurrentPlanId();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Subscription Management
        </h2>
        <Button
          onClick={loadData}
          size="sm"
          className="bg-gray-100 hover:bg-gray-200 text-gray-700"
        >
          <RefreshCw className="w-4 h-4 mr-1" />
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <SubscriptionCard subscription={subscription} />
        </div>

        <div className="space-y-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Quick Actions</h3>
            <div className="space-y-2">
              {subscription.is_canceled ? (
                <Button
                  onClick={handleResumeSubscription}
                  disabled={actionLoading}
                  className="w-full bg-green-600 hover:bg-green-700 text-white"
                  size="sm"
                >
                  Resume Subscription
                </Button>
              ) : (
                <Button
                  onClick={() => setShowCancelModal(true)}
                  className="w-full bg-red-600 hover:bg-red-700 text-white"
                  size="sm"
                >
                  Cancel Subscription
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Plans Modal */}
      <Modal
        isOpen={showPlansModal}
        onClose={() => setShowPlansModal(false)}
        className="max-w-6xl mx-4 p-6"
      >
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Choose Your Plan</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plans.map((plan) => {
            const isCurrentPlan = currentPlanId === plan.id;

            return (
              <div key={plan.id} className="border rounded-lg p-4 bg-white dark:bg-gray-800">
                <h3 className="text-lg font-semibold mb-2">{plan.name}</h3>
                <p className="text-2xl font-bold mb-4">${plan.price}</p>
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
                  {isCurrentPlan ? 'Current Plan' : actionLoading ? 'Changing...' : 'Select Plan'}
                </button>
              </div>
            );
          })}
        </div>
      </Modal>

      {/* Cancel Confirmation Modal */}
      <ConfirmModal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        onConfirm={handleCancelSubscription}
        isLoading={actionLoading}
        title="Cancel Subscription"
        message="Are you sure you want to cancel? Your subscription will remain active until the end of your current billing period. You can resume your subscription at any time before it expires."
        confirmLabel="Cancel Subscription"
        cancelLabel="Keep Subscription"
        variant="warning"
      />
    </div>
  );
}
