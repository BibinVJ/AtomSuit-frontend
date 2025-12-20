import Domains from '@/pages/Domain/Domains';
import ProtectedLayout from '@/components/layout/ProtectedLayout';

export default function DomainsPage() {
  return (
    <ProtectedLayout>
      <Domains />
    </ProtectedLayout>
  );
}
