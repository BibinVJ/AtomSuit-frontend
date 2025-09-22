import EditRole from '@/pages/RoleManagement/EditRole';
import ProtectedLayout from '@/components/layout/ProtectedLayout';

export default function EditRolePage() {
  return (
    <ProtectedLayout>
      <EditRole />
    </ProtectedLayout>
  );
}
