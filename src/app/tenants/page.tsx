import Tenants from '@/pages/Tenants';
import ProtectedLayout from '@/components/layout/ProtectedLayout';

export default function TenantsPage() {
  return (
    <ProtectedLayout>
      <Tenants />
    </ProtectedLayout>
  );
}
