import type { Metadata } from 'next';
import { Outfit } from 'next/font/google';
import './globals.css';
import 'nprogress/nprogress.css';
import './nprogress-custom.css';

import { SidebarProvider } from '@/context/SidebarContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { AuthProvider } from '@/context/AuthProvider';
import { TenantProvider } from '@/context/TenantProvider';
import { SettingsProvider } from '@/context/SettingsProvider';
import { Toaster } from 'sonner';

const outfit = Outfit({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: 'Atom Suit - Dashboard',
  description: 'Atom Suit inventory management system',
};
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${outfit.className} dark:bg-gray-900`}>
        <ThemeProvider>
          <TenantProvider>
            <AuthProvider>
              <SettingsProvider>
                <SidebarProvider>
                  <Toaster richColors position="top-center" closeButton={true} />
                  {children}
                </SidebarProvider>
              </SettingsProvider>
            </AuthProvider>
          </TenantProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
