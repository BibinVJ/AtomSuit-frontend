import Dashboard from '@/pages/Dashboard/Home';
import ProtectedLayout from '@/components/layout/ProtectedLayout';

export default function HomePage() {
  return (
    <ProtectedLayout>
      <Dashboard />
    </ProtectedLayout>
  );
}
