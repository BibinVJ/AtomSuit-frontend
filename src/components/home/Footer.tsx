import Link from 'next/link';
import { Mail, Phone, MapPin, Facebook, Twitter, Linkedin, Instagram } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">A</span>
              </div>
              <span className="ml-2 text-xl font-bold">Atom Suit</span>
            </div>
            <p className="text-gray-300 text-sm">
              Streamline your business operations with our comprehensive ERP solution. 
              Built for modern enterprises seeking efficiency and growth.
            </p>
            <div className="space-y-2">
              <div className="flex items-center space-x-3">
                <Mail className="h-4 w-4 text-brand-400" />
                <span className="text-sm text-gray-300">contact@atomsuit.com</span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="h-4 w-4 text-brand-400" />
                <span className="text-sm text-gray-300">+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center space-x-3">
                <MapPin className="h-4 w-4 text-brand-400" />
                <span className="text-sm text-gray-300">San Francisco, CA</span>
              </div>
            </div>
          </div>

          {/* Products */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Products</h3>
            <ul className="space-y-2">
              <li>
                <Link href="#" className="text-gray-300 hover:text-brand-400 text-sm transition-colors">
                  Inventory Management
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-300 hover:text-brand-400 text-sm transition-colors">
                  Financial Management
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-300 hover:text-brand-400 text-sm transition-colors">
                  HR Management
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-300 hover:text-brand-400 text-sm transition-colors">
                  Customer Relations
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-300 hover:text-brand-400 text-sm transition-colors">
                  Supply Chain
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Company</h3>
            <ul className="space-y-2">
              <li>
                <Link href="#" className="text-gray-300 hover:text-brand-400 text-sm transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-300 hover:text-brand-400 text-sm transition-colors">
                  Careers
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-300 hover:text-brand-400 text-sm transition-colors">
                  Press
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-300 hover:text-brand-400 text-sm transition-colors">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-300 hover:text-brand-400 text-sm transition-colors">
                  Partners
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Resources</h3>
            <ul className="space-y-2">
              <li>
                <Link href="#" className="text-gray-300 hover:text-brand-400 text-sm transition-colors">
                  Documentation
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-300 hover:text-brand-400 text-sm transition-colors">
                  Help Center
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-300 hover:text-brand-400 text-sm transition-colors">
                  API Reference
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-300 hover:text-brand-400 text-sm transition-colors">
                  System Status
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-300 hover:text-brand-400 text-sm transition-colors">
                  Contact Support
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Social Links and Copyright */}
        <div className="border-t border-gray-700 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex items-center space-x-6">
              <Link href="#" className="text-gray-400 hover:text-brand-400 transition-colors">
                <Facebook className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-gray-400 hover:text-brand-400 transition-colors">
                <Twitter className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-gray-400 hover:text-brand-400 transition-colors">
                <Linkedin className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-gray-400 hover:text-brand-400 transition-colors">
                <Instagram className="h-5 w-5" />
              </Link>
            </div>
            
            <div className="flex items-center space-x-6 text-sm text-gray-400">
              <Link href="#" className="hover:text-brand-400 transition-colors">
                Privacy Policy
              </Link>
              <Link href="#" className="hover:text-brand-400 transition-colors">
                Terms of Service
              </Link>
              <Link href="#" className="hover:text-brand-400 transition-colors">
                Cookie Policy
              </Link>
            </div>
          </div>
          
          <div className="mt-6 text-center text-sm text-gray-400">
            <p>&copy; {new Date().getFullYear()} Atom Suit. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;