import { createContext } from 'react';

export interface SettingsContextType {
  settings: Record<string, any>;
  isLoading: boolean;
  getSetting: (key: string, defaultValue?: any) => any;
  formatCurrency: (amount: number | string) => string;
  formatDate: (date: string | Date) => string;
  formatDateTime: (date: string | Date) => string;
  refreshSettings: () => Promise<void>;
}

export const SettingsContext = createContext<SettingsContextType | undefined>(undefined);
