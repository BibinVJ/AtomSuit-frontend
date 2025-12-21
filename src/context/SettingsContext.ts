import { createContext } from 'react';

export interface SettingsContextType {
  settings: Record<string, unknown>;
  isLoading: boolean;
  getSetting: <T>(key: string, defaultValue?: T) => T;
  formatCurrency: (amount: number | string) => string;
  formatDate: (date: string | Date) => string;
  formatDateTime: (date: string | Date) => string;
  refreshSettings: () => Promise<void>;
}

export const SettingsContext = createContext<SettingsContextType | undefined>(undefined);
