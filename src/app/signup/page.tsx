'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getTenantFromBrowser } from '@/utils/tenant';
import SignUp from '@/components/auth/SignUpForm';
import AuthLayout from '@/layout/AuthLayout';

export default function SignUpPage() {
  const router = useRouter();

  useEffect(() => {
    const tenant = getTenantFromBrowser();

    // If accessing from tenant subdomain, redirect to signin
    if (!tenant.isCentral) {
      router.replace('/signin');
    }
  }, [router]);

  const tenant = getTenantFromBrowser();

  // Don't render signup form for tenant subdomains
  if (!tenant.isCentral) {
    return null;
  }

  return (
    <AuthLayout>
      <SignUp />
    </AuthLayout>
  );
}
