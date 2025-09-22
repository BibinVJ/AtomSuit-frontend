import Badges from '@/pages/UiElements/Badges';
import ProtectedLayout from '@/components/layout/ProtectedLayout';

export default function BadgesPage() {
  return (
    <ProtectedLayout>
      <Badges />
    </ProtectedLayout>
  );
}
