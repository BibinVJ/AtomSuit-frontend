import Audits from '@/pages/Audits';
import ProtectedLayout from '@/components/layout/ProtectedLayout';

export default function AuditsPage() {
  return (
    <ProtectedLayout>
      <Audits />
    </ProtectedLayout>
  );
}
