import { createContext } from 'react';
import { TenantInfo } from '../utils/tenant';

export interface TenantContextType {
  tenant: TenantInfo;
  isLoading: boolean;
  error: string | null;
  validateTenant: () => Promise<boolean>;
  refreshTenant: () => void;
}

export const TenantContext = createContext<TenantContextType | null>(null);