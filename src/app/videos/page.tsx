import Videos from '@/pages/UiElements/Videos';
import ProtectedLayout from '@/components/layout/ProtectedLayout';

export default function VideosPage() {
  return (
    <ProtectedLayout>
      <Videos />
    </ProtectedLayout>
  );
}
