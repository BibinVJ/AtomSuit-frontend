'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useTenant } from '@/hooks/useTenant';

interface RouteGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  redirectTo?: string;
}

const RouteGuard: React.FC<RouteGuardProps> = ({ children, requireAuth = true, redirectTo }) => {
  const { user, loading } = useAuth();
  const { tenant } = useTenant();
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    // Check if authentication is required
    if (!requireAuth) {
      setAuthorized(true);
      return;
    }

    // Wait for auth to finish loading
    if (loading) {
      return;
    }

    // Check if user is authenticated
    if (user) {
      setAuthorized(true);
    } else {
      setAuthorized(false);
      // Redirect to signin or custom redirect
      const signinUrl = redirectTo || '/signin';
      router.push(signinUrl);
    }
  }, [user, loading, requireAuth, router, tenant, redirectTo]);

  // Show loading spinner while checking authentication
  if (loading || (requireAuth && !authorized)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500"></div>
      </div>
    );
  }

  return <>{children}</>;
};

export default RouteGuard;
