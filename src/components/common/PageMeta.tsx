'use client';

import { useEffect } from 'react';

const PageMeta = ({ title, description }: { title: string; description?: string }) => {
  useEffect(() => {
    document.title = `${title} - Atom Suit`;

    if (description) {
      let metaDescription = document.querySelector('meta[name="description"]');
      if (!metaDescription) {
        metaDescription = document.createElement('meta');
        metaDescription.setAttribute('name', 'description');
        document.head.appendChild(metaDescription);
      }
      metaDescription.setAttribute('content', description);
    }
  }, [title, description]);

  return null;
};

// No need for AppWrapper with Next.js Head
export const AppWrapper = ({ children }: { children: React.ReactNode }) => <>{children}</>;

export default PageMeta;
