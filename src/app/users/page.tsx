import Users from '@/pages/UserManagement/Users';
import ProtectedLayout from '@/components/layout/ProtectedLayout';

export default function UsersPage() {
  return (
    <ProtectedLayout>
      <Users />
    </ProtectedLayout>
  );
}
