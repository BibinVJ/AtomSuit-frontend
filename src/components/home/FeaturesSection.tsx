import { 
  BarChart3, 
  Users, 
  Package, 
  CreditCard, 
  TrendingUp, 
  Shield,
  Clock,
  Globe,
  Smartphone,
  Zap,
  CheckCircle,
  ArrowRight
} from 'lucide-react';

const FeaturesSection = () => {
  const mainFeatures = [
    {
      icon: BarChart3,
      title: "Advanced Analytics",
      description: "Get deep insights into your business with real-time analytics and customizable dashboards.",
      benefits: ["Real-time reporting", "Custom KPIs", "Predictive analytics"]
    },
    {
      icon: Package,
      title: "Inventory Management",
      description: "Streamline your inventory with automated tracking, smart alerts, and optimization tools.",
      benefits: ["Automated tracking", "Low stock alerts", "Multi-location support"]
    },
    {
      icon: Users,
      title: "HR Management",
      description: "Manage your workforce efficiently with payroll, attendance, and performance tracking.",
      benefits: ["Payroll automation", "Time tracking", "Performance reviews"]
    },
    {
      icon: CreditCard,
      title: "Financial Management",
      description: "Complete financial control with accounting, invoicing, and expense management.",
      benefits: ["Automated invoicing", "Expense tracking", "Financial reporting"]
    }
  ];

  const additionalFeatures = [
    { icon: TrendingUp, title: "Sales Optimization", description: "Boost sales with CRM integration and pipeline management" },
    { icon: Shield, title: "Enterprise Security", description: "Bank-level security with role-based access controls" },
    { icon: Clock, title: "24/7 Support", description: "Round-the-clock customer support and system monitoring" },
    { icon: Globe, title: "Multi-location", description: "Manage multiple locations from a single unified platform" },
    { icon: Smartphone, title: "Mobile Access", description: "Access your ERP system anywhere with our mobile apps" },
    { icon: Zap, title: "API Integration", description: "Connect with your existing tools through our robust APIs" }
  ];

  return (
    <div id="features" className="bg-gray-50 py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Everything You Need to Run Your Business
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Our comprehensive ERP solution provides all the tools you need to streamline operations, 
            increase efficiency, and drive growth.
          </p>
        </div>

        {/* Main Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
          {mainFeatures.map((feature, index) => (
            <div key={index} className="bg-white rounded-2xl p-8 shadow-theme-sm hover:shadow-theme-md transition-shadow">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-brand-100 rounded-xl flex items-center justify-center">
                    <feature.icon className="h-6 w-6 text-brand-600" />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {feature.description}
                  </p>
                  <ul className="space-y-2">
                    {feature.benefits.map((benefit, benefitIndex) => (
                      <li key={benefitIndex} className="flex items-center text-sm text-gray-500">
                        <CheckCircle className="h-4 w-4 text-success-500 mr-2 flex-shrink-0" />
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Additional Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {additionalFeatures.map((feature, index) => (
            <div key={index} className="bg-white rounded-xl p-6 text-center hover:shadow-theme-md transition-shadow group">
              <div className="w-12 h-12 bg-brand-50 rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:bg-brand-100 transition-colors">
                <feature.icon className="h-6 w-6 text-brand-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600 text-sm">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-brand-600 to-brand-800 rounded-2xl p-8 lg:p-12 text-center text-white">
          <h3 className="text-3xl font-bold mb-4">
            Ready to Transform Your Business?
          </h3>
          <p className="text-xl text-brand-100 mb-8 max-w-2xl mx-auto">
            Join thousands of businesses that have streamlined their operations with Atom Suit ERP.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-brand-600 hover:bg-gray-50 px-8 py-4 rounded-lg font-semibold flex items-center justify-center group transition-colors">
              Start Your Free Trial
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button className="border border-brand-200 text-brand-200 hover:bg-brand-200/10 px-8 py-4 rounded-lg font-semibold transition-colors">
              Schedule Demo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeaturesSection;