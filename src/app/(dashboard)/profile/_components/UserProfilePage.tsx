'use client';

import { useEffect, useState } from 'react';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import UserMetaCard from './UserMetaCard';
import UserInfoCard from './UserInfoCard';
import PageMeta from '@/components/common/PageMeta';
import { useAuth } from '@/hooks/useAuth';
import UserAddressCard from './UserAddressCard';
import EditProfileModal from './EditProfileModal';
import EditAddressModal from './EditAddressModal';
import EditSocialLinksModal from './EditSocialLinksModal';
import EditProfileImageModal from './EditProfileImageModal';
import SkeletonDetail from '@/components/common/SkeletonDetail';
import ComponentCard from '@/components/common/ComponentCard';

export default function UserProfilePage() {
  const { fetchProfile, user, loading } = useAuth();
  const [isProfileModalOpen, setProfileModalOpen] = useState(false);
  const [isAddressModalOpen, setAddressModalOpen] = useState(false);
  const [isSocialLinksModalOpen, setSocialLinksModalOpen] = useState(false);
  const [isProfileImageModalOpen, setProfileImageModalOpen] = useState(false);
  const [selectedAddressType, setSelectedAddressType] = useState<string | null>(null);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleEditAddress = (addressType: string) => {
    setSelectedAddressType(addressType);
    setAddressModalOpen(true);
  };

  // Show loading state while user data is being fetched
  if (loading) {
    return (
      <div className="p-6">
        <PageMeta title="User Profile" description="This is the user profile page" />
        <PageBreadcrumb pageTitle="Profile" />
        <div className="space-y-6">
          <ComponentCard>
            <div className="flex flex-col gap-5 xl:flex-row xl:items-center">
              <div className="flex flex-col items-center w-full gap-6 xl:flex-row">
                <div className="w-20 h-20 bg-gray-200 dark:bg-gray-800 rounded-full animate-pulse"></div>
                <div className="space-y-3 flex-grow">
                  <div className="h-6 w-48 bg-gray-200 dark:bg-gray-800 rounded animate-pulse"></div>
                  <div className="h-4 w-32 bg-gray-100 dark:bg-gray-800/50 rounded animate-pulse"></div>
                </div>
                <div className="flex gap-2">
                  <div className="h-10 w-10 bg-gray-200 dark:bg-gray-800 rounded-full animate-pulse"></div>
                  <div className="h-10 w-10 bg-gray-200 dark:bg-gray-800 rounded-full animate-pulse"></div>
                  <div className="h-10 w-10 bg-gray-200 dark:bg-gray-800 rounded-full animate-pulse"></div>
                </div>
              </div>
              <div className="h-10 w-32 bg-brand-500/20 rounded-full animate-pulse ml-auto"></div>
            </div>
          </ComponentCard>
          <SkeletonDetail columns={1} hasTable={false} />
          <SkeletonDetail columns={1} hasTable={false} />
        </div>
      </div>
    );
  }

  // Show message if no user data is available
  if (!user) {
    return (
      <>
        <PageMeta title="User Profile" description="This is the user profile page" />
        <PageBreadcrumb pageTitle="Profile" />
        <div className="flex items-center justify-center min-h-[400px]">
          <p className="text-gray-500 dark:text-gray-400">User profile not found.</p>
        </div>
      </>
    );
  }

  return (
    <>
      <PageMeta title="User Profile" description="This is the user profile page" />
      <PageBreadcrumb pageTitle="Profile" />
      <div className="rounded-2xl border border-gray-200 custom-card-bg p-5 dark:border-gray-800 lg:p-6">
        <h3 className="mb-5 text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-7">
          Profile
        </h3>
        <div className="space-y-6">
          <UserMetaCard
            user={user}
            onEditSocials={() => setSocialLinksModalOpen(true)}
            onEditImage={() => setProfileImageModalOpen(true)}
          />
          <UserInfoCard user={user} onEdit={() => setProfileModalOpen(true)} />
          <UserAddressCard user={user} onEdit={handleEditAddress} />
        </div>
      </div>
      <EditProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setProfileModalOpen(false)}
        user={user}
      />
      <EditAddressModal
        isOpen={isAddressModalOpen}
        onClose={() => setAddressModalOpen(false)}
        user={user}
        addressType={selectedAddressType}
      />
      <EditSocialLinksModal
        isOpen={isSocialLinksModalOpen}
        onClose={() => setSocialLinksModalOpen(false)}
        user={user}
      />
      <EditProfileImageModal
        isOpen={isProfileImageModalOpen}
        onClose={() => setProfileImageModalOpen(false)}
      />
    </>
  );
}
