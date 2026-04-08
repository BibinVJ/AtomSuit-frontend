'use client';

import { useTenant } from '@/hooks/useTenant';
import { AlertCircle } from 'lucide-react';

interface TenantLoadingProps {
  children: React.ReactNode;
}

export default function TenantLoading({ children }: TenantLoadingProps) {
  const { isLoading, error } = useTenant();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 overflow-hidden relative">
        {/* Shimmer background */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.03] dark:opacity-[0.05]">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-brand-500 to-transparent animate-shimmer -skew-x-12 translate-x-[-100%]"></div>
        </div>
        <div className="text-center relative z-10">
          <div className="relative mb-6">
            <div className="w-16 h-16 border-4 border-gray-200 dark:border-gray-800 rounded-full mx-auto"></div>
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-16 h-16 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 tracking-tight">
            Initializing Your Space
          </h2>
          <p className="text-gray-500 dark:text-gray-400 max-w-xs mx-auto text-sm leading-relaxed">
            Please wait while we validate your tenant configuration and optimize your workspace.
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
          <p className="text-gray-500 dark:text-gray-400 mb-4">{error}</p>
          <p className="text-sm text-gray-400 dark:text-gray-500">
            You will be redirected to the main site shortly...
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
