import AddRole from '@/pages/RoleManagement/AddRole';
import ProtectedLayout from '@/components/layout/ProtectedLayout';

export default function AddRolePage() {
  return (
    <ProtectedLayout>
      <AddRole />
    </ProtectedLayout>
  );
}
