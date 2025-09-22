import Alerts from '@/pages/UiElements/Alerts';
import ProtectedLayout from '@/components/layout/ProtectedLayout';

export default function AlertsPage() {
  return (
    <ProtectedLayout>
      <Alerts />
    </ProtectedLayout>
  );
}
