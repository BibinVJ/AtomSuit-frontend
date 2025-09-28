import Dashboard from '@/pages/Dashboard/Home';
import ProtectedLayout from '@/components/layout/ProtectedLayout';

export default function DashboardPage() {
  return (
    <ProtectedLayout>
      <Dashboard />
    </ProtectedLayout>
  );
}