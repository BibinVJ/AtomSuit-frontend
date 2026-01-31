import Dashboard from '@/pages/Dashboard';
import ProtectedLayout from '@/components/layout/ProtectedLayout';

export default function DashboardPage() {
  return (
    <ProtectedLayout>
      <Dashboard />
    </ProtectedLayout>
  );
}
