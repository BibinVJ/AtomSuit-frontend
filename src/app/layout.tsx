import { Outfit } from 'next/font/google';
import './globals.css';
import 'nprogress/nprogress.css';
import './nprogress-custom.css';

import { SidebarProvider } from '@/context/SidebarContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { AuthProvider } from '@/context/AuthProvider';
import { Toaster } from 'sonner';
const outfit = Outfit({
  subsets: ["latin"],
});
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${outfit.className} dark:bg-gray-900`}>
        <ThemeProvider>
          <AuthProvider>
            <SidebarProvider>
              <Toaster richColors position="top-center" closeButton={true} />
              {children}
            </SidebarProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
