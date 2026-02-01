'use client';

import { useTenant } from '@/hooks/useTenant';
import { Building, Crown } from 'lucide-react';

export default function TenantInfo() {
  const { tenant, isLoading, error } = useTenant();

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 text-sm text-gray-500 dark:text-gray-400">
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-brand-500"></div>
        Loading...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 text-sm text-red-500">
        <span>⚠️ {error}</span>
      </div>
    );
  }

  if (tenant.isCentral) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 text-sm text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
        <Crown className="w-4 h-4" />
        <span className="font-medium">Super Admin</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 px-3 py-2 text-sm text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
      <Building className="w-4 h-4" />
      <span className="font-medium">{tenant.subdomain}</span>
    </div>
  );
}
