'use client';

import ProtectedLayout from '@/components/layout/ProtectedLayout';
import { SidebarProvider } from '@/context/SidebarContext';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <ProtectedLayout>{children}</ProtectedLayout>
    </SidebarProvider>
  );
}
