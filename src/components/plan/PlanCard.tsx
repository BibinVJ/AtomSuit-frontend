import { Check } from 'lucide-react';
import { Plan, PlanFeature } from '@/types';
import { useSettings } from '@/hooks/useSettings';

interface Props {
  plan: Plan;
  isPopular?: boolean;
  onSelect?: (planId: string) => void;
  buttonText?: string;
  buttonStyle?: string;
  disabled?: boolean;
}

export default function PlanCard({
  plan,
  isPopular = false,
  onSelect,
  buttonText,
  buttonStyle,
  disabled = false,
}: Props) {
  const { formatCurrency } = useSettings();
  const handleClick = () => {
    if (onSelect && !disabled) {
      onSelect(String(plan.id));
    }
  };

  const getFeatureValue = (feature: PlanFeature) => {
    if (feature.type === 'boolean') {
      return feature.value ? 'Yes' : 'No';
    }
    if (feature.value === -1 || feature.value === '-1') {
      return 'Unlimited';
    }
    return feature.value;
  };

  const defaultButtonText = plan.is_trial_plan ? 'Start Free' : 'Get Started';
  const defaultButtonStyle = plan.is_trial_plan
    ? 'bg-gray-100 text-gray-900 hover:bg-gray-200 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600'
    : isPopular
      ? 'bg-brand-500 text-white hover:bg-brand-600 shadow-lg hover:shadow-xl'
      : 'bg-brand-500 text-white hover:bg-brand-600';

  return (
    <div
      className={`relative bg-white dark:bg-gray-800 rounded-2xl shadow-xl border-2 transition-all hover:shadow-2xl ${
        isPopular ? 'border-brand-500 scale-105' : 'border-gray-200 dark:border-gray-700'
      }`}
    >
      {isPopular && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
          <span className="bg-brand-500 text-white px-6 py-2 rounded-full text-sm font-semibold shadow-lg">
            Most Popular
          </span>
        </div>
      )}

      {plan.is_trial_plan && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
          <span className="bg-green-500 text-white px-6 py-2 rounded-full text-sm font-semibold shadow-lg">
            Free Plan
          </span>
        </div>
      )}

      <div className="p-8">
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{plan.name}</h3>

        <div className="mb-6">
          <div className="flex items-baseline">
            <span className="text-5xl font-bold text-gray-900 dark:text-white">
              {plan.price === 0 ? 'Free' : formatCurrency(plan.price)}
            </span>
            {!plan.is_trial_plan && plan.interval !== 'lifetime' && (
              <span className="ml-2 text-xl text-gray-500 dark:text-gray-400">
                /{plan.interval}
              </span>
            )}
          </div>

          {plan.is_trial_plan && plan.trial_duration_in_days && (
            <p className="text-sm text-green-600 dark:text-green-400 mt-2">
              {plan.trial_duration_in_days} days free trial
            </p>
          )}
        </div>

        <ul className="space-y-4 mb-8">
          {plan.features?.map((feature) => (
            <li key={feature.key} className="flex items-start">
              <Check className="h-5 w-5 text-brand-500 mt-0.5 flex-shrink-0" />
              <div className="ml-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-900 dark:text-white font-medium">
                    {feature.display_name}
                  </span>
                  <span className="text-brand-600 dark:text-brand-400 font-semibold ml-2">
                    {getFeatureValue(feature)}
                  </span>
                </div>
                {feature.description && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {feature.description}
                  </p>
                )}
              </div>
            </li>
          ))}
        </ul>

        <button
          onClick={handleClick}
          disabled={disabled}
          className={`w-full py-3 px-6 rounded-xl font-semibold transition-all ${
            buttonStyle || defaultButtonStyle
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {buttonText || defaultButtonText}
        </button>
      </div>
    </div>
  );
}
