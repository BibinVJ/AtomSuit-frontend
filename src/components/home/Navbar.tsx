'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Menu, X, ChevronDown } from 'lucide-react';
import { useTenant } from '@/hooks/useTenant';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { tenant } = useTenant();
  
  // Only render marketing navbar on central domain
  if (!tenant.isCentral) {
    return null;
  }

  return (
    <nav className="bg-white shadow-theme-sm sticky top-0 z-999">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0 flex items-center">
              <Image
                src="/images/logo/logo.png"
                alt="Atom Suit Logo"
                width={120}
                height={32}
                className="h-8 w-auto"
                priority
              />
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="#features" className="text-gray-700 hover:text-brand-500 px-3 py-2 text-sm font-medium">
              Features
            </Link>
            <div className="relative">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="text-gray-700 hover:text-brand-500 px-3 py-2 text-sm font-medium flex items-center"
              >
                Solutions
                <ChevronDown className="ml-1 h-4 w-4" />
              </button>
              {isDropdownOpen && (
                <div className="absolute left-0 mt-2 w-48 rounded-md shadow-theme-lg bg-white ring-1 ring-gray-900/5">
                  <div className="py-1">
                    <Link href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                      Inventory Management
                    </Link>
                    <Link href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                      Financial Management
                    </Link>
                    <Link href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                      HR Management
                    </Link>
                    <Link href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                      CRM
                    </Link>
                  </div>
                </div>
              )}
            </div>
            <Link href="/pricing" className="text-gray-700 hover:text-brand-500 px-3 py-2 text-sm font-medium">
              Pricing
            </Link>
            <Link href="#about" className="text-gray-700 hover:text-brand-500 px-3 py-2 text-sm font-medium">
              About
            </Link>
            <Link href="#contact" className="text-gray-700 hover:text-brand-500 px-3 py-2 text-sm font-medium">
              Contact
            </Link>
          </div>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <Link
              href="/signin"
              className="text-gray-700 hover:text-brand-500 px-3 py-2 text-sm font-medium"
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              className="bg-brand-500 hover:bg-brand-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Get Started
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-700 hover:text-brand-500 p-2"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t border-gray-200">
            <Link href="#features" className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-brand-500">
              Features
            </Link>
            <Link href="#solutions" className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-brand-500">
              Solutions
            </Link>
            <Link href="/pricing" className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-brand-500">
              Pricing
            </Link>
            <Link href="#about" className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-brand-500">
              About
            </Link>
            <Link href="#contact" className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-brand-500">
              Contact
            </Link>
            <div className="border-t border-gray-200 pt-4">
              <Link
                href="/signin"
                className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-brand-500"
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                className="block px-3 py-2 text-base font-medium bg-brand-500 text-white rounded-lg mx-3 mt-2 text-center"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;