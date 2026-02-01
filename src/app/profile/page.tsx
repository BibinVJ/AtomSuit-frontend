import UserProfiles from '@/app/profile/_components/UserProfilePage';
import ProtectedLayout from '@/components/layout/ProtectedLayout';

export default function UserProfilesPage() {
  return (
    <ProtectedLayout>
      <UserProfiles />
    </ProtectedLayout>
  );
}
