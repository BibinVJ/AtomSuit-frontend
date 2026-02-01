import type { Metadata } from 'next';
import { Outfit } from 'next/font/google';
import './globals.css';
import 'nprogress/nprogress.css';
import './nprogress-custom.css';
import { Suspense } from 'react';
import NavigationEvents from '@/components/common/NavigationEvents';
import AppProviders from '@/components/common/AppProviders';

const outfit = Outfit({
  subsets: ['latin'],
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
        {/* ... script ... */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var storedTheme = localStorage.getItem('theme');
                  if (storedTheme === 'dark') {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
        <AppProviders>
          <Suspense fallback={null}>
            <NavigationEvents />
          </Suspense>
          {children}
        </AppProviders>
      </body>
    </html>
  );
}
