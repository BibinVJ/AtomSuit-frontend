import UserProfiles from '@/pages/UserProfiles';
import ProtectedLayout from '@/components/layout/ProtectedLayout';

export default function UserProfilesPage() {
  return (
    <ProtectedLayout>
      <UserProfiles />
    </ProtectedLayout>
  );
}
