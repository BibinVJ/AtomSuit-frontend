import UserProfiles from '@/components/UserProfile/UserProfilePage';
import ProtectedLayout from '@/components/layout/ProtectedLayout';

export default function UserProfilesPage() {
  return (
    <ProtectedLayout>
      <UserProfiles />
    </ProtectedLayout>
  );
}
