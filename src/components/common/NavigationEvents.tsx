'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import NProgress from 'nprogress';

export default function NavigationEvents() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // When the component mounts (on navigation complete) or params change
    NProgress.done();
  }, [pathname, searchParams]);

  useEffect(() => {
    // Add a global click listener to trigger start on internal links
    const handleClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest('a');
      if (
        target &&
        target.href &&
        target.href.startsWith(window.location.origin) &&
        target.target !== '_blank' &&
        !e.ctrlKey &&
        !e.metaKey
      ) {
        // Only start if it's a different path
        if (target.href !== window.location.href) {
          NProgress.start();
        }
      }
    };

    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  return null;
}
