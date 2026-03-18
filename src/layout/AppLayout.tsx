'use client';

import { useEffect } from 'react';
import { SidebarProvider } from '@/context/SidebarContext';
import { useSidebar } from '@/hooks/useSidebar';

import AppHeader from './AppHeader';
import Backdrop from './Backdrop';
import AppSidebar from './AppSidebar';

const LayoutContent: React.FC = () => {
  const { isExpanded, isHovered, isMobileOpen, isFullScreen, enterFullScreen, exitFullScreen } =
    useSidebar();

  useEffect(() => {
    const shouldGoFullScreen = false;
    if (shouldGoFullScreen) {
      enterFullScreen();
    } else {
      if (isFullScreen) {
        exitFullScreen();
      }
    }
  }, [isFullScreen, enterFullScreen, exitFullScreen]);

  if (isFullScreen) {
    return (
      <div className="min-h-screen">
        <div className="p-4 mx-auto max-w-(--breakpoint-2xl) md:p-6"></div>
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
        <div className="p-4 mx-auto max-w-(--breakpoint-2xl) md:p-6"></div>
      </div>
    </div>
  );
};

const AppLayout: React.FC = () => {
  return (
    <SidebarProvider>
      <LayoutContent />
    </SidebarProvider>
  );
};

export default AppLayout;
