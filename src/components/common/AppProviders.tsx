'use client';

import React from 'react';
import { ThemeProvider } from '../../context/ThemeContext';
import { AuthProvider } from '../../context/AuthProvider';
import { TenantProvider } from '../../context/TenantProvider';
import { SettingsProvider } from '../../context/SettingsProvider';
import { Toaster } from 'sonner';

interface AppProvidersProps {
  children: React.ReactNode;
}

export default function AppProviders({ children }: AppProvidersProps) {
  return (
    <ThemeProvider>
      <TenantProvider>
        <AuthProvider>
          <SettingsProvider>
            <Toaster richColors position="top-center" closeButton={true} />
            {children}
          </SettingsProvider>
        </AuthProvider>
      </TenantProvider>
    </ThemeProvider>
  );
}
