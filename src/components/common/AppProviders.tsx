'use client';

import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { queryClient } from '@/lib/queryClient';

import React from 'react';
import { ThemeProvider } from '@/context/ThemeContext';
import { AuthProvider } from '@/context/AuthProvider';
import { TenantProvider } from '@/context/TenantProvider';
import { SettingsProvider } from '@/context/SettingsProvider';
import { Toaster } from 'sonner';

interface AppProvidersProps {
  children: React.ReactNode;
}

export default function AppProviders({ children }: AppProvidersProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TenantProvider>
          <AuthProvider>
            <SettingsProvider>
              <Toaster
                richColors
                position="top-center"
                closeButton={true}
                duration={4000}
                toastOptions={{
                  style: {
                    boxShadow:
                      '0 10px 40px -5px rgba(0, 0, 0, 0.25), 0 8px 20px -8px rgba(0, 0, 0, 0.2)',
                    border: '1px solid rgba(0, 0, 0, 0.08)',
                    fontSize: '14px',
                    padding: '14px 18px',
                  },
                }}
              />
              {children}
            </SettingsProvider>
          </AuthProvider>
        </TenantProvider>
      </ThemeProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
