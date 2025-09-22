"use client";

import { useEffect, useState } from "react";
import PageBreadcrumb from "../components/common/PageBreadCrumb";
import UserMetaCard from "../components/UserProfile/UserMetaCard";
import UserInfoCard from "../components/UserProfile/UserInfoCard";
import PageMeta from "../components/common/PageMeta";
import { useAuth } from "../hooks/useAuth";
import UserAddressCard from "../components/UserProfile/UserAddressCard";
import EditProfileModal from "../components/UserProfile/EditProfileModal";
import EditAddressModal from "../components/UserProfile/EditAddressModal";
import EditSocialLinksModal from "../components/UserProfile/EditSocialLinksModal";
import EditProfileImageModal from "../components/UserProfile/EditProfileImageModal";

export default function UserProfiles() {
  const { fetchProfile, user } = useAuth();
  const [isProfileModalOpen, setProfileModalOpen] = useState(false);
  const [isAddressModalOpen, setAddressModalOpen] = useState(false);
  const [isSocialLinksModalOpen, setSocialLinksModalOpen] = useState(false);
  const [isProfileImageModalOpen, setProfileImageModalOpen] = useState(false);
  const [selectedAddressType, setSelectedAddressType] = useState<string | null>(
    null
  );

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleEditAddress = (addressType: string) => {
    setSelectedAddressType(addressType);
    setAddressModalOpen(true);
  };

  return (
    <>
      <PageMeta
        title="User Profile"
        description="This is the user profile page"
      />
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