"use client";

import { useState, useEffect } from 'react';
import PlanCard from '../components/plan/PlanCard';
import LifetimePlanCard from '../components/plan/LifetimePlanCard';
import { getPlans } from '../services/PlanService';
import { Plan } from '../types/Plan';
import Navbar from '../components/home/Navbar';
import Footer from '../components/home/Footer';

export default function Pricing() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [billingCycle, setBillingCycle] = useState<'month' | 'year'>('month');

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const response = await getPlans(1, 10, 'created_at', 'desc', true);
        setPlans(response.data.filter((plan: Plan) => plan.is_active));
      } catch (error) {
        console.error('Failed to fetch plans:', error);
        setPlans([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPlans();
  }, []);

  // Categorize plans (exclude expired user plans)
  const activePlans = plans.filter(plan => !plan.is_expired_user_plan);
  const freePlans = activePlans.filter(plan => plan.is_trial_plan);
  const monthlyPlans = activePlans.filter(plan => !plan.is_trial_plan && plan.interval === 'month' && plan.interval_count === 1);
  const yearlyPlans = activePlans.filter(plan => !plan.is_trial_plan && plan.interval === 'year' && plan.interval_count === 1);
  const lifetimePlans = activePlans.filter(plan => !plan.is_trial_plan && plan.interval === 'lifetime');
  
  const currentPlans = billingCycle === 'month' ? monthlyPlans : yearlyPlans;
  const allPlansToShow = [...freePlans, ...currentPlans];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading plans...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="py-16 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white sm:text-5xl mb-4">
              Simple, Transparent Pricing
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Choose the perfect plan for your business. Start free and scale as you grow.
            </p>
          </div>

          {/* Billing Toggle */}
          <div className="flex justify-center mb-12">
            <div className="bg-white dark:bg-gray-800 p-1 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setBillingCycle('month')}
                className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${
                  billingCycle === 'month'
                    ? 'bg-brand-500 text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingCycle('year')}
                className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${
                  billingCycle === 'year'
                    ? 'bg-brand-500 text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                Yearly
                <span className="ml-2 bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                  Save 20%
                </span>
              </button>
            </div>
          </div>

          {/* All Plans (Free + Monthly/Yearly) */}
          {allPlansToShow.length > 0 && (
            <div className="mb-16">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {allPlansToShow.map((plan, index) => {
                  const isPopular = !plan.is_trial_plan && index === Math.floor(allPlansToShow.length / 2);
                  return (
                    <PlanCard key={plan.id} plan={plan} isPopular={isPopular} />
                  );
                })}
              </div>
            </div>
          )}

          {/* Lifetime Plans */}
          {lifetimePlans.length > 0 && (
            <div>
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Lifetime Access
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mt-2">
                  Pay once, use forever
                </p>
              </div>
              <div className="space-y-8">
                {lifetimePlans.map((plan) => (
                  <LifetimePlanCard key={plan.id} plan={plan} />
                ))}
              </div>
            </div>
          )}

          {activePlans.length === 0 && !loading && (
            <div className="text-center py-16">
              <p className="text-xl text-gray-500 dark:text-gray-400">
                Plans will be available soon. Please check back later.
              </p>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
