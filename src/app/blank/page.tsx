import Blank from '@/pages/Blank';
import ProtectedLayout from '@/components/layout/ProtectedLayout';

export default function BlankPage() {
  return (
    <ProtectedLayout>
      <Blank />
    </ProtectedLayout>
  );
}
