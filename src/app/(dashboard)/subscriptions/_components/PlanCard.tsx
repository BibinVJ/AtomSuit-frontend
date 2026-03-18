'use client';

import { Plan } from '@/types/Plan';
import Button from '@/components/ui/button/Button';
import { Check, Star } from 'lucide-react';

interface Props {
  plan: Plan;
  isCurrentPlan?: boolean;
  isUpgrade?: boolean;
  isDowngrade?: boolean;
  onSelect: (planId: string) => void;
  loading?: boolean;
}

export default function PlanCard({
  plan,
  isCurrentPlan,
  isUpgrade,
  isDowngrade,
  onSelect,
  loading,
}: Props) {
  const formatAmount = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: (currency || 'USD').toUpperCase(),
    }).format(amount);
  };

  const getButtonText = () => {
    if (isCurrentPlan) return 'Current Plan';
    if (isUpgrade) return 'Upgrade';
    if (isDowngrade) return 'Downgrade';
    return 'Select Plan';
  };

  const getButtonStyle = () => {
    if (isCurrentPlan) return 'bg-gray-100 text-gray-500 cursor-not-allowed';
    if (isUpgrade) return 'bg-green-600 hover:bg-green-700 text-white';
    if (isDowngrade) return 'bg-orange-600 hover:bg-orange-700 text-white';
    return 'bg-blue-600 hover:bg-blue-700 text-white';
  };

  return (
    <div
      className={`relative bg-white dark:bg-gray-800 rounded-lg border-2 p-6 ${
        isCurrentPlan ? 'border-blue-500' : 'border-gray-200 dark:border-gray-700'
      }`}
    >
      {isCurrentPlan && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <div className="bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
            <Star className="w-3 h-3" />
            Current Plan
          </div>
        </div>
      )}

      <div className="text-center mb-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{plan.name}</h3>
        <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">{plan.description}</p>
        <div className="mb-4">
          <span className="text-3xl font-bold text-gray-900 dark:text-white">
            {formatAmount(plan.price, plan.currency || 'USD')}
          </span>
          <span className="text-gray-500 dark:text-gray-400 ml-1">/{plan.interval}</span>
        </div>
      </div>

      <div className="space-y-3 mb-6">
        {plan.features?.map((feature) => (
          <div key={feature.id} className="flex items-start gap-2">
            <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
            <div>
              <span className="text-sm text-gray-900 dark:text-white font-medium">
                {feature.display_name}
              </span>
              {feature.description && (
                <p className="text-xs text-gray-500 dark:text-gray-400">{feature.description}</p>
              )}
            </div>
          </div>
        ))}
      </div>

      <Button
        onClick={() => onSelect(String(plan.id))}
        disabled={isCurrentPlan || loading}
        className={`w-full ${getButtonStyle()}`}
      >
        {loading ? 'Processing...' : getButtonText()}
      </Button>
    </div>
  );
}
