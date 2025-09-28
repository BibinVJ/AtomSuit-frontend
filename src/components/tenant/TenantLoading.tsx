"use client";

import { useTenant } from '../../hooks/useTenant';
import { Building, Crown, AlertCircle } from 'lucide-react';

interface TenantLoadingProps {
  children: React.ReactNode;
}

export default function TenantLoading({ children }: TenantLoadingProps) {
  const { tenant, isLoading, error } = useTenant();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
            Loading Tenant
          </h2>
          <p className="text-gray-500 dark:text-gray-400">
            Validating tenant configuration...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
            Tenant Validation Failed
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            {error}
          </p>
          <p className="text-sm text-gray-400 dark:text-gray-500">
            You will be redirected to the main site shortly...
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}