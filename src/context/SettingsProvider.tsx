'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { SettingsContext, SettingsContextType } from './SettingsContext';
import { getSettings } from '@/services/SettingsService';
import { AuthContext } from './AuthContext';
import { useContext } from 'react';

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const authContext = useContext(AuthContext);
  const user = authContext?.user;

  const [settings, setSettings] = useState<Record<string, unknown>>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('app_settings');
      return saved ? JSON.parse(saved) : {};
    }
    return {};
  });
  const [isLoading, setIsLoading] = useState(true);

  const fetchSettings = useCallback(async () => {
    if (!user) {
      // Don't clear settings instantly, keep them for the next mount if still logged in
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const response = await getSettings();

      // Flatten settings groups into a single key-value record
      const flattened: Record<string, unknown> = {};
      Object.values(response.data as Record<string, { key: string; value: unknown }[]>).forEach(
        (group) => {
          group.forEach((setting) => {
            flattened[setting.key] = setting.value;
          });
        }
      );

      setSettings(flattened);
      if (typeof window !== 'undefined') {
        localStorage.setItem('app_settings', JSON.stringify(flattened));
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  // Apply Appearance settings globally
  useEffect(() => {
    if (settings.primary_color) {
      document.documentElement.style.setProperty('--color-primary', String(settings.primary_color));
      // Set a slightly darker version for hover states (simulated)
      document.documentElement.style.setProperty(
        '--color-primary-dark',
        String(settings.primary_color) + 'dd'
      );
      document.documentElement.style.setProperty(
        '--color-primary-darker',
        String(settings.primary_color) + 'bb'
      );
    }
    if (settings.secondary_color) {
      document.documentElement.style.setProperty(
        '--color-secondary',
        String(settings.secondary_color)
      );
    }
    if (settings.success_color) {
      document.documentElement.style.setProperty('--color-success', String(settings.success_color));
    }
    if (settings.error_color) {
      document.documentElement.style.setProperty('--color-error', String(settings.error_color));
    }
    if (settings.warning_color) {
      document.documentElement.style.setProperty('--color-warning', String(settings.warning_color));
    }
    if (settings.info_color) {
      document.documentElement.style.setProperty('--color-info', String(settings.info_color));
    }
    if (settings.theme) {
      if (settings.theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else if (settings.theme === 'light') {
        document.documentElement.classList.remove('dark');
      }
    }
  }, [settings]);

  const getSetting = useCallback(
    <T,>(key: string, defaultValue?: T): T => {
      return settings[key] !== undefined ? (settings[key] as T) : (defaultValue as T);
    },
    [settings]
  );

  const formatCurrency = useCallback(
    (amount: number | string) => {
      const num = typeof amount === 'string' ? parseFloat(amount) : amount;
      const symbol = getSetting('currency_symbol', '$');
      const position = getSetting('currency_position', 'before');
      const decimalSeparator = getSetting('decimal_separator', '.');
      const thousandSeparator = getSetting('thousand_separator', ',');
      const decimalPlaces = parseInt(getSetting('decimal_places', '2'));

      let formatted =
        num !== null && num !== undefined ? num.toFixed(decimalPlaces) : (0).toFixed(decimalPlaces);

      // Replace default separators with custom ones
      const parts = formatted.split('.');
      parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, thousandSeparator);
      formatted = parts.join(decimalSeparator);

      return position === 'before' ? `${symbol}${formatted}` : `${formatted}${symbol}`;
    },
    [getSetting]
  );

  const formatDate = useCallback(
    (date: string | Date) => {
      const d = new Date(date);
      const phpFormat = getSetting('date_format', 'Y-m-d');

      // Basic mapping of PHP date formats to JS date strings
      // In a real app, you'd use a library like date-fns or a more robust mapper
      const map: Record<string, string> = {
        'Y-m-d': d.toISOString().split('T')[0],
        'd/m/Y': `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`,
        'm/d/Y': `${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}/${d.getFullYear()}`,
      };

      return map[phpFormat] || d.toLocaleDateString();
    },
    [getSetting]
  );

  const formatDateTime = useCallback(
    (date: string | Date) => {
      const d = new Date(date);
      const timeFormat = getSetting('time_format', 'H:i:s');
      return `${formatDate(date)} ${d.toLocaleTimeString([], { hour12: timeFormat.includes('g') || timeFormat.includes('A') })}`;
    },
    [getSetting, formatDate]
  );

  const formatQuantity = useCallback(
    (amount: number | string) => {
      const num = typeof amount === 'string' ? parseFloat(amount) : amount;
      const decimalSeparator = getSetting('quantity_decimal_separator', '.');
      const thousandSeparator = getSetting('quantity_thousand_separator', ',');
      const decimalPlaces = parseInt(getSetting('quantity_decimal_places', '3'));

      let formatted =
        num !== null && num !== undefined ? num.toFixed(decimalPlaces) : (0).toFixed(decimalPlaces);

      const parts = formatted.split('.');
      parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, thousandSeparator);
      formatted = parts.join(decimalSeparator);

      return formatted;
    },
    [getSetting]
  );

  const formatNumber = useCallback(
    (amount: number | string) => {
      const num = typeof amount === 'string' ? parseFloat(amount) : amount;
      const decimalSeparator = getSetting('decimal_separator', '.');
      const thousandSeparator = getSetting('thousand_separator', ',');
      const decimalPlaces = parseInt(getSetting('general_number_decimal_places', '2'));

      let formatted =
        num !== null && num !== undefined ? num.toFixed(decimalPlaces) : (0).toFixed(decimalPlaces);

      const parts = formatted.split('.');
      parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, thousandSeparator);
      formatted = parts.join(decimalSeparator);

      return formatted;
    },
    [getSetting]
  );

  const contextValue = useMemo<SettingsContextType>(
    () => ({
      settings,
      isLoading,
      getSetting,
      formatCurrency,
      formatQuantity,
      formatNumber,
      formatDate,
      formatDateTime,
      refreshSettings: fetchSettings,
    }),
    [
      settings,
      isLoading,
      getSetting,
      formatCurrency,
      formatQuantity,
      formatNumber,
      formatDate,
      formatDateTime,
      fetchSettings,
    ]
  );

  return <SettingsContext.Provider value={contextValue}>{children}</SettingsContext.Provider>;
};
