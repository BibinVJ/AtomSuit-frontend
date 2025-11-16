"use client";

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import TenantSubscriptionService, { Plan, Subscription } from '../../services/TenantSubscriptionService';
import { RefreshCw, Star } from 'lucide-react';
import Button from '../../components/ui/button/Button';
import PlanCard from '../../components/plan/PlanCard';
import LifetimePlanCard from '../../components/plan/LifetimePlanCard';

export default function BillingPlans() {
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
      const [plansData, subscriptionData] = await Promise.all([
        TenantSubscriptionService.getAvailablePlans(),
        TenantSubscriptionService.getCurrentSubscription().catch(() => null)
      ]);
      setPlans(plansData);
      setSubscription(subscriptionData);
    } catch (error) {
      toast.error('Failed to load plans');
    } finally {
      setLoading(false);
    }
  };

  const getCurrentPlanPrice = () => {
    if (!subscription?.items.length) return 0;
    return subscription.items[0].price.unit_amount;
  };

  const handlePlanSelect = async (planId: string) => {
    const selectedPlan = plans.find(p => p.id === planId);
    if (!selectedPlan || !subscription) return;

    const currentPrice = getCurrentPlanPrice();
    const newPrice = getDisplayPrice(selectedPlan) * 100;
    const isUpgrade = newPrice > currentPrice;

    try {
      setActionLoading(true);
      if (isUpgrade) {
        await TenantSubscriptionService.upgradePlan(planId);
        toast.success('Plan upgraded successfully!');
      } else {
        await TenantSubscriptionService.downgradePlan(planId);
        toast.success('Plan downgrade scheduled for end of billing period');
      }
      await loadData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to change plan');
    } finally {
      setActionLoading(false);
    }
  };

  const formatAmount = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: (currency || 'USD').toUpperCase(),
    }).format(amount);
  };

  const getDisplayPrice = (plan: Plan) => {
    return plan.price;
  };

  const getDisplayInterval = (plan: Plan) => {
    return plan.interval;
  };

  const getButtonText = (plan: Plan, isCurrentPlan: boolean, isUpgrade: boolean, isDowngrade: boolean) => {
    if (isCurrentPlan) return 'Current Plan';
    if (isUpgrade) return 'Upgrade';
    if (isDowngrade) return 'Downgrade';
    return 'Select Plan';
  };

  const getButtonStyle = (isCurrentPlan: boolean, isUpgrade: boolean, isDowngrade: boolean) => {
    if (isCurrentPlan) return 'bg-gray-100 text-gray-500 cursor-not-allowed';
    if (isUpgrade) return 'bg-green-600 hover:bg-green-700 text-white';
    if (isDowngrade) return 'bg-orange-600 hover:bg-orange-700 text-white';
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

  const currentPrice = getCurrentPlanPrice();
  
  // Filter plans based on billing interval and active status
  const monthlyPlans = plans.filter(plan => 
    plan.is_active && 
    plan.interval === 'month' && 
    !plan.name.toLowerCase().includes('trial') &&
    !plan.name.toLowerCase().includes('expired') &&
    !plan.is_expired_user_plan
  );
  
  const yearlyPlans = plans.filter(plan => 
    plan.is_active && 
    plan.interval === 'year' && 
    !plan.name.toLowerCase().includes('trial') &&
    !plan.name.toLowerCase().includes('expired') &&
    !plan.is_expired_user_plan
  );
  
  const lifetimePlans = plans.filter(plan => 
    plan.is_active && 
    (plan.interval === 'lifetime' || plan.name.toLowerCase().includes('lifetime')) &&
    !plan.is_expired_user_plan
  );
  
  const displayPlans = billingInterval === 'monthly' ? monthlyPlans : yearlyPlans;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Choose Your Plan</h1>
          <p className="text-gray-600 dark:text-gray-400">Select the perfect plan for your business needs</p>
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
          const displayPrice = getDisplayPrice(plan);
          const planPrice = displayPrice * 100;
          const isCurrentPlan = subscription?.stripe_price === plan.stripe_price_id;
          const isUpgrade = planPrice > currentPrice;
          const isDowngrade = planPrice < currentPrice;

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
                buttonText={actionLoading ? 'Processing...' : getButtonText(plan, isCurrentPlan, isUpgrade, isDowngrade)}
                buttonStyle={getButtonStyle(isCurrentPlan, isUpgrade, isDowngrade)}
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
              const displayPrice = getDisplayPrice(plan);
              const planPrice = displayPrice * 100;
              const isCurrentPlan = subscription?.stripe_price === plan.stripe_price_id;
              const isUpgrade = planPrice > currentPrice;
              const isDowngrade = planPrice < currentPrice;

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
                    buttonText={actionLoading ? 'Processing...' : getButtonText(plan, isCurrentPlan, isUpgrade, isDowngrade)}
                    buttonStyle={getButtonStyle(isCurrentPlan, isUpgrade, isDowngrade)}
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