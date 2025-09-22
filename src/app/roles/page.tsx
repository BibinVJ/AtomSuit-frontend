import Roles from '@/pages/RoleManagement/Roles';
import ProtectedLayout from '@/components/layout/ProtectedLayout';

export default function RolesPage() {
  return (
    <ProtectedLayout>
      <Roles />
    </ProtectedLayout>
  );
}
