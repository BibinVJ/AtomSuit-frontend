"use client";

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import TenantSubscriptionService, { 
  Subscription, 
  Plan 
} from '../../services/TenantSubscriptionService';
import SubscriptionCard from './SubscriptionCard';
import PlanCard from './PlanCard';
import Button from '../ui/button/Button';
import { Modal } from '../ui/modal';
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
      const [subscriptionData, plansData] = await Promise.all([
        TenantSubscriptionService.getCurrentSubscription(),
        TenantSubscriptionService.getAvailablePlans()
      ]);
      setSubscription(subscriptionData);
      setPlans(plansData);
    } catch (error) {
      toast.error('Failed to load subscription data');
    } finally {
      setLoading(false);
    }
  };

  const getCurrentPlanPrice = () => {
    if (!subscription?.items.length) return 0;
    return subscription.items[0].price.unit_amount;
  };

  const handlePlanChange = async (planId: string) => {
    const selectedPlan = plans.find(p => p.id === planId);
    if (!selectedPlan || !subscription) return;

    const currentPrice = getCurrentPlanPrice();
    const newPrice = selectedPlan.price * 100; // Convert to cents
    const isUpgrade = newPrice > currentPrice;

    try {
      setActionLoading(true);
      let updatedSubscription;
      
      if (isUpgrade) {
        updatedSubscription = await TenantSubscriptionService.upgradePlan(planId);
        toast.success('Plan upgraded successfully!');
      } else {
        updatedSubscription = await TenantSubscriptionService.downgradePlan(planId);
        toast.success('Plan downgrade scheduled for end of billing period');
      }
      
      setSubscription(updatedSubscription);
      setShowPlansModal(false);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to change plan');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    try {
      setActionLoading(true);
      const updatedSubscription = await TenantSubscriptionService.cancelSubscription();
      setSubscription(updatedSubscription);
      setShowCancelModal(false);
      toast.success('Subscription cancelled. Access will continue until end of billing period.');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to cancel subscription');
    } finally {
      setActionLoading(false);
    }
  };

  const handleResumeSubscription = async () => {
    try {
      setActionLoading(true);
      const updatedSubscription = await TenantSubscriptionService.resumeSubscription();
      setSubscription(updatedSubscription);
      toast.success('Subscription resumed successfully!');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to resume subscription');
    } finally {
      setActionLoading(false);
    }
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
        <p className="text-gray-600 mb-4">You don't have an active subscription.</p>
        <Button onClick={() => setShowPlansModal(true)} className="bg-blue-600 hover:bg-blue-700 text-white">
          View Plans
        </Button>
      </div>
    );
  }

  const currentPrice = getCurrentPlanPrice();

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
          <SubscriptionCard 
            subscription={subscription}
            onManage={() => setShowPlansModal(true)}
          />
        </div>
        
        <div className="space-y-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Quick Actions</h3>
            <div className="space-y-2">
              <Button
                onClick={() => setShowPlansModal(true)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                size="sm"
              >
                Change Plan
              </Button>
              
              {subscription.is_cancelled ? (
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
            const planPrice = plan.price * 100; // Convert to cents
            const isCurrentPlan = planPrice === currentPrice;
            const isUpgrade = planPrice > currentPrice;
            const isDowngrade = planPrice < currentPrice;

            return (
              <PlanCard
                key={plan.id}
                plan={plan}
                isCurrentPlan={isCurrentPlan}
                isUpgrade={isUpgrade}
                isDowngrade={isDowngrade}
                onSelect={handlePlanChange}
                loading={actionLoading}
              />
            );
          })}
        </div>
      </Modal>

      {/* Cancel Confirmation Modal */}
      <Modal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        className="max-w-md mx-4 p-6"
      >
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Cancel Subscription</h2>
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-6 h-6 text-orange-500 mt-1" />
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                Are you sure you want to cancel?
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Your subscription will remain active until the end of your current billing period. 
                You can resume your subscription at any time before it expires.
              </p>
            </div>
          </div>
          
          <div className="flex gap-3 pt-4">
            <Button
              onClick={() => setShowCancelModal(false)}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700"
            >
              Keep Subscription
            </Button>
            <Button
              onClick={handleCancelSubscription}
              disabled={actionLoading}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white"
            >
              {actionLoading ? 'Cancelling...' : 'Cancel Subscription'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}