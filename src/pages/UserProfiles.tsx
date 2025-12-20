'use client';

import { useEffect, useState } from 'react';
import PageBreadcrumb from '../components/common/PageBreadCrumb';
import UserMetaCard from '../components/UserProfile/UserMetaCard';
import UserInfoCard from '../components/UserProfile/UserInfoCard';
import PageMeta from '../components/common/PageMeta';
import { useAuth } from '../hooks/useAuth';
import UserAddressCard from '../components/UserProfile/UserAddressCard';
import EditProfileModal from '../components/UserProfile/EditProfileModal';
import EditAddressModal from '../components/UserProfile/EditAddressModal';
import EditSocialLinksModal from '../components/UserProfile/EditSocialLinksModal';
import EditProfileImageModal from '../components/UserProfile/EditProfileImageModal';

export default function UserProfiles() {
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
      <>
        <PageMeta title="User Profile" description="This is the user profile page" />
        <PageBreadcrumb pageTitle="Profile" />
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500"></div>
        </div>
      </>
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
