'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import {
  getUser,
  storeUser,
  logout as logoutService,
  login as loginService,
} from '@/services/AuthService';
import api from '@/services/api';
import { useTenant } from '@/hooks/useTenant';
import { User } from '@/types';
import { AuthContext } from './AuthContext';

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { tenant } = useTenant();

  const fetchProfile = useCallback(async () => {
    try {
      const { data } = await api.get('/profile');
      setUser(data.data);
      return true;
    } catch {
      // If profile fetch fails, treat as unauthorized
      await logoutService();
      setUser(null);
      return false;
    }
  }, []);

  const handleLogout = useCallback(
    async (preserveRedirect = false) => {
      try {
        await logoutService();
      } catch {
        // Silently handle logout errors
      }
      setUser(null);

      // Always redirect to signin after logout
      if (pathname !== '/signin' && pathname !== '/signup') {
        // If this is a session expiry (401), preserve the current path so the user
        // can return to it after re-authenticating
        const redirectParam =
          preserveRedirect && pathname && pathname !== '/'
            ? `?redirect=${encodeURIComponent(pathname)}`
            : '';
        router.push(`/signin${redirectParam}`);
      }
    },
    [pathname, router]
  );

  useEffect(() => {
    const initializeAuth = async () => {
      const storedUser = getUser();

      if (storedUser && storedUser.data.token.access_token) {
        // User has stored credentials, set them up
        api.defaults.headers.common['Authorization'] =
          `Bearer ${storedUser.data.token.access_token}`;
        setUser(storedUser.data.user);

        // In production or when using real API, verify token validity
        try {
          await fetchProfile();
        } catch {
          // If profile fetch fails, clear user data
          setUser(null);
        }
      } else {
        // User is not authenticated
        setUser(null);
      }

      setLoading(false);
      setIsInitialized(true);
    };

    // Only run on mount
    if (!isInitialized) {
      initializeAuth();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isInitialized]); // Intentionally omitting 'fetchProfile' dependency to prevent unnecessary re-renders

  // Separate useEffect to handle route protection
  useEffect(() => {
    // Don't do redirects while still loading
    if (loading || !isInitialized) return;

    // Define public routes differently for central vs tenant domains
    const tenantPublicRoutes = ['/signin', '/signup', '/forgot-password', '/reset-password'];

    // For central domain, everything is public EXCEPT dashboard
    // For tenant domain, only specific routes are public
    let isPublicRoute = false;

    if (tenant.isCentral) {
      isPublicRoute = !pathname?.startsWith('/dashboard');
    } else {
      isPublicRoute = pathname ? tenantPublicRoutes.includes(pathname) : false;
    }

    if (user) {
      // User is authenticated - redirect away from auth pages
      if (pathname === '/signin' || pathname === '/signup') {
        const redirect = searchParams.get('redirect');
        const safeRedirect =
          redirect && redirect.startsWith('/') && !redirect.startsWith('//')
            ? redirect
            : '/dashboard';
        router.push(safeRedirect);
      }
    } else {
      // User is not authenticated - redirect to signin if on protected route
      if (!isPublicRoute) {
        const redirectParam =
          pathname && pathname !== '/' ? `?redirect=${encodeURIComponent(pathname)}` : '';
        router.push(`/signin${redirectParam}`);
      } else if (!tenant.isCentral && pathname === '/') {
        // If on tenant domain home page, redirect to signin
        router.push('/signin');
      }
    }
  }, [user, pathname, router, tenant, loading, isInitialized]);

  // Listen for logout events from API interceptor (401 responses)
  useEffect(() => {
    const handleLogoutEvent = () => {
      // 401-triggered logout: preserve the current path for redirect after re-login
      handleLogout(true);
    };

    window.addEventListener('logout', handleLogoutEvent);
    return () => {
      window.removeEventListener('logout', handleLogoutEvent);
    };
  }, [handleLogout]);

  const login = useCallback(async (identifier: string, password: string, stayLoggedIn: boolean) => {
    const data = await loginService(identifier, password);
    storeUser(data, stayLoggedIn);
    api.defaults.headers.common['Authorization'] = `Bearer ${data.data.token.access_token}`;
    setUser(data.data.user);

    // Set as initialized to prevent re-running auth checks
    setIsInitialized(true);
    setLoading(false);

    return data.data.user;
  }, []);

  const logout = useCallback(async () => {
    await handleLogout();
  }, [handleLogout]);

  const hasPermission = useCallback(
    (permission: string) => {
      if (!user) return false;
      return user.permission_names.includes(permission);
    },
    [user]
  );

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, fetchProfile, hasPermission }}>
      {children}
    </AuthContext.Provider>
  );
};
