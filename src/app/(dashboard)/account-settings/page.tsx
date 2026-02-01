'use client';

import { useState, useEffect } from 'react';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import PageMeta from '@/components/common/PageMeta';
import { useAuth } from '@/hooks/useAuth';
import UserSecurityCard from './_components/UserSecurityCard';
import ChangePasswordModal from './_components/ChangePasswordModal';

export default function AccountSettingsPage() {
  const { user, fetchProfile, loading } = useAuth();
  const [isChangePasswordModalOpen, setChangePasswordModalOpen] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  if (loading) {
    return (
      <>
        <PageMeta title="Account Settings" description="Manage your account settings" />
        <PageBreadcrumb pageTitle="Account Settings" />
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500"></div>
        </div>
      </>
    );
  }

  return (
    <>
      <PageMeta title="Account Settings" description="Manage your account settings" />
      <PageBreadcrumb pageTitle="Account Settings" />

      <div className="space-y-6">
        <UserSecurityCard onChangePassword={() => setChangePasswordModalOpen(true)} />
      </div>

      <ChangePasswordModal
        isOpen={isChangePasswordModalOpen}
        onClose={() => setChangePasswordModalOpen(false)}
        user={user}
      />
    </>
  );
}
