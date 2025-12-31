'use client';

import { useState, useEffect, useCallback, ReactNode } from 'react';
import { TenantContext, TenantContextType } from './TenantContext';
import { getTenantFromBrowser, TenantInfo, getMainDomainUrl } from '../utils/tenant';

interface TenantProviderProps {
  children: ReactNode;
}

export const TenantProvider = ({ children }: TenantProviderProps) => {
  const [tenant, setTenant] = useState<TenantInfo>({ subdomain: '', isCentral: true });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const validateTenant = useCallback(async (tenantToValidate?: TenantInfo): Promise<boolean> => {
    const targetTenant = tenantToValidate || tenant;

    try {
      setError(null);

      // If it's central domain, no validation needed
      if (targetTenant.isCentral) {
        return true;
      }

      // Use proxy API to avoid CORS issues
      const response = await fetch('/api/proxy', {
        method: 'GET',
        headers: {
          'X-Tenant': targetTenant.subdomain,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();

      // Check if the response indicates tenant validation success
      if (data.error === false && data.code === 200) {
        return true;
      } else {
        throw new Error(data.message || 'Tenant validation failed');
      }
    } catch (err: unknown) {
      console.error('[TenantProvider] Tenant validation error:', err);
      // If it's a network error or the API returns an error response
      let errorMessage = 'Tenant not found';
      if (err instanceof Error) {
        errorMessage = err.message;
      } else if (typeof err === 'object' && err !== null && 'response' in err) {
        const axiosError = err as { response?: { data?: { message?: string } }; message?: string };
        errorMessage =
          axiosError.response?.data?.message || axiosError.message || 'Tenant not found';
      }
      setError(errorMessage);

      window.location.href = getMainDomainUrl();

      return false;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Intentionally omitting 'tenant' dependency to prevent infinite loop

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Intentionally omitting 'validateTenant' dependency to prevent infinite loop

  const contextValue: TenantContextType = {
    tenant,
    isLoading,
    error,
    validateTenant,
    refreshTenant,
  };

  return <TenantContext.Provider value={contextValue}>{children}</TenantContext.Provider>;
};
