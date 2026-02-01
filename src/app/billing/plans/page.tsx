'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { getCurrentSubscription, changePlan } from '@/services/TenantSubscriptionService';
import { getPlans } from '@/services/PlanService';
import { RefreshCw, Star } from 'lucide-react';
import PlanCard from '@/app/plans/_components/PlanCard';
import LifetimePlanCard from '@/app/plans/_components/LifetimePlanCard';
import { Plan, Subscription } from '@/types';
import { useSettings } from '@/hooks/useSettings';

export default function BillingPlans() {
  const {} = useSettings();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [billingInterval, setBillingInterval] = useState<'monthly' | 'yearly'>('monthly');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [plansResponse, subscriptionData] = await Promise.all([
        getPlans({ unpaginated: true }),
        getCurrentSubscription().catch(() => null),
      ]);
      setPlans(plansResponse.data as Plan[]);
      setSubscription(subscriptionData);
    } catch {
      toast.error('Failed to load plans');
    } finally {
      setLoading(false);
    }
  };

  const handlePlanSelect = async (planId: string) => {
    try {
      setActionLoading(true);
      await changePlan(planId);
      toast.success('Plan changed successfully!');
      await loadData();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to change plan';
      toast.error(message);
    } finally {
      setActionLoading(false);
    }
  };

  const getButtonText = (isCurrentPlan: boolean) => {
    if (isCurrentPlan) return 'Current Plan';
    return 'Change Plan';
  };

  const getButtonStyle = (isCurrentPlan: boolean) => {
    if (isCurrentPlan) return 'bg-gray-100 text-gray-500 cursor-not-allowed';
    return 'bg-blue-600 hover:bg-blue-700 text-white';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Loading plans...</span>
      </div>
    );
  }

  // Filter plans based on billing interval and active status
  const monthlyPlans = plans.filter(
    (plan) =>
      plan.interval === 'month' &&
      !plan.name.toLowerCase().includes('trial') &&
      !plan.name.toLowerCase().includes('expired') &&
      !plan.is_expired_user_plan
  );

  const yearlyPlans = plans.filter(
    (plan) =>
      plan.interval === 'year' &&
      !plan.name.toLowerCase().includes('trial') &&
      !plan.name.toLowerCase().includes('expired') &&
      !plan.is_expired_user_plan
  );

  const lifetimePlans = plans.filter(
    (plan) =>
      (plan.interval === 'lifetime' || plan.name.toLowerCase().includes('lifetime')) &&
      !plan.is_expired_user_plan
  );

  const displayPlans = billingInterval === 'monthly' ? monthlyPlans : yearlyPlans;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Choose Your Plan</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Select the perfect plan for your business needs
          </p>
        </div>
        <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
          <button
            onClick={() => setBillingInterval('monthly')}
            className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
              billingInterval === 'monthly'
                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-400'
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setBillingInterval('yearly')}
            className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
              billingInterval === 'yearly'
                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-400'
            }`}
          >
            Yearly
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {displayPlans.map((plan) => {
          const isCurrentPlan = subscription?.plan?.id === plan.id;

          return (
            <div key={plan.id} className="relative">
              {isCurrentPlan && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                  <div className="bg-blue-500 text-white px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2">
                    <Star className="w-4 h-4" />
                    Your Plan
                  </div>
                </div>
              )}
              <PlanCard
                plan={plan}
                onSelect={handlePlanSelect}
                buttonText={actionLoading ? 'Processing...' : getButtonText(isCurrentPlan)}
                buttonStyle={getButtonStyle(isCurrentPlan)}
                disabled={isCurrentPlan || actionLoading}
              />
            </div>
          );
        })}
      </div>

      {/* Lifetime Plans */}
      {lifetimePlans.length > 0 && (
        <div className="mt-12">
          <div className="text-center mb-8">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Lifetime Plans</h2>
            <p className="text-gray-600 dark:text-gray-400">One-time payment, lifetime access</p>
          </div>
          <div className="space-y-8">
            {lifetimePlans.map((plan) => {
              const isCurrentPlan = subscription?.plan?.id === plan.id;

              return (
                <div key={plan.id} className="relative">
                  {isCurrentPlan && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                      <div className="bg-purple-500 text-white px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2">
                        <Star className="w-4 h-4" />
                        Your Plan
                      </div>
                    </div>
                  )}
                  <LifetimePlanCard
                    plan={plan}
                    onSelect={handlePlanSelect}
                    buttonText={actionLoading ? 'Processing...' : getButtonText(isCurrentPlan)}
                    buttonStyle={getButtonStyle(isCurrentPlan)}
                    disabled={isCurrentPlan || actionLoading}
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
