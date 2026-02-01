'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSidebar } from '@/hooks/useSidebar';
import { useAuth } from '@/hooks/useAuth';
import { usePathname } from 'next/navigation';
import { useTenant } from '@/hooks/useTenant';
import AppHeader from '../../layout/AppHeader';
import Backdrop from '../../layout/Backdrop';
import AppSidebar from '../../layout/AppSidebar';
interface ProtectedLayoutProps {
  children: React.ReactNode;
}
const ProtectedLayout: React.FC<ProtectedLayoutProps> = ({ children }) => {
  const { isExpanded, isHovered, isMobileOpen, isFullScreen, enterFullScreen, exitFullScreen } =
    useSidebar();
  const { user, loading } = useAuth();
  const { tenant } = useTenant();
  const router = useRouter();
  const pathname = usePathname();

  // All hooks must be called before any conditional returns
  useEffect(() => {
    // Check if we need fullscreen mode based on pathname or other logic
    const shouldGoFullScreen = false; // You can implement logic here
    if (shouldGoFullScreen) {
      enterFullScreen();
    } else {
      if (isFullScreen) {
        exitFullScreen();
      }
    }
  }, [pathname, isFullScreen, enterFullScreen, exitFullScreen]);

  // Check authentication status
  useEffect(() => {
    if (!loading && !user) {
      // User is not authenticated, redirect to signin
      // Always use relative path to stay on the same domain
      router.push('/signin');
    }
  }, [user, loading, router, tenant]);

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500"></div>
      </div>
    );
  }

  // If not loading and no user, show loading spinner (redirect will happen in useEffect)
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500"></div>
      </div>
    );
  }
  if (isFullScreen) {
    return (
      <div className="min-h-screen">
        <div className="p-4 mx-auto max-w-(--breakpoint-2xl) md:p-6">{children}</div>
      </div>
    );
  }
  return (
    <div className="min-h-screen xl:flex">
      <div>
        <AppSidebar />
        <Backdrop />
      </div>
      <div
        className={`flex-1 transition-all duration-300 ease-in-out ${
          isExpanded || isHovered ? 'lg:ml-[290px]' : 'lg:ml-[90px]'
        } ${isMobileOpen ? 'ml-0' : ''}`}
      >
        <AppHeader />
        <div className="p-4 mx-auto max-w-(--breakpoint-2xl) md:p-6">{children}</div>
      </div>
    </div>
  );
};
export default ProtectedLayout;
