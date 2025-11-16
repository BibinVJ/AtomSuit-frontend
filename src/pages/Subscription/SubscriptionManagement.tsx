"use client";

import { useEffect, useState } from 'react';
import PageBreadcrumb from '../../components/common/PageBreadCrumb';
import ComponentCard from '../../components/common/ComponentCard';
import PageMeta from '../../components/common/PageMeta';
import PlanCard from '../../components/subscription/PlanCard';
import Button from '../../components/ui/button/Button';
import Badge from '../../components/ui/badge/Badge';
import { getPlans } from '../../services/PlanService';
import { getSubscriptions } from '../../services/SubscriptionService';
import { useAuth } from '../../hooks/useAuth';
import { toast } from 'sonner';
import { Plan, Subscription } from '../../types';
import { CreditCard, Calendar, TrendingUp, AlertCircle } from 'lucide-react';

export default function SubscriptionManagement() {
  const { user } = useAuth();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [currentSubscription, setCurrentSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      // Fetch all active plans
      const plansResponse = await getPlans(1, 100, 'price', 'asc', { is_active: true });
      const plansData = Array.isArray(plansResponse.data) ? plansResponse.data : [plansResponse.data];
      setPlans(plansData.filter(p => p.is_active));

      // Fetch current subscription
      const subsResponse = await getSubscriptions(1, 1, 'created_at', 'desc');
      const subsData = Array.isArray(subsResponse.data) ? subsResponse.data : [subsResponse.data];
      if (subsData.length > 0 && subsData[0].is_active) {
        setCurrentSubscription(subsData[0]);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load subscription data');
    } finally {
      setLoading(false);
    }
  };

  const handlePlanSelect = (plan: Plan) => {
    setSelectedPlan(plan);
    // Here you would typically open a modal or redirect to checkout
    toast.info(`Plan selection: ${plan.name} - Implementation pending`);
  };

  const formatDate = (date?: string) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusBadge = (subscription: Subscription) => {
    if (subscription.is_canceled) {
      return <Badge color="error">Canceled</Badge>;
    }
    if (subscription.is_on_trial) {
      return <Badge color="warning">Trial</Badge>;
    }
    if (subscription.is_active) {
      return <Badge color="success">Active</Badge>;
    }
    return <Badge color="secondary">Inactive</Badge>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <>
      <PageMeta
        title="Subscription Management"
        description="Manage your subscription and billing"
      />
      <PageBreadcrumb pageTitle="Subscription Management" />

      {/* Current Subscription Overview */}
      {currentSubscription ? (
        <ComponentCard title="Current Subscription">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            {/* Plan Info */}
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="flex items-center gap-3 mb-2">
                <CreditCard className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <h3 className="font-semibold text-gray-700 dark:text-gray-300">Current Plan</h3>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {currentSubscription.plan?.name || 'N/A'}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                ${currentSubscription.stripe_price} / {currentSubscription.plan?.interval || 'month'}
              </p>
            </div>

            {/* Status */}
            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="flex items-center gap-3 mb-2">
                <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
                <h3 className="font-semibold text-gray-700 dark:text-gray-300">Status</h3>
              </div>
              <div className="mt-3">
                {getStatusBadge(currentSubscription)}
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                {currentSubscription.is_on_trial && currentSubscription.trial_ends_at &&
                  `Trial ends: ${formatDate(currentSubscription.trial_ends_at)}`
                }
                {currentSubscription.is_on_grace_period &&
                  'Grace period active'
                }
              </p>
            </div>

            {/* Billing Date */}
            <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <div className="flex items-center gap-3 mb-2">
                <Calendar className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                <h3 className="font-semibold text-gray-700 dark:text-gray-300">Next Billing</h3>
              </div>
              <p className="text-lg font-semibold text-gray-900 dark:text-white mt-3">
                {currentSubscription.ends_at ? formatDate(currentSubscription.ends_at) : 'N/A'}
              </p>
            </div>

            {/* Quantity */}
            <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
              <div className="flex items-center gap-3 mb-2">
                <AlertCircle className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                <h3 className="font-semibold text-gray-700 dark:text-gray-300">Quantity</h3>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-3">
                {currentSubscription.quantity}
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                Active licenses
              </p>
            </div>
          </div>

          {/* Subscription Details */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Subscription ID</p>
                <p className="font-mono text-sm text-gray-900 dark:text-white mt-1">
                  {currentSubscription.stripe_id}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Started On</p>
                <p className="text-sm text-gray-900 dark:text-white mt-1">
                  {formatDate(currentSubscription.created_at)}
                </p>
              </div>
            </div>
          </div>
        </ComponentCard>
      ) : (
        <ComponentCard title="No Active Subscription">
          <div className="text-center py-8">
            <AlertCircle className="w-16 h-16 text-orange-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No Active Subscription
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Subscribe to a plan to access all features
            </p>
          </div>
        </ComponentCard>
      )}

      {/* Available Plans */}
      <div className="mt-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Available Plans
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Choose a plan that fits your needs. {currentSubscription ? 'Upgrade or downgrade anytime.' : 'Start with a plan today.'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plans.map((plan, index) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              isCurrentPlan={currentSubscription?.plan?.id === plan.id}
              isRecommended={index === 1} // Middle plan as recommended
              onSelectPlan={() => handlePlanSelect(plan)}
              buttonText={
                currentSubscription?.plan?.id === plan.id
                  ? 'Current Plan'
                  : currentSubscription && plan.price > (currentSubscription.plan?.price || 0)
                  ? 'Upgrade'
                  : currentSubscription && plan.price < (currentSubscription.plan?.price || 0)
                  ? 'Downgrade'
                  : 'Subscribe'
              }
            />
          ))}
        </div>
      </div>

      {/* Help Section */}
      <ComponentCard title="Need Help?" className="mt-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
              📞 Contact Support
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Have questions about your subscription? Our support team is here to help.
            </p>
            <Button variant="outline" size="sm" className="mt-3">
              Contact Us
            </Button>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
              📄 View Invoices
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Access and download all your past invoices and payment history.
            </p>
            <Button variant="outline" size="sm" className="mt-3">
              View History
            </Button>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
              🔄 Cancel Subscription
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Need to cancel? You can do so at any time from your account settings.
            </p>
            <Button variant="outline" size="sm" className="mt-3" disabled={!currentSubscription || currentSubscription.is_canceled}>
              Cancel Plan
            </Button>
          </div>
        </div>
      </ComponentCard>
    </>
  );
}
