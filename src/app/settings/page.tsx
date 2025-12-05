import Settings from '@/pages/Settings/Settings';
import ProtectedLayout from '@/components/layout/ProtectedLayout';

export default function SettingsPage() {
  return (
    <ProtectedLayout>
      <Settings />
    </ProtectedLayout>
  );
}