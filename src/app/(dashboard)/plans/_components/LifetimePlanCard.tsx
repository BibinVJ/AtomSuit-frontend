import { Check } from 'lucide-react';
import { Plan, PlanFeature } from '@/types';
import { useSettings } from '@/hooks/useSettings';

interface Props {
  plan: Plan;
  onSelect?: (planId: string) => void;
  buttonText?: string;
  buttonStyle?: string;
  disabled?: boolean;
}

export default function LifetimePlanCard({
  plan,
  onSelect,
  buttonText = 'Get Lifetime Access',
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

  const defaultButtonStyle =
    'bg-gradient-to-r from-yellow-400 to-orange-500 text-white hover:from-yellow-500 hover:to-orange-600 shadow-xl hover:shadow-2xl transform hover:scale-105';

  return (
    <div className="relative bg-gradient-to-r from-purple-600 via-purple-700 to-indigo-800 rounded-3xl shadow-2xl border-2 border-purple-500 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-indigo-800/20 backdrop-blur-sm"></div>

      <div className="absolute -top-6 left-1/2 transform -translate-x-1/2">
        <span className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-8 py-3 rounded-full text-lg font-bold shadow-xl">
          🚀 LIFETIME ACCESS
        </span>
      </div>

      <div className="relative p-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
          {/* Left: Plan Info */}
          <div className="lg:col-span-1">
            <h3 className="text-4xl font-bold text-white mb-4">{plan.name}</h3>
            <div className="mb-6">
              <div className="flex items-baseline">
                <span className="text-6xl font-bold text-white">{formatCurrency(plan.price)}</span>
                <span className="ml-3 text-2xl text-purple-200">once</span>
              </div>
              <p className="text-purple-200 mt-2 text-lg">Pay once, use forever</p>
            </div>

            <button
              onClick={handleClick}
              disabled={disabled}
              className={`py-4 px-8 rounded-2xl font-bold text-lg transition-all ${
                buttonStyle || defaultButtonStyle
              } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {buttonText}
            </button>
          </div>

          {/* Right: Features */}
          <div className="lg:col-span-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {plan.features?.map((feature) => (
                <div key={feature.key} className="flex items-start">
                  <Check className="h-6 w-6 text-yellow-400 mt-1 flex-shrink-0" />
                  <div className="ml-4">
                    <div className="flex items-center justify-between">
                      <span className="text-white font-semibold text-lg">
                        {feature.display_name}
                      </span>
                      <span className="text-yellow-400 font-bold ml-3">
                        {getFeatureValue(feature)}
                      </span>
                    </div>
                    {feature.description && (
                      <p className="text-purple-200 text-sm mt-1">{feature.description}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
