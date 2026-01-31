import Plans from '@/pages/Plans';
import ProtectedLayout from '@/components/layout/ProtectedLayout';

export default function PlansPage() {
  return (
    <ProtectedLayout>
      <Plans />
    </ProtectedLayout>
  );
}
