import { Building2, Users, Globe, TrendingUp } from 'lucide-react';

const StatsSection = () => {
  const stats = [
    {
      icon: Building2,
      value: "10,000+",
      label: "Active Companies",
      description: "Businesses trust us worldwide"
    },
    {
      icon: Users,
      value: "500K+",
      label: "Daily Users",
      description: "Processing millions of transactions"
    },
    {
      icon: Globe,
      value: "150+",
      label: "Countries",
      description: "Global presence and support"
    },
    {
      icon: TrendingUp,
      value: "99.9%",
      label: "Uptime",
      description: "Reliable and always available"
    }
  ];

  const testimonials = [
    {
      quote: "Atom Suit transformed our operations completely. We've seen a 40% increase in efficiency since implementation.",
      author: "Sarah Johnson",
      role: "Operations Director",
      company: "TechFlow Industries"
    },
    {
      quote: "The best ERP solution we've used. Intuitive interface and powerful features that scale with our growth.",
      author: "Michael Chen",
      role: "CEO",
      company: "GreenTech Solutions"
    },
    {
      quote: "Outstanding customer support and a platform that just works. Highly recommended for any growing business.",
      author: "Emily Rodriguez",
      role: "Finance Manager",
      company: "Retail Plus"
    }
  ];

  return (
    <div className="bg-white py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Stats Section */}
        <div className="text-center mb-20">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Trusted by Industry Leaders
          </h2>
          <p className="text-xl text-gray-600 mb-12">
            Join thousands of successful businesses that have transformed their operations with Atom Suit
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center group">
                <div className="w-16 h-16 bg-brand-100 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-brand-200 transition-colors">
                  <stat.icon className="h-8 w-8 text-brand-600" />
                </div>
                <div className="text-4xl font-bold text-gray-900 mb-2">
                  {stat.value}
                </div>
                <div className="text-lg font-semibold text-gray-700 mb-1">
                  {stat.label}
                </div>
                <div className="text-sm text-gray-500">
                  {stat.description}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Testimonials Section */}
        <div className="bg-gray-50 rounded-3xl p-8 lg:p-12">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              What Our Customers Say
            </h3>
            <p className="text-lg text-gray-600">
              Real feedback from businesses using Atom Suit ERP
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white rounded-2xl p-6 shadow-theme-sm">
                <div className="flex items-start mb-4">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-brand-500 rounded-full flex items-center justify-center text-white font-bold">
                      {testimonial.author.charAt(0)}
                    </div>
                  </div>
                  <div className="ml-3">
                    <div className="font-semibold text-gray-900">{testimonial.author}</div>
                    <div className="text-sm text-gray-500">{testimonial.role}</div>
                    <div className="text-sm font-medium text-brand-600">{testimonial.company}</div>
                  </div>
                </div>
                <blockquote className="text-gray-700 italic">
                  "{testimonial.quote}"
                </blockquote>
                <div className="flex text-yellow-400 mt-4">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Trust Badges */}
        <div className="mt-20 text-center">
          <p className="text-lg font-semibold text-gray-900 mb-8">
            Certified and Compliant
          </p>
          <div className="flex flex-wrap justify-center items-center gap-8 opacity-60">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gray-300 rounded"></div>
              <span className="text-gray-700 font-medium">ISO 27001</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gray-300 rounded"></div>
              <span className="text-gray-700 font-medium">SOC 2 Type II</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gray-300 rounded"></div>
              <span className="text-gray-700 font-medium">GDPR Compliant</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gray-300 rounded"></div>
              <span className="text-gray-700 font-medium">PCI DSS</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsSection;