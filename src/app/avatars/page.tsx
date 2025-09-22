import Avatars from '@/pages/UiElements/Avatars';
import ProtectedLayout from '@/components/layout/ProtectedLayout';

export default function AvatarsPage() {
  return (
    <ProtectedLayout>
      <Avatars />
    </ProtectedLayout>
  );
}
