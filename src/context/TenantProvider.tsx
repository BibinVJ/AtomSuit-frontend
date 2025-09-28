"use client";

import { useState, useEffect, useCallback, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { TenantContext, TenantContextType } from './TenantContext';
import {
  getTenantFromBrowser,
  TenantInfo,
  getMainDomainUrl,
  isDevelopment
} from '../utils/tenant';
import api from '../services/api';

interface TenantProviderProps {
  children: ReactNode;
}

export const TenantProvider = ({ children }: TenantProviderProps) => {
  const [tenant, setTenant] = useState<TenantInfo>({ subdomain: '', isCentral: true });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const validateTenant = useCallback(async (tenantToValidate?: TenantInfo): Promise<boolean> => {
    const targetTenant = tenantToValidate || tenant;
    
    console.log('[TenantProvider] Validating tenant:', targetTenant);
    
    try {
      setError(null);

      // If it's central domain, no validation needed
      if (targetTenant.isCentral) {
        console.log('[TenantProvider] Central domain, skipping validation');
        return true;
      }
      
      console.log('[TenantProvider] Making API request to validate tenant:', targetTenant.subdomain);
      
      // Use proxy API to avoid CORS issues
      const response = await fetch('/api/proxy', {
        method: 'GET',
        headers: {
          'X-Tenant': targetTenant.subdomain,
          'Content-Type': 'application/json',
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const data = await response.json();

      console.log('[TenantProvider] API response:', response.status, data);

      // Check if the response indicates tenant validation success
      if (data.error === false && data.code === 200) {
        console.log('[TenantProvider] Tenant validation successful');
        return true;
      } else {
        console.log('[TenantProvider] Tenant validation failed - invalid response data:', data);
        throw new Error(data.message || 'Tenant validation failed');
      }
    } catch (err: any) {
      console.error('[TenantProvider] Tenant validation error:', err);
      // If it's a network error or the API returns an error response
      const errorMessage = err.response?.data?.message || err.message || 'Tenant not found';
      setError(errorMessage);

      console.log('[TenantProvider] Tenant validation failed, redirecting to main domain:', getMainDomainUrl());
      window.location.href = getMainDomainUrl();

      return false;
    }
  }, [tenant]);

  const refreshTenant = useCallback(() => {
    const currentTenant = getTenantFromBrowser();
    setTenant(currentTenant);
  }, []);

  useEffect(() => {
    const initializeTenant = async () => {
      // Initialize tenant from browser
      const currentTenant = getTenantFromBrowser();
      setTenant(currentTenant);

      // Validate tenant if not central
      if (!currentTenant.isCentral) {
        await validateTenant(currentTenant);
      }
      
      setIsLoading(false);
    };
    
    initializeTenant();
  }, []); // Remove validateTenant from dependencies to prevent infinite re-renders

  const contextValue: TenantContextType = {
    tenant,
    isLoading,
    error,
    validateTenant,
    refreshTenant,
  };

  return (
    <TenantContext.Provider value={contextValue}>
      {children}
    </TenantContext.Provider>
  );
};