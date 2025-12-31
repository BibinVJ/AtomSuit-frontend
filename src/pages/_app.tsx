import type { AppProps } from 'next/app';
import { SidebarProvider } from '@/context/SidebarContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { AuthProvider } from '@/context/AuthProvider';
import { TenantProvider } from '@/context/TenantProvider';
import { SettingsProvider } from '@/context/SettingsProvider';
import { Toaster } from 'sonner';
import '@/app/globals.css';
import 'nprogress/nprogress.css';
import '@/app/nprogress-custom.css';

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider>
      <TenantProvider>
        <AuthProvider>
          <SettingsProvider>
            <SidebarProvider>
              <Toaster richColors position="top-center" closeButton={true} />
              <Component {...pageProps} />
            </SidebarProvider>
          </SettingsProvider>
        </AuthProvider>
      </TenantProvider>
    </ThemeProvider>
  );
}
