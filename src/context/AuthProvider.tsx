"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  getUser,
  storeUser,
  logout as logoutService,
  login as loginService,
} from "../services/AuthService";
import api from "../services/api";
import { useTenant } from "../hooks/useTenant";

import { User } from "../types";
import { AuthContext } from "./AuthContext";

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const { tenant } = useTenant();

  const fetchProfile = useCallback(async () => {
    try {
      const { data } = await api.get("/profile");
      setUser(data.data);
      return true;
    } catch {
      // If profile fetch fails, treat as unauthorized
      await logoutService();
      setUser(null);
      return false;
    }
  }, []);

  const handleLogout = useCallback(async () => {
    try {
      await logoutService();
    } catch {
      // Silently handle logout errors
    }
    setUser(null);
    
    // Always redirect to signin after logout
    if (pathname !== '/signin' && pathname !== '/signup') {
      router.push('/signin');
    }
  }, [pathname, router]);

  useEffect(() => {
    const initializeAuth = async () => {
      const storedUser = getUser();
      
      if (storedUser && storedUser.data.token.access_token) {
        // User has stored credentials, set them up
        api.defaults.headers.common[
          "Authorization"
        ] = `Bearer ${storedUser.data.token.access_token}`;
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
    const centralPublicRoutes = ['/signin', '/signup', '/', '/pricing'];
    const tenantPublicRoutes = ['/signin', '/signup'];
    const publicRoutes = tenant.isCentral ? centralPublicRoutes : tenantPublicRoutes;
    const isPublicRoute = pathname ? publicRoutes.includes(pathname) : false;
    
    if (user) {
      // User is authenticated - redirect away from auth pages
      if (pathname === '/signin' || pathname === '/signup') {
        router.push('/dashboard');
      }
    } else {
      // User is not authenticated - redirect to signin if on protected route
      if (!isPublicRoute) {
        router.push('/signin');
      } else if (!tenant.isCentral && pathname === '/') {
        // If on tenant domain home page, redirect to signin
        router.push('/signin');
      }
    }
  }, [user, pathname, router, tenant, loading, isInitialized]);

  // Listen for logout events from API interceptor (401 responses)
  useEffect(() => {
    const handleLogoutEvent = () => {
      handleLogout();
    };

    window.addEventListener('logout', handleLogoutEvent);
    return () => {
      window.removeEventListener('logout', handleLogoutEvent);
    };
  }, [handleLogout]);

  const login = useCallback(
    async (identifier: string, password: string, stayLoggedIn: boolean) => {
      const data = await loginService(identifier, password);
      storeUser(data, stayLoggedIn);
      api.defaults.headers.common[
        "Authorization"
      ] = `Bearer ${data.data.token.access_token}`;
      setUser(data.data.user);
      
      // Set as initialized to prevent re-running auth checks
      setIsInitialized(true);
      setLoading(false);
      
      return data.data.user;
    },
    []
  );

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
    <AuthContext.Provider
      value={{ user, login, logout, loading, fetchProfile, hasPermission }}
    >
      {children}
    </AuthContext.Provider>
  );
};

