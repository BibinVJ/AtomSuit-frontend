'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTenant } from '@/hooks/useTenant';
import { useAuth } from '@/hooks/useAuth';
import Navbar from '@/components/home/Navbar';
import HeroSection from '@/components/home/HeroSection';
import FeaturesSection from '@/components/home/FeaturesSection';
import StatsSection from '@/components/home/StatsSection';
import CTASection from '@/components/home/CTASection';
import Footer from '@/components/home/Footer';

export default function HomePage() {
  const { tenant, isLoading: tenantLoading } = useTenant();
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Wait for tenant and auth to load
    if (tenantLoading || authLoading) return;

    // If this is a tenant subdomain (not central domain)
    if (!tenant.isCentral) {
      // If user is authenticated, redirect to dashboard
      if (user) {
        router.push('/dashboard');
      } else {
        // If not authenticated, redirect to signin
        router.push('/signin');
      }
      return;
    }

    // For central domain, show marketing pages
  }, [tenant, user, tenantLoading, authLoading, router]);

  // Show loading while determining tenant/auth status
  if (tenantLoading || authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500"></div>
      </div>
    );
  }

  // If this is a tenant subdomain, don't render marketing pages
  // (user will be redirected by useEffect)
  if (!tenant.isCentral) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500"></div>
      </div>
    );
  }

  // Render marketing pages for central domain
  return (
    <div className="min-h-screen">
      <Navbar />
      <HeroSection />
      <FeaturesSection />
      <StatsSection />
      <CTASection />
      <Footer />
    </div>
  );
}
