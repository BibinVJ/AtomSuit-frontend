import Link from 'next/link';
import { ArrowRight, CheckCircle, Clock, Users } from 'lucide-react';

const CTASection = () => {
  const benefits = [
    'Free 30-day trial',
    'No credit card required',
    'Setup assistance included',
    'Cancel anytime',
  ];

  return (
    <div className="bg-gradient-to-br from-brand-600 via-brand-700 to-brand-800 py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="text-white">
            <div className="flex items-center space-x-2 mb-6">
              <Clock className="h-5 w-5 text-brand-200" />
              <span className="text-brand-200 text-sm font-medium uppercase tracking-wide">
                Get Started in Minutes
              </span>
            </div>

            <h2 className="text-4xl lg:text-5xl font-bold leading-tight mb-6">
              Ready to Transform Your Business Operations?
            </h2>

            <p className="text-xl text-brand-100 mb-8 leading-relaxed">
              Join thousands of businesses already using Atom Suit ERP to streamline their
              operations, increase efficiency, and accelerate growth. Start your journey today.
            </p>

            <div className="space-y-3 mb-8">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-success-400 flex-shrink-0" />
                  <span className="text-brand-100">{benefit}</span>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/signup"
                className="bg-white text-brand-600 hover:bg-gray-50 px-8 py-4 rounded-xl font-semibold text-lg flex items-center justify-center group transition-all duration-300 transform hover:scale-105"
              >
                Start Your Free Trial
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                href="/demo"
                className="border-2 border-brand-200 text-brand-200 hover:bg-brand-200/10 px-8 py-4 rounded-xl font-semibold text-lg flex items-center justify-center transition-colors"
              >
                Schedule Demo
              </Link>
            </div>
          </div>

          {/* Right Content - Interactive Demo Preview */}
          <div className="relative">
            {/* Main Card */}
            <div className="bg-white rounded-3xl shadow-2xl p-8 transform hover:scale-105 transition-transform duration-300">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-brand-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-white font-bold text-2xl">A</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Start Your Journey</h3>
                <p className="text-gray-600">Experience the power of Atom Suit ERP</p>
              </div>

              {/* Quick Setup Steps */}
              <div className="space-y-4">
                <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl">
                  <div className="w-8 h-8 bg-brand-500 text-white rounded-lg flex items-center justify-center font-bold text-sm">
                    1
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">Create Account</div>
                    <div className="text-sm text-gray-500">Quick 2-minute setup</div>
                  </div>
                </div>

                <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl">
                  <div className="w-8 h-8 bg-brand-500 text-white rounded-lg flex items-center justify-center font-bold text-sm">
                    2
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">Import Data</div>
                    <div className="text-sm text-gray-500">We&apos;ll help you migrate</div>
                  </div>
                </div>

                <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl">
                  <div className="w-8 h-8 bg-brand-500 text-white rounded-lg flex items-center justify-center font-bold text-sm">
                    3
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">Go Live</div>
                    <div className="text-sm text-gray-500">Start managing your business</div>
                  </div>
                </div>
              </div>

              {/* Trust Indicators */}
              <div className="border-t border-gray-200 pt-6 mt-6">
                <div className="flex items-center justify-center space-x-6 text-sm text-gray-500">
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4" />
                    <span>10K+ users</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-success-500" />
                    <span>99.9% uptime</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating Elements */}
            <div className="absolute -top-6 -right-6 bg-success-500 text-white px-4 py-2 rounded-full text-sm font-medium animate-bounce">
              Free Trial
            </div>
            <div className="absolute -bottom-6 -left-6 bg-orange-500 text-white px-4 py-2 rounded-full text-sm font-medium">
              No Credit Card
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CTASection;
