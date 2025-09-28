import Link from 'next/link';
import { ArrowRight, Play, Shield, Zap, Users } from 'lucide-react';

const HeroSection = () => {
  return (
    <div className="relative bg-gradient-to-r from-brand-600 to-brand-800 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:20px_20px]" />
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-20 lg:py-28">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="text-white">
              <div className="flex items-center space-x-2 mb-6">
                <Shield className="h-5 w-5 text-brand-200" />
                <span className="text-brand-200 text-sm font-medium uppercase tracking-wide">
                  Enterprise Grade Security
                </span>
              </div>
              
              <h1 className="text-4xl lg:text-6xl font-bold leading-tight mb-6">
                Transform Your Business with
                <span className="block text-brand-200">Atom Suit ERP</span>
              </h1>
              
              <p className="text-xl text-brand-100 mb-8 leading-relaxed">
                Streamline operations, boost productivity, and drive growth with our 
                comprehensive Enterprise Resource Planning solution. Built for the modern business.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <Link
                  href="/signup"
                  className="bg-white text-brand-600 hover:bg-gray-50 px-8 py-4 rounded-lg font-semibold text-lg flex items-center justify-center group transition-colors"
                >
                  Start Free Trial
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                
                <button className="border border-brand-200 text-brand-200 hover:bg-brand-200/10 px-8 py-4 rounded-lg font-semibold text-lg flex items-center justify-center transition-colors">
                  <Play className="mr-2 h-5 w-5" />
                  Watch Demo
                </button>
              </div>
              
              {/* Trust Indicators */}
              <div className="flex items-center space-x-6 text-brand-200">
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4" />
                  <span className="text-sm">10,000+ Companies</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Zap className="h-4 w-4" />
                  <span className="text-sm">99.9% Uptime</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Shield className="h-4 w-4" />
                  <span className="text-sm">ISO 27001 Certified</span>
                </div>
              </div>
            </div>
            
            {/* Right Content - Dashboard Preview */}
            <div className="relative">
              <div className="bg-white rounded-2xl shadow-2xl p-6 transform rotate-1 hover:rotate-0 transition-transform duration-300">
                <div className="bg-gray-50 rounded-xl p-4">
                  {/* Mock Dashboard Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold text-sm">A</span>
                      </div>
                      <span className="font-semibold text-gray-900">Dashboard</span>
                    </div>
                    <div className="flex space-x-1">
                      <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                      <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                      <div className="w-3 h-3 bg-success-400 rounded-full"></div>
                    </div>
                  </div>
                  
                  {/* Mock Stats Cards */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="bg-white rounded-lg p-3 border">
                      <div className="text-2xl font-bold text-gray-900">$2.4M</div>
                      <div className="text-sm text-gray-500">Total Revenue</div>
                      <div className="text-xs text-success-600 mt-1">+12.5%</div>
                    </div>
                    <div className="bg-white rounded-lg p-3 border">
                      <div className="text-2xl font-bold text-gray-900">1,429</div>
                      <div className="text-sm text-gray-500">Orders</div>
                      <div className="text-xs text-success-600 mt-1">+8.2%</div>
                    </div>
                  </div>
                  
                  {/* Mock Chart Area */}
                  <div className="bg-white rounded-lg p-4 border">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Sales Overview</span>
                      <span className="text-xs text-gray-500">Last 30 days</span>
                    </div>
                    <div className="h-20 bg-gradient-to-r from-brand-400 to-brand-600 rounded opacity-20"></div>
                  </div>
                </div>
              </div>
              
              {/* Floating Elements */}
              <div className="absolute -top-4 -right-4 bg-brand-400 text-white px-3 py-1 rounded-full text-xs font-medium animate-pulse">
                Live Data
              </div>
              <div className="absolute -bottom-4 -left-4 bg-success-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                Real-time Analytics
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;