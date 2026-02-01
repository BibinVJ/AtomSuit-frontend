'use client';

import { usePathname } from 'next/navigation';
import ProtectedLayout from './ProtectedLayout';
import { SidebarProvider } from '../../context/SidebarContext';

interface LayoutWrapperProps {
  children: React.ReactNode;
}
export default function LayoutWrapper({ children }: LayoutWrapperProps) {
  const pathname = usePathname();
  const isAuthPage =
    pathname === '/signin' ||
    pathname === '/signup' ||
    pathname === '/forgot-password' ||
    pathname === '/reset-password';

  if (isAuthPage) {
    return <>{children}</>;
  }

  return (
    <SidebarProvider>
      <ProtectedLayout>{children}</ProtectedLayout>
    </SidebarProvider>
  );
}
