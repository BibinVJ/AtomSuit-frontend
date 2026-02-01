'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SettingsIndex() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/settings/general');
  }, [router]);

  return (
    <div className="flex justify-center items-center h-64">
      <div className="text-gray-500">Redirecting to General Settings...</div>
    </div>
  );
}
